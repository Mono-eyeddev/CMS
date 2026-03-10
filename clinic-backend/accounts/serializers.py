from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, ClinicKPI,Clinic
from .models import AuditLog
from .models import Staff
class AuditLogSerializer(serializers.ModelSerializer):

    user = serializers.StringRelatedField()

    class Meta:
        model = AuditLog
        fields = [
            "user",
            "action",
            "timestamp",
            "ip_address",
            "details"
        ]
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    role = serializers.CharField()

    def validate(self, data):

        email = data.get("email")
        password = data.get("password")
        selected_role = data.get("role")

        # DEBUG
        print("LOGIN ATTEMPT")
        print("EMAIL:", email)
        print("ROLE FROM FRONTEND:", selected_role)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            print("USER NOT FOUND")
            raise serializers.ValidationError("Invalid credentials")

        print("USER FOUND:", user.username)
        print("ROLE IN DATABASE:", user.role)

        user = authenticate(username=user.username, password=password)

        if not user:
            print("PASSWORD FAILED")
            raise serializers.ValidationError("Invalid credentials")

        if user.role != selected_role:
            print("ROLE MISMATCH")
            raise serializers.ValidationError("Role mismatch")

        refresh = RefreshToken.for_user(user)

        print("LOGIN SUCCESS")

        return {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "role": user.role,
            "email": user.email,
        }

class ClinicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Clinic
        fields = ["id", "name", "location", "code", "timezone"]
    
class MeSerializer(serializers.ModelSerializer):
    clinic = ClinicSerializer(read_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "role", "clinic"]
class KPISerializer(serializers.ModelSerializer):

    class Meta:
        model = ClinicKPI
        fields = "__all__"
        read_only_fields = ["manager", "clinic", "created_at"]
        
class StaffSerializer(serializers.ModelSerializer):

    clinic = serializers.CharField(source="clinic.name")

    class Meta:
        model = Staff
        fields = [
            "id",
            "name",
            "role",
            "qualification",
            "training_coverage",
            "clinic"
        ]