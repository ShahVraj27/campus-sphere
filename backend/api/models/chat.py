from django.db import models
import uuid


class Chat(models.Model):
    """
    Chat model representing conversations between friends
    """
    chat_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    participants = models.ManyToManyField('User', related_name='chats')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        participants_str = ", ".join([p.name for p in self.participants.all()[:3]])
        if self.participants.count() > 3:
            participants_str += f" and {self.participants.count() - 3} more"
        return f"Chat between {participants_str}"


class Message(models.Model):
    """
    Message model representing individual messages in a chat
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey('User', on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField()
    date_time = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['date_time']
    
    def __str__(self):
        return f"Message from {self.sender.name} at {self.date_time.strftime('%Y-%m-%d %H:%M')}"


class GroupChat(models.Model):
    """
    Group chat model for conversations with multiple participants
    """
    chat = models.OneToOneField(Chat, on_delete=models.CASCADE, primary_key=True, related_name='group_info')
    name = models.CharField(max_length=100)
    admin = models.ForeignKey('User', on_delete=models.SET_NULL, null=True, related_name='administered_chats')
    
    def __str__(self):
        return self.name