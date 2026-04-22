from django.contrib import admin

from .models import Docente, Estudiante, Usuario, UsuarioRol


@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):
    list_display = ("id", "nombre", "apellido", "correo", "activo", "fecha_registro")
    list_filter = ("activo", "fecha_registro")
    search_fields = ("nombre", "apellido", "correo")
    ordering = ("-fecha_registro",)


@admin.register(Estudiante)
class EstudianteAdmin(admin.ModelAdmin):
    list_display = ("id", "codigo_estudiante", "programa", "promedio_acumulado")
    search_fields = ("codigo_estudiante", "programa", "usuario__correo")
    ordering = ("-id",)


@admin.register(Docente)
class DocenteAdmin(admin.ModelAdmin):
    list_display = ("id", "codigo_docente", "area_conocimiento", "max_proyectos_asesor")
    search_fields = ("codigo_docente", "usuario__correo", "area_conocimiento")
    ordering = ("-id",)


@admin.register(UsuarioRol)
class UsuarioRolAdmin(admin.ModelAdmin):
    list_display = ("id", "usuario", "rol")
    list_filter = ("rol",)
    search_fields = ("usuario__correo",)
    ordering = ("-id",)
