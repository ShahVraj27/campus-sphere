from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .views.user_views import UserViewSet, RegisterView
from .views.course_views import CourseViewSet, EnrollmentViewSet
from .views.hostel_views import HostelViewSet, RoomViewSet, OccupancyViewSet
from .views.club_views import ClubViewSet, ClubMembershipViewSet
from .views.event_views import EventViewSet, EventParticipationViewSet
from .views.friend_views import FriendViewSet, FriendRequestViewSet
from .views.chat_views import ChatViewSet, MessageViewSet, GroupChatViewSet

# Create a router for viewsets
router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'enrollments', EnrollmentViewSet)
router.register(r'hostels', HostelViewSet)
router.register(r'rooms', RoomViewSet)
router.register(r'occupancies', OccupancyViewSet)
router.register(r'clubs', ClubViewSet)
router.register(r'club-memberships', ClubMembershipViewSet)
router.register(r'events', EventViewSet)
router.register(r'event-participations', EventParticipationViewSet)
router.register(r'friends', FriendViewSet)
router.register(r'friend-requests', FriendRequestViewSet)
router.register(r'chats', ChatViewSet)
router.register(r'messages', MessageViewSet)
router.register(r'group-chats', GroupChatViewSet)

urlpatterns = [
    # JWT Authentication
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    
    # API Endpoints
    path('', include(router.urls)),
]