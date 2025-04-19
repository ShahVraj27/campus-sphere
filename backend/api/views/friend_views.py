from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from ..models import Friend, FriendRequest
from ..serializers.friend_serializers import (
    FriendSerializer, FriendRequestSerializer, FriendListSerializer
)


class IsSenderOrReceiver(permissions.BasePermission):
    """
    Custom permission to only allow the sender or receiver to view or update a friend request
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return obj.sender == request.user or obj.receiver == request.user
            
        # Write permissions are only allowed to the receiver or admins
        if request.user.user_type in ['developer', 'maintainer']:
            return True
            
        # Receiver can update status
        if view.action in ['update', 'partial_update']:
            return obj.receiver == request.user
            
        # Sender can delete (cancel) request
        if view.action == 'destroy':
            return obj.sender == request.user
            
        return False


class FriendViewSet(viewsets.ModelViewSet):
    """
    API endpoint for friendships
    """
    queryset = Friend.objects.all()
    serializer_class = FriendSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        This view should return a list of all friendships for the currently authenticated user
        or all friendships for admins
        """
        user = self.request.user
        if user.user_type in ['developer', 'maintainer']:
            return Friend.objects.all()
        return Friend.objects.filter(user=user)
    
    def get_permissions(self):
        """
        Custom permissions:
        - Only admins can directly create/delete friendships
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    @action(detail=False, methods=['get'])
    def my_friends(self, request):
        """
        Returns the current user's friends
        """
        friends = Friend.objects.filter(user=request.user)
        serializer = FriendListSerializer(friends, many=True)
        return Response(serializer.data)


class FriendRequestViewSet(viewsets.ModelViewSet):
    """
    API endpoint for friend requests
    """
    queryset = FriendRequest.objects.all()
    serializer_class = FriendRequestSerializer
    permission_classes = [permissions.IsAuthenticated, IsSenderOrReceiver]
    
    def get_queryset(self):
        """
        This view should return friend requests relevant to the current user
        or all requests for admins
        """
        user = self.request.user
        if user.user_type in ['developer', 'maintainer']:
            return FriendRequest.objects.all()
        
        # Return requests sent by or received by the current user
        return FriendRequest.objects.filter(sender=user) | FriendRequest.objects.filter(receiver=user)
    
    def create(self, request, *args, **kwargs):
        """
        Custom create to automatically set the sender as the current user
        """
        # Set the sender to the current user if not specified
        if 'sender_id' not in request.data:
            request.data['sender_id'] = request.user.id_no
            
        return super().create(request, *args, **kwargs)
    
    @action(detail=False, methods=['get'])
    def sent(self, request):
        """
        Returns friend requests sent by the current user
        """
        sent_requests = FriendRequest.objects.filter(sender=request.user)
        serializer = FriendRequestSerializer(sent_requests, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def received(self, request):
        """
        Returns friend requests received by the current user
        """
        received_requests = FriendRequest.objects.filter(receiver=request.user)
        serializer = FriendRequestSerializer(received_requests, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        """
        Accepts a friend request
        """
        friend_request = self.get_object()
        
        # Check if user is the receiver
        if friend_request.receiver != request.user:
            return Response(
                {"detail": "Only the receiver can accept a friend request."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if request is pending
        if friend_request.status != 'pending':
            return Response(
                {"detail": f"This request has already been {friend_request.status}."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update status to accepted
        friend_request.status = 'accepted'
        friend_request.save()
        
        serializer = FriendRequestSerializer(friend_request, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """
        Rejects a friend request
        """
        friend_request = self.get_object()
        
        # Check if user is the receiver
        if friend_request.receiver != request.user:
            return Response(
                {"detail": "Only the receiver can reject a friend request."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if request is pending
        if friend_request.status != 'pending':
            return Response(
                {"detail": f"This request has already been {friend_request.status}."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update status to rejected
        friend_request.status = 'rejected'
        friend_request.save()
        
        serializer = FriendRequestSerializer(friend_request, context={'request': request})
        return Response(serializer.data)