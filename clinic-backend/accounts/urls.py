from django.urls import path
from .views import LoginView
from rest_framework_simplejwt.views import TokenRefreshView
from .views import LoginView, SysAdminDashboardView, ManagerDashboardView , CNODashboardView
from .views import SubmitKPIView

urlpatterns = [
     path("login/", LoginView.as_view(), name="login"),
    path("sysadmin/dashboard/", SysAdminDashboardView.as_view(), name="sysadmin_dashboard"),
    path("manager/dashboard/", ManagerDashboardView.as_view(), name="manager_dashboard"),
    path("cno/dashboard/", CNODashboardView.as_view(), name="cno_dashboard"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("manager/kpi/submit/", SubmitKPIView.as_view(), name="submit_kpi"),
]