from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from ..models import Club, ClubMembership
from ..serializers.club_serializers import (
    ClubSerializer, ClubDetailSerializer, ClubMembershipSerializer, UserClubsSerializer
)


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow admins to create/edit clubs
    """
    def has_permission(self, request, view):
        # Read permissions are allowed to any authenticated request
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # Write permissions are only allowed to admins
        return request.user.user_type in ['developer', 'maintainer']


class IsClubLeaderOrAdmin(permissions.BasePermission):
    """
    Custom permission to allow club leaders to edit their club info
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any authenticated request
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # Write permissions for admins
        if request.user.user_type in ['developer', 'maintainer']:
            return True
            
        # Also allow club leaders to edit
        try:
            membership = ClubMembership.objects.get(user=request.user, club=obj)
            return membership.role in ['leader', 'coordinator']
        except ClubMembership.DoesNotExist:
            return False


class ClubViewSet(viewsets.ModelViewSet):
    """
    API endpoint for clubs
    """
    queryset = Club.objects.all()
    
    def get_permissions(self):
        if self.action in ['create']:
            permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]
        else:
            permission_classes = [permissions.IsAuthenticated, IsClubLeaderOrAdmin]
        return [permission() for permission in permission_classes]
    
    def get_serializer_class(self):
        if self.action == 'retrieve' or self.action == 'members':
            return ClubDetailSerializer
        return ClubSerializer
    
    @action(detail=True, methods=['get'])
    def members(self, request, pk=None):
        """
        Returns the members of a club
        """
        club = self.get_object()
        serializer = ClubDetailSerializer(club)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        """
        Makes the current user join a club
        """
        club = self.get_object()
        
        # Check if already a member
        if ClubMembership.objects.filter(user=request.user, club=club).exists():
            return Response(
                {"detail": "You are already a member of this club."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create membership (default role is 'member')
        membership = ClubMembership.objects.create(user=request.user, club=club)
        serializer = ClubMembershipSerializer(membership)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def leave(self, request, pk=None):
        """
        Makes the current user leave a club
        """
        club = self.get_object()
        
        # Check if a member
        try:
            membership = ClubMembership.objects.get(user=request.user, club=club)
        except ClubMembership.DoesNotExist:
            return Response(
                {"detail": "You are not a member of this club."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Leaders cannot leave without transferring leadership
        if membership.role == 'leader':
            # Check if there are other leaders
            other_leaders = ClubMembership.objects.filter(
                club=club, 
                role='leader'
            ).exclude(user=request.user)
            
            if not other_leaders.exists():
                return Response(
                    {"detail": "As the only leader, you must transfer leadership before leaving."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Delete membership
        membership.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ClubMembershipViewSet(viewsets.ModelViewSet):
    """
    API endpoint for club memberships
    """
    queryset = ClubMembership.objects.all()
    serializer_class = ClubMembershipSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Filter memberships by user or club
        """
        queryset = ClubMembership.objects.all()
        
        user_id = self.request.query_params.get('user', None)
        club_name = self.request.query_params.get('club', None)
        
        if user_id is not None:
            queryset = queryset.filter(user__id_no=user_id)
        
        if club_name is not None:
            queryset = queryset.filter(club__name=club_name)
            
        # Regular users can only see their own memberships
        if self.request.user.user_type not in ['developer', 'maintainer']:
            queryset = queryset.filter(user=self.request.user)
            
        return queryset
    
    def get_permissions(self):
        """
        Custom permissions:
        - Regular users can only update their own role if they're a leader
        - Only admins can create, delete, or update other users' memberships
        """
        if self.action in ['create', 'destroy']:
            permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]
        elif self.action in ['update', 'partial_update']:
            permission_classes = [permissions.IsAuthenticated, IsClubLeaderOrAdmin]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    @action(detail=False, methods=['get'])
    def my_clubs(self, request):
        """
        Returns the clubs that the current user is a member of
        """
        memberships = ClubMembership.objects.filter(user=request.user)
        serializer = UserClubsSerializer(memberships, many=True)
        return Response(serializer.data)