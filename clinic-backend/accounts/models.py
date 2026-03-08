from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings

# ===============================
# Audit Logs
# ===============================
class AuditLog(models.Model):
    user = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    
    action = models.CharField(max_length=255)
    
    timestamp = models.DateTimeField(auto_now_add=True)
    
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    details = models.TextField(blank=True)

    def __str__(self):
        return f"{self.user} - {self.action} - {self.timestamp}"
# ======================================
# CLINIC MODEL
# ======================================

class Clinic(models.Model):
    name = models.CharField(max_length=150)
    location = models.CharField(max_length=150)
    code = models.CharField(max_length=20, unique=True)
    timezone = models.CharField(max_length=60, default="UTC")
    
    def __str__(self):
        return self.name


# ======================================
# USER MODEL (CUSTOM USER)
# ======================================

class User(AbstractUser):

    ROLE_CHOICES = [
        ("MANAGER", "Manager"),
        ("CNO", "Chief Nursing Officer"),
        ("SYSADMIN", "System Admin")
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

    clinic = models.ForeignKey(
        Clinic,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    def __str__(self):
        return f"{self.username} ({self.role})"


# ======================================
# STAFF MODEL
# ======================================

class Staff(models.Model):

    clinic = models.ForeignKey(Clinic, on_delete=models.CASCADE)

    name = models.CharField(max_length=150)

    role = models.CharField(max_length=100)

    qualification = models.CharField(max_length=200)

    training_coverage = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} - {self.role}"


# ======================================
# KPI REPORT MODEL
# ======================================

class ClinicKPI(models.Model):

    SHIFT_CHOICES = [
        ("DAY", "Day Shift"),
        ("NIGHT", "Night Shift")
    ]

    clinic = models.ForeignKey(Clinic, on_delete=models.CASCADE)

    manager = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    shift = models.CharField(max_length=10, choices=SHIFT_CHOICES)

    created_at = models.DateTimeField(auto_now_add=True)
    
    shift_date = models.DateField(null=True, blank=True)

    # ===============================
    # A. PATIENT LOAD
    # ===============================

    total_patients = models.IntegerField()
    new_cases = models.IntegerField()
    emergency_cases = models.IntegerField()
    critical_cases = models.IntegerField()
    icu_transfers = models.IntegerField()
    mortality_count = models.IntegerField()


    # ===============================
    # B. STAFFING
    # ===============================

    staff_on_duty = models.IntegerField()
    nurses_absent = models.IntegerField()
    overtime_hours = models.IntegerField()


    # ===============================
    # C. CRITICAL HANDLING
    # ===============================

    unattended_critical_cases = models.IntegerField()


    # ===============================
    # D. INFRASTRUCTURE
    # ===============================

    power_outage_hours = models.IntegerField()
    internet_downtime_hours = models.IntegerField()
    stockout_oxygen = models.BooleanField()
    stockout_essential_drugs = models.BooleanField()


    # ===============================
    # E. QUALITY
    # ===============================

    bed_occupancy_rate = models.FloatField()
    readmission_rate = models.FloatField()
    patient_complaints = models.IntegerField()


    # ===============================
    # F. DISEASE SURVEILLANCE
    # ===============================

    malaria_cases = models.IntegerField(default=0)
    cholera_cases = models.IntegerField(default=0)
    respiratory_cases = models.IntegerField(default=0)


    # ===============================
    # G. SERVICE TURNAROUND TIMES
    # ===============================

    triage_wait_time = models.IntegerField(default=0)
    lab_turnaround_time = models.IntegerField(default=0)
    pharmacy_wait_time = models.IntegerField(default=0)


    # ===============================
    # H. MANAGER NOTES
    # ===============================

    comments = models.TextField(blank=True, null=True)
    
    class Meta:
    # Enforces: one report per clinic, per shift, per shift-day
       unique_together = ("clinic", "shift", "shift_date")

    def __str__(self):
        return f"{self.clinic.name} - {self.shift} - {self.created_at.date()}"