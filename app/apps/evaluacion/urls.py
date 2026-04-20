from django.urls import path

from .views import CalificacionView, IteracionDetalleView, JuradosView, RevisionIteracionView, RevistaIndexadaView

urlpatterns = [
    path("proyectos/<int:id>/jurados/", JuradosView.as_view()),
    path("iteraciones/<int:id>/", IteracionDetalleView.as_view()),
    path("iteraciones/<int:id>/revision/", RevisionIteracionView.as_view()),
    path("evaluacion/<int:id>/calificacion/", CalificacionView.as_view()),
    path("proyectos/<int:id>/revista/", RevistaIndexadaView.as_view()),
]
