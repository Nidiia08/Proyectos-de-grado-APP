from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import FaseAprobacion, FaseCulminacion, FaseDesarrollo, FaseEvaluacion, FaseInscripcion
from .serializers import (
    FaseAprobacionSerializer,
    FaseCulminacionSerializer,
    FaseDesarrolloSerializer,
    FaseEvaluacionSerializer,
    FaseInscripcionSerializer,
)
from .services import aprobar_culminacion, aprobar_inscripcion, programar_sustentacion, registrar_prorroga, rechazar_inscripcion


def ok(mensaje, datos=None, status_code=status.HTTP_200_OK):
    return Response({"mensaje": mensaje, "datos": datos}, status=status_code)


def error(mensaje, status_code=status.HTTP_400_BAD_REQUEST):
    return Response({"error": mensaje}, status=status_code)


class InscripcionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        fase = FaseInscripcion.objects.get(proyecto_id=id)
        return ok("Fase de inscripcion consultada.", FaseInscripcionSerializer(fase).data)


class AprobarInscripcionView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, id):
        fase = aprobar_inscripcion(id, request.user)
        return ok("Inscripcion aprobada.", FaseInscripcionSerializer(fase).data)


class RechazarInscripcionView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, id):
        fase = rechazar_inscripcion(id, request.data.get("observaciones", ""), request.user)
        return ok("Inscripcion rechazada.", FaseInscripcionSerializer(fase).data)


class AprobacionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        fase = FaseAprobacion.objects.get(proyecto_id=id)
        return ok("Fase de aprobacion consultada.", FaseAprobacionSerializer(fase).data)


class DesarrolloView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        fase = FaseDesarrollo.objects.get(proyecto_id=id)
        return ok("Fase de desarrollo consultada.", FaseDesarrolloSerializer(fase).data)


class ProrrogaView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, id):
        fase = FaseDesarrollo.objects.get(proyecto_id=id)
        prorroga = registrar_prorroga(fase.id, request.data, request.user)
        return ok("Prorroga registrada.", {"id": prorroga.id}, status.HTTP_201_CREATED)


class CulminacionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        fase = FaseCulminacion.objects.get(proyecto_id=id)
        return ok("Fase de culminacion consultada.", FaseCulminacionSerializer(fase).data)


class AprobarCulminacionView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, id):
        fase = aprobar_culminacion(id, request.user)
        return ok("Culminacion aprobada.", FaseCulminacionSerializer(fase).data)


class EvaluacionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        fase = FaseEvaluacion.objects.get(proyecto_id=id)
        return ok("Fase de evaluacion consultada.", FaseEvaluacionSerializer(fase).data)


class SustentacionView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, id):
        fase = FaseEvaluacion.objects.get(proyecto_id=id)
        fase = programar_sustentacion(fase.id, request.data, request.user)
        return ok("Sustentacion programada.", FaseEvaluacionSerializer(fase).data)
