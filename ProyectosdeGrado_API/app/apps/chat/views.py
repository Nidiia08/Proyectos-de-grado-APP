from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Conversacion
from .serializers import ConversacionSerializer, MensajeSerializer
from .services import (
    enviar_mensaje,
    marcar_mensajes_leidos,
    obtener_mensajes,
    obtener_o_crear_conversacion,
)


def ok(mensaje, datos=None, status_code=status.HTTP_200_OK):
    return Response({"mensaje": mensaje, "datos": datos}, status=status_code)


def error(mensaje, status_code=status.HTTP_400_BAD_REQUEST):
    return Response({"error": mensaje}, status=status_code)


class ConversacionListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        conversaciones = Conversacion.objects.filter(activa=True)
        return ok("Conversaciones consultadas.", ConversacionSerializer(conversaciones, many=True).data)

    def post(self, request):
        conversacion = obtener_o_crear_conversacion(
            request.data["proyecto_id"],
            request.data["estudiante_id"],
            request.data["docente_id"],
        )
        return ok("Conversacion disponible.", ConversacionSerializer(conversacion).data, status.HTTP_201_CREATED)


class MensajesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        mensajes = obtener_mensajes(id, request.user)
        return ok("Mensajes consultados.", MensajeSerializer(mensajes, many=True).data)

    def post(self, request, id):
        mensaje = enviar_mensaje(id, request.user, request.data.get("contenido"))
        return ok("Mensaje enviado.", MensajeSerializer(mensaje).data, status.HTTP_201_CREATED)


class LeerMensajesView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, id):
        total = marcar_mensajes_leidos(id, request.user)
        return ok("Mensajes marcados como leidos.", {"cantidad": total})
