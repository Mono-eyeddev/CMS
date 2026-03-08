
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from django.contrib.auth import get_user_model
from django.utils.timezone import now

from accounts.models import Clinic, ClinicKPI
from accounts.permissions import IsCNO

from datetime import timedelta, date
import joblib

ebm_model = joblib.load("ml/ebm_model.pkl")

def _predict_risk(kpi):

    critical_ratio = kpi.critical_cases / kpi.total_patients if kpi.total_patients else 0
    staff_ratio = kpi.staff_on_duty / kpi.total_patients if kpi.total_patients else 0

    mortality_flag = kpi.mortality_count > 0
    resource_failure = kpi.stockout_oxygen or kpi.stockout_essential_drugs

    features = [[
        critical_ratio,
        staff_ratio,
        kpi.bed_occupancy_rate,
        mortality_flag,
        resource_failure
    ]]

    score = ebm_model.predict_proba(features)[0][1]

    # probability smoothing
    score = 0.05 + (score * 0.9)

    return float(score)


User = get_user_model()


# ─────────────────────────────────────────────────────────────
# HELPER  –  reuse the exact same risk logic from views_ai.py
# ─────────────────────────────────────────────────────────────

def _risk_level(score):
    if score >= 0.8:
        return "HIGH"
    if score >= 0.5:
        return "MEDIUM"
    return "LOW"



def _latest_kpi(clinic):
    return ClinicKPI.objects.filter(clinic=clinic).order_by("-created_at").first()


# ─────────────────────────────────────────────────────────────
# 1.  CLINIC RISK   –  /api/auth/cno/clinic-risk/
#     Already exists in views_ai.py as ClinicRiskView.
#     We re-expose it here under IsCNO permission so the CNO
#     dashboard token works correctly.
# ─────────────────────────────────────────────────────────────

class CNOClinicRiskView(APIView):

    permission_classes = [IsAuthenticated, IsCNO]

    def get(self, request):

        clinics = Clinic.objects.all()
        clinic_results = []
        total_risk  = 0
        high_risk   = 0
        total_beds  = 0
        total_staff = 0

        for clinic in clinics:

            latest = _latest_kpi(clinic)
            if not latest:
                continue

            score = _predict_risk(latest)
            risk_level = _risk_level(score)

            if risk_level == "HIGH":
                high_risk += 1

            staff_avail = max(0, 100 - latest.nurses_absent * 10)

            # Build human-readable reason
            reasons = []
            if latest.critical_cases > 5:
                reasons.append("Critical patient overload")
            if latest.nurses_absent > 3:
                reasons.append("Staff shortage")
            if latest.stockout_oxygen:
                reasons.append("Oxygen stockout")
            if latest.stockout_essential_drugs:
                reasons.append("Essential drug stockout")
            if latest.bed_occupancy_rate >= 90:
                reasons.append("Bed occupancy critical")
            reason = ", ".join(reasons) if reasons else "Stable operations"

            # Trend: compare to yesterday's latest KPI
            yesterday = ClinicKPI.objects.filter(
                clinic=clinic,
                created_at__date=date.today() - timedelta(days=1)
            ).order_by("-created_at").first()

            if yesterday:
                prev_score = _predict_risk(yesterday)
                trend = "up" if score > prev_score else ("down" if score < prev_score else "stable")
            else:
                trend = "stable"

            clinic_results.append({
                "name":             clinic.name,
                "score":            score,
                "risk_level":       risk_level,
                "trend":            trend,
                "bedOccupancy":     latest.bed_occupancy_rate,
                "staffAvailability": staff_avail,
                "emergencyCases":   latest.emergency_cases,
                "absenteeism":      latest.nurses_absent,
                "treatmentDelay":   latest.triage_wait_time,
                "icuPressure":      latest.icu_transfers,
                "issues":           [reason],
            })

            total_risk  += score
            total_beds  += latest.bed_occupancy_rate
            total_staff += staff_avail

        n = len(clinic_results) or 1

        return Response({
            "summary": {
                "avgRisk":             round(total_risk  / n, 2),
                "highRiskClinics":     high_risk,
                "avgBedOccupancy":     round(total_beds  / n, 1),
                "avgStaffAvailability": round(total_staff / n, 1),
            },
            "clinics": clinic_results,
        })


