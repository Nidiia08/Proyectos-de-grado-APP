from django.db import transaction
from django.utils import timezone

from .models import Conversacion, Mensaje


@transaction.atomic
def obtener_o_crear_conversacion(proyecto_id, estudiante_id, docente_id):
    """Obtiene o crea una conversacion unica por proyecto y actores."""
    conversacion, _ = Conversacion.objects.get_or_create(
        proyecto_id=proyecto_id,
        estudiante_id=estudiante_id,
        docente_id=docente_id,
        defaults={"fecha_creacion": timezone.now(), "activa": True},
    )
    return conversacion


@transaction.atomic
def enviar_mensaje(conversacion_id, remitente, contenido):
    """Envia un mensaje en una conversacion activa."""
    return Mensaje.objects.create(
        conversacion_id=conversacion_id,
        remitente=remitente,
        contenido=contenido,
        fecha_envio=timezone.now(),
        leido=False,
    )


@transaction.atomic
def marcar_mensajes_leidos(conversacion_id, usuario):
    """Marca como leidos los mensajes recibidos por el usuario."""
    return Mensaje.objects.filter(conversacion_id=conversacion_id).exclude(remitente=usuario).update(
        leido=True,
        fecha_lectura=timezone.now(),
    )


def obtener_mensajes(conversacion_id, usuario):
    """Obtiene mensajes de una conversacion en orden cronologico."""
    return Mensaje.objects.filter(conversacion_id=conversacion_id).order_by("fecha_envio")
