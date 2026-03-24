<h1 align="center">🏥 Clinic Instability Detection System</h1>

<p align="center">
  AI-Powered Healthcare Analytics Platform <br>
  KPI-Based Clinic Monitoring | Explainable Machine Learning | Real-Time Risk Alerts
</p>

<p align="center">
  Built with <strong>Django · React · PostgreSQL · Explainable Boosting Machine (EBM)</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.11-blue?style=for-the-badge&logo=python">
  <img src="https://img.shields.io/badge/Django-5.2.1-green?style=for-the-badge&logo=django">
  <img src="https://img.shields.io/badge/React-Frontend-blue?style=for-the-badge&logo=react">
  <img src="https://img.shields.io/badge/PostgreSQL-Database-blue?style=for-the-badge&logo=postgresql">
  <img src="https://img.shields.io/badge/Machine%20Learning-EBM-orange?style=for-the-badge">
  <img src="https://img.shields.io/badge/Status-Deployed-brightgreen?style=for-the-badge">
</p>

---

## Overview

The **Clinic Instability Detection System** is an AI-driven healthcare reporting and decision-support platform designed to monitor operational stability across multiple clinics.

Healthcare facilities often rely on manual reporting systems such as spreadsheets or paper-based reports, which leads to delayed insights and poor visibility into operational performance.

This system solves that problem by collecting **Key Performance Indicators (KPIs)** from clinics and analyzing them using an **Explainable Boosting Machine (EBM)** to generate interpretable instability risk predictions.

The system allows **Chief Nursing Officers (CNOs)** and healthcare administrators to detect early warning signs of operational stress and respond proactively.

---

## Key Features

- 📋 Digital KPI reporting system for clinic managers
- 🤖 AI-driven clinic instability detection
- 🔍 Explainable machine learning predictions using EBM
- 🚨 Real-time instability alerts for healthcare administrators
- 📊 KPI contribution analysis for transparent predictions
- 🏥 Centralized monitoring of multiple clinics
- 🔐 Role-based access control (Manager, CNO, System Administrator)

---

## Machine Learning Model

The system uses an **Explainable Boosting Machine (EBM)** model to predict clinic instability.

EBM is an interpretable machine learning algorithm that learns how each operational indicator contributes to instability risk.

Unlike black-box models, EBM provides **transparent predictions**, allowing administrators to understand exactly why a clinic was flagged as unstable.

---

## KPI Indicators Used

The model evaluates **nine operational indicators** derived from clinic KPIs:

| Indicator | Formula | Purpose |
|---|---|---|
| critical_ratio | critical_cases / total_patients | Measures patient severity |
| staff_ratio | staff_on_duty / total_patients | Measures staffing capacity |
| bed_occupancy_rate | occupied_beds / total_beds | Measures facility utilization |
| mortality_flag | 1 if mortality_count > 0 else 0 | Detects severe clinical events |
| resource_failure | 1 if resource_failure_count > 0 else 0 | Detects equipment shortages |
| triage_wait_time | average waiting time (minutes) | Measures service delays |
| nurses_absent | nurses_absent_count | Measures workforce shortages |
| icu_transfers | icu_transfer_count | Measures escalation severity |
| patient_complaints | complaint_count | Measures service quality |

---

## Risk Score Calculation

After feature engineering, clinic data is converted into a **feature vector**:

```
[0.20, 0.083, 0.90, 1, 1, 40, 3, 6, 5]
```

The EBM computes the instability score using an additive model:

```
Risk = Base + f1(x1) + f2(x2) + ... + f9(x9)
```

The risk score is converted to probability using the logistic function:

```
P(instability) = 1 / (1 + e^(-Risk))
```

### Risk Interpretation

| Probability | Interpretation |
|---|---|
| 0.01 – 0.30 | ✅ Stable clinic |
| 0.31 – 0.60 | ⚠️ Moderate operational pressure |
| 0.61 – 1.00 | 🚨 High instability risk |

---

## Model Performance

| Metric | Value |
|---|---|
| Accuracy | 1.0 |
| Precision | 1.0 |
| Recall | 1.0 |
| F1 Score | 1.0 |

---

## System Architecture

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

## Technology Stack

### Frontend
- React (Vite)
- Tailwind CSS
- Axios

### Backend
- Django 5.2.1
- Django REST Framework
- SimpleJWT Authentication

### Database
- PostgreSQL

### Machine Learning
- Python 3.11
- InterpretML (EBM)
- Pandas
- Scikit-learn
- NumPy

### Tools
- Docker
- Git & GitHub

---

## Project Structure

```
clinic-instability-system/
│
├── clinic-backend/
│   ├── accounts/
│   ├── api/
│   ├── ml/
│   │   └── ebm_model.pkl
│   ├── config/
│   ├── requirements.txt
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

## Backend Setup

### Requirements
- Python **3.11** (recommended — required for ML library compatibility)
- PostgreSQL
- Git

### Installation

**1. Clone the repository:**
```bash
git clone https://github.com/Mono-eyeddev/clinic-instability-system.git
cd clinic-instability-system/clinic-backend
```

**2. Create and activate a virtual environment using Python 3.11:**
```bash
# Windows
py -3.11 -m venv venv
venv\Scripts\activate

# Linux / Mac
python3.11 -m venv venv
source venv/bin/activate
```

**3. Install dependencies:**
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

**4. Configure environment variables:**

Create a `.env` file in `clinic-backend/` with:
```env
SECRET_KEY=your_secret_key
DEBUG=True
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432
```

**5. Run migrations:**
```bash
python manage.py makemigrations
python manage.py migrate
```

**6. Create a superuser:**
```bash
python manage.py createsuperuser
```

**7. Start the server:**
```bash
python manage.py runserver
```

---

## Frontend Setup

**1. Navigate to frontend folder:**
```bash
cd clinic-frontend
```

**2. Install dependencies:**
```bash
npm install
```

**3. Start development server:**
```bash
npm run dev
```

---

## ⚠️ Python Version Note

This project was built and tested on **Python 3.11**.

If you are on a machine with a different Python version, install Python 3.11 separately and create the virtual environment using `py -3.11 -m venv venv` on Windows.

The ML stack (`interpret`, `numpy`, `scikit-learn`) has known compatibility issues with Python 3.12+ pre-release builds.

---

## Author

**Sajaad Iqbal**

Developer · AI Enthusiast · Full-Stack Engineer  
Passionate about building intelligent systems that combine **machine learning, web technologies, and real-world problem solving**.

[![WhatsApp](https://img.shields.io/badge/WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://wa.me/+254115760476)
[![Instagram](https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://instagram.com/the___user_)
[![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:Sajaadiqbalkarim7@gmail.com)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Mono-eyeddev)

---

## License

This project is released for **academic and research purposes only**.  
Developed as a final-year academic project — **not licensed for commercial use, redistribution, or modification** without explicit permission from the author.  
All rights reserved.
