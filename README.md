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

## Paso a paso para generar lo que esta en `.gitignore`

Sigue estos pasos para crear localmente los archivos y carpetas que el repo ignora.

### 1) Crear entornos virtuales (`.venv/`)

Desde la raiz del proyecto:

```bash
python -m venv .venv
```

Si tambien quieres entorno virtual dentro del backend:

```bash
python -m venv ProyectosdeGrado_API/.venv
```

### 2) Crear archivos de variables (`.env`)

Crea estos dos archivos:

- `.env`
- `ProyectosdeGrado_API/.env`

Puedes crearlos vacios y luego llenarlos con tus variables:

```bash
type nul > .env
type nul > ProyectosdeGrado_API/.env
```

### 3) Generar dependencias y cache de Angular (`node_modules/`, `.angular/`)

```bash
cd ProyectosdeGrado_WEB
npm install
```

Con `npm install` se crea `node_modules/`.
Al ejecutar Angular (por ejemplo `ng serve` o `npm start`) se crea `.angular/`.

### 4) Generar build de Angular (`dist/`)

```bash
cd ProyectosdeGrado_WEB
npm run build
```

Esto genera `ProyectosdeGrado_WEB/dist/`.

### 5) Generar datos locales de Postgres (`postgres_data/`)

Desde la raiz del monorepo:

```bash
docker-compose up -d
```

Con el volumen configurado en Docker Compose se crea `postgres_data/`.

### 6) Generar cache de Django (`__pycache__/`, `*.pyc`)

Al correr Django o cualquier comando de Python del backend se crean automaticamente.
Ejemplo:

```bash
cd ProyectosdeGrado_API/app
python manage.py check
```

### 7) Carpeta de VS Code (`.vscode/`)

Se crea cuando guardas configuraciones del espacio de trabajo (tasks, launch, settings) en VS Code.

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