from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from ..models import Course, Enrollment, User
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
    
    @action(detail=True, methods=['post'])
    def bulk_enroll(self, request, pk=None):
        """
        Bulk enroll students in a course (admin only)
        """
        if request.user.user_type not in ['developer', 'maintainer']:
            return Response(
                {"detail": "You do not have permission to perform this action."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        course = self.get_object()
        user_ids = request.data.get('user_ids', [])
        
        if not user_ids:
            return Response(
                {"detail": "No user IDs provided."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        results = {'success': [], 'failed': []}
        
        for user_id in user_ids:
            try:
                # Check if user exists
                user = User.objects.get(id_no=user_id)
                
                # Check if enrollment already exists
                if not Enrollment.objects.filter(user=user, course=course).exists():
                    enrollment = Enrollment.objects.create(user=user, course=course)
                    results['success'].append({
                        'user_id': user_id,
                        'name': user.name
                    })
                else:
                    results['failed'].append({
                        'user_id': user_id,
                        'reason': 'Already enrolled'
                    })
            except User.DoesNotExist:
                results['failed'].append({
                    'user_id': user_id,
                    'reason': 'User not found'
                })
            except Exception as e:
                results['failed'].append({
                    'user_id': user_id,
                    'reason': str(e)
                })
        
        return Response(results)
    
    @action(detail=True, methods=['post'])
    def bulk_unenroll(self, request, pk=None):
        """
        Bulk unenroll students from a course (admin only)
        """
        if request.user.user_type not in ['developer', 'maintainer']:
            return Response(
                {"detail": "You do not have permission to perform this action."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        course = self.get_object()
        user_ids = request.data.get('user_ids', [])
        
        if not user_ids:
            return Response(
                {"detail": "No user IDs provided."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        results = {'success': [], 'failed': []}
        
        for user_id in user_ids:
            try:
                # Check if user exists
                user = User.objects.get(id_no=user_id)
                
                # Check if enrollment exists
                try:
                    enrollment = Enrollment.objects.get(user=user, course=course)
                    enrollment.delete()
                    results['success'].append({
                        'user_id': user_id,
                        'name': user.name
                    })
                except Enrollment.DoesNotExist:
                    results['failed'].append({
                        'user_id': user_id,
                        'reason': 'Not enrolled in this course'
                    })
            except User.DoesNotExist:
                results['failed'].append({
                    'user_id': user_id,
                    'reason': 'User not found'
                })
            except Exception as e:
                results['failed'].append({
                    'user_id': user_id,
                    'reason': str(e)
                })
        
        return Response(results)


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
    
    def create(self, request, *args, **kwargs):
        """
        Create enrollment(s) - allows admin to enroll others
        """
        # Check if admin is trying to enroll other users
        if request.user.user_type in ['developer', 'maintainer']:
            # Handle bulk enrollment
            if 'bulk_enrollments' in request.data:
                created_enrollments = []
                errors = []
                
                for enrollment_data in request.data['bulk_enrollments']:
                    serializer = self.get_serializer(data=enrollment_data)
                    if serializer.is_valid():
                        try:
                            enrollment = serializer.save()
                            created_enrollments.append(self.get_serializer(enrollment).data)
                        except Exception as e:
                            errors.append(f"{enrollment_data}: {str(e)}")
                    else:
                        errors.append(f"{enrollment_data}: {serializer.errors}")
                
                return Response({
                    'created': created_enrollments,
                    'errors': errors
                }, status=status.HTTP_207_MULTI_STATUS if errors else status.HTTP_201_CREATED)
            
            # Regular single enrollment
            return super().create(request, *args, **kwargs)
        else:
            # Non-admin users can only enroll themselves
            data = request.data.copy()
            data['user_id'] = request.user.id_no
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)