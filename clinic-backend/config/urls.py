from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),

    # Auth API
    path("api/auth/", include("accounts.urls")),
]