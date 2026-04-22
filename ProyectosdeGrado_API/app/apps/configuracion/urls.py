from django.urls import path

from .views import ConfiguracionListView, ConfiguracionUpdateView

urlpatterns = [
    path("configuracion/", ConfiguracionListView.as_view()),
    path("configuracion/<str:clave>/", ConfiguracionUpdateView.as_view()),
]
