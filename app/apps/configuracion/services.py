from django.db import transaction
from django.utils import timezone

from .models import ConfiguracionSistema


@transaction.atomic
def actualizar_configuracion(clave, valor, usuario):
    """Actualiza el valor de una clave de configuracion."""
    config, _ = ConfiguracionSistema.objects.get_or_create(clave=clave, defaults={"valor": valor, "actualizado_por": usuario})
    config.valor = valor
    config.actualizado_por = usuario
    config.ultima_actualizacion = timezone.now()
    config.save()
    return config
