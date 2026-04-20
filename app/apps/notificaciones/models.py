from django.db import models


class Notificacion(models.Model):
    """Notificaciones dirigidas a los usuarios del sistema."""

    usuario_destino = models.ForeignKey("usuarios.Usuario", models.DO_NOTHING)
    proyecto = models.ForeignKey("proyectos.Proyecto", models.DO_NOTHING, blank=True, null=True)
    tipo = models.CharField(max_length=100)
    mensaje = models.TextField()
    leida = models.BooleanField(blank=True, null=True)
    fecha = models.DateTimeField(blank=True, null=True)
    url_accion = models.CharField(max_length=500, blank=True, null=True)

    class Meta:
        managed = True
        db_table = "notificacion"

    def __str__(self):
        return f"Notificacion {self.tipo}"
