from django.urls import path

from .views import (
    CambioPasswordView,
    DesactivarUsuarioView,
    DetalleUsuarioView,
    ListaUsuariosView,
    LoginView,
    LogoutView,
    PerfilView,
    RefreshTokenView,
    RegistroDocenteView,
    RegistroEstudianteView,
)

urlpatterns = [
    path("auth/login/", LoginView.as_view()),
    path("auth/refresh/", RefreshTokenView.as_view()),
    path("auth/logout/", LogoutView.as_view()),
    path("auth/perfil/", PerfilView.as_view()),
    path("auth/cambiar-password/", CambioPasswordView.as_view()),
    path("usuarios/", ListaUsuariosView.as_view()),
    path("usuarios/estudiantes/", RegistroEstudianteView.as_view()),
    path("usuarios/docentes/", RegistroDocenteView.as_view()),
    path("usuarios/<int:id>/", DetalleUsuarioView.as_view()),
    path("usuarios/<int:id>/desactivar/", DesactivarUsuarioView.as_view()),
]
