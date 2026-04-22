from django.urls import path

from .views import (
    DocumentoCulminacionListCreateView,
    DocumentoCulminacionUpdateView,
    DocumentoInscripcionListCreateView,
    DocumentoInscripcionUpdateView,
    PlantillaDeleteView,
    PlantillaListCreateView,
)

urlpatterns = [
    path("proyectos/<int:id>/documentos-inscripcion/", DocumentoInscripcionListCreateView.as_view()),
    path("documentos-inscripcion/<int:id>/", DocumentoInscripcionUpdateView.as_view()),
    path("proyectos/<int:id>/documentos-culminacion/", DocumentoCulminacionListCreateView.as_view()),
    path("documentos-culminacion/<int:id>/", DocumentoCulminacionUpdateView.as_view()),
    path("plantillas/", PlantillaListCreateView.as_view()),
    path("plantillas/<int:id>/", PlantillaDeleteView.as_view()),
]
