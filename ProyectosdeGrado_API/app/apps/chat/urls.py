from django.urls import path

from .views import ConversacionListCreateView, LeerMensajesView, MensajesView

urlpatterns = [
    path("conversaciones/", ConversacionListCreateView.as_view()),
    path("conversaciones/<int:id>/mensajes/", MensajesView.as_view()),
    path("conversaciones/<int:id>/leer/", LeerMensajesView.as_view()),
]
