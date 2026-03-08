from .models import AuditLog

def get_client_ip(request):

    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")

    if x_forwarded_for:
        ip = x_forwarded_for.split(",")[0]

    else:
        ip = request.META.get("REMOTE_ADDR")

    return ip


def log_audit(user, action, request, details=""):

    ip = get_client_ip(request)

    print(f"AUDIT DEBUG → user={user} ip={ip}")

    AuditLog.objects.create(
        user=user,
        action=action,
        ip_address=ip,
        details=details
    )