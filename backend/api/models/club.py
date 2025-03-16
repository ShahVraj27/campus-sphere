from django.db import models


class Club(models.Model):
    """
    Club model representing student organizations and clubs
    """
    name = models.CharField(max_length=100, primary_key=True)
    type = models.CharField(max_length=50)  # e.g., Technical, Cultural, Sports
    description = models.TextField(blank=True)
    members = models.ManyToManyField('User', through='ClubMembership', related_name='clubs')
    
    def __str__(self):
        return self.name


class ClubMembership(models.Model):
    """
    Represents the relationship between users and clubs
    """
    ROLE_CHOICES = (
        ('member', 'Member'),
        ('leader', 'Leader'),
        ('coordinator', 'Coordinator'),
    )
    
    user = models.ForeignKey('User', on_delete=models.CASCADE)
    club = models.ForeignKey(Club, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='member')
    joined_date = models.DateField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'club')  # A user can be part of a club only once
    
    def __str__(self):
        return f"{self.user.name} - {self.club.name} ({self.get_role_display()})"