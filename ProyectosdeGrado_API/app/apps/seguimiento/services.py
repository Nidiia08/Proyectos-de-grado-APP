from django.db import transaction
from django.utils import timezone

from .models import Acuerdo, HistorialAccion, InformeTrimestral


def registrar_accion(proyecto, usuario, accion, descripcion, fase=None):
    """Registra una accion importante en el historial."""
    return HistorialAccion.objects.create(
        proyecto=proyecto,
        usuario=usuario,
        accion=accion,
        descripcion=descripcion,
        fase=fase,
        fecha=timezone.now(),
    )


@transaction.atomic
def crear_informe(datos):
    """Crea un informe trimestral."""
    return InformeTrimestral.objects.create(**datos)


@transaction.atomic
def actualizar_informe(informe_id, datos):
    """Actualiza un informe trimestral."""
    informe = InformeTrimestral.objects.get(id=informe_id)
    for campo, valor in datos.items():
        setattr(informe, campo, valor)
    informe.save()
    return informe


@transaction.atomic
def crear_acuerdo(datos):
    """Crea un acuerdo del comite curricular."""
    return Acuerdo.objects.create(**datos)
