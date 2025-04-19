from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from ..models import Hostel, Room, Occupancy, User
from ..serializers.hostel_serializers import (
    HostelSerializer, HostelDetailSerializer, RoomSerializer, 
    RoomWithOccupantsSerializer, OccupancySerializer
)
from datetime import date


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
    
    def perform_create(self, serializer):
        """
        When creating a hostel, automatically create a default room
        """
        hostel = serializer.save()
        
        # Create a default room
        Room.objects.create(
            hostel=hostel,
            room_number="101"  # Default room number
        )
        
        return hostel
    
    @action(detail=False, methods=['get'], url_path='my_hostel')
    def my_hostel(self, request):
        user = request.user

        occupancy = Occupancy.objects.select_related('room__hostel').filter(occupant=request.user).first()


        if occupancy and occupancy.room and occupancy.room.hostel:
            hostel = occupancy.room.hostel
            serializer = self.get_serializer(hostel)
            return Response(serializer.data)
        else:
            return Response({"detail": "Hostel not found for user"}, status=404)

    @action(detail=True, methods=['get'])
    def rooms(self, request, pk=None):
        """
        Returns the rooms in a hostel
        """
        hostel = self.get_object()
        serializer = HostelDetailSerializer(hostel)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def bulk_assign(self, request, pk=None):
        """
        Bulk assign students to a hostel room (admin only)
        """
        if request.user.user_type not in ['developer', 'maintainer']:
            return Response(
                {"detail": "You do not have permission to perform this action."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        hostel = self.get_object()
        user_ids = request.data.get('user_ids', [])
        room_id = request.data.get('room_id')
        
        if not user_ids:
            return Response(
                {"detail": "No user IDs provided."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not room_id:
            return Response(
                {"detail": "Room ID is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            room = Room.objects.get(id=room_id, hostel=hostel)
        except Room.DoesNotExist:
            return Response(
                {"detail": "Room not found in this hostel."},
                status=status.HTTP_404_NOT_FOUND
            )
            
        results = {'success': [], 'failed': []}
        
        for user_id in user_ids:
            try:
                # Check if user exists
                user = User.objects.get(id_no=user_id)
                
                # Check if user already has an active occupancy
                existing_occupancy = Occupancy.objects.filter(
                    occupant=user, 
                    to_date__isnull=True
                ).first()
                
                if existing_occupancy:
                    # End previous occupancy
                    existing_occupancy.to_date = date.today()
                    existing_occupancy.save()
                
                # Create new occupancy
                Occupancy.objects.create(
                    occupant=user,
                    room=room,
                    from_date=date.today()
                )
                
                results['success'].append({
                    'user_id': user_id,
                    'name': user.name,
                    'room': room.room_number
                })
                
            except User.DoesNotExist:
                results['failed'].append({
                    'user_id': user_id,
                    'reason': 'User not found'
                })
            except Exception as e:
                results['failed'].append({
                    'user_id': user_id,
                    'reason': str(e)
                })
        
        return Response(results)

    @action(detail=True, methods=['get'])
    def residents(self, request, pk=None):
        """
        Returns all residents of a hostel
        """
        hostel = self.get_object()
        
        # Get all active occupancies in this hostel
        occupancies = Occupancy.objects.filter(
            room__hostel=hostel,
            to_date__isnull=True
        ).select_related('occupant', 'room')
        
        # Extract user data with proper error handling
        residents = []
        for occ in occupancies:
            try:
                residents.append({
                    'id_no': occ.occupant.id_no,
                    'name': occ.occupant.name,
                    'email': occ.occupant.email,
                    'room_number': occ.room.room_number,
                    'room_id': occ.room.id
                })
            except AttributeError:
                # Handle case where relationship has missing attributes
                continue
        
        return Response(residents)

    @action(detail=True, methods=['post'])
    def create_rooms(self, request, pk=None):
        """
        Create multiple rooms for a hostel at once (admin only)
        """
        if request.user.user_type not in ['developer', 'maintainer']:
            return Response(
                {"detail": "You do not have permission to perform this action."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        hostel = self.get_object()
        room_count = request.data.get('room_count', 0)
        starting_number = request.data.get('starting_number', 1)
        
        if room_count <= 0:
            return Response(
                {"detail": "Invalid room count."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        created_rooms = []
        
        for i in range(room_count):
            room_number = str(starting_number + i)
            room, created = Room.objects.get_or_create(
                hostel=hostel,
                room_number=room_number
            )
            created_rooms.append({
                'id': room.id,
                'room_number': room.room_number,
                'created': created
            })
        
        return Response({
            'created_rooms': created_rooms
        })


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