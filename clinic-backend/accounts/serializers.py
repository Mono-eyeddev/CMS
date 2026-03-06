from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, ClinicKPI


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


class KPISerializer(serializers.ModelSerializer):

    class Meta:
        model = ClinicKPI
        fields = "__all__"
        read_only_fields = ["manager", "clinic", "created_at"]