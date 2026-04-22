from django.contrib import admin

from .models import Acuerdo, HistorialAccion, InformeTrimestral, Prorroga


@admin.register(InformeTrimestral)
class InformeTrimestralAdmin(admin.ModelAdmin):
    list_display = ("id", "fase_desarrollo", "numero_informe", "estado", "fecha_envio")
    list_filter = ("estado", "fecha_envio")
    search_fields = ("fase_desarrollo__proyecto__nombre",)
    ordering = ("-fecha_envio",)


@admin.register(Prorroga)
class ProrrogaAdmin(admin.ModelAdmin):
    list_display = ("id", "fase_desarrollo", "fecha_anterior", "fecha_nueva", "fecha_registro")
    list_filter = ("fecha_registro",)
    search_fields = ("fase_desarrollo__proyecto__nombre",)
    ordering = ("-fecha_registro",)


@admin.register(Acuerdo)
class AcuerdoAdmin(admin.ModelAdmin):
    list_display = ("id", "numero_acuerdo", "tipo", "fecha", "proyecto")
    list_filter = ("tipo", "fecha")
    search_fields = ("numero_acuerdo", "proyecto__nombre")
    ordering = ("-fecha",)


@admin.register(HistorialAccion)
class HistorialAccionAdmin(admin.ModelAdmin):
    list_display = ("id", "proyecto", "usuario", "accion", "fase", "fecha")
    list_filter = ("fase", "fecha")
    search_fields = ("proyecto__nombre", "usuario__correo", "accion")
    ordering = ("-fecha",)
