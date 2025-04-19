from django.db import models


class Hostel(models.Model):
    """
    Hostel model representing student accommodation
    """
    hostel_name = models.CharField(max_length=100)
    location = models.CharField(max_length=255, default='')
    total_rooms = models.PositiveIntegerField(default=0)
    warden = models.CharField(max_length=100, default='')
    
    def __str__(self):
        return self.hostel_name


class Room(models.Model):
    """
    Room within a hostel
    """
    hostel = models.ForeignKey(Hostel, on_delete=models.CASCADE, related_name='rooms')
    room_number = models.CharField(max_length=20)
    
    class Meta:
        unique_together = ('hostel', 'room_number')  # Room numbers must be unique within a hostel
    
    def __str__(self):
        return f"{self.hostel.hostel_name} - Room {self.room_number}"


class Occupancy(models.Model):
    """
    Represents the relationship between a user and their hostel room
    """
    occupant = models.OneToOneField('User', on_delete=models.CASCADE, primary_key=True, 
                                  related_name='hostel_room')
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='occupants')
    from_date = models.DateField()
    to_date = models.DateField(null=True, blank=True)  # Null if currently occupied
    
    class Meta:
        verbose_name_plural = "Occupancies"
    
    def __str__(self):
        return f"{self.occupant.name} in {self.room}"