# ─────────────────────────────────────────────────────────────
# 2.  ALERTS   –  /api/auth/cno/alerts/
#     Returns clinics whose risk score >= 0.5, sorted desc.
#     Generates recommended actions from KPI values.
# ─────────────────────────────────────────────────────────────

class CNOAlertsView(APIView):

    permission_classes = [IsAuthenticated, IsCNO]

    def get(self, request):

        alerts = []

        for idx, clinic in enumerate(Clinic.objects.all(), start=1):

            latest = _latest_kpi(clinic)
            if not latest:
                continue

            score = _predict_risk(latest)
            if score < 0.5:
                continue

            level = "critical" if score >= 0.75 else ("high" if score >= 0.60 else "warning")

            # Issues list
            issues = []
            if latest.nurses_absent > 3:
                issues.append(f"Staff shortage — {latest.nurses_absent} nurses absent")
            if latest.critical_cases > 5:
                issues.append(f"Critical case overload ({latest.critical_cases} cases)")
            if latest.bed_occupancy_rate >= 90:
                issues.append(f"Bed occupancy at {latest.bed_occupancy_rate}%")
            if latest.stockout_oxygen:
                issues.append("Oxygen stockout")
            if latest.stockout_essential_drugs:
                issues.append("Essential drug stockout")
            if latest.triage_wait_time >= 30:
                issues.append(f"Triage wait {latest.triage_wait_time} min")
            if not issues:
                issues.append("Elevated risk score — review KPIs")

            # Recommended actions derived from KPIs
            actions = []
            if latest.nurses_absent > 3:
                actions.append("Deploy float pool staff immediately")
                actions.append("Request inter-facility nurse support")
            if latest.critical_cases > 5:
                actions.append("Activate emergency overflow protocols")
                actions.append("Escalate to CNO and Medical Director")
            if latest.stockout_essential_drugs:
                actions.append("Place urgent pharmacy resupply order")
            if latest.stockout_oxygen:
                actions.append("Emergency oxygen resupply — contact supplier now")
            if latest.bed_occupancy_rate >= 90:
                actions.append("Expedite discharge planning for stable patients")
            if not actions:
                actions.append("Monitor closely and review next shift KPI report")

            alerts.append({
                "id":      idx,
                "clinic":  clinic.name,
                "score":   score,
                "level":   level,
                "issues":  issues,
                "actions": actions,
            })

        alerts.sort(key=lambda a: a["score"], reverse=True)

        return Response(alerts)


# ─────────────────────────────────────────────────────────────
# 3.  TRENDS   –  /api/auth/cno/trends/
#     Returns the last 14 days of network-wide daily averages.
# ─────────────────────────────────────────────────────────────

class CNOTrendsView(APIView):

    permission_classes = [IsAuthenticated, IsCNO]

    def get(self, request):

        trend_data = []

        for i in range(13, -1, -1):  # 14 days, oldest first

            day = date.today() - timedelta(days=i)

            kpis = ClinicKPI.objects.filter(created_at__date=day)

            if not kpis.exists():
                trend_data.append({
                    "day":          day.strftime("%b %d"),
                    "absenteeism":  0,
                    "emergencies":  0,
                    "delays":       0,
                    "occupancy":    0,
                })
                continue

            count = kpis.count()

            avg_absent     = sum(k.nurses_absent       for k in kpis) / count
            avg_emergency  = sum(k.emergency_cases     for k in kpis) / count
            avg_delay      = sum(k.triage_wait_time    for k in kpis) / count
            avg_occupancy  = sum(k.bed_occupancy_rate  for k in kpis) / count

            trend_data.append({
                "day":         day.strftime("%b %d"),
                "absenteeism": round(avg_absent,    1),
                "emergencies": round(avg_emergency, 1),
                "delays":      round(avg_delay,     1),
                "occupancy":   round(avg_occupancy, 1),
            })

        return Response(trend_data)


# ─────────────────────────────────────────────────────────────
# 4.  RESOURCES   –  /api/auth/cno/resources/
#     Network-wide resource pressure derived from latest KPIs.
# ─────────────────────────────────────────────────────────────

