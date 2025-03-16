from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _

from .models import (
    User, Course, Enrollment, Hostel, Room, Occupancy, 
    Club, ClubMembership, Event, EventParticipation,
    Friend, FriendRequest, Chat, Message, GroupChat
)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin configuration for the custom User model"""
    list_display = ('id_no', 'name', 'email', 'branch', 'year', 'user_type', 'is_active', 'is_staff')
    list_filter = ('user_type', 'is_active', 'is_staff')
    fieldsets = (
        (None, {'fields': ('id_no', 'password')}),
        (_('Personal info'), {'fields': ('name', 'email')}),
        (_('Permissions'), {'fields': ('user_type', 'is_active', 'is_staff', 'is_superuser',
                                       'groups', 'user_permissions')}),
        (_('Important dates'), {'fields': ('last_login',)}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('id_no', 'email', 'name', 'password1', 'password2'),
        }),
    )
    search_fields = ('id_no', 'name', 'email')
    ordering = ('id_no',)


# Course related models
@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('course_id', 'course_name', 'department')
    search_fields = ('course_id', 'course_name', 'department')
    list_filter = ('department',)


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('user', 'course', 'enrollment_date')
    list_filter = ('enrollment_date', 'course')
    search_fields = ('user__id_no', 'user__name', 'course__course_id', 'course__course_name')
    date_hierarchy = 'enrollment_date'


# Hostel related models
@admin.register(Hostel)
class HostelAdmin(admin.ModelAdmin):
    list_display = ('id', 'hostel_name')
    search_fields = ('hostel_name',)


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ('id', 'hostel', 'room_number')
    list_filter = ('hostel',)
    search_fields = ('room_number', 'hostel__hostel_name')


@admin.register(Occupancy)
class OccupancyAdmin(admin.ModelAdmin):
    list_display = ('occupant', 'room', 'from_date', 'to_date')
    list_filter = ('from_date', 'to_date')
    search_fields = ('occupant__id_no', 'occupant__name', 'room__room_number', 'room__hostel__hostel_name')
    date_hierarchy = 'from_date'


# Club related models
@admin.register(Club)
class ClubAdmin(admin.ModelAdmin):
    list_display = ('name', 'type')
    list_filter = ('type',)
    search_fields = ('name', 'type', 'description')


@admin.register(ClubMembership)
class ClubMembershipAdmin(admin.ModelAdmin):
    list_display = ('user', 'club', 'role', 'joined_date')
    list_filter = ('role', 'joined_date', 'club')
    search_fields = ('user__id_no', 'user__name', 'club__name')
    date_hierarchy = 'joined_date'


# Event related models
@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('name', 'club', 'date_time', 'location')
    list_filter = ('club', 'date_time')
    search_fields = ('name', 'description', 'location', 'club__name')
    date_hierarchy = 'date_time'


@admin.register(EventParticipation)
class EventParticipationAdmin(admin.ModelAdmin):
    list_display = ('user', 'event', 'registered_at', 'attended')
    list_filter = ('registered_at', 'attended', 'event')
    search_fields = ('user__id_no', 'user__name', 'event__name')
    date_hierarchy = 'registered_at'


# Friend related models
@admin.register(Friend)
class FriendAdmin(admin.ModelAdmin):
    list_display = ('user', 'friend', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__id_no', 'user__name', 'friend__id_no', 'friend__name')
    date_hierarchy = 'created_at'


@admin.register(FriendRequest)
class FriendRequestAdmin(admin.ModelAdmin):
    list_display = ('sender', 'receiver', 'status', 'created_at', 'updated_at')
    list_filter = ('status', 'created_at')
    search_fields = ('sender__id_no', 'sender__name', 'receiver__id_no', 'receiver__name')
    date_hierarchy = 'created_at'


# Chat related models
@admin.register(Chat)
class ChatAdmin(admin.ModelAdmin):
    list_display = ('chat_id', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at')
    date_hierarchy = 'created_at'
    readonly_fields = ('chat_id',)

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.prefetch_related('participants')


@admin.register(GroupChat)
class GroupChatAdmin(admin.ModelAdmin):
    list_display = ('chat', 'name', 'admin')
    search_fields = ('name', 'admin__name', 'admin__id_no')
    list_filter = ('admin',)


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'chat', 'sender', 'content_preview', 'date_time', 'is_read')
    list_filter = ('date_time', 'is_read', 'sender')
    search_fields = ('content', 'sender__name', 'sender__id_no')
    date_hierarchy = 'date_time'
    readonly_fields = ('id',)

    def content_preview(self, obj):
        """Return a truncated version of the content for display in the admin"""
        if len(obj.content) > 50:
            return f"{obj.content[:50]}..."
        return obj.content
    content_preview.short_description = 'Content'