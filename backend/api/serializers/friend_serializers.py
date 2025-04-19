from rest_framework import serializers
from ..models import Friend, FriendRequest
from .user_serializers import UserSerializer


class FriendSerializer(serializers.ModelSerializer):
    """
    Basic friend serializer
    """
    user = UserSerializer(read_only=True)
    friend = UserSerializer(read_only=True)
    
    class Meta:
        model = Friend
        fields = ['id', 'user', 'friend', 'created_at']
        read_only_fields = ['created_at']


class FriendRequestSerializer(serializers.ModelSerializer):
    """
    Serializer for friend requests
    """
    sender = UserSerializer(read_only=True)
    sender_id = serializers.CharField(write_only=True, required=False)
    receiver = UserSerializer(read_only=True)
    receiver_id = serializers.CharField(write_only=True)
    
    class Meta:
        model = FriendRequest
        fields = ['id', 'sender', 'sender_id', 'receiver', 'receiver_id', 
                  'status', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
    
    def create(self, validated_data):
        # If sender_id not provided, use the authenticated user
        if 'sender_id' not in validated_data:
            validated_data['sender_id'] = self.context['request'].user.id_no
            
        sender_id = validated_data.pop('sender_id')
        receiver_id = validated_data.pop('receiver_id')
        
        # Check if request already exists
        if FriendRequest.objects.filter(sender_id=sender_id, receiver_id=receiver_id).exists():
            raise serializers.ValidationError("Friend request already sent.")
        
        # Check if reverse request exists
        if FriendRequest.objects.filter(sender_id=receiver_id, receiver_id=sender_id).exists():
            raise serializers.ValidationError("You already have a pending friend request from this user.")
        
        # Check if already friends
        if Friend.objects.filter(user_id=sender_id, friend_id=receiver_id).exists():
            raise serializers.ValidationError("You are already friends with this user.")
        
        # Create friend request
        request = FriendRequest.objects.create(
            sender_id=sender_id,
            receiver_id=receiver_id,
            **validated_data
        )
        return request
    
    def update(self, instance, validated_data):
        # Only allow updating the status field
        if 'status' in validated_data:
            instance.status = validated_data['status']
            instance.save()
        return instance


class FriendListSerializer(serializers.ModelSerializer):
    """
    Serializer for listing a user's friends
    """
    friend_details = UserSerializer(source='friend', read_only=True)
    
    class Meta:
        model = Friend
        fields = ['id', 'friend_details', 'created_at']