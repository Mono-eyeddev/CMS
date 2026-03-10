from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from accounts.models import ClinicKPI, Clinic
from ml.ebm_model import predict_risk 

class ClinicRiskView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        clinics = Clinic.objects.all()

        clinic_results = []

        total_risk = 0
        high_risk = 0
        total_beds = 0
        total_staff = 0

        for clinic in clinics:

            latest = ClinicKPI.objects.filter(
                clinic=clinic
            ).order_by("-created_at").first()

            if not latest:
                continue

            # Simulated EBM output for now
            
            risk_score = predict_risk(latest)

            if risk_score >= 0.8:
                risk_level = "HIGH"
                high_risk += 1
            elif risk_score >= 0.5:
                risk_level = "MEDIUM"
            else:
                risk_level = "LOW"

            bed_occupancy = latest.bed_occupancy_rate
            staff_available = max(0, 100 - latest.nurses_absent * 10)

            emergency_cases = latest.emergency_cases
            absenteeism = latest.nurses_absent
            treatment_delay = latest.triage_wait_time
            icu_pressure = latest.icu_transfers

            reason = "Stable operations"

            if latest.critical_cases > 5:
                reason = "Critical patient overload"

            if latest.nurses_absent > 3:
                reason = "Staff shortage"

            clinic_results.append({
                "name": clinic.name,
                "score": round(risk_score, 2),
                "risk_level": risk_level,
                "trend": "stable",

                "bedOccupancy": bed_occupancy,
                "staffAvail": staff_available,
                "emergencyCases": emergency_cases,
                "absenteeism": absenteeism,
                "treatmentDelay": treatment_delay,
                "icuPressure": icu_pressure,

                "issues": [reason]
            })

            total_risk += risk_score
            total_beds += bed_occupancy
            total_staff += staff_available

        clinic_count = len(clinic_results) or 1

        summary = {
            "avgRisk": round(total_risk / clinic_count, 2),
            "highRiskClinics": high_risk,
            "avgBedOccupancy": round(total_beds / clinic_count, 1),
            "avgStaffAvailability": round(total_staff / clinic_count, 1),
        }

        return Response({
            "summary": summary,
            "clinics": clinic_results
        })