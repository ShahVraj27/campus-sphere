from django.db import models


class Course(models.Model):
    """
    Course model representing academic courses in the university
    """
    course_id = models.CharField(max_length=20, primary_key=True)
    course_name = models.CharField(max_length=255)
    department = models.CharField(max_length=100)  # Derived from course_id
    students = models.ManyToManyField('User', through='Enrollment', related_name='courses')
    
    class Meta:
        ordering = ['course_id']
    
    def __str__(self):
        return f"{self.course_id}: {self.course_name}"
    
    def save(self, *args, **kwargs):
        """
        Override save to derive department from course_id
        Assuming course_id follows a format like CS101 where CS is the department code
        """
        # Extract department code from course_id (assuming it's the alphabetic prefix)
        import re
        dept_match = re.match(r'^([A-Za-z]+)', self.course_id)
        if dept_match:
            self.department = dept_match.group(1).upper()
        super().save(*args, **kwargs)


class Enrollment(models.Model):
    """
    Represents the enrollment relationship between users and courses
    """
    user = models.ForeignKey('User', on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    enrollment_date = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'course')  # A user can enroll in a course only once
    
    def __str__(self):
        return f"{self.user.name} enrolled in {self.course.course_id}"