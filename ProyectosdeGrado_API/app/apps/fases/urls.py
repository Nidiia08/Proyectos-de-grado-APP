from django.urls import path

from .views import (
    AprobacionView,
    AprobarCulminacionView,
    AprobarInscripcionView,
    CulminacionView,
    DesarrolloView,
    EvaluacionView,
    InscripcionView,
    ProrrogaView,
    RechazarInscripcionView,
    SustentacionView,
)

urlpatterns = [
    path("proyectos/<int:id>/inscripcion/", InscripcionView.as_view()),
    path("proyectos/<int:id>/inscripcion/aprobar/", AprobarInscripcionView.as_view()),
    path("proyectos/<int:id>/inscripcion/rechazar/", RechazarInscripcionView.as_view()),
    path("proyectos/<int:id>/aprobacion/", AprobacionView.as_view()),
    path("proyectos/<int:id>/desarrollo/", DesarrolloView.as_view()),
    path("proyectos/<int:id>/desarrollo/prorroga/", ProrrogaView.as_view()),
    path("proyectos/<int:id>/culminacion/", CulminacionView.as_view()),
    path("proyectos/<int:id>/culminacion/aprobar/", AprobarCulminacionView.as_view()),
    path("proyectos/<int:id>/evaluacion/", EvaluacionView.as_view()),
    path("proyectos/<int:id>/evaluacion/sustentacion/", SustentacionView.as_view()),
]
