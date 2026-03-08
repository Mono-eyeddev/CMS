from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny

from django.utils import timezone
from datetime import date, timedelta

from .serializers import LoginSerializer, KPISerializer
from .permissions import IsSysAdmin, IsManager, IsCNO
from .models import ClinicKPI, Staff


# =========================
# SHIFT DETECTION
# =========================

def get_shift_and_date():
    """
    Returns (shift, shift_date) based on server local time.
    - DAY shift:   06:30 → 18:29  (shift_date = today)
    - NIGHT shift: 18:30 → 06:29  (shift_date = the day the shift STARTED)
      → After midnight (00:00–06:29), shift_date = yesterday
    """
    now = timezone.localtime()
    current_minutes = now.hour * 60 + now.minute

    DAY_START   = 6 * 60 + 30   # 06:30
    NIGHT_START = 18 * 60 + 30  # 18:30

    if DAY_START <= current_minutes < NIGHT_START:
        return "DAY", now.date()

    elif current_minutes >= NIGHT_START:
        # Night shift, before midnight — shift started today
        return "NIGHT", now.date()

    else:
        # Night shift, after midnight (00:00–06:29) — shift started yesterday
        return "NIGHT", (now - timedelta(days=1)).date()


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
# MANAGER STAFF VIEW
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
class CheckKPISubmissionView(APIView):
    permission_classes = [IsAuthenticated, IsManager]

    def get(self, request):
        clinic = request.user.clinic
        if not clinic:
            return Response({"already_submitted": False})

        shift, shift_date = get_shift_and_date()

        already_submitted = ClinicKPI.objects.filter(
            clinic=clinic,
            shift=shift,
            shift_date=shift_date
        ).exists()

        return Response({
            "already_submitted": already_submitted,
            "shift": shift,
            "shift_date": str(shift_date)
        })
class SubmitKPIView(APIView):

    permission_classes = [IsAuthenticated, IsManager]

    def post(self, request):

        # Manager must belong to a clinic
        clinic = request.user.clinic
        if not clinic:
            return Response(
                {"error": "Manager is not assigned to a clinic."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # --------------------------
        # Determine shift + date
        # --------------------------
        shift, shift_date = get_shift_and_date()

        # --------------------------
        # Prevent duplicate reports
        # (uses shift_date, not created_at, so night shifts crossing midnight work correctly)
        # --------------------------
        already_submitted = ClinicKPI.objects.filter(
            clinic=clinic,
            shift=shift,
            shift_date=shift_date
        ).exists()

        if already_submitted:
            return Response(
                {"error": "already submitted"},  # frontend checks this exact string
                status=status.HTTP_409_CONFLICT
            )

        # --------------------------
        # Save KPI
        # --------------------------
        serializer = KPISerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(
                manager=request.user,
                clinic=clinic,
                shift=shift,
                shift_date=shift_date      # ← persist the canonical shift date
            )

            return Response(
                {
                    "message": f"{shift} shift KPI submitted successfully.",
                    "shift": shift,
                    "shift_date": str(shift_date)
                },
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)