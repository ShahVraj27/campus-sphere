from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from ..models import Course, Enrollment
from ..serializers.course_serializers import (
    CourseSerializer, CourseDetailSerializer, EnrollmentSerializer, CourseWithStudentsSerializer
)


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow admins to create/edit courses
    """
    def has_permission(self, request, view):
        # Read permissions are allowed to any authenticated request
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # Write permissions are only allowed to admins
        return request.user.user_type in ['developer', 'maintainer']


class CourseViewSet(viewsets.ModelViewSet):
    """
    API endpoint for courses
    """
    queryset = Course.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CourseDetailSerializer
        elif self.action == 'students':
            return CourseWithStudentsSerializer
        return CourseSerializer
    
    @action(detail=True, methods=['get'])
    def students(self, request, pk=None):
        """
        Returns the students enrolled in a course
        """
        course = self.get_object()
        serializer = CourseWithStudentsSerializer(course)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def enroll(self, request, pk=None):
        """
        Enrolls the current user in a course
        """
        course = self.get_object()
        
        # Check if already enrolled
        if Enrollment.objects.filter(user=request.user, course=course).exists():
            return Response(
                {"detail": "You are already enrolled in this course."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create enrollment
        enrollment = Enrollment.objects.create(user=request.user, course=course)
        serializer = EnrollmentSerializer(enrollment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def unenroll(self, request, pk=None):
        """
        Unenrolls the current user from a course
        """
        course = self.get_object()
        
        # Check if enrolled
        try:
            enrollment = Enrollment.objects.get(user=request.user, course=course)
        except Enrollment.DoesNotExist:
            return Response(
                {"detail": "You are not enrolled in this course."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Delete enrollment
        enrollment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class EnrollmentViewSet(viewsets.ModelViewSet):
    """
    API endpoint for course enrollments
    """
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        This view should return a list of all enrollments for the currently authenticated user
        or all enrollments for admins
        """
        user = self.request.user
        if user.user_type in ['developer', 'maintainer']:
            return Enrollment.objects.all()
        return Enrollment.objects.filter(user=user)