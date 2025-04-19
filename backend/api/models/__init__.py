# Import all models to make them available from api.models
from .user import User
from .course import Course, Enrollment  # Make sure Enrollment is imported here
from .hostel import Hostel, Room, Occupancy
from .club import Club, ClubMembership
from .event import Event, EventParticipation
from .friend import Friend, FriendRequest
from .chat import Chat, Message, GroupChat

# Export all models
__all__ = [
    'User', 
    'Course', 'Enrollment',
    'Hostel', 'Room', 'Occupancy',
    'Club', 'ClubMembership',
    'Event', 'EventParticipation',
    'Friend', 'FriendRequest',
    'Chat', 'Message', 'GroupChat'
]