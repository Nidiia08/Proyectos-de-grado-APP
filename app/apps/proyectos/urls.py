from django.urls import path

from .views import (
    GrupoInvestigacionListCreateView,
    PeriodoListCreateView,
    ProyectoDetailView,
    ProyectoListCreateView,
)

urlpatterns = [
    path("proyectos/", ProyectoListCreateView.as_view()),
    path("proyectos/<int:id>/", ProyectoDetailView.as_view()),
    path("periodos/", PeriodoListCreateView.as_view()),
    path("grupos-investigacion/", GrupoInvestigacionListCreateView.as_view()),
]
