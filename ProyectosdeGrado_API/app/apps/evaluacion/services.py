from decimal import Decimal

from django.db import transaction
from django.utils import timezone

from apps.fases.models import FaseEvaluacion
from apps.notificaciones.services import crear_notificacion
from apps.seguimiento.models import HistorialAccion
from apps.usuarios.models import Docente

from .models import AsignacionJurado, CalificacionJurado, IteracionAprobacion, RevisionJuradoRevisor


def _resultado_por_nota(nota):
    if nota >= 90:
        return "LAUREADO"
    if nota >= 80:
        return "MERITORIO"
    if nota >= 60:
        return "APROBADO"
    return "REPROBADO"


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
def asignar_jurados(proyecto_id, jurado_ids, tipo, usuario):
    """Asigna jurados validando su carga maxima de proyectos."""
    asignaciones = []
    for jurado_id in jurado_ids:
        docente = Docente.objects.get(id=jurado_id)
        carga_actual = AsignacionJurado.objects.filter(jurado=docente, activo=True).count()
        limite = docente.max_proyectos_jurado or 0
        if limite and carga_actual >= limite:
            raise ValueError(f"El jurado {docente.codigo_docente} supero el maximo permitido.")
        asignacion = AsignacionJurado.objects.create(
            proyecto_id=proyecto_id,
            jurado=docente,
            tipo_jurado=tipo,
            fecha_asignacion=timezone.now().date(),
            activo=True,
        )
        asignaciones.append(asignacion)
        crear_notificacion(
            docente.usuario_id,
            proyecto_id,
            "ASIGNACION_JURADO",
            "Usted fue asignado como jurado en un proyecto de grado.",
            f"/proyectos/{proyecto_id}/jurados/",
        )
    _registrar_historial(asignaciones[0].proyecto, usuario, "ASIGNAR_JURADOS", "Se asignaron jurados.")
    return asignaciones


@transaction.atomic
def registrar_revision(iteracion_id, datos, jurado):
    """Registra revision jurado en una iteracion de aprobacion."""
    revision = RevisionJuradoRevisor.objects.create(
        iteracion_aprobacion_id=iteracion_id,
        jurado=jurado,
        decision=datos.get("decision"),
        observaciones=datos.get("observaciones"),
        fecha_respuesta=timezone.now(),
    )
    iteracion = IteracionAprobacion.objects.select_related("fase_aprobacion__proyecto").get(id=iteracion_id)
    proyecto = iteracion.fase_aprobacion.proyecto
    _registrar_historial(proyecto, jurado.usuario, "REGISTRAR_REVISION", "Se registro revision de jurado.")
    return revision


@transaction.atomic
def registrar_calificacion(fase_evaluacion_id, datos, jurado):
    """Registra una calificacion y consolida nota final cuando ambos jurados califican."""
    calificacion, _ = CalificacionJurado.objects.update_or_create(
        fase_evaluacion_id=fase_evaluacion_id,
        jurado=jurado,
        defaults={
            **datos,
            "fecha_registro": timezone.now(),
            "enviada": True,
        },
    )
    fase = FaseEvaluacion.objects.select_related("proyecto").get(id=fase_evaluacion_id)
    calificaciones = CalificacionJurado.objects.filter(fase_evaluacion=fase, enviada=True)
    if calificaciones.count() >= 2:
        promedio = sum([c.total_final or 0 for c in calificaciones]) / calificaciones.count()
        fase.nota_final = Decimal(str(round(promedio, 2)))
        fase.resultado = _resultado_por_nota(promedio)
        fase.save()
    _registrar_historial(fase.proyecto, jurado.usuario, "REGISTRAR_CALIFICACION", "Se registro calificacion de jurado.")
    return calificacion
