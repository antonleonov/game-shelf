# Database Container

This directory contains the database Docker setup for Game Shelf.

## Structure

- `Dockerfile` - Custom PostgreSQL Docker image (based on postgres:15-alpine)
- `init.sql` - Database initialization script
- `schema.sql` - Database schema (tables, indexes)

## Usage

The database container is automatically started with `docker-compose up`. 

### Using Docker Compose (Recommended)

```bash
# Start database only
docker-compose up -d postgres

# Start all services
docker-compose up -d
```

### Standalone Database Container

If you want to run just the database container using the custom Dockerfile:

```bash
# Build the database image
docker build -t game-shelf-db ./database

# Run the container
docker run -d \
  --name game-shelf-db \
  -e POSTGRES_USER=gameshelf \
  -e POSTGRES_PASSWORD=gameshelf_dev \
  -e POSTGRES_DB=gameshelf \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  game-shelf-db
```

Or using the official PostgreSQL image directly:

```bash
docker run -d \
  --name game-shelf-db \
  -e POSTGRES_USER=gameshelf \
  -e POSTGRES_PASSWORD=gameshelf_dev \
  -e POSTGRES_DB=gameshelf \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  -v $(pwd)/database/init.sql:/docker-entrypoint-initdb.d/init.sql \
  -v $(pwd)/database/schema.sql:/docker-entrypoint-initdb.d/01-schema.sql \
  postgres:15-alpine
```

### Accessing the Database

```bash
# Using docker-compose
docker-compose exec postgres psql -U gameshelf -d gameshelf

# Using standalone container
docker exec -it game-shelf-db psql -U gameshelf -d gameshelf
```

### Reset Database

```bash
# Stop and remove volumes
docker-compose down -v

# Start fresh
docker-compose up -d postgres
```

## Initialization

The database schema is automatically applied when the container is first created via:
- `init.sql` - Runs first (grants, etc.)
- `schema.sql` - Runs second (creates tables, indexes)

These scripts are mounted to `/docker-entrypoint-initdb.d/` which PostgreSQL executes automatically on first initialization.

## Environment Variables

- `POSTGRES_USER` - Database user (default: gameshelf)
- `POSTGRES_PASSWORD` - Database password (default: gameshelf_dev)
- `POSTGRES_DB` - Database name (default: gameshelf)

## Data Persistence

Database data is persisted in a Docker volume `postgres_data`. To backup:

```bash
docker-compose exec postgres pg_dump -U gameshelf gameshelf > backup.sql
```

To restore:

```bash
docker-compose exec -T postgres psql -U gameshelf gameshelf < backup.sql
```

