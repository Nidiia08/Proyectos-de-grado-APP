# Proyectos de Grado Monorepo

Sistema de seguimiento de trabajos de grado de la Universidad de Narino.

## Resumen

Este repositorio se usa principalmente con Docker. Esa es la forma recomendada para ejecutar el proyecto, porque el backend, el frontend y la base de datos quedan conectados con las rutas y variables correctas desde `docker-compose.yml`.

El monorepo contiene dos aplicaciones:

- `ProyectosdeGrado_API/`: backend en Django REST Framework.
- `ProyectosdeGrado_WEB/`: frontend en Angular.

## Estructura

- `ProyectosdeGrado_API/`
  - backend Django, serializers, servicios, comandos y scripts SQL.
- `ProyectosdeGrado_WEB/`
  - frontend Angular con Angular Material y Signals.
- Raiz del monorepo
  - `docker-compose.yml`
  - `.env`
  - `.gitignore`
  - `.dockerignore`

## Requisitos

- Docker y Docker Compose.
- Node.js y npm, solo si vas a trabajar el frontend fuera de Docker.
- Python 3.11+, solo si vas a trabajar el backend fuera de Docker.

## Arranque con Docker

Este es el flujo principal y recomendado.


### 1. Levantar todo el entorno

Desde la raiz del monorepo:

```bash
docker-compose up --build
```

Si lo quieres en segundo plano:

```bash
docker-compose up -d --build
```

### 2. Verificar que quedo arriba

```bash
docker-compose ps
docker-compose logs -f api
docker-compose logs -f web
```

## Rehacer archivos ignorados por Git

Si borraste o quieres regenerar lo que esta en `.gitignore`, usa estos comandos.

### Entornos virtuales

```bash
python -m venv .venv
python -m venv ProyectosdeGrado_API/.venv
```

### Variables de entorno

```bash
type nul > .env
type nul > ProyectosdeGrado_API/.env
```

### Dependencias del frontend

```bash
cd ProyectosdeGrado_WEB
npm install
```

### Build del frontend

```bash
cd ProyectosdeGrado_WEB
npm run build
```

### Cache de Angular

La carpeta `.angular/` se crea automaticamente al ejecutar Angular en desarrollo o al compilar.

### Cache de Django

Los directorios `__pycache__/` y los archivos `*.pyc` se crean automaticamente al ejecutar Python o Django.

### Volumen de PostgreSQL

El volumen `postgres_data/` se crea al levantar Docker. Si necesitas rehacerlo desde cero, elimina el volumen correspondiente y vuelve a ejecutar:

```bash
docker-compose up -d --build
```

## Desarrollo fuera de Docker

Este modo no es el recomendado para el uso normal del proyecto, pero puede servir para pruebas locales.

### Frontend local

```bash
cd ProyectosdeGrado_WEB
npm install
npm start
```

### Backend local

```bash
cd ProyectosdeGrado_API
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
```
## Ultimo paso obligatorio

Ejecuta estos comandos solo al final, cuando todo este armado y los contenedores ya esten arriba para crear el comité que será usuario administrador y migrar el token blacklist:

```bash
docker-compose exec api python manage.py crear_comite
docker-compose exec api python manage.py migrate token_blacklist
```
## Base de datos

El proyecto usa PostgreSQL.

Cuando trabajes con una base nueva o un volumen limpio, asegurate de que el esquema se cargue correctamente antes de probar los endpoints.

## Comandos utiles

```bash
docker-compose exec api python manage.py migrate
docker-compose logs -f api
docker-compose logs -f db
docker-compose down
```

## Notas

- Si cambias el esquema de la base de datos, revisa tambien los scripts SQL y las migraciones del backend.
- Para evitar problemas de rutas, usa Docker como forma principal de ejecucion.