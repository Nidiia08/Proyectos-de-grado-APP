from django.db import models


class PeriodoAcademico(models.Model):
    """Define periodos academicos habilitados en el sistema."""

    nombre = models.CharField(max_length=50)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    activo = models.BooleanField(blank=True, null=True)

    class Meta:
        managed = True
        db_table = "periodo_academico"

    def __str__(self):
        return self.nombre


class GrupoInvestigacion(models.Model):
    """Representa un grupo de investigacion institucional."""

    nombre = models.CharField(max_length=200)
    codigo = models.CharField(unique=True, max_length=50)
    director = models.CharField(max_length=200)

    class Meta:
        managed = True
        db_table = "grupo_investigacion"

    def __str__(self):
        return f"{self.codigo} - {self.nombre}"


class Proyecto(models.Model):
    """Modelo principal para la gestion de trabajos de grado."""

    class Modalidad(models.TextChoices):
        INVESTIGACION = "INVESTIGACION", "Investigacion"
        INTERACCION_SOCIAL = "INTERACCION_SOCIAL", "Interaccion social"

    class Subtipo(models.TextChoices):
        PASANTIA = "PASANTIA", "Pasantia"
        DESARROLLO_SOFTWARE = "DESARROLLO_SOFTWARE", "Desarrollo de software"
        INTERVENCION = "INTERVENCION", "Intervencion"

    class Estado(models.TextChoices):
        ACTIVO = "ACTIVO", "Activo"
        FINALIZADO = "FINALIZADO", "Finalizado"
        CANCELADO = "CANCELADO", "Cancelado"
        REPROBADO = "REPROBADO", "Reprobado"

    class FaseActual(models.TextChoices):
        INSCRIPCION = "INSCRIPCION", "Inscripcion"
        APROBACION = "APROBACION", "Aprobacion"
        DESARROLLO = "DESARROLLO", "Desarrollo"
        CULMINACION = "CULMINACION", "Culminacion"
        EVALUACION = "EVALUACION", "Evaluacion"

    nombre = models.CharField(max_length=300)
    modalidad = models.CharField(max_length=30, choices=Modalidad.choices)
    subtipo = models.CharField(max_length=50, blank=True, null=True, choices=Subtipo.choices)
    estado = models.CharField(max_length=30, choices=Estado.choices)
    fase_actual = models.CharField(max_length=30, choices=FaseActual.choices)
    fecha_inicio = models.DateField(blank=True, null=True)
    fecha_fin_estimada = models.DateField(blank=True, null=True)
    fecha_fin_real = models.DateField(blank=True, null=True)
    periodo_academico = models.ForeignKey("proyectos.PeriodoAcademico", models.DO_NOTHING)
    asesor = models.ForeignKey("usuarios.Docente", models.DO_NOTHING)
    grupo_investigacion = models.ForeignKey(
        "proyectos.GrupoInvestigacion",
        models.DO_NOTHING,
        blank=True,
        null=True,
    )
    es_interdisciplinario = models.BooleanField(blank=True, null=True)
    es_grupo = models.BooleanField(blank=True, null=True)

    class Meta:
        managed = True
        db_table = "proyecto"

    def __str__(self):
        return self.nombre


class ProyectoEstudiante(models.Model):
    """Asocia estudiantes a un proyecto de grado."""

    proyecto = models.ForeignKey("proyectos.Proyecto", models.DO_NOTHING)
    estudiante = models.ForeignKey("usuarios.Estudiante", models.DO_NOTHING)
    es_autor_principal = models.BooleanField(blank=True, null=True)

    class Meta:
        managed = True
        db_table = "proyecto_estudiante"
        unique_together = (("proyecto", "estudiante"),)

    def __str__(self):
        return f"{self.proyecto} - {self.estudiante}"
