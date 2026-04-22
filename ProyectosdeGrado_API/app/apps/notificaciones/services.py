from django.db import transaction
from django.utils import timezone

from .models import Notificacion


@transaction.atomic
def crear_notificacion(usuario_destino_id, proyecto_id, tipo, mensaje, url_accion):
    """Crea una notificacion para un usuario destino."""
    return Notificacion.objects.create(
        usuario_destino_id=usuario_destino_id,
        proyecto_id=proyecto_id,
        tipo=tipo,
        mensaje=mensaje,
        leida=False,
        fecha=timezone.now(),
        url_accion=url_accion,
    )


@transaction.atomic
def marcar_como_leida(notificacion_id, usuario):
    """Marca una notificacion como leida si pertenece al usuario."""
    notificacion = Notificacion.objects.get(id=notificacion_id, usuario_destino=usuario)
    notificacion.leida = True
    notificacion.save()
    return notificacion


@transaction.atomic
def marcar_todas_leidas(usuario):
    """Marca todas las notificaciones del usuario como leidas."""
    return Notificacion.objects.filter(usuario_destino=usuario, leida=False).update(leida=True)


def obtener_no_leidas(usuario):
    """Retorna todas las notificaciones no leidas del usuario."""
    return Notificacion.objects.filter(usuario_destino=usuario, leida=False).order_by("-fecha")
