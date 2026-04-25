from rest_framework import serializers

from apps.usuarios.models import Docente, Estudiante
from apps.usuarios.serializers import DocenteSerializer, EstudianteSerializer

from .models import PeriodoAcademico, Proyecto, ProyectoEstudiante


class PeriodoAcademicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PeriodoAcademico
        fields = "__all__"


class ProyectoEstudianteSerializer(serializers.ModelSerializer):
    estudiante_detalle = EstudianteSerializer(source="estudiante", read_only=True)

    class Meta:
        model = ProyectoEstudiante
        fields = ("id", "proyecto", "estudiante", "estudiante_detalle", "es_autor_principal")


class ProyectoSerializer(serializers.ModelSerializer):
    periodo = PeriodoAcademicoSerializer(source="periodo_academico", read_only=True)
    asesor_detalle = DocenteSerializer(source="asesor", read_only=True)
    coasesor_detalle = DocenteSerializer(source="coasesor", read_only=True)
    estudiantes = serializers.SerializerMethodField()

    class Meta:
        model = Proyecto
        fields = "__all__"

    def get_estudiantes(self, obj):
        rel = ProyectoEstudiante.objects.filter(proyecto=obj).select_related("estudiante__usuario")
        return ProyectoEstudianteSerializer(rel, many=True).data


class ProyectoCreateSerializer(serializers.ModelSerializer):
    periodo_academico_id = serializers.PrimaryKeyRelatedField(
        queryset=PeriodoAcademico.objects.all(),
        source="periodo_academico",
        write_only=True,
    )
    asesor_id = serializers.IntegerField(write_only=True)
    coasesor_id = serializers.IntegerField(required=False, allow_null=True, write_only=True)
    estudiantes = serializers.ListField(
        child=serializers.DictField(),
        required=False,
        write_only=True,
    )

    class Meta:
        model = Proyecto
        fields = (
            "nombre",
            "modalidad",
            "subtipo",
            "fecha_inicio",
            "fecha_fin_estimada",
            "fecha_fin_real",
            "es_interdisciplinario",
            "es_grupo",
            "periodo_academico_id",
            "asesor_id",
            "coasesor_id",
            "estudiantes",
        )

    def validate_asesor_id(self, value):
        docente = Docente.objects.filter(id=value).first() or Docente.objects.filter(usuario_id=value).first()
        if not docente:
            raise serializers.ValidationError("El asesor seleccionado no existe.")
        return docente

    def validate_coasesor_id(self, value):
        if value in (None, ""):
            return None
        docente = Docente.objects.filter(id=value).first() or Docente.objects.filter(usuario_id=value).first()
        if not docente:
            raise serializers.ValidationError("El coasesor seleccionado no existe.")
        return docente

    def validate(self, attrs):
        modalidad = attrs.get("modalidad")
        subtipo = attrs.get("subtipo")
        if modalidad == Proyecto.Modalidad.INTERACCION_SOCIAL and not subtipo:
            raise serializers.ValidationError("El subtipo es obligatorio para interaccion social.")

        asesor = attrs.pop("asesor_id", None)
        attrs["asesor"] = asesor

        coasesor = attrs.pop("coasesor_id", None)
        if coasesor and asesor and coasesor.id == asesor.id:
            raise serializers.ValidationError("El coasesor no puede ser el mismo asesor.")
        attrs["coasesor"] = coasesor

        estudiantes_entrada = attrs.get("estudiantes") or []
        estudiantes_normalizados = []
        for item in estudiantes_entrada:
            estudiante_id = item.get("estudiante_id")
            es_autor_principal = bool(item.get("es_autor_principal", False))

            if estudiante_id is None:
                raise serializers.ValidationError("Cada estudiante debe incluir estudiante_id.")

            estudiante = Estudiante.objects.filter(id=estudiante_id).first() or Estudiante.objects.filter(
                usuario_id=estudiante_id
            ).first()
            if not estudiante:
                raise serializers.ValidationError(
                    f"El estudiante con id {estudiante_id} no existe."
                )

            estudiantes_normalizados.append(
                {
                    "estudiante_id": estudiante.id,
                    "es_autor_principal": es_autor_principal,
                }
            )

        if not attrs.get("es_grupo") and len(estudiantes_normalizados) > 1:
            raise serializers.ValidationError("Un proyecto individual solo puede tener un estudiante.")

        autores_principales = sum(1 for e in estudiantes_normalizados if e["es_autor_principal"])
        if autores_principales > 1:
            raise serializers.ValidationError("Solo puede haber un autor principal por proyecto.")
        if estudiantes_normalizados and autores_principales == 0:
            estudiantes_normalizados[0]["es_autor_principal"] = True

        attrs["estudiantes"] = estudiantes_normalizados
        return attrs

    def create(self, validated_data):
        validated_data.pop("estudiantes", None)
        return Proyecto.objects.create(**validated_data)

    def update(self, instance, validated_data):
        validated_data.pop("estudiantes", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
