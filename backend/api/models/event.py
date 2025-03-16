from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError


def validate_future_date(value):
    """
    Validate that the date is in the future
    """
    if value < timezone.now():
        raise ValidationError('Event date & time must be in the future')


class Event(models.Model):
    """
    Event model representing club events and activities
    """
    name = models.CharField(max_length=200)
    club = models.ForeignKey('Club', on_delete=models.CASCADE, related_name='events')
    date_time = models.DateTimeField(validators=[validate_future_date])
    location = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        # Events are uniquely identified by the combination of club and date_time
        unique_together = ('club', 'date_time')
    
    def __str__(self):
        return f"{self.name} by {self.club.name} on {self.date_time.strftime('%Y-%m-%d %H:%M')}"
    
    def clean(self):
        """
        Custom validation to ensure date_time is in the future
        """
        if self.date_time and self.date_time < timezone.now():
            raise ValidationError({'date_time': 'Event date & time must be in the future'})
    
    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)


class EventParticipation(models.Model):
    """
    Represents users participating in events
    """
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='participations')
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='participants')
    registered_at = models.DateTimeField(auto_now_add=True)
    attended = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ('user', 'event')  # A user can register for an event only once
    
    def __str__(self):
        return f"{self.user.name} - {self.event.name}"