from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Notificacion
from .serializers import NotificacionSerializer
from .services import marcar_como_leida, marcar_todas_leidas, obtener_no_leidas


def ok(mensaje, datos=None, status_code=status.HTTP_200_OK):
    return Response({"mensaje": mensaje, "datos": datos}, status=status_code)


def error(mensaje, status_code=status.HTTP_400_BAD_REQUEST):
    return Response({"error": mensaje}, status=status_code)


class NotificacionesListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = NotificacionSerializer(Notificacion.objects.filter(usuario_destino=request.user), many=True).data
        return ok("Notificaciones consultadas.", data)


class LeerNotificacionView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, id):
        notificacion = marcar_como_leida(id, request.user)
        return ok("Notificacion marcada como leida.", NotificacionSerializer(notificacion).data)


class LeerTodasView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        cantidad = marcar_todas_leidas(request.user)
        return ok("Notificaciones actualizadas.", {"cantidad": cantidad})


class NoLeidasCountView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cantidad = obtener_no_leidas(request.user).count()
        return ok("Conteo consultado.", {"total_no_leidas": cantidad})
