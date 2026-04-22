# Proyectos de Grado Monorepo

Monorepo del sistema de seguimiento de trabajos de grado de la Universidad de Narino.

## Estructura

- `ProyectosdeGrado_API/`: backend Django, Dockerfile y recursos de base de datos.
- `ProyectosdeGrado_WEB/`: frontend Angular.
- Raiz: orquestacion compartida con `docker-compose.yml`, `.env`, `.gitignore` y `.dockerignore`.

## Levantar todo el entorno

```bash
docker-compose up --build
```

## Comandos utiles

```bash
docker-compose exec api python manage.py crear_comite
docker-compose exec api python manage.py migrate token_blacklist
docker-compose exec api python manage.py migrate
docker-compose logs -f api
docker-compose down
```

## Variables de entorno

- `.env` en la raiz: variables compartidas entre servicios.
- `ProyectosdeGrado_API/.env`: variables exclusivas del backend Django.
