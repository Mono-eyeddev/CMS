from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny

from datetime import date

from .serializers import LoginSerializer, KPISerializer
from .permissions import IsSysAdmin, IsManager, IsCNO
from .models import ClinicKPI


# =========================
# LOGIN VIEW
# =========================

class LoginView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        serializer = LoginSerializer(data=request.data)

        if serializer.is_valid():
            return Response(serializer.validated_data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# =========================
# SYSADMIN DASHBOARD
# =========================

class SysAdminDashboardView(APIView):

    permission_classes = [IsAuthenticated, IsSysAdmin]

    def get(self, request):

        return Response({
            "message": "Welcome SysAdmin",
            "user": request.user.email,
            "role": request.user.role
        })


# =========================
# CNO DASHBOARD
# =========================

class CNODashboardView(APIView):

    permission_classes = [IsAuthenticated, IsCNO]

    def get(self, request):

        return Response({
            "message": "Welcome CNO",
            "user": request.user.email,
            "role": request.user.role
        })


# =========================
# MANAGER DASHBOARD
# =========================

class ManagerDashboardView(APIView):

    permission_classes = [IsAuthenticated, IsManager]

    def get(self, request):

        return Response({
            "message": "Welcome Manager",
            "user": request.user.email,
            "role": request.user.role,
            "clinic": request.user.clinic.name if request.user.clinic else None
        })
# =========================
# Staff
# =========================
class ManagerStaffView(APIView):

    permission_classes = [IsAuthenticated, IsManager]

    def get(self, request):

        clinic = request.user.clinic

        staff = Staff.objects.filter(clinic=clinic)

        data = [
            {
                "id": s.id,
                "name": s.name,
                "role": s.role,
                "qualification": s.qualification,
                "training_coverage": s.training_coverage
            }
            for s in staff
        ]

        return Response(data)
# =========================
# KPI SUBMISSION
# =========================

class SubmitKPIView(APIView):
 permission_classes = [IsAuthenticated, IsManager]

 def post(self, request):

    # Ensure manager has a clinic
    if not request.user.clinic:
        return Response(
            {"error": "Manager is not assigned to a clinic."},
            status=status.HTTP_400_BAD_REQUEST
        )

    shift = request.data.get("shift")

    if not shift:
        return Response(
            {"error": "Shift is required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    today = date.today()

    # Prevent duplicate submissions
    existing = ClinicKPI.objects.filter(
        clinic=request.user.clinic,
        shift=shift,
        created_at__date=today
    ).exists()

    if existing:
        return Response(
            {"error": "You have already submitted today's KPI report for this shift."},
            status=status.HTTP_400_BAD_REQUEST
        )

    serializer = KPISerializer(data=request.data)

    if serializer.is_valid():

        serializer.save(
            manager=request.user,
            clinic=request.user.clinic
        )

        return Response(
            {"message": "KPI submitted successfully"},
            status=status.HTTP_201_CREATED
        )

    print("KPI SUBMISSION ERROR:", serializer.errors)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
