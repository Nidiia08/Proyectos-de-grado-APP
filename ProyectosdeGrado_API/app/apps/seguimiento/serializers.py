from rest_framework import serializers

from .models import Acuerdo, HistorialAccion, InformeTrimestral, Prorroga


class InformeTrimestralSerializer(serializers.ModelSerializer):
    class Meta:
        model = InformeTrimestral
        fields = "__all__"


class ProrrogaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prorroga
        fields = "__all__"


class AcuerdoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Acuerdo
        fields = "__all__"


class HistorialAccionSerializer(serializers.ModelSerializer):
    class Meta:
        model = HistorialAccion
        fields = "__all__"
