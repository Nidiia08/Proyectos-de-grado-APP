from typing import Any

from django.db import transaction
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Docente, Estudiante, Usuario, UsuarioRol


def autenticar_usuario(correo: str, password: str) -> dict[str, Any]:
    """Valida credenciales y retorna tokens JWT."""
    usuario = Usuario.objects.filter(correo=correo).first()
    if not usuario or not usuario.check_password(password):
        raise ValueError("Credenciales invalidas.")
    if not usuario.activo:
        raise ValueError("El usuario esta inactivo.")

    refresh = RefreshToken.for_user(usuario)
    return {
        "access_token": str(refresh.access_token),
        "refresh_token": str(refresh),
        "usuario": {
            "id": usuario.id,
            "nombre": usuario.nombre,
            "apellido": usuario.apellido,
            "correo": usuario.correo,
            "roles": usuario.roles_lista,
        },
    }


@transaction.atomic
def registrar_estudiante(datos: dict[str, Any]) -> Estudiante:
    """Registra un estudiante creando usuario y perfil academico."""
    usuario = Usuario.objects.create_user(
        correo=datos["correo"],
        password=datos["password"],
        nombre=datos["nombre"],
        apellido=datos["apellido"],
        roles=[UsuarioRol.Rol.ESTUDIANTE],
        activo=True,
    )
    return Estudiante.objects.create(
        usuario=usuario,
        codigo_estudiante=datos["codigo_estudiante"],
        programa=datos["programa"],
        promedio_acumulado=datos.get("promedio_acumulado"),
        creditos_aprobados=datos.get("creditos_aprobados"),
    )


@transaction.atomic
def registrar_docente(datos: dict[str, Any]) -> Docente:
    """Registra un docente o jurado creando usuario y perfil academico."""
    usuario = Usuario.objects.create_user(
        correo=datos["correo"],
        password=datos["password"],
        nombre=datos["nombre"],
        apellido=datos["apellido"],
        roles=datos.get("roles") or [UsuarioRol.Rol.DOCENTE],
        activo=True,
    )
    return Docente.objects.create(
        usuario=usuario,
        codigo_docente=datos["codigo_docente"],
        area_conocimiento=datos.get("area_conocimiento"),
        max_proyectos_asesor=datos.get("max_proyectos_asesor"),
        max_proyectos_jurado=datos.get("max_proyectos_jurado"),
    )


def obtener_perfil_usuario(usuario_id: int) -> dict[str, Any]:
    """Obtiene el usuario y su perfil asociado."""
    usuario = Usuario.objects.get(id=usuario_id)
    perfil = None
    if usuario.tiene_rol(UsuarioRol.Rol.ESTUDIANTE):
        perfil = Estudiante.objects.filter(usuario=usuario).first()
    if usuario.tiene_rol(UsuarioRol.Rol.DOCENTE) or usuario.tiene_rol(UsuarioRol.Rol.JURADO):
        perfil = Docente.objects.filter(usuario=usuario).first()
    return {"usuario": usuario, "perfil": perfil}


@transaction.atomic
def actualizar_usuario(usuario_id: int, datos: dict[str, Any]) -> Usuario:
    """Actualiza datos permitidos de usuario."""
    usuario = Usuario.objects.get(id=usuario_id)
    for campo in ["nombre", "apellido", "correo", "activo"]:
        if campo in datos:
            setattr(usuario, campo, datos[campo])
    usuario.save()
    if "roles" in datos:
        usuario.roles.all().delete()
        for rol in datos["roles"]:
            UsuarioRol.objects.create(usuario=usuario, rol=rol)
    return usuario


@transaction.atomic
def desactivar_usuario(usuario_id: int) -> Usuario:
    """Desactiva un usuario del sistema."""
    usuario = Usuario.objects.get(id=usuario_id)
    usuario.activo = False
    usuario.save()
    return usuario


@transaction.atomic
def cambiar_password(usuario_id: int, password_actual: str, password_nuevo: str) -> None:
    """Cambia la contrasena validando la contrasena actual."""
    usuario = Usuario.objects.get(id=usuario_id)
    if not usuario.check_password(password_actual):
        raise ValueError("La contrasena actual no es correcta.")
    usuario.set_password(password_nuevo)
    usuario.save()
