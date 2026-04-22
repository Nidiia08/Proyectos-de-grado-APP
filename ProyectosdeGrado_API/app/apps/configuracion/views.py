from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.usuarios.permissions import tiene_rol

from .models import ConfiguracionSistema
from .serializers import ConfiguracionSistemaSerializer
from .services import actualizar_configuracion


def ok(mensaje, datos=None, status_code=status.HTTP_200_OK):
    return Response({"mensaje": mensaje, "datos": datos}, status=status_code)


def error(mensaje, status_code=status.HTTP_400_BAD_REQUEST):
    return Response({"error": mensaje}, status=status_code)


class ConfiguracionListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not tiene_rol(request.user, "COMITE"):
            return error("Solo el comite puede consultar configuracion.", status.HTTP_403_FORBIDDEN)
        data = ConfiguracionSistemaSerializer(ConfiguracionSistema.objects.all(), many=True).data
        return ok("Configuracion consultada.", data)


class ConfiguracionUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, clave):
        if not tiene_rol(request.user, "COMITE"):
            return error("Solo el comite puede actualizar configuracion.", status.HTTP_403_FORBIDDEN)
        valor = request.data.get("valor")
        if valor is None:
            return error("Debe enviar el campo valor.")
        config = actualizar_configuracion(clave, valor, request.user)
        return ok("Configuracion actualizada.", ConfiguracionSistemaSerializer(config).data)
