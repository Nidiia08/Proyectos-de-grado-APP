from rest_framework import serializers

from .models import FaseAprobacion, FaseCulminacion, FaseDesarrollo, FaseEvaluacion, FaseInscripcion


class FaseInscripcionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FaseInscripcion
        fields = "__all__"


class FaseAprobacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FaseAprobacion
        fields = "__all__"


class FaseDesarrolloSerializer(serializers.ModelSerializer):
    class Meta:
        model = FaseDesarrollo
        fields = "__all__"


class FaseCulminacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FaseCulminacion
        fields = "__all__"


class FaseEvaluacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FaseEvaluacion
        fields = "__all__"
