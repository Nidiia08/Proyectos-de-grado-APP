from django.db import models


class ConfiguracionSistema(models.Model):
    """Parametros globales de funcionamiento del sistema."""

    clave = models.CharField(unique=True, max_length=100)
    valor = models.CharField(max_length=255)
    descripcion = models.TextField(blank=True, null=True)
    ultima_actualizacion = models.DateTimeField(blank=True, null=True)
    actualizado_por = models.ForeignKey("usuarios.Usuario", models.DO_NOTHING, db_column="actualizado_por")

    class Meta:
        managed = True
        db_table = "configuracion_sistema"

    def __str__(self):
        return self.clave
