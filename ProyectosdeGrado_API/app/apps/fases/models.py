from django.db import models


class EstadoFase(models.TextChoices):
    """Estados usados para las fases del proceso."""

    PENDIENTE = "PENDIENTE", "Pendiente"
    EN_PROCESO = "EN_PROCESO", "En proceso"
    APROBADA = "APROBADA", "Aprobada"
    RECHAZADA = "RECHAZADA", "Rechazada"
    CERRADA = "CERRADA", "Cerrada"


class FaseInscripcion(models.Model):
    """Controla la etapa de inscripcion del proyecto."""

    proyecto = models.OneToOneField("proyectos.Proyecto", models.CASCADE)
    fecha_limite = models.DateField(blank=True, null=True)
    estado = models.CharField(max_length=30, choices=EstadoFase.choices)
    comentario_estudiante = models.TextField(blank=True, null=True)
    observaciones_comite = models.TextField(blank=True, null=True)
    fecha_envio = models.DateTimeField(blank=True, null=True)
    fecha_aprobacion = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = True
        db_table = "fase_inscripcion"

    def __str__(self):
        return f"Inscripcion de {self.proyecto}"


class FaseAprobacion(models.Model):
    """Controla la etapa de aprobacion por iteraciones."""

    proyecto = models.OneToOneField("proyectos.Proyecto", models.CASCADE)
    iteracion_actual = models.IntegerField(blank=True, null=True)
    max_iteraciones = models.IntegerField()
    estado = models.CharField(max_length=30, choices=EstadoFase.choices)

    class Meta:
        managed = True
        db_table = "fase_aprobacion"

    def __str__(self):
        return f"Aprobacion de {self.proyecto}"


class FaseDesarrollo(models.Model):
    """Controla la etapa de desarrollo y sus prorrogas."""

    proyecto = models.OneToOneField("proyectos.Proyecto", models.CASCADE)
    fecha_inicio = models.DateField(blank=True, null=True)
    fecha_fin_estimada = models.DateField(blank=True, null=True)
    estado = models.CharField(max_length=30, choices=EstadoFase.choices)
    tiene_prorroga = models.BooleanField(blank=True, null=True)

    class Meta:
        managed = True
        db_table = "fase_desarrollo"

    def __str__(self):
        return f"Desarrollo de {self.proyecto}"


class FaseCulminacion(models.Model):
    """Controla entrega de documentos finales del proyecto."""

    proyecto = models.OneToOneField("proyectos.Proyecto", models.CASCADE)
    fecha_limite = models.DateField(blank=True, null=True)
    estado = models.CharField(max_length=30, choices=EstadoFase.choices)
    enlace_nube = models.CharField(max_length=500, blank=True, null=True)
    comentario_estudiante = models.TextField(blank=True, null=True)
    fecha_envio = models.DateTimeField(blank=True, null=True)
    fecha_aprobacion = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = True
        db_table = "fase_culminacion"

    def __str__(self):
        return f"Culminacion de {self.proyecto}"


class FaseEvaluacion(models.Model):
    """Controla sustentacion y resultado final del proyecto."""

    proyecto = models.OneToOneField("proyectos.Proyecto", models.CASCADE)
    estado = models.CharField(max_length=30, choices=EstadoFase.choices)
    fecha_sustentacion_privada = models.DateTimeField(blank=True, null=True)
    fecha_socializacion_publica = models.DateTimeField(blank=True, null=True)
    socializacion_confirmada = models.BooleanField(blank=True, null=True)
    asistentes_socializacion = models.IntegerField(blank=True, null=True)
    nota_final = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    resultado = models.CharField(max_length=20, blank=True, null=True)
    fecha_acta = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = True
        db_table = "fase_evaluacion"

    def __str__(self):
        return f"Evaluacion de {self.proyecto}"