class CNOResourcesView(APIView):

    permission_classes = [IsAuthenticated, IsCNO]

    def get(self, request):

        clinics  = Clinic.objects.all()
        kpi_list = [_latest_kpi(c) for c in clinics]
        kpi_list = [k for k in kpi_list if k is not None]

        if not kpi_list:
            return Response([])

        n = len(kpi_list)

        avg_bed_occupancy  = sum(k.bed_occupancy_rate for k in kpi_list) / n
        avg_staff_avail    = sum(max(0, 100 - k.nurses_absent * 10) for k in kpi_list) / n
        oxygen_ok          = sum(1 for k in kpi_list if not k.stockout_oxygen)
        drugs_ok           = sum(1 for k in kpi_list if not k.stockout_essential_drugs)
        avg_oxygen_pct     = round((oxygen_ok / n) * 100, 1)
        avg_drugs_pct      = round((drugs_ok  / n) * 100, 1)

        # ICU: use icu_transfers as a proxy — cap at 100
        avg_icu = min(
            round(sum(k.icu_transfers for k in kpi_list) / n * 10, 1),
            100
        )

        return Response([
            {
                "label":    "Bed Occupancy",
                "value":    round(avg_bed_occupancy, 1),
                "warning":  75,
                "critical": 88,
                "invert":   False,
            },
            {
                "label":    "ICU Pressure",
                "value":    avg_icu,
                "warning":  70,
                "critical": 85,
                "invert":   False,
            },
            {
                "label":    "Staff Availability",
                "value":    round(avg_staff_avail, 1),
                "warning":  70,
                "critical": 55,
                "invert":   True,
            },
            {
                "label":    "Drug Inventory",
                "value":    avg_drugs_pct,
                "warning":  65,
                "critical": 40,
                "invert":   True,
            },
            {
                "label":    "Oxygen Supply",
                "value":    avg_oxygen_pct,
                "warning":  65,
                "critical": 45,
                "invert":   True,
            },
        ])


# ─────────────────────────────────────────────────────────────
# 5.  KPIs   –  /api/auth/cno/kpis/
#     Network-wide averages grouped into the 9 dashboard categories.
#     Values are averaged across the latest KPI row per clinic.
# ─────────────────────────────────────────────────────────────

