from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from ..models import Enrollment

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for the User model with limited fields for list views
    """
    branch = serializers.ReadOnlyField()
    year = serializers.ReadOnlyField()
    
    class Meta:
        model = User
        fields = ['id_no', 'name', 'email', 'branch', 'year', 'user_type']
        read_only_fields = ['id_no', 'user_type']


class UserDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for the User model with additional fields
    """
    branch = serializers.ReadOnlyField()
    year = serializers.ReadOnlyField()
    
    class Meta:
        model = User
        fields = ['id_no', 'name', 'email', 'branch', 'year', 'user_type', 'created_at', 'updated_at']
        read_only_fields = ['id_no', 'user_type', 'created_at', 'updated_at']


class UserRegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for registering a new user
    """
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ['id_no', 'email', 'name', 'password', 'password_confirm']
    
    def validate(self, attrs):
        # Check if passwords match
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        return attrs
    
    def create(self, validated_data):
        # Remove password_confirm as it's not part of the model
        validated_data.pop('password_confirm')
        
        # Create the user
        user = User.objects.create_user(
            id_no=validated_data['id_no'],
            email=validated_data['email'],
            name=validated_data['name'],
            password=validated_data['password']
        )
        
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating user information
    """
    current_password = serializers.CharField(write_only=True, required=False)
    new_password = serializers.CharField(write_only=True, required=False, validators=[validate_password])
    new_password_confirm = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = User
        fields = ['name', 'email', 'current_password', 'new_password', 'new_password_confirm']
    
    def validate(self, attrs):
        # If changing password, check current password and confirm new password
        if 'new_password' in attrs:
            if 'current_password' not in attrs:
                raise serializers.ValidationError({"current_password": "Current password is required to set a new password."})
            
            if not self.instance.check_password(attrs['current_password']):
                raise serializers.ValidationError({"current_password": "Current password is incorrect."})
            
            if 'new_password_confirm' not in attrs or attrs['new_password'] != attrs['new_password_confirm']:
                raise serializers.ValidationError({"new_password_confirm": "New passwords do not match."})
        
        return attrs
    
    def update(self, instance, validated_data):
        # Remove password fields from validated data
        current_password = validated_data.pop('current_password', None)
        new_password = validated_data.pop('new_password', None)
        validated_data.pop('new_password_confirm', None)
        
        # Update the user fields
        instance = super().update(instance, validated_data)
        
        # If new password provided, set it
        if new_password:
            instance.set_password(new_password)
            instance.save()
        
        return instance