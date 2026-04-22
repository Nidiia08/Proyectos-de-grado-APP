from django.contrib import admin

from .models import FaseAprobacion, FaseCulminacion, FaseDesarrollo, FaseEvaluacion, FaseInscripcion


@admin.register(FaseInscripcion)
class FaseInscripcionAdmin(admin.ModelAdmin):
    list_display = ("id", "proyecto", "estado", "fecha_envio", "fecha_aprobacion")
    list_filter = ("estado",)
    search_fields = ("proyecto__nombre",)
    ordering = ("-id",)


@admin.register(FaseAprobacion)
class FaseAprobacionAdmin(admin.ModelAdmin):
    list_display = ("id", "proyecto", "iteracion_actual", "max_iteraciones", "estado")
    list_filter = ("estado",)
    search_fields = ("proyecto__nombre",)
    ordering = ("-id",)


@admin.register(FaseDesarrollo)
class FaseDesarrolloAdmin(admin.ModelAdmin):
    list_display = ("id", "proyecto", "estado", "fecha_inicio", "fecha_fin_estimada")
    list_filter = ("estado",)
    search_fields = ("proyecto__nombre",)
    ordering = ("-id",)


@admin.register(FaseCulminacion)
class FaseCulminacionAdmin(admin.ModelAdmin):
    list_display = ("id", "proyecto", "estado", "fecha_envio", "fecha_aprobacion")
    list_filter = ("estado",)
    search_fields = ("proyecto__nombre",)
    ordering = ("-id",)


@admin.register(FaseEvaluacion)
class FaseEvaluacionAdmin(admin.ModelAdmin):
    list_display = ("id", "proyecto", "estado", "nota_final", "resultado")
    list_filter = ("estado", "resultado")
    search_fields = ("proyecto__nombre",)
    ordering = ("-id",)
