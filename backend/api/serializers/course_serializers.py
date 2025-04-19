from rest_framework import serializers
from ..models import Course, Enrollment
from .user_serializers import UserSerializer


class CourseSerializer(serializers.ModelSerializer):
    """
    Basic Course serializer
    """
    class Meta:
        model = Course
        fields = ['course_id', 'course_name', 'department']
        read_only_fields = ['department']  # Department is derived from course_id


class CourseDetailSerializer(serializers.ModelSerializer):
    """
    Detailed Course serializer with student information
    """
    students_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = ['course_id', 'course_name', 'department', 'students_count']
        read_only_fields = ['department']
    
    def get_students_count(self, obj):
        return obj.students.count()


class EnrollmentSerializer(serializers.ModelSerializer):
    """
    Serializer for course enrollments
    """
    user = UserSerializer(read_only=True)
    user_id = serializers.CharField(write_only=True)
    course = CourseSerializer(read_only=True)
    course_id = serializers.CharField(write_only=True)
    
    class Meta:
        model = Enrollment
        fields = ['id', 'user', 'user_id', 'course', 'course_id', 'enrollment_date']
        read_only_fields = ['enrollment_date']
    
    def create(self, validated_data):
        user_id = validated_data.pop('user_id')
        course_id = validated_data.pop('course_id')
        
        # Check if enrollment already exists
        if Enrollment.objects.filter(user_id=user_id, course_id=course_id).exists():
            raise serializers.ValidationError("User is already enrolled in this course.")
        
        enrollment = Enrollment.objects.create(
            user_id=user_id,
            course_id=course_id,
            **validated_data
        )
        return enrollment


class CourseWithStudentsSerializer(serializers.ModelSerializer):
    """
    Course serializer that includes enrolled students
    """
    students = UserSerializer(many=True, read_only=True)
    
    class Meta:
        model = Course
        fields = ['course_id', 'course_name', 'department', 'students']
        read_only_fields = ['department']