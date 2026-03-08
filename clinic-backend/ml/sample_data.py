import random
from accounts.models import Clinic, User, ClinicKPI

def generate_kpi_data(records=300):

    clinics = list(Clinic.objects.all())
    managers = list(User.objects.filter(role="MANAGER"))

    if not clinics or not managers:
        print("Create clinics and managers first.")
        return

    for _ in range(records):

        clinic = random.choice(clinics)
        manager = random.choice(managers)

        total_patients = random.randint(20, 80)

        critical_cases = random.randint(0, int(total_patients * 0.3))
        emergency_cases = random.randint(0, int(total_patients * 0.2))
        new_cases = random.randint(5, int(total_patients * 0.5))

        staff_on_duty = random.randint(3, 12)

        mortality_count = random.choice([0,0,0,1,2])

        ClinicKPI.objects.create(
            clinic=clinic,
            manager=manager,
            shift=random.choice(["DAY","NIGHT"]),
            total_patients=total_patients,
            new_cases=new_cases,
            emergency_cases=emergency_cases,
            critical_cases=critical_cases,
            icu_transfers=random.randint(0,3),
            mortality_count=mortality_count,
            staff_on_duty=staff_on_duty,
            nurses_absent=random.randint(0,2),
            overtime_hours=random.randint(0,10),
            unattended_critical_cases=random.randint(0,2),
            power_outage_hours=random.randint(0,3),
            internet_downtime_hours=random.randint(0,2),
            stockout_oxygen=random.choice([True,False]),
            stockout_essential_drugs=random.choice([True,False]),
            bed_occupancy_rate=random.randint(40,100),
            readmission_rate=random.randint(0,20),
            patient_complaints=random.randint(0,5),
            malaria_cases=random.randint(0,10),
            cholera_cases=random.randint(0,3),
            respiratory_cases=random.randint(0,15),
            triage_wait_time=random.randint(5,60),
            lab_turnaround_time=random.randint(10,120),
            pharmacy_wait_time=random.randint(5,45),
            comments="Synthetic generated data"
        )

    print(f"{records} synthetic KPI records created.")