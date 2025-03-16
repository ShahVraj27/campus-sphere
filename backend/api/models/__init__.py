# Import all models to make them available from api.models
from .user import User
from .course import Course
from .hostel import Hostel
from .club import Club
from .event import Event
from .chat import Chat
from .friend import Friend

__all__ = ['User', 'Course', 'Hostel', 'Club', 'Event', 'Chat', 'Friend']