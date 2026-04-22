from django.db import transaction
from rest_framework import serializers

from .models import Docente, Estudiante, Usuario, UsuarioRol
from .services import autenticar_usuario, registrar_docente, registrar_estudiante


class UsuarioSerializer(serializers.ModelSerializer):
    """Serializer base de datos de usuario."""

    roles = serializers.SerializerMethodField()

    class Meta:
        model = Usuario
        fields = ("id", "nombre", "apellido", "correo", "roles", "activo", "fecha_registro")

    def get_roles(self, obj):
        return list(obj.roles.values_list("rol", flat=True))


class EstudianteSerializer(serializers.ModelSerializer):
    """Serializer de estudiante con usuario anidado."""

    usuario = UsuarioSerializer(read_only=True)

    class Meta:
        model = Estudiante
        fields = "__all__"


class DocenteSerializer(serializers.ModelSerializer):
    """Serializer de docente con usuario anidado."""

    usuario = UsuarioSerializer(read_only=True)

    class Meta:
        model = Docente
        fields = "__all__"


class LoginSerializer(serializers.Serializer):
    """Valida credenciales para autenticacion."""

    correo = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    rol = serializers.ChoiceField(choices=UsuarioRol.Rol.choices)

    def validate(self, attrs):
        try:
            return autenticar_usuario(attrs["correo"], attrs["password"], attrs["rol"])
        except ValueError as exc:
            raise serializers.ValidationError(str(exc))


class RegistroEstudianteSerializer(serializers.Serializer):
    """Crea usuario y estudiante en una sola transaccion."""

    nombre = serializers.CharField(max_length=100)
    apellido = serializers.CharField(max_length=100)
    correo = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    codigo_estudiante = serializers.CharField(max_length=50)
    programa = serializers.CharField(max_length=150)
    promedio_acumulado = serializers.DecimalField(max_digits=3, decimal_places=2, required=False)
    creditos_aprobados = serializers.IntegerField(required=False)

    @transaction.atomic
    def create(self, validated_data):
        return registrar_estudiante(validated_data)


class RegistroDocenteSerializer(serializers.Serializer):
    """Crea usuario y docente en una sola transaccion."""

    nombre = serializers.CharField(max_length=100)
    apellido = serializers.CharField(max_length=100)
    correo = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    roles = serializers.ListField(
        child=serializers.ChoiceField(choices=[UsuarioRol.Rol.DOCENTE, UsuarioRol.Rol.JURADO]),
        required=False,
    )
    codigo_docente = serializers.CharField(max_length=50)
    area_conocimiento = serializers.CharField(max_length=150, required=False, allow_blank=True)
    max_proyectos_asesor = serializers.IntegerField(required=False)
    max_proyectos_jurado = serializers.IntegerField(required=False)

    @transaction.atomic
    def create(self, validated_data):
        return registrar_docente(validated_data)


class CambioPasswordSerializer(serializers.Serializer):
    """Valida el cambio de contrasena de un usuario."""

    password_actual = serializers.CharField(write_only=True)
    password_nuevo = serializers.CharField(write_only=True, min_length=8)
    confirmar_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs["password_nuevo"] != attrs["confirmar_password"]:
            raise serializers.ValidationError("La confirmacion de contrasena no coincide.")
        return attrs
