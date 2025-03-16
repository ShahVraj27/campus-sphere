from rest_framework import serializers
from ..models import Hostel, Room, Occupancy
from .user_serializers import UserSerializer


class RoomSerializer(serializers.ModelSerializer):
    """
    Serializer for hostel rooms
    """
    hostel_name = serializers.ReadOnlyField(source='hostel.hostel_name')
    occupants_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Room
        fields = ['id', 'hostel', 'hostel_name', 'room_number', 'occupants_count']
    
    def get_occupants_count(self, obj):
        return obj.occupants.count()


class HostelSerializer(serializers.ModelSerializer):
    """
    Basic hostel serializer
    """
    rooms_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Hostel
        fields = ['id', 'hostel_name', 'rooms_count']
    
    def get_rooms_count(self, obj):
        return obj.rooms.count()


class HostelDetailSerializer(serializers.ModelSerializer):
    """
    Detailed hostel serializer with rooms
    """
    rooms = RoomSerializer(many=True, read_only=True)
    
    class Meta:
        model = Hostel
        fields = ['id', 'hostel_name', 'rooms']


class OccupancySerializer(serializers.ModelSerializer):
    """
    Serializer for room occupancy
    """
    occupant = UserSerializer(read_only=True)
    occupant_id = serializers.CharField(write_only=True)
    room = RoomSerializer(read_only=True)
    room_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Occupancy
        fields = ['occupant', 'occupant_id', 'room', 'room_id', 'from_date', 'to_date']
    
    def create(self, validated_data):
        occupant_id = validated_data.pop('occupant_id')
        room_id = validated_data.pop('room_id')
        
        # Check if user already has an active occupancy
        if Occupancy.objects.filter(occupant_id=occupant_id, to_date__isnull=True).exists():
            raise serializers.ValidationError("User already has an active hostel room assignment.")
        
        occupancy = Occupancy.objects.create(
            occupant_id=occupant_id,
            room_id=room_id,
            **validated_data
        )
        return occupancy


class RoomWithOccupantsSerializer(serializers.ModelSerializer):
    """
    Room serializer with occupant details
    """
    hostel_name = serializers.ReadOnlyField(source='hostel.hostel_name')
    occupants = serializers.SerializerMethodField()
    
    class Meta:
        model = Room
        fields = ['id', 'hostel', 'hostel_name', 'room_number', 'occupants']
    
    def get_occupants(self, obj):
        # Get active occupancies (to_date is null)
        active_occupancies = obj.occupants.filter(to_date__isnull=True)
        return OccupancySerializer(active_occupancies, many=True).data