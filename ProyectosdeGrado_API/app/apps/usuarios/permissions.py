from rest_framework.permissions import BasePermission


def tiene_rol(usuario, rol):
    """Valida si el usuario autenticado tiene un rol especifico."""
    return bool(usuario and usuario.is_authenticated and usuario.roles.filter(rol=rol).exists())


class EsComite(BasePermission):
    def has_permission(self, request, view):
        return tiene_rol(request.user, "COMITE")


class EsEstudiante(BasePermission):
    def has_permission(self, request, view):
        return tiene_rol(request.user, "ESTUDIANTE")


class EsDocente(BasePermission):
    def has_permission(self, request, view):
        return tiene_rol(request.user, "DOCENTE")


class EsJurado(BasePermission):
    def has_permission(self, request, view):
        return tiene_rol(request.user, "JURADO")


class EsDocenteOJurado(BasePermission):
    def has_permission(self, request, view):
        return tiene_rol(request.user, "DOCENTE") or tiene_rol(request.user, "JURADO")


class EsPropioUsuarioOComite(BasePermission):
    def has_permission(self, request, view):
        return True

    def has_object_permission(self, request, view, obj):
        return request.user == obj or tiene_rol(request.user, "COMITE")


class EsAsesorDe(BasePermission):
    """Permite acceso al asesor del proyecto o al comite."""

    def has_object_permission(self, request, view, obj):
        docente = getattr(request.user, "docente", None)
        return (
            tiene_rol(request.user, "COMITE")
            or (docente is not None and getattr(obj, "asesor_id", None) == docente.id)
        )
