from rest_framework import serializers
from ..models import Chat, Message, GroupChat
from .user_serializers import UserSerializer


class MessageSerializer(serializers.ModelSerializer):
    """
    Serializer for chat messages
    """
    sender = UserSerializer(read_only=True)
    sender_id = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = Message
        fields = ['id', 'chat', 'sender', 'sender_id', 'content', 'date_time', 'is_read']
        read_only_fields = ['date_time']
    
    def create(self, validated_data):
        # If sender_id not provided, use the authenticated user
        if 'sender_id' not in validated_data:
            validated_data['sender_id'] = self.context['request'].user.id_no
            
        sender_id = validated_data.pop('sender_id')
        chat_id = validated_data['chat'].chat_id
        
        # Check if sender is a participant in the chat
        chat = Chat.objects.get(chat_id=chat_id)
        if not chat.participants.filter(id_no=sender_id).exists():
            raise serializers.ValidationError("You are not a participant in this chat.")
        
        # Create message
        message = Message.objects.create(
            sender_id=sender_id,
            **validated_data
        )
        
        # Update chat's updated_at timestamp
        chat.save()  # This triggers the auto_now field update
        
        return message


class GroupChatSerializer(serializers.ModelSerializer):
    """
    Serializer for group chat information
    """
    admin = UserSerializer(read_only=True)
    admin_id = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = GroupChat
        fields = ['chat', 'name', 'admin', 'admin_id']
    
    def create(self, validated_data):
        # If admin_id not provided, use the authenticated user
        if 'admin_id' not in validated_data:
            validated_data['admin_id'] = self.context['request'].user.id_no
            
        return GroupChat.objects.create(**validated_data)


class ChatSerializer(serializers.ModelSerializer):
    """
    Basic chat serializer
    """
    participants = UserSerializer(many=True, read_only=True)
    is_group_chat = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    
    class Meta:
        model = Chat
        fields = ['chat_id', 'participants', 'is_group_chat', 'last_message', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
    
    def get_is_group_chat(self, obj):
        return hasattr(obj, 'group_info')
    
    def get_last_message(self, obj):
        last_message = obj.messages.order_by('-date_time').first()
        if last_message:
            return {
                'content': last_message.content,
                'sender': last_message.sender.name,
                'date_time': last_message.date_time
            }
        return None


class ChatDetailSerializer(serializers.ModelSerializer):
    """
    Detailed chat serializer with messages
    """
    participants = UserSerializer(many=True, read_only=True)
    messages = MessageSerializer(many=True, read_only=True)
    group_info = GroupChatSerializer(read_only=True)
    
    class Meta:
        model = Chat
        fields = ['chat_id', 'participants', 'messages', 'group_info', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class ChatCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating new chats
    """
    participants = serializers.ListField(
        child=serializers.CharField(),
        write_only=True
    )
    is_group_chat = serializers.BooleanField(write_only=True, default=False)
    group_name = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = Chat
        fields = ['chat_id', 'participants', 'is_group_chat', 'group_name']
        read_only_fields = ['chat_id']
    
    def validate(self, attrs):
        participants = attrs.get('participants', [])
        is_group_chat = attrs.get('is_group_chat', False)
        
        # Check if the authenticated user is in the participants list
        if self.context['request'].user.id_no not in participants:
            participants.append(self.context['request'].user.id_no)
        
        # For non-group chats, ensure exactly 2 participants
        if not is_group_chat and len(participants) != 2:
            raise serializers.ValidationError("Direct chats must have exactly 2 participants.")
        
        # For group chats, require a group name
        if is_group_chat and not attrs.get('group_name'):
            raise serializers.ValidationError("Group chats require a name.")
            
        # For non-group chats, check if a chat already exists between these users
        if not is_group_chat:
            user1, user2 = participants
            existing_chats = Chat.objects.filter(participants__id_no=user1).filter(participants__id_no=user2)
            
            # Only consider direct chats (not group chats)
            direct_chats = [chat for chat in existing_chats if not hasattr(chat, 'group_info')]
            
            if direct_chats and len(direct_chats) > 0:
                raise serializers.ValidationError("A chat already exists between these users.")
        
        attrs['participants'] = participants
        return attrs
    
    def create(self, validated_data):
        participants = validated_data.pop('participants')
        is_group_chat = validated_data.pop('is_group_chat', False)
        group_name = validated_data.pop('group_name', None)
        
        # Create the chat
        chat = Chat.objects.create(**validated_data)
        
        # Add participants
        from ..models import User
        for participant_id in participants:
            user = User.objects.get(id_no=participant_id)
            chat.participants.add(user)
        
        # If it's a group chat, create the GroupChat instance
        if is_group_chat and group_name:
            GroupChat.objects.create(
                chat=chat,
                name=group_name,
                admin=self.context['request'].user
            )
        
        return chat