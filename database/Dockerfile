FROM postgres:15-alpine

# Set environment variables
ENV POSTGRES_USER=gameshelf
ENV POSTGRES_PASSWORD=gameshelf_dev
ENV POSTGRES_DB=gameshelf

# Copy initialization scripts
COPY init.sql /docker-entrypoint-initdb.d/
COPY schema.sql /docker-entrypoint-initdb.d/

# Expose PostgreSQL port
EXPOSE 5432

