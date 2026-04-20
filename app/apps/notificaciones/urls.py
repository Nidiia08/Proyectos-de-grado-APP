from django.urls import path

from .views import LeerNotificacionView, LeerTodasView, NoLeidasCountView, NotificacionesListView

urlpatterns = [
    path("notificaciones/", NotificacionesListView.as_view()),
    path("notificaciones/<int:id>/leer/", LeerNotificacionView.as_view()),
    path("notificaciones/leer-todas/", LeerTodasView.as_view()),
    path("notificaciones/no-leidas/count/", NoLeidasCountView.as_view()),
]
