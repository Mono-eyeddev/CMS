<h1 align="center">🏥 Clinic Instability Detection System</h1>

<p align="center">
  AI-Powered Healthcare Analytics Platform <br>
  KPI-Based Clinic Monitoring | Explainable Machine Learning | Real-Time Risk Alerts
</p>

<p align="center">
  Built with <strong>Django, React, PostgreSQL, and Explainable Boosting Machine (EBM)</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.11-blue?style=for-the-badge&logo=python">
  <img src="https://img.shields.io/badge/Django-Backend-green?style=for-the-badge&logo=django">
  <img src="https://img.shields.io/badge/React-Frontend-blue?style=for-the-badge&logo=react">
  <img src="https://img.shields.io/badge/PostgreSQL-Database-blue?style=for-the-badge&logo=postgresql">
  <img src="https://img.shields.io/badge/Machine%20Learning-EBM-orange?style=for-the-badge">
</p>

---

# Overview

The **Clinic Instability Detection System** is an AI-driven healthcare reporting and decision-support platform designed to monitor operational stability across multiple clinics.

Healthcare facilities often rely on manual reporting systems such as spreadsheets or paper-based reports, which leads to delayed insights and poor visibility into operational performance.

This system solves that problem by collecting **Key Performance Indicators (KPIs)** from clinics and analyzing them using an **Explainable Boosting Machine (EBM)** to generate interpretable instability risk predictions.

The system allows **Chief Nursing Officers (CNOs)** and healthcare administrators to detect early warning signs of operational stress and respond proactively.

---

# Key Features

- Digital KPI reporting system for clinic managers  
- AI-driven clinic instability detection  
- Explainable machine learning predictions using EBM  
- Real-time instability alerts for healthcare administrators  
- KPI contribution analysis for transparent predictions  
- Centralized monitoring of multiple clinics  
- Role-based access control (Manager, CNO, System Administrator)

---

# Machine Learning Model

The system uses an **Explainable Boosting Machine (EBM)** model to predict clinic instability.

EBM is an interpretable machine learning algorithm that learns how each operational indicator contributes to instability risk.

Unlike black-box models, EBM provides **transparent predictions**, allowing administrators to understand why a clinic was flagged as unstable.

---

# KPI Indicators Used

The model evaluates **nine operational indicators derived from clinic KPIs**.

| Indicator | Formula | Purpose |
|---|---|---|
critical_ratio | critical_cases / total_patients | Measures patient severity |
staff_ratio | staff_on_duty / total_patients | Measures staffing capacity |
bed_occupancy_rate | occupied_beds / total_beds | Measures facility utilization |
mortality_flag | 1 if mortality_count > 0 else 0 | Detects severe clinical events |
resource_failure | 1 if resource_failure_count > 0 else 0 | Detects equipment shortages |
triage_wait_time | average waiting time (minutes) | Measures service delays |
nurses_absent | nurses_absent_count | Measures workforce shortages |
icu_transfers | icu_transfer_count | Measures escalation severity |
patient_complaints | complaint_count | Measures service quality |

---

# Feature Vector Example

After KPI processing, the clinic data becomes a **feature vector**:
# ⚙️ Risk Score Calculation

The Explainable Boosting Machine evaluates the contribution of each KPI indicator derived from clinic operational data.

After feature engineering, the clinic data becomes a **feature vector** containing the nine indicators used by the model.

Example feature vector:

```
[0.20, 0.083, 0.90, 1, 1, 40, 3, 6, 5]
```

Each value corresponds to a KPI indicator in the following order:

1. critical_ratio  
2. staff_ratio  
3. bed_occupancy_rate  
4. mortality_flag  
5. resource_failure  
6. triage_wait_time  
7. nurses_absent  
8. icu_transfers  
9. patient_complaints  

The Explainable Boosting Machine computes the instability score using an additive model:

```
Risk = Base + f1(x1) + f2(x2) + ... + f9(x9)
```

Where each function represents the learned contribution of a KPI indicator.

Example contribution calculation:

```
Base Risk = 0.02

critical_ratio contribution = 0.18
staff_ratio contribution = 0.12
bed_occupancy contribution = 0.16
mortality contribution = 0.21
resource failure contribution = 0.10
triage wait contribution = 0.09
nurses absent contribution = 0.07
ICU transfers contribution = 0.11
complaints contribution = 0.06
```

Total risk score:

```
Risk ≈ 1.12
```

---

# Probability Conversion

The risk score is converted into probability using the logistic function:

```
P(instability) = 1 / (1 + e^(-Risk))
```

Example:

```
Risk Score = 1.12
Instability Probability ≈ 0.75
```

This means the clinic has a **75% probability of operational instability**.

---

# Risk Interpretation

| Probability | Interpretation |
|---|---|
| 0.01 – 0.30 | Stable clinic |
| 0.31 – 0.60 | Moderate operational pressure |
| 0.61 – 1.00 | High instability risk |

---

# System Architecture

```
Clinic Managers
      ↓
React Frontend (KPI Submission)
      ↓
Django REST API
      ↓
PostgreSQL Database
      ↓
EBM Machine Learning Model
      ↓
CNO Dashboard Alerts
```

---

# Technology Stack

## Frontend
- React (Vite)
- Tailwind CSS
- Axios

## Backend
- Django
- Django REST Framework

## Database
- PostgreSQL

## Machine Learning
- Python
- Explainable Boosting Machine (InterpretML)
- Pandas
- Scikit-learn

## Tools
- Docker
- Git
- GitHub

---

# Project Structure

```
clinic-instability-system/
│
├── clinic-backend/
│   ├── accounts/
│   ├── api/
│   ├── ml/
│   │   └── ebm_model.pkl
│   ├── config/
│   └── manage.py
│
├── clinic-frontend/
│   ├── src/
│   ├── pages/
│   └── components/
│
└── README.md
```

---

# Backend Setup

Clone the repository:

```
git clone https://github.com/yourusername/clinic-instability-system.git
```

Navigate to backend:

```
cd clinic-backend
```

Create virtual environment:

```
python -m venv venv
```

Activate environment:

```
venv\Scripts\activate
```

Install dependencies:

```
pip install -r requirements.txt
```

Run migrations:

```
python manage.py migrate
```

Start server:

```
python manage.py runserver
```

---

# Frontend Setup

Navigate to frontend folder:

```
cd clinic-frontend
```

Install dependencies:

```
npm install
```

Start development server:

```
npm run dev
```

---

# Author

**Sajaad Iqbal**

Developer | AI Enthusiast | Full-Stack Engineer  
Passionate about building intelligent systems that combine **machine learning, web technologies, and real-world problem solving**.

---

# License

This project is currently released for **academic and research purposes only**.
The software was developed as part of a final-year academic project and is **not licensed for commercial use, redistribution, or modification without explicit permission from the author**.
All rights reserved.
Future versions of this system may be released under a **commercial license**.
