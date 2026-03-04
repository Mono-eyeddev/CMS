from rest_framework.permissions import BasePermission


class IsSysAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == "SYSADMIN"


class IsManager(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == "MANAGER"


class IsCNO(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == "CNO"