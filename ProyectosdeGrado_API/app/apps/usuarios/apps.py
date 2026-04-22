from django.apps import AppConfig


class UsuariosConfig(AppConfig):
    """Configuración de la app de usuarios."""

    default_auto_field = 'django.db.models.AutoField'
    name = 'apps.usuarios'
    label = 'usuarios'
