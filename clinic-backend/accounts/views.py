from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny

from django.utils import timezone
from datetime import date, timedelta

from .serializers import LoginSerializer, KPISerializer
from .permissions import IsSysAdmin, IsManager, IsCNO
from .models import ClinicKPI, Staff
from .models import AuditLog
from .serializers import AuditLogSerializer
from .utils import log_audit
from .models import User
import csv
from django.http import HttpResponse

# =========================
# Audit log export view
# =========================
class ExportAuditLogsView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        logs = AuditLog.objects.all().order_by("-timestamp")

        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="audit_logs.csv"'

        writer = csv.writer(response)

        writer.writerow([
            "User",
            "Action",
            "IP Address",
            "Details",
            "Timestamp"
        ])

        for log in logs:
            writer.writerow([
                log.user,
                log.action,
                log.ip_address,
                log.details,
                log.timestamp
            ])

        return response

# =========================
# Audit_logs
# =========================
class AuditLogsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        logs = AuditLog.objects.all().order_by("-timestamp")
        serializer = AuditLogSerializer(logs, many=True)
        return Response(serializer.data)

# =========================
# SHIFT DETECTION
# =========================

def get_shift_and_date():
  
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

            data = serializer.validated_data

            print("LOGIN DEBUG → serializer data:", data)

            email = data.get("email")

            user = User.objects.filter(email=email).first()

            if user:
                log_audit(user, "User login", request, "Successful login")
                print(f"AUDIT LOG SAVED → {user}")
            else:
                print("AUDIT LOG FAILED → user lookup failed")

            return Response(data)

        print("LOGIN FAILED → serializer invalid")

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
                shift_date=shift_date      # ensure shift_date is saved correctly for night shifts
            )
            log_audit(
                    request.user,
                    "Submitted KPI",
                     request,
                    f"{clinic.name} {shift} shift KPI"
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
       