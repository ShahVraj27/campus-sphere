from rest_framework import serializers
from ..models import Club, ClubMembership
from .user_serializers import UserSerializer


class ClubSerializer(serializers.ModelSerializer):
    """
    Basic club serializer
    """
    members_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Club
        fields = ['name', 'type', 'description', 'members_count']
    
    def get_members_count(self, obj):
        return obj.members.count()


class ClubMembershipSerializer(serializers.ModelSerializer):
    """
    Serializer for club memberships
    """
    user = UserSerializer(read_only=True)
    user_id = serializers.CharField(write_only=True)
    club = ClubSerializer(read_only=True)
    club_name = serializers.CharField(write_only=True)
    
    class Meta:
        model = ClubMembership
        fields = ['id', 'user', 'user_id', 'club', 'club_name', 'role', 'joined_date']
        read_only_fields = ['joined_date']
    
    def create(self, validated_data):
        user_id = validated_data.pop('user_id')
        club_name = validated_data.pop('club_name')
        
        # Check if membership already exists
        if ClubMembership.objects.filter(user_id=user_id, club__name=club_name).exists():
            raise serializers.ValidationError("User is already a member of this club.")
        
        membership = ClubMembership.objects.create(
            user_id=user_id,
            club_id=club_name,
            **validated_data
        )
        return membership


class ClubDetailSerializer(serializers.ModelSerializer):
    """
    Detailed club serializer with member information
    """
    memberships = serializers.SerializerMethodField()
    
    class Meta:
        model = Club
        fields = ['name', 'type', 'description', 'memberships']
    
    def get_memberships(self, obj):
        memberships = ClubMembership.objects.filter(club=obj)
        return ClubMembershipSerializer(memberships, many=True).data


class UserClubsSerializer(serializers.ModelSerializer):
    """
    Serializer for listing user's club memberships
    """
    club = ClubSerializer()
    
    class Meta:
        model = ClubMembership
        fields = ['id', 'club', 'role', 'joined_date']