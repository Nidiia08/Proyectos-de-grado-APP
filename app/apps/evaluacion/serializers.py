from rest_framework import serializers

from .models import (
    AsignacionJurado,
    CalificacionJurado,
    IteracionAprobacion,
    RevisionJuradoRevisor,
    RevistaIndexada,
)


class AsignacionJuradoSerializer(serializers.ModelSerializer):
    class Meta:
        model = AsignacionJurado
        fields = "__all__"


class IteracionAprobacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = IteracionAprobacion
        fields = "__all__"


class RevisionJuradoRevisorSerializer(serializers.ModelSerializer):
    class Meta:
        model = RevisionJuradoRevisor
        fields = "__all__"


class CalificacionJuradoSerializer(serializers.ModelSerializer):
    total_documento = serializers.IntegerField(read_only=True)
    total_sustentacion = serializers.IntegerField(read_only=True)
    total_final = serializers.IntegerField(read_only=True)

    class Meta:
        model = CalificacionJurado
        fields = "__all__"

    def validate(self, attrs):
        for campo in [
            "cumplimiento_objetivos",
            "originalidad_creatividad",
            "validez_conclusiones",
            "organizacion_presentacion",
            "sustentacion_privada",
            "socializacion_publica",
        ]:
            if not 0 <= attrs[campo] <= 20:
                raise serializers.ValidationError(f"El campo {campo} debe estar entre 0 y 20.")
        total_documento = (
            attrs["cumplimiento_objetivos"]
            + attrs["originalidad_creatividad"]
            + attrs["validez_conclusiones"]
            + attrs["organizacion_presentacion"]
        )
        total_sustentacion = attrs["sustentacion_privada"] + attrs["socializacion_publica"]
        if total_documento < 36:
            raise serializers.ValidationError("El total de documento debe ser minimo 36.")
        if total_sustentacion < 24:
            raise serializers.ValidationError("El total de sustentacion debe ser minimo 24.")
        return attrs


class RevistaIndexadaSerializer(serializers.ModelSerializer):
    calificacion_equivalente = serializers.IntegerField(read_only=True)

    class Meta:
        model = RevistaIndexada
        fields = "__all__"
