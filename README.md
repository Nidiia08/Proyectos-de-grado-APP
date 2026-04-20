# Proyectos de Grado API

Backend del sistema de seguimiento de trabajos de grado con Django + PostgreSQL + Docker.

## Requisitos

- Docker Desktop
- Docker Compose

## 1) Configurar variables de entorno

Verifica que exista el archivo `.env` en la raíz del proyecto con los datos de base de datos.

## 2) Levantar contenedores

```bash
docker compose up -d --build
```

## 3) Ejecutar migraciones

```bash
docker compose exec api python manage.py migrate
```

## 4) Comandos importantes (ejecutar una vez por base de datos)

Crear usuario inicial del comité curricular:

```bash
docker compose exec api python manage.py crear_comite
```

Crear tablas de blacklist para JWT (logout/refresh):

```bash
docker compose exec api python manage.py migrate token_blacklist
```

## 5) Ver logs (opcional)

```bash
docker compose logs -f api
docker compose logs -f db
```

## 6) Detener contenedores

```bash
docker compose down
```

## 7) Eliminar contenedores, redes y volúmenes

```bash
docker compose down -v
```

## 8) Vaciar base de datos (opcional)

```bash
docker compose exec db psql -U proyectos_user -d proyectos_grado -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
```

## Nota

Si borras volúmenes (`docker compose down -v`) o cambias a una base de datos nueva/vacía, debes volver a ejecutar migraciones y el comando `crear_comite`.
