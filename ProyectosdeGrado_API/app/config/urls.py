"""Rutas principales del proyecto."""

from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("apps.usuarios.urls")),
    path("api/", include("apps.proyectos.urls")),
    path("api/", include("apps.fases.urls")),
    path("api/", include("apps.documentos.urls")),
    path("api/", include("apps.evaluacion.urls")),
    path("api/", include("apps.seguimiento.urls")),
    path("api/", include("apps.notificaciones.urls")),
    path("api/", include("apps.chat.urls")),
    path("api/", include("apps.configuracion.urls")),
]
