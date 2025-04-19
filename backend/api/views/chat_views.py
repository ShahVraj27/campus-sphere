from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from ..models import Chat, Message, GroupChat
from ..serializers.chat_serializers import (
    ChatSerializer, ChatDetailSerializer, ChatCreateSerializer,
    MessageSerializer, GroupChatSerializer
)


class IsChatParticipant(permissions.BasePermission):
    """
    Custom permission to only allow chat participants to view or interact with a chat
    """
    def has_object_permission(self, request, view, obj):
        # Check if the user is a participant in the chat
        if hasattr(obj, 'participants'):
            # For Chat objects
            return request.user in obj.participants.all()
        elif hasattr(obj, 'chat'):
            # For Message objects
            return request.user in obj.chat.participants.all()
        return False


class IsGroupChatAdmin(permissions.BasePermission):
    """
    Custom permission to only allow group chat admins to update group chat settings
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any chat participant
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # Write permissions are only allowed to the group admin or system admins
        if request.user.user_type in ['developer', 'maintainer']:
            return True
            
        # Check if user is the group admin
        return obj.admin == request.user


class ChatViewSet(viewsets.ModelViewSet):
    """
    API endpoint for chats
    """
    queryset = Chat.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsChatParticipant]
    
    def get_serializer_class(self):
        if self.action == 'retrieve' or self.action == 'messages':
            return ChatDetailSerializer
        elif self.action == 'create':
            return ChatCreateSerializer
        return ChatSerializer
    
    def get_queryset(self):
        """
        This view should return a list of all chats that the user participates in
        or all chats for admins
        """
        user = self.request.user
        if user.user_type in ['developer', 'maintainer']:
            return Chat.objects.all()
        return Chat.objects.filter(participants=user)
    
    def get_permissions(self):
        """
        Custom permissions:
        - Anyone can create a chat
        - Only participants can view or interact with a chat
        """
        if self.action == 'create':
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAuthenticated, IsChatParticipant]
        return [permission() for permission in permission_classes]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        
        # Return detailed chat info
        chat = Chat.objects.get(chat_id=serializer.data['chat_id'])
        return Response(
            ChatDetailSerializer(chat, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )
    
    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        """
        Returns the messages in a chat
        """
        chat = self.get_object()
        serializer = ChatDetailSerializer(chat)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_participant(self, request, pk=None):
        """
        Adds a participant to a group chat
        """
        chat = self.get_object()
        
        # Check if this is a group chat
        if not hasattr(chat, 'group_info'):
            return Response(
                {"detail": "Can only add participants to group chats."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if current user is admin
        if chat.group_info.admin != request.user and request.user.user_type not in ['developer', 'maintainer']:
            return Response(
                {"detail": "Only the group admin can add participants."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get the user to add
        user_id = request.data.get('user_id')
        if not user_id:
            return Response(
                {"detail": "user_id is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user exists
        from ..models import User
        try:
            user = User.objects.get(id_no=user_id)
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if user is already a participant
        if user in chat.participants.all():
            return Response(
                {"detail": "User is already a participant in this chat."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Add user to participants
        chat.participants.add(user)
        
        # Return updated chat
        serializer = ChatDetailSerializer(chat)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def remove_participant(self, request, pk=None):
        """
        Removes a participant from a group chat
        """
        chat = self.get_object()
        
        # Check if this is a group chat
        if not hasattr(chat, 'group_info'):
            return Response(
                {"detail": "Can only remove participants from group chats."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if current user is admin
        if chat.group_info.admin != request.user and request.user.user_type not in ['developer', 'maintainer']:
            return Response(
                {"detail": "Only the group admin can remove participants."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get the user to remove
        user_id = request.data.get('user_id')
        if not user_id:
            return Response(
                {"detail": "user_id is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user exists
        from ..models import User
        try:
            user = User.objects.get(id_no=user_id)
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if user is a participant
        if user not in chat.participants.all():
            return Response(
                {"detail": "User is not a participant in this chat."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user is the group admin
        if user == chat.group_info.admin:
            return Response(
                {"detail": "Cannot remove the group admin. Transfer admin role first."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Remove user from participants
        chat.participants.remove(user)
        
        # Return updated chat
        serializer = ChatDetailSerializer(chat)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def leave(self, request, pk=None):
        """
        Allows a user to leave a group chat
        """
        chat = self.get_object()
        
        # Check if this is a group chat
        if not hasattr(chat, 'group_info'):
            return Response(
                {"detail": "Can only leave group chats. Direct chats must be deleted."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user is a participant
        if request.user not in chat.participants.all():
            return Response(
                {"detail": "You are not a participant in this chat."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user is the group admin
        if request.user == chat.group_info.admin:
            return Response(
                {"detail": "As the admin, you must transfer admin role before leaving or delete the chat."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Remove user from participants
        chat.participants.remove(request.user)
        
        return Response(status=status.HTTP_204_NO_CONTENT)


class MessageViewSet(viewsets.ModelViewSet):
    """
    API endpoint for chat messages
    """
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated, IsChatParticipant]
    
    def get_queryset(self):
        """
        This view should return messages for chats the user participates in
        or all messages for admins
        """
        user = self.request.user
        if user.user_type in ['developer', 'maintainer']:
            return Message.objects.all()
            
        # Return messages from chats the user participates in
        return Message.objects.filter(chat__participants=user)
    
    def perform_create(self, serializer):
        # Set the sender to the current user
        serializer.save(sender=self.request.user)
    
    @action(detail=False, methods=['post'])
    def mark_read(self, request):
        """
        Marks messages as read
        """
        message_ids = request.data.get('message_ids', [])
        
        # Get messages that the user can access and haven't been read
        messages = Message.objects.filter(
            id__in=message_ids,
            chat__participants=request.user,
            is_read=False
        ).exclude(sender=request.user)  # Don't mark user's own messages
        
        # Mark as read
        updated_count = messages.update(is_read=True)
        
        return Response({'updated_count': updated_count})


class GroupChatViewSet(viewsets.ModelViewSet):
    """
    API endpoint for group chat settings
    """
    queryset = GroupChat.objects.all()
    serializer_class = GroupChatSerializer
    permission_classes = [permissions.IsAuthenticated, IsChatParticipant, IsGroupChatAdmin]
    
    def get_queryset(self):
        """
        This view should return group chats the user participates in
        or all group chats for admins
        """
        user = self.request.user
        if user.user_type in ['developer', 'maintainer']:
            return GroupChat.objects.all()
            
        # Return group chats the user participates in
        return GroupChat.objects.filter(chat__participants=user)
    
    @action(detail=True, methods=['post'])
    def transfer_admin(self, request, pk=None):
        """
        Transfers admin role to another participant
        """
        group_chat = self.get_object()
        
        # Check if current user is admin
        if group_chat.admin != request.user and request.user.user_type not in ['developer', 'maintainer']:
            return Response(
                {"detail": "Only the current admin can transfer admin role."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get the new admin
        new_admin_id = request.data.get('new_admin_id')
        if not new_admin_id:
            return Response(
                {"detail": "new_admin_id is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if new admin exists
        from ..models import User
        try:
            new_admin = User.objects.get(id_no=new_admin_id)
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if new admin is a participant
        if new_admin not in group_chat.chat.participants.all():
            return Response(
                {"detail": "The new admin must be a participant in the chat."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Transfer admin role
        group_chat.admin = new_admin
        group_chat.save()
        
        serializer = GroupChatSerializer(group_chat)
        return Response(serializer.data)