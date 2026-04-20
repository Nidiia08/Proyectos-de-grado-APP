from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.usuarios.permissions import tiene_rol

from .models import Acuerdo, HistorialAccion, InformeTrimestral
from .serializers import AcuerdoSerializer, HistorialAccionSerializer, InformeTrimestralSerializer
from .services import actualizar_informe, crear_acuerdo, crear_informe


def ok(mensaje, datos=None, status_code=status.HTTP_200_OK):
    return Response({"mensaje": mensaje, "datos": datos}, status=status_code)


def error(mensaje, status_code=status.HTTP_400_BAD_REQUEST):
    return Response({"error": mensaje}, status=status_code)


class InformeListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        informes = InformeTrimestral.objects.filter(fase_desarrollo__proyecto_id=id)
        return ok("Informes consultados.", InformeTrimestralSerializer(informes, many=True).data)

    def post(self, request, id):
        serializer = InformeTrimestralSerializer(data=request.data)
        if not serializer.is_valid():
            return error("Datos invalidos para informe.")
        informe = crear_informe(serializer.validated_data)
        return ok("Informe creado.", InformeTrimestralSerializer(informe).data, status.HTTP_201_CREATED)


class InformeUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, id):
        informe = actualizar_informe(id, request.data)
        return ok("Informe actualizado.", InformeTrimestralSerializer(informe).data)


class AcuerdoListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        acuerdos = Acuerdo.objects.filter(proyecto_id=id)
        return ok("Acuerdos consultados.", AcuerdoSerializer(acuerdos, many=True).data)

    def post(self, request, id):
        if not tiene_rol(request.user, "COMITE"):
            return error("Solo el comite puede crear acuerdos.", status.HTTP_403_FORBIDDEN)
        serializer = AcuerdoSerializer(data=request.data)
        if not serializer.is_valid():
            return error("Datos invalidos para acuerdo.")
        acuerdo = crear_acuerdo(serializer.validated_data)
        return ok("Acuerdo creado.", AcuerdoSerializer(acuerdo).data, status.HTTP_201_CREATED)


class HistorialProyectoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        historial = HistorialAccion.objects.filter(proyecto_id=id).order_by("-fecha")
        return ok("Historial consultado.", HistorialAccionSerializer(historial, many=True).data)
