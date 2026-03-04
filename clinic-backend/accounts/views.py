from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import LoginSerializer
from rest_framework.permissions import IsAuthenticated
from .permissions import IsSysAdmin
from .permissions import IsManager
from .permissions import IsCNO

class LoginView(APIView):

    def post(self, request):
        serializer = LoginSerializer(data=request.data)

        if serializer.is_valid():
            return Response(serializer.validated_data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    


class SysAdminDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsSysAdmin]

    def get(self, request):
        return Response({
            "message": "Welcome SysAdmin",
            "user": request.user.email,
            "role": request.user.role
        })
        
class CNODashboardView(APIView):
    permission_classes = [IsAuthenticated, IsCNO]

    def get(self, request):
        return Response({
            "message": "Welcome CNO",
            "user": request.user.email,
            "role": request.user.role
        })
        
class ManagerDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsManager]

    def get(self, request):
        return Response({
            "message": "Welcome Manager",
            "user": request.user.email,
            "role": request.user.role
        })
    