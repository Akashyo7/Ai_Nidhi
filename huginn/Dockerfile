# Huginn Docker Configuration for ANIDHI Personal Branding Platform
# Works with both local Docker Compose and Render.com deployment

FROM huginn/huginn:latest

# Environment-specific port configuration
# Local development: PORT=3000, Production (Render): PORT=10000
ENV PORT=${PORT:-3000}
ENV HUGINN_PORT=${PORT}
ENV IP=0.0.0.0

# Force PostgreSQL adapter (override Huginn's MySQL default)
ENV DATABASE_ADAPTER=postgresql
ENV HUGINN_DATABASE_ADAPTER=postgresql

# Rails configuration
ENV RAILS_ENV=${RAILS_ENV:-production}
ENV RAILS_LOG_TO_STDOUT=true
ENV RAILS_SERVE_STATIC_FILES=true

# Huginn configuration
ENV HUGINN_USE_GRAPHICAL_DIAGRAM=true
ENV HUGINN_ENABLE_INSECURE_AGENTS=false

# Expose ports (3000 for local, 10000 for Render)
EXPOSE 3000 10000

# Use Huginn's standard initialization
CMD ["/scripts/init"]