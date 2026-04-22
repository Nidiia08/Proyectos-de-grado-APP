from django.apps import AppConfig


class ChatConfig(AppConfig):
    """Configuracion de la app chat."""

    default_auto_field = 'django.db.models.AutoField'
    name = 'apps.chat'
    label = 'chat'
