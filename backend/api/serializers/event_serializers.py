from rest_framework import serializers
from ..models import Event, EventParticipation
from .club_serializers import ClubSerializer
from .user_serializers import UserSerializer


class EventSerializer(serializers.ModelSerializer):
    """
    Basic event serializer
    """
    club_name = serializers.ReadOnlyField(source='club.name')
    participants_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Event
        fields = ['id', 'name', 'club', 'club_name', 'date_time', 'location', 
                  'description', 'participants_count', 'created_at']
        read_only_fields = ['created_at']
    
    def get_participants_count(self, obj):
        return obj.participants.count()


class EventParticipationSerializer(serializers.ModelSerializer):
    """
    Serializer for event participations
    """
    user = UserSerializer(read_only=True)
    user_id = serializers.CharField(write_only=True)
    event = EventSerializer(read_only=True)
    event_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = EventParticipation
        fields = ['id', 'user', 'user_id', 'event', 'event_id', 'registered_at', 'attended']
        read_only_fields = ['registered_at']
    
    def create(self, validated_data):
        user_id = validated_data.pop('user_id')
        event_id = validated_data.pop('event_id')
        
        # Check if participation already exists
        if EventParticipation.objects.filter(user_id=user_id, event_id=event_id).exists():
            raise serializers.ValidationError("User is already registered for this event.")
        
        participation = EventParticipation.objects.create(
            user_id=user_id,
            event_id=event_id,
            **validated_data
        )
        return participation


class EventDetailSerializer(serializers.ModelSerializer):
    """
    Detailed event serializer with club and participant information
    """
    club = ClubSerializer(read_only=True)
    participants = serializers.SerializerMethodField()
    
    class Meta:
        model = Event
        fields = ['id', 'name', 'club', 'date_time', 'location', 'description', 
                  'participants', 'created_at']
        read_only_fields = ['created_at']
    
    def get_participants(self, obj):
        participations = EventParticipation.objects.filter(event=obj)
        return EventParticipationSerializer(participations, many=True).data


class UserEventsSerializer(serializers.ModelSerializer):
    """
    Serializer for listing user's registered events
    """
    event = EventSerializer()
    
    class Meta:
        model = EventParticipation
        fields = ['id', 'event', 'registered_at', 'attended']