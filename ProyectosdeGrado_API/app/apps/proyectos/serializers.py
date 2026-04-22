from rest_framework import serializers

from apps.usuarios.serializers import DocenteSerializer, EstudianteSerializer

from .models import GrupoInvestigacion, PeriodoAcademico, Proyecto, ProyectoEstudiante


class PeriodoAcademicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PeriodoAcademico
        fields = "__all__"


class GrupoInvestigacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = GrupoInvestigacion
        fields = "__all__"


class ProyectoEstudianteSerializer(serializers.ModelSerializer):
    estudiante_detalle = EstudianteSerializer(source="estudiante", read_only=True)

    class Meta:
        model = ProyectoEstudiante
        fields = ("id", "proyecto", "estudiante", "estudiante_detalle", "es_autor_principal")


class ProyectoSerializer(serializers.ModelSerializer):
    periodo = PeriodoAcademicoSerializer(source="periodo_academico", read_only=True)
    asesor_detalle = DocenteSerializer(source="asesor", read_only=True)
    estudiantes = serializers.SerializerMethodField()

    class Meta:
        model = Proyecto
        fields = "__all__"

    def get_estudiantes(self, obj):
        rel = ProyectoEstudiante.objects.filter(proyecto=obj).select_related("estudiante__usuario")
        return ProyectoEstudianteSerializer(rel, many=True).data


class ProyectoCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proyecto
        fields = "__all__"

    def validate(self, attrs):
        modalidad = attrs.get("modalidad")
        subtipo = attrs.get("subtipo")
        if modalidad == Proyecto.Modalidad.INTERACCION_SOCIAL and not subtipo:
            raise serializers.ValidationError("El subtipo es obligatorio para interaccion social.")
        return attrs
