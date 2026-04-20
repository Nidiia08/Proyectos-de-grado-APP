from django.db import models


class InformeTrimestral(models.Model):
    """Informe periodico de avance durante el desarrollo."""

    fase_desarrollo = models.ForeignKey("fases.FaseDesarrollo", models.DO_NOTHING)
    numero_informe = models.IntegerField()
    fecha_limite = models.DateField(blank=True, null=True)
    estado = models.CharField(max_length=30)
    archivo_url = models.CharField(max_length=500, blank=True, null=True)
    comentario_estudiante = models.TextField(blank=True, null=True)
    observaciones_comite = models.TextField(blank=True, null=True)
    observaciones_asesor = models.TextField(blank=True, null=True)
    fecha_envio = models.DateTimeField(blank=True, null=True)
    fecha_aprobacion = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = True
        db_table = "informe_trimestral"
        unique_together = (("fase_desarrollo", "numero_informe"),)

    def __str__(self):
        return f"Informe {self.numero_informe}"


class Prorroga(models.Model):
    """Registra prorrogas de fecha fin estimada de desarrollo."""

    fase_desarrollo = models.ForeignKey("fases.FaseDesarrollo", models.DO_NOTHING)
    fecha_anterior = models.DateField()
    fecha_nueva = models.DateField()
    motivo = models.TextField()
    fecha_registro = models.DateTimeField(blank=True, null=True)
    registrado_por = models.ForeignKey("usuarios.Usuario", models.DO_NOTHING, db_column="registrado_por")

    class Meta:
        managed = True
        db_table = "prorroga"

    def __str__(self):
        return f"Prorroga hasta {self.fecha_nueva}"


class Acuerdo(models.Model):
    """Acuerdos del comite relacionados con un proyecto."""

    proyecto = models.ForeignKey("proyectos.Proyecto", models.DO_NOTHING)
    numero_acuerdo = models.CharField(unique=True, max_length=50)
    tipo = models.CharField(max_length=100)
    fecha = models.DateField()
    descripcion = models.TextField(blank=True, null=True)
    generado_por = models.ForeignKey("usuarios.Usuario", models.DO_NOTHING, db_column="generado_por")

    class Meta:
        managed = True
        db_table = "acuerdo"

    def __str__(self):
        return self.numero_acuerdo


class HistorialAccion(models.Model):
    """Bitacora de acciones importantes del sistema."""

    proyecto = models.ForeignKey("proyectos.Proyecto", models.DO_NOTHING)
    usuario = models.ForeignKey("usuarios.Usuario", models.DO_NOTHING)
    accion = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True, null=True)
    fase = models.CharField(max_length=30, blank=True, null=True)
    fecha = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = True
        db_table = "historial_accion"

    def __str__(self):
        return f"{self.accion} - {self.fecha}"
