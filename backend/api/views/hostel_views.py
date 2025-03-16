from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from ..models import Hostel, Room, Occupancy
from ..serializers.hostel_serializers import (
    HostelSerializer, HostelDetailSerializer, RoomSerializer, 
    RoomWithOccupantsSerializer, OccupancySerializer
)


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow admins to create/edit hostels and rooms
    """
    def has_permission(self, request, view):
        # Read permissions are allowed to any authenticated request
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # Write permissions are only allowed to admins
        return request.user.user_type in ['developer', 'maintainer']


class HostelViewSet(viewsets.ModelViewSet):
    """
    API endpoint for hostels
    """
    queryset = Hostel.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]
    
    def get_serializer_class(self):
        if self.action == 'retrieve' or self.action == 'rooms':
            return HostelDetailSerializer
        return HostelSerializer
    
    @action(detail=True, methods=['get'])
    def rooms(self, request, pk=None):
        """
        Returns the rooms in a hostel
        """
        hostel = self.get_object()
        serializer = HostelDetailSerializer(hostel)
        return Response(serializer.data)


class RoomViewSet(viewsets.ModelViewSet):
    """
    API endpoint for hostel rooms
    """
    queryset = Room.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]
    
    def get_serializer_class(self):
        if self.action == 'retrieve' or self.action == 'occupants':
            return RoomWithOccupantsSerializer
        return RoomSerializer
    
    def get_queryset(self):
        """
        Optionally filter rooms by hostel
        """
        queryset = Room.objects.all()
        hostel_id = self.request.query_params.get('hostel', None)
        if hostel_id is not None:
            queryset = queryset.filter(hostel_id=hostel_id)
        return queryset
    
    @action(detail=True, methods=['get'])
    def occupants(self, request, pk=None):
        """
        Returns the occupants of a room
        """
        room = self.get_object()
        serializer = RoomWithOccupantsSerializer(room)
        return Response(serializer.data)


class OccupancyViewSet(viewsets.ModelViewSet):
    """
    API endpoint for room occupancies
    """
    queryset = Occupancy.objects.all()
    serializer_class = OccupancySerializer
    
    def get_permissions(self):
        """
        Custom permissions:
        - Regular users can only view their own occupancy
        - Only admins can create, update, or delete occupancies
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """
        This view should return:
        - All occupancies for admins
        - Only the user's own occupancy for regular users
        """
        user = self.request.user
        if user.user_type in ['developer', 'maintainer']:
            return Occupancy.objects.all()
        return Occupancy.objects.filter(occupant=user)