from django.contrib import admin

from .models import ConfiguracionSistema


@admin.register(ConfiguracionSistema)
class ConfiguracionSistemaAdmin(admin.ModelAdmin):
    list_display = ("id", "clave", "valor", "ultima_actualizacion", "actualizado_por")
    list_filter = ("ultima_actualizacion",)
    search_fields = ("clave", "descripcion")
    ordering = ("-ultima_actualizacion",)
