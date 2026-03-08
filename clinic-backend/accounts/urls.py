from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    LoginView,
    SysAdminDashboardView,
    ManagerDashboardView,
    CNODashboardView,
    SubmitKPIView,
    CheckKPISubmissionView,
)

from .views_cno import (
    CNOClinicRiskView,
    CNOAlertsView,
    CNOTrendsView,
    CNOResourcesView,
    CNOKpisView,
    CNOReportsView,
    CNONotificationsView,
    CNOProfileView,
)

urlpatterns = [
    path("login/",                  LoginView.as_view(),             name="login"),
    path("token/refresh/",          TokenRefreshView.as_view(),      name="token_refresh"),
    path("sysadmin/dashboard/",     SysAdminDashboardView.as_view(), name="sysadmin_dashboard"),
    path("manager/dashboard/",      ManagerDashboardView.as_view(),  name="manager_dashboard"),
    path("manager/kpi/submit/",     SubmitKPIView.as_view(),         name="submit_kpi"),
    path("cno/dashboard/",          CNODashboardView.as_view(),      name="cno_dashboard"),
    path("cno/clinic-risk/",        CNOClinicRiskView.as_view()),    # new CNO endpoint
    path("cno/alerts/",             CNOAlertsView.as_view()),
    path("cno/trends/",             CNOTrendsView.as_view()),
    path("cno/resources/",          CNOResourcesView.as_view()),
    path("cno/kpis/",               CNOKpisView.as_view()),
    path("cno/reports/",            CNOReportsView.as_view()),
    path("cno/notifications/",      CNONotificationsView.as_view()),
    path("cno/profile/",            CNOProfileView.as_view()),
    path("api/auth/manager/kpi/check-submission/", CheckKPISubmissionView.as_view()),
]