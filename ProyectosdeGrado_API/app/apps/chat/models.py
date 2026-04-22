from django.db import models


class Conversacion(models.Model):
    """Conversacion privada entre estudiante y docente por proyecto."""

    proyecto = models.ForeignKey("proyectos.Proyecto", models.DO_NOTHING)
    estudiante = models.ForeignKey("usuarios.Estudiante", models.DO_NOTHING)
    docente = models.ForeignKey("usuarios.Docente", models.DO_NOTHING)
    fecha_creacion = models.DateTimeField(blank=True, null=True)
    activa = models.BooleanField(blank=True, null=True)

    class Meta:
        managed = True
        db_table = "conversacion"
        unique_together = (("proyecto", "estudiante", "docente"),)

    def __str__(self):
        return f"Conversacion {self.id}"


class Mensaje(models.Model):
    """Mensaje asociado a una conversacion."""

    conversacion = models.ForeignKey("chat.Conversacion", models.DO_NOTHING)
    remitente = models.ForeignKey("usuarios.Usuario", models.DO_NOTHING)
    contenido = models.TextField()
    fecha_envio = models.DateTimeField(blank=True, null=True)
    leido = models.BooleanField(blank=True, null=True)
    fecha_lectura = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = True
        db_table = "mensaje"

    def __str__(self):
        return f"Mensaje {self.id}"
