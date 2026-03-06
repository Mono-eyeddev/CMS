from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Clinic, User, Staff, ClinicKPI


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