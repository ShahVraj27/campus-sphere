from django.db import models
from django.core.exceptions import ValidationError


class Friend(models.Model):
    """
    Friend model representing the friendships between users
    """
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='friends')
    friend = models.ForeignKey('User', on_delete=models.CASCADE, related_name='friend_of')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'friend')
    
    def __str__(self):
        return f"{self.user.name} - {self.friend.name}"
    
    def clean(self):
        """
        Ensure a user cannot be friends with themselves
        """
        if self.user == self.friend:
            raise ValidationError("A user cannot be friends with themselves")
    
    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)


class FriendRequest(models.Model):
    """
    Model for friend requests
    """
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    )
    
    sender = models.ForeignKey('User', on_delete=models.CASCADE, related_name='sent_requests')
    receiver = models.ForeignKey('User', on_delete=models.CASCADE, related_name='received_requests')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('sender', 'receiver')
    
    def __str__(self):
        return f"{self.sender.name} to {self.receiver.name} ({self.get_status_display()})"
    
    def clean(self):
        """
        Ensure a user cannot send a friend request to themselves
        """
        if self.sender == self.receiver:
            raise ValidationError("A user cannot send a friend request to themselves")
    
    def save(self, *args, **kwargs):
        self.clean()
        
        # If the request is being accepted, create the friendship
        if self.status == 'accepted' and self.pk is not None:
            old_instance = FriendRequest.objects.get(pk=self.pk)
            if old_instance.status != 'accepted':
                # Create the bidirectional friendship
                Friend.objects.create(user=self.sender, friend=self.receiver)
                Friend.objects.create(user=self.receiver, friend=self.sender)
        
        super().save(*args, **kwargs)