class CNOKpisView(APIView):

    permission_classes = [IsAuthenticated, IsCNO]

    def get(self, request):

        clinics  = Clinic.objects.all()
        kpi_list = [_latest_kpi(c) for c in clinics]
        kpi_list = [k for k in kpi_list if k is not None]

        if not kpi_list:
            return Response([])

        n = len(kpi_list)

        def avg(field):
            return round(sum(getattr(k, field) for k in kpi_list) / n, 1)

        def avg_bool(field):
            """Returns percentage of clinics where bool field is True."""
            return round(sum(1 for k in kpi_list if getattr(k, field)) / n * 100, 1)

        categories = [
            {
                "id":    "patient_flow",
                "label": "Patient Flow",
                "color": "#00AEEF",
                "icon":  "👥",
                "kpis": [
                    {"key":"total_patients",  "label":"Total Patients",    "value": avg("total_patients"),  "unit":"",     "warn":350, "crit":450, "fmt":"num"},
                    {"key":"new_cases",       "label":"New Cases",         "value": avg("new_cases"),       "unit":"",     "warn":200, "crit":300, "fmt":"num"},
                    {"key":"emergency_cases", "label":"Emergency Cases",   "value": avg("emergency_cases"), "unit":"",     "warn":40,  "crit":60,  "fmt":"num", "hiWarn": True},
                    {"key":"mortality_count", "label":"Mortality Count",   "value": avg("mortality_count"), "unit":"",     "warn":2,   "crit":5,   "fmt":"num", "hiWarn": True},
                ],
            },
            {
                "id":    "critical_care",
                "label": "Critical Care",
                "color": "#FF4D4D",
                "icon":  "🚨",
                "kpis": [
                    {"key":"critical_cases",             "label":"Critical Cases",             "value": avg("critical_cases"),             "unit":"", "warn":5,  "crit":8,  "fmt":"num", "hiWarn": True},
                    {"key":"icu_transfers",              "label":"ICU Transfers",              "value": avg("icu_transfers"),              "unit":"", "warn":3,  "crit":6,  "fmt":"num", "hiWarn": True},
                    {"key":"unattended_critical_cases",  "label":"Unattended Critical Cases",  "value": avg("unattended_critical_cases"),  "unit":"", "warn":1,  "crit":3,  "fmt":"num", "hiWarn": True},
                ],
            },
            {
                "id":    "staffing",
                "label": "Staffing",
                "color": "#A855F7",
                "icon":  "🧑‍⚕️",
                "kpis": [
                    {"key":"staff_on_duty",  "label":"Staff on Duty",  "value": avg("staff_on_duty"),  "unit":"", "warn":15, "crit":10, "fmt":"num", "loWarn": True},
                    {"key":"nurses_absent",  "label":"Nurses Absent",  "value": avg("nurses_absent"),  "unit":"", "warn":3,  "crit":6,  "fmt":"num", "hiWarn": True},
                    {"key":"overtime_hours", "label":"Overtime Hours",  "value": avg("overtime_hours"), "unit":" hrs", "warn":40, "crit":60, "fmt":"num", "hiWarn": True},
                ],
            },
            {
                "id":    "bed_management",
                "label": "Bed Management",
                "color": "#00C48C",
                "icon":  "🛏️",
                "kpis": [
                    {"key":"bed_occupancy_rate", "label":"Bed Occupancy Rate", "value": avg("bed_occupancy_rate"), "unit":"%", "warn":80, "crit":90, "fmt":"pct", "hiWarn": True},
                    {"key":"readmission_rate",   "label":"Readmission Rate",   "value": avg("readmission_rate"),   "unit":"%", "warn":5,  "crit":10, "fmt":"pct", "hiWarn": True},
                ],
            },
            {
                "id":    "resources",
                "label": "Resource Availability",
                "color": "#F97316",
                "icon":  "💊",
                "kpis": [
                    {"key":"stockout_oxygen",         "label":"Clinics with Oxygen Stockout",       "value": avg_bool("stockout_oxygen"),         "unit":"%", "warn":20, "crit":50, "fmt":"pct", "hiWarn": True},
                    {"key":"stockout_essential_drugs", "label":"Clinics with Drug Stockout",         "value": avg_bool("stockout_essential_drugs"), "unit":"%", "warn":20, "crit":50, "fmt":"pct", "hiWarn": True},
                ],
            },
            {
                "id":    "infrastructure",
                "label": "Infrastructure",
                "color": "#FFB020",
                "icon":  "🔧",
                "kpis": [
                    {"key":"power_outage_hours",    "label":"Power Outage Hours",    "value": avg("power_outage_hours"),    "unit":" hrs", "warn":1,  "crit":4,  "fmt":"num", "hiWarn": True},
                    {"key":"internet_downtime_hours","label":"Internet Downtime Hrs", "value": avg("internet_downtime_hours"),"unit":" hrs", "warn":2,  "crit":6,  "fmt":"num", "hiWarn": True},
                ],
            },
            {
                "id":    "operations",
                "label": "Operations",
                "color": "#00AEEF",
                "icon":  "⏱️",
                "kpis": [
                    {"key":"triage_wait_time",   "label":"Triage Wait Time",    "value": avg("triage_wait_time"),   "unit":" min", "warn":30, "crit":45, "fmt":"num", "hiWarn": True},
                    {"key":"lab_turnaround_time","label":"Lab Turnaround Time", "value": avg("lab_turnaround_time"),"unit":" min", "warn":90, "crit":120,"fmt":"num", "hiWarn": True},
                    {"key":"pharmacy_wait_time", "label":"Pharmacy Wait Time",  "value": avg("pharmacy_wait_time"), "unit":" min", "warn":20, "crit":40, "fmt":"num", "hiWarn": True},
                ],
            },
            {
                "id":    "disease_surveillance",
                "label": "Disease Surveillance",
                "color": "#FF4D4D",
                "icon":  "🦠",
                "kpis": [
                    {"key":"malaria_cases",      "label":"Malaria Cases",      "value": avg("malaria_cases"),      "unit":"", "warn":5,  "crit":10, "fmt":"num", "hiWarn": True},
                    {"key":"cholera_cases",      "label":"Cholera Cases",      "value": avg("cholera_cases"),      "unit":"", "warn":2,  "crit":5,  "fmt":"num", "hiWarn": True},
                    {"key":"respiratory_cases",  "label":"Respiratory Cases",  "value": avg("respiratory_cases"),  "unit":"", "warn":10, "crit":20, "fmt":"num", "hiWarn": True},
                ],
            },
            {
                "id":    "quality",
                "label": "Quality",
                "color": "#00C48C",
                "icon":  "📋",
                "kpis": [
                    {"key":"patient_complaints", "label":"Patient Complaints", "value": avg("patient_complaints"), "unit":"", "warn":3, "crit":8, "fmt":"num", "hiWarn": True},
                ],
            },
        ]

        return Response(categories)


