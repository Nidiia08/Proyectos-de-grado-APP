from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.usuarios.models import Docente

from .models import AsignacionJurado, CalificacionJurado, IteracionAprobacion, RevistaIndexada
from .serializers import (
    AsignacionJuradoSerializer,
    CalificacionJuradoSerializer,
    IteracionAprobacionSerializer,
    RevisionJuradoRevisorSerializer,
    RevistaIndexadaSerializer,
)
from .services import asignar_jurados, registrar_calificacion, registrar_revision


def ok(mensaje, datos=None, status_code=status.HTTP_200_OK):
    return Response({"mensaje": mensaje, "datos": datos}, status=status_code)


def error(mensaje, status_code=status.HTTP_400_BAD_REQUEST):
    return Response({"error": mensaje}, status=status_code)


class JuradosView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        asignaciones = AsignacionJurado.objects.filter(proyecto_id=id)
        return ok("Jurados consultados.", AsignacionJuradoSerializer(asignaciones, many=True).data)

    def post(self, request, id):
        jurado_ids = request.data.get("jurado_ids", [])
        tipo = request.data.get("tipo", "REVISOR")
        try:
            asignaciones = asignar_jurados(id, jurado_ids, tipo, request.user)
        except ValueError as exc:
            return error(str(exc))
        return ok("Jurados asignados.", AsignacionJuradoSerializer(asignaciones, many=True).data, status.HTTP_201_CREATED)


class IteracionDetalleView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        iteracion = IteracionAprobacion.objects.get(id=id)
        return ok("Iteracion consultada.", IteracionAprobacionSerializer(iteracion).data)


class RevisionIteracionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, id):
        docente = Docente.objects.get(usuario=request.user)
        revision = registrar_revision(id, request.data, docente)
        return ok("Revision registrada.", RevisionJuradoRevisorSerializer(revision).data, status.HTTP_201_CREATED)


class CalificacionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        calificaciones = CalificacionJurado.objects.filter(fase_evaluacion_id=id)
        return ok("Calificaciones consultadas.", CalificacionJuradoSerializer(calificaciones, many=True).data)

    def post(self, request, id):
        serializer = CalificacionJuradoSerializer(data=request.data)
        if not serializer.is_valid():
            return error("Datos invalidos para calificacion.")
        docente = Docente.objects.get(usuario=request.user)
        calificacion = registrar_calificacion(id, serializer.validated_data, docente)
        return ok("Calificacion registrada.", CalificacionJuradoSerializer(calificacion).data, status.HTTP_201_CREATED)


class RevistaIndexadaView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, id):
        serializer = RevistaIndexadaSerializer(data={**request.data, "proyecto": id})
        if not serializer.is_valid():
            return error("Datos invalidos para revista indexada.")
        serializer.save()
        return ok("Revista registrada.", serializer.data, status.HTTP_201_CREATED)
