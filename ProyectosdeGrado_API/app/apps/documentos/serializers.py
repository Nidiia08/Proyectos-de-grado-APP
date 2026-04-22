from rest_framework import serializers

from .models import DocumentoCulminacion, DocumentoInscripcion, Plantilla


class DocumentoInscripcionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentoInscripcion
        fields = "__all__"


class DocumentoCulminacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentoCulminacion
        fields = "__all__"


class PlantillaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plantilla
        fields = "__all__"