# ─────────────────────────────────────────────────────────────
# 6.  REPORTS   –  /api/auth/cno/reports/
#     Lists ClinicKPI submissions as downloadable reports,
#     most recent first.
# ─────────────────────────────────────────────────────────────

class CNOReportsView(APIView):

    permission_classes = [IsAuthenticated, IsCNO]

    def get(self, request):

        # Get the 20 most recent KPI submissions across all clinics
        kpis = ClinicKPI.objects.select_related("clinic", "manager") \
                                .order_by("-created_at")[:20]

        reports = []

        for kpi in kpis:
            created = kpi.created_at
            day_diff = (date.today() - created.date()).days

            if day_diff == 0:
                report_type = "daily"
            elif day_diff <= 7:
                report_type = "weekly"
            elif day_diff <= 30:
                report_type = "monthly"
            else:
                report_type = "summary"

            reports.append({
                "id":    kpi.id,
                "title": f"{kpi.clinic.name} — {kpi.shift} Shift Report",
                "date":  created.strftime("%b %d, %Y"),
                "type":  report_type,
                "size":  "—",           # Replace with real file size if you generate PDFs
                "clinic": kpi.clinic.name,
                "shift":  kpi.shift,
                "submitted_by": kpi.manager.get_full_name() or kpi.manager.username,
            })

        return Response(reports)


# ─────────────────────────────────────────────────────────────
# 7.  NOTIFICATIONS   –  /api/auth/cno/notifications/
#     Auto-generates notifications from current risk state.
#     No separate Notification model needed.
# ─────────────────────────────────────────────────────────────

class CNONotificationsView(APIView):

    permission_classes = [IsAuthenticated, IsCNO]

    def get(self, request):

        notifs  = []
        nid     = 1

        for clinic in Clinic.objects.all():

            latest = _latest_kpi(clinic)
            if not latest:
                continue

            score = _predict_risk(latest)
            level = _risk_level(score)

            if level == "HIGH":
                notifs.append({
                    "id":    nid,
                    "type":  "danger",
                    "title": f"{clinic.name} — Critical Risk",
                    "body":  f"Risk score {score}. Immediate action required.",
                    "time":  "Just now",
                    "read":  False,
                })
                nid += 1

            elif level == "MEDIUM":
                notifs.append({
                    "id":    nid,
                    "type":  "warning",
                    "title": f"{clinic.name} — Elevated Risk",
                    "body":  f"Risk score {score}. Review KPIs.",
                    "time":  "Just now",
                    "read":  False,
                })
                nid += 1

            # Report submitted notification
            if latest.created_at.date() == date.today():
                notifs.append({
                    "id":    nid,
                    "type":  "success",
                    "title": f"{clinic.name} — Report Submitted",
                    "body":  f"{latest.shift} shift KPI submitted on time.",
                    "time":  latest.created_at.strftime("%I:%M %p"),
                    "read":  True,
                })
                nid += 1

        # Sort: unread danger first, then warning, then success
        priority = {"danger": 0, "warning": 1, "info": 2, "success": 3}
        notifs.sort(key=lambda n: (n["read"], priority.get(n["type"], 9)))

        return Response(notifs)


# ─────────────────────────────────────────────────────────────
# 8.  PROFILE   –  /api/auth/cno/profile/
#     Returns the logged-in CNO's profile info.
# ─────────────────────────────────────────────────────────────

class CNOProfileView(APIView):

    permission_classes = [IsAuthenticated, IsCNO]

    def get(self, request):

        user = request.user

        return Response({
            "name":     user.get_full_name() or user.username,
            "email":    user.email,
            "username": user.username,
            "role":     user.role,
            "clinic":   user.clinic.name if user.clinic else None,
        })


# ─────────────────────────────────────────────────────────────
# URL REGISTRATION
# ─────────────────────────────────────────────────────────────
#
