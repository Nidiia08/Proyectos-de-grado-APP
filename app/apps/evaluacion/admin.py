from django.contrib import admin

from .models import (
    AsignacionJurado,
    CalificacionJurado,
    IteracionAprobacion,
    RevisionJuradoRevisor,
    RevistaIndexada,
)


@admin.register(AsignacionJurado)
class AsignacionJuradoAdmin(admin.ModelAdmin):
    list_display = ("id", "proyecto", "jurado", "tipo_jurado", "fecha_asignacion", "activo")
    list_filter = ("tipo_jurado", "activo", "fecha_asignacion")
    search_fields = ("proyecto__nombre", "jurado__codigo_docente")
    ordering = ("-fecha_asignacion",)


@admin.register(IteracionAprobacion)
class IteracionAprobacionAdmin(admin.ModelAdmin):
    list_display = ("id", "fase_aprobacion", "numero_iteracion", "estado", "fecha_inicio")
    list_filter = ("estado",)
    search_fields = ("fase_aprobacion__proyecto__nombre",)
    ordering = ("-id",)


@admin.register(RevisionJuradoRevisor)
class RevisionJuradoRevisorAdmin(admin.ModelAdmin):
    list_display = ("id", "iteracion_aprobacion", "jurado", "decision", "fecha_respuesta")
    list_filter = ("decision", "fecha_respuesta")
    search_fields = ("jurado__codigo_docente",)
    ordering = ("-fecha_respuesta",)


@admin.register(CalificacionJurado)
class CalificacionJuradoAdmin(admin.ModelAdmin):
    list_display = ("id", "fase_evaluacion", "jurado", "total_documento", "total_sustentacion", "total_final")
    list_filter = ("enviada", "fecha_registro")
    search_fields = ("jurado__codigo_docente",)
    ordering = ("-fecha_registro",)


@admin.register(RevistaIndexada)
class RevistaIndexadaAdmin(admin.ModelAdmin):
    list_display = ("id", "proyecto", "nombre_revista", "clasificacion", "calificacion_equivalente")
    list_filter = ("clasificacion",)
    search_fields = ("proyecto__nombre", "nombre_revista")
    ordering = ("-fecha_registro",)
