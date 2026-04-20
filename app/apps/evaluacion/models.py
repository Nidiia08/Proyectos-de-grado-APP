from django.db import models


class AsignacionJurado(models.Model):
    """Asigna jurados a proyectos en evaluacion."""

    proyecto = models.ForeignKey("proyectos.Proyecto", models.DO_NOTHING)
    jurado = models.ForeignKey("usuarios.Docente", models.DO_NOTHING)
    tipo_jurado = models.CharField(max_length=20)
    fecha_asignacion = models.DateField(blank=True, null=True)
    activo = models.BooleanField(blank=True, null=True)

    class Meta:
        managed = True
        db_table = "asignacion_jurado"
        unique_together = (("proyecto", "jurado", "tipo_jurado"),)

    def __str__(self):
        return f"{self.jurado} en {self.proyecto}"


class IteracionAprobacion(models.Model):
    """Iteraciones de revision durante fase de aprobacion."""

    fase_aprobacion = models.ForeignKey("fases.FaseAprobacion", models.DO_NOTHING)
    numero_iteracion = models.IntegerField()
    estado = models.CharField(max_length=30)
    fecha_inicio = models.DateField(blank=True, null=True)
    dias_habiles_jurado = models.IntegerField(blank=True, null=True)
    dias_habiles_estudiante = models.IntegerField(blank=True, null=True)
    fecha_limite_jurado = models.DateField(blank=True, null=True)
    fecha_limite_estudiante = models.DateField(blank=True, null=True)
    archivo_propuesta_url = models.CharField(max_length=500, blank=True, null=True)
    comentario_estudiante = models.TextField(blank=True, null=True)
    fecha_envio_estudiante = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = True
        db_table = "iteracion_aprobacion"
        unique_together = (("fase_aprobacion", "numero_iteracion"),)

    def __str__(self):
        return f"Iteracion {self.numero_iteracion}"


class RevisionJuradoRevisor(models.Model):
    """Registra la decision de jurados en cada iteracion."""

    iteracion_aprobacion = models.ForeignKey("evaluacion.IteracionAprobacion", models.DO_NOTHING)
    jurado = models.ForeignKey("usuarios.Docente", models.DO_NOTHING)
    decision = models.CharField(max_length=30)
    observaciones = models.TextField(blank=True, null=True)
    fecha_respuesta = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = True
        db_table = "revision_jurado_revisor"

    def __str__(self):
        return f"Revision de {self.jurado}"


class CalificacionJurado(models.Model):
    """Calificacion de jurado con totales calculados por PostgreSQL."""

    fase_evaluacion = models.ForeignKey("fases.FaseEvaluacion", models.DO_NOTHING)
    jurado = models.ForeignKey("usuarios.Docente", models.DO_NOTHING)
    cumplimiento_objetivos = models.IntegerField()
    originalidad_creatividad = models.IntegerField()
    validez_conclusiones = models.IntegerField()
    organizacion_presentacion = models.IntegerField()
    sustentacion_privada = models.IntegerField()
    socializacion_publica = models.IntegerField()
    total_documento = models.IntegerField(blank=True, null=True, editable=False)
    total_sustentacion = models.IntegerField(blank=True, null=True, editable=False)
    total_final = models.IntegerField(blank=True, null=True, editable=False)
    observaciones_finales = models.TextField(blank=True, null=True)
    fecha_registro = models.DateTimeField(blank=True, null=True)
    enviada = models.BooleanField(blank=True, null=True)

    class Meta:
        managed = True
        db_table = "calificacion_jurado"
        unique_together = (("fase_evaluacion", "jurado"),)

    def __str__(self):
        return f"Calificacion de {self.jurado}"


class RevistaIndexada(models.Model):
    """Registro de publicacion en revista indexada."""

    class Clasificacion(models.TextChoices):
        A1 = "A1", "A1"
        A = "A", "A"
        B = "B", "B"
        C = "C", "C"

    proyecto = models.OneToOneField("proyectos.Proyecto", models.DO_NOTHING)
    nombre_revista = models.CharField(max_length=300)
    clasificacion = models.CharField(max_length=5, choices=Clasificacion.choices)
    calificacion_equivalente = models.IntegerField(blank=True, null=True, editable=False)
    isbn_issn = models.CharField(max_length=50, blank=True, null=True)
    fecha_registro = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = True
        db_table = "revista_indexada"

    def __str__(self):
        return self.nombre_revista
