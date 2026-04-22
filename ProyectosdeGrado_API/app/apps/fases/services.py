from django.db import transaction
from django.utils import timezone

from apps.notificaciones.services import crear_notificacion
from apps.proyectos.models import Proyecto
from apps.seguimiento.models import HistorialAccion, Prorroga

from .models import EstadoFase, FaseAprobacion, FaseCulminacion, FaseDesarrollo, FaseEvaluacion, FaseInscripcion


def _registrar_historial(proyecto, usuario, accion, descripcion):
    HistorialAccion.objects.create(
        proyecto=proyecto,
        usuario=usuario,
        accion=accion,
        descripcion=descripcion,
        fase=proyecto.fase_actual,
        fecha=timezone.now(),
    )


@transaction.atomic
def aprobar_inscripcion(proyecto_id, usuario):
    """Aprueba la fase de inscripcion del proyecto."""
    fase = FaseInscripcion.objects.select_related("proyecto").get(proyecto_id=proyecto_id)
    fase.estado = EstadoFase.APROBADA
    fase.fecha_aprobacion = timezone.now()
    fase.save()
    _registrar_historial(fase.proyecto, usuario, "APROBAR_INSCRIPCION", "Se aprobo la inscripcion.")
    return fase


@transaction.atomic
def rechazar_inscripcion(proyecto_id, observaciones, usuario):
    """Rechaza la fase de inscripcion con observaciones."""
    fase = FaseInscripcion.objects.select_related("proyecto").get(proyecto_id=proyecto_id)
    fase.estado = EstadoFase.RECHAZADA
    fase.observaciones_comite = observaciones
    fase.save()
    _registrar_historial(fase.proyecto, usuario, "RECHAZAR_INSCRIPCION", observaciones)
    return fase


def iniciar_aprobacion(proyecto_id, usuario):
    """Marca la fase de aprobacion como en proceso."""
    fase = FaseAprobacion.objects.select_related("proyecto").get(proyecto_id=proyecto_id)
    fase.estado = EstadoFase.EN_PROCESO
    fase.save()
    _registrar_historial(fase.proyecto, usuario, "INICIAR_APROBACION", "Se inicio la fase de aprobacion.")
    return fase


def aprobar_desarrollo(proyecto_id, usuario):
    """Aprueba la fase de desarrollo."""
    fase = FaseDesarrollo.objects.select_related("proyecto").get(proyecto_id=proyecto_id)
    fase.estado = EstadoFase.APROBADA
    fase.save()
    _registrar_historial(fase.proyecto, usuario, "APROBAR_DESARROLLO", "Se aprobo la fase de desarrollo.")
    return fase


@transaction.atomic
def registrar_prorroga(fase_desarrollo_id, datos, usuario):
    """Registra una prorroga de fase desarrollo."""
    fase = FaseDesarrollo.objects.select_related("proyecto").get(id=fase_desarrollo_id)
    fase.tiene_prorroga = True
    fase.fecha_fin_estimada = datos["fecha_nueva"]
    fase.save()
    prorroga = Prorroga.objects.create(
        fase_desarrollo=fase,
        fecha_anterior=datos["fecha_anterior"],
        fecha_nueva=datos["fecha_nueva"],
        motivo=datos["motivo"],
        fecha_registro=timezone.now(),
        registrado_por=usuario,
    )
    _registrar_historial(fase.proyecto, usuario, "REGISTRAR_PRORROGA", "Se registro prorroga de proyecto.")
    return prorroga


def aprobar_culminacion(proyecto_id, usuario):
    """Aprueba la fase de culminacion del proyecto."""
    fase = FaseCulminacion.objects.select_related("proyecto").get(proyecto_id=proyecto_id)
    fase.estado = EstadoFase.APROBADA
    fase.fecha_aprobacion = timezone.now()
    fase.save()
    _registrar_historial(fase.proyecto, usuario, "APROBAR_CULMINACION", "Se aprobo la culminacion.")
    return fase


def programar_sustentacion(fase_evaluacion_id, datos, usuario):
    """Programa fechas de sustentacion privada y publica."""
    fase = FaseEvaluacion.objects.select_related("proyecto").get(id=fase_evaluacion_id)
    fase.fecha_sustentacion_privada = datos.get("fecha_sustentacion_privada")
    fase.fecha_socializacion_publica = datos.get("fecha_socializacion_publica")
    fase.estado = EstadoFase.EN_PROCESO
    fase.save()
    _registrar_historial(fase.proyecto, usuario, "PROGRAMAR_SUSTENTACION", "Se programo la sustentacion.")
    return fase


def finalizar_evaluacion(fase_evaluacion_id, usuario):
    """Finaliza la fase de evaluacion del proyecto."""
    fase = FaseEvaluacion.objects.select_related("proyecto").get(id=fase_evaluacion_id)
    fase.estado = EstadoFase.CERRADA
    fase.save()
    _registrar_historial(fase.proyecto, usuario, "FINALIZAR_EVALUACION", "Se finalizo la evaluacion.")
    return fase
