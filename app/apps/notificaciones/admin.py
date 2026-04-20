from django.contrib import admin

from .models import Notificacion


@admin.register(Notificacion)
class NotificacionAdmin(admin.ModelAdmin):
    list_display = ("id", "usuario_destino", "tipo", "leida", "fecha")
    list_filter = ("tipo", "leida", "fecha")
    search_fields = ("usuario_destino__correo", "mensaje")
    ordering = ("-fecha",)
