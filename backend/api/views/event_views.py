from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from ..models import Event, EventParticipation, ClubMembership
from ..serializers.event_serializers import (
    EventSerializer, EventDetailSerializer, EventParticipationSerializer, UserEventsSerializer
)


class IsClubMemberOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow club members to create events
    """
    def has_permission(self, request, view):
        # Read permissions are allowed to any authenticated request
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # Write permissions are only allowed to admins or club members
        if request.user.user_type in ['developer', 'maintainer']:
            return True
            
        # For create, check if user is providing a club they're a member of
        if view.action == 'create' and 'club' in request.data:
            try:
                club_id = request.data['club']
                return ClubMembership.objects.filter(user=request.user, club_id=club_id).exists()
            except:
                return False
        
        return True  # Other actions checked with has_object_permission
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any authenticated request
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # Write permissions are only allowed to admins or club members
        if request.user.user_type in ['developer', 'maintainer']:
            return True
            
        # Check if user is a club member
        return ClubMembership.objects.filter(user=request.user, club=obj.club).exists()


class EventViewSet(viewsets.ModelViewSet):
    """
    API endpoint for events
    """
    queryset = Event.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsClubMemberOrReadOnly]
    
    def get_serializer_class(self):
        if self.action == 'retrieve' or self.action == 'participants':
            return EventDetailSerializer
        return EventSerializer
    
    def get_queryset(self):
        """
        Optionally filter events by club or date range
        """
        queryset = Event.objects.all()
        
        # Filter by club
        club = self.request.query_params.get('club', None)
        if club is not None:
            queryset = queryset.filter(club__name=club)
        
        # Filter by date range (future events by default)
        from_date = self.request.query_params.get('from_date', None)
        to_date = self.request.query_params.get('to_date', None)
        
        if from_date is None:
            # By default, show future events
            queryset = queryset.filter(date_time__gte=timezone.now())
        else:
            queryset = queryset.filter(date_time__gte=from_date)
            
        if to_date is not None:
            queryset = queryset.filter(date_time__lte=to_date)
            
        # Order by date
        return queryset.order_by('date_time')
    
    @action(detail=True, methods=['get'])
    def participants(self, request, pk=None):
        """
        Returns the participants of an event
        """
        event = self.get_object()
        serializer = EventDetailSerializer(event)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def register(self, request, pk=None):
        """
        Registers the current user for an event
        """
        event = self.get_object()
        
        # Check if already registered
        if EventParticipation.objects.filter(user=request.user, event=event).exists():
            return Response(
                {"detail": "You are already registered for this event."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if event is in the past
        if event.date_time < timezone.now():
            return Response(
                {"detail": "Cannot register for past events."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create participation
        participation = EventParticipation.objects.create(user=request.user, event=event)
        serializer = EventParticipationSerializer(participation)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def unregister(self, request, pk=None):
        """
        Unregisters the current user from an event
        """
        event = self.get_object()
        
        # Check if registered
        try:
            participation = EventParticipation.objects.get(user=request.user, event=event)
        except EventParticipation.DoesNotExist:
            return Response(
                {"detail": "You are not registered for this event."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if event is in the past
        if event.date_time < timezone.now():
            return Response(
                {"detail": "Cannot unregister from past events."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Delete participation
        participation.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class EventParticipationViewSet(viewsets.ModelViewSet):
    """
    API endpoint for event participations
    """
    queryset = EventParticipation.objects.all()
    serializer_class = EventParticipationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Filter participations by user or event
        """
        queryset = EventParticipation.objects.all()
        
        user_id = self.request.query_params.get('user', None)
        event_id = self.request.query_params.get('event', None)
        
        if user_id is not None:
            queryset = queryset.filter(user__id_no=user_id)
        
        if event_id is not None:
            queryset = queryset.filter(event_id=event_id)
            
        # Regular users can only see their own participations
        if self.request.user.user_type not in ['developer', 'maintainer']:
            queryset = queryset.filter(user=self.request.user)
            
        return queryset
    
    def get_permissions(self):
        """
        Custom permissions:
        - Only admins or event organizers can update participation (e.g., mark as attended)
        """
        if self.action in ['update', 'partial_update']:
            permission_classes = [permissions.IsAuthenticated, IsClubMemberOrReadOnly]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    @action(detail=False, methods=['get'])
    def my_events(self, request):
        """
        Returns the events that the current user is registered for
        """
        participations = EventParticipation.objects.filter(user=request.user)
        serializer = UserEventsSerializer(participations, many=True)
        return Response(serializer.data)