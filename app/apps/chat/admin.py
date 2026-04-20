from django.contrib import admin

from .models import Conversacion, Mensaje


@admin.register(Conversacion)
class ConversacionAdmin(admin.ModelAdmin):
    list_display = ("id", "proyecto", "estudiante", "docente", "activa", "fecha_creacion")
    list_filter = ("activa", "fecha_creacion")
    search_fields = ("proyecto__nombre", "estudiante__codigo_estudiante", "docente__codigo_docente")
    ordering = ("-fecha_creacion",)


@admin.register(Mensaje)
class MensajeAdmin(admin.ModelAdmin):
    list_display = ("id", "conversacion", "remitente", "leido", "fecha_envio")
    list_filter = ("leido", "fecha_envio")
    search_fields = ("contenido", "remitente__correo")
    ordering = ("-fecha_envio",)
