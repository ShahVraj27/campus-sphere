from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.core.validators import EmailValidator

class UserManager(BaseUserManager):
    def create_user(self, id_no, email, name, password=None, **extra_fields):
        """
        Creates and saves a new user
        """
        if not id_no:
            raise ValueError('Users must have an ID number')
        if not email:
            raise ValueError('Users must have an email address')
        
        user = self.model(
            id_no=id_no,
            email=self.normalize_email(email),
            name=name,
            **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, id_no, email, name, password=None, **extra_fields):
        """
        Creates and saves a new superuser (developer)
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('user_type', 'developer')
        
        return self.create_user(id_no, email, name, password, **extra_fields)
    
    def create_maintainer(self, id_no, email, name, password=None, **extra_fields):
        """
        Creates and saves a new maintainer
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('user_type', 'maintainer')
        
        return self.create_user(id_no, email, name, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom user model that uses ID number as the unique identifier
    and supports the campus sphere domain requirements
    """
    USER_TYPE_CHOICES = (
        ('developer', 'Developer'),
        ('maintainer', 'Maintainer'),
        ('user', 'Regular User'),
    )
    
    id_no = models.CharField(max_length=20, primary_key=True, unique=True, 
                           verbose_name="ID Number")
    email = models.EmailField(max_length=255, unique=True, 
                            validators=[EmailValidator()])
    name = models.CharField(max_length=255)
    password = models.CharField(max_length=255)
    # Branch and Year are derived attributes from Course, implemented as properties
    
    # User type for permission levels
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default='user')
    
    # Django specific fields
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    
    # When user was created/updated
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'id_no'
    REQUIRED_FIELDS = ['email', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.id_no})"
    
    @property
    def branch(self):
        """
        Derive branch from course enrollment if available
        """
        from .course import Course  # Import here to avoid circular import
        enrollment = Course.objects.filter(students=self).first()
        if enrollment:
            # Assuming the branch can be derived from course_id according to your schema
            # This implementation will depend on the exact format of course IDs
            # For example, if course_id has format like "CS101", then branch would be "CS"
            return enrollment.department
        return None
        
    @property
    def year(self):
        """
        Derive year from ID number if it follows a pattern like 2023A7PS0466G
        where 2023 indicates the student's joining year
        """
        # Example assumes ID like 2023A7PS0466G where first 4 digits are year
        if len(self.id_no) >= 4 and self.id_no[:4].isdigit():
            joining_year = int(self.id_no[:4])
            # Calculate current year of study
            import datetime
            current_year = datetime.datetime.now().year
            year_of_study = current_year - joining_year + 1
            return max(1, min(5, year_of_study))  # Limit between 1-5 years
        return None