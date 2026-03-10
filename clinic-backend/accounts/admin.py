from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Clinic, User, Staff, ClinicKPI ,RiskPrediction
from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("user", "action", "timestamp", "ip_address")
    search_fields = ("user__username", "action")
    list_filter = ("timestamp",)
class UserAdmin(BaseUserAdmin):
    fieldsets = BaseUserAdmin.fieldsets + (
        ("Role Information", {"fields": ("role", "clinic")}),
    )

    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        (None, {"fields": ("role", "clinic")}),
    )


# Register models
admin.site.register(User, UserAdmin)
admin.site.register(Clinic)
admin.site.register(Staff)
admin.site.register(ClinicKPI)
@admin.register(RiskPrediction)
class RiskPredictionAdmin(admin.ModelAdmin):
    list_display = ("clinic", "risk_score", "risk_level", "created_at")
    list_filter = ("risk_level", "created_at")
    search_fields = ("clinic__name",)