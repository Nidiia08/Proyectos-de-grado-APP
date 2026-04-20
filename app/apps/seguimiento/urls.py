from django.urls import path

from .views import AcuerdoListCreateView, HistorialProyectoView, InformeListCreateView, InformeUpdateView

urlpatterns = [
    path("proyectos/<int:id>/informes/", InformeListCreateView.as_view()),
    path("informes/<int:id>/", InformeUpdateView.as_view()),
    path("proyectos/<int:id>/acuerdos/", AcuerdoListCreateView.as_view()),
    path("proyectos/<int:id>/historial/", HistorialProyectoView.as_view()),
]
