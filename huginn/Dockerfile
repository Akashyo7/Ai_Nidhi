# Huginn Docker Configuration for ANIDHI Personal Branding Platform
# Proper configuration based on Huginn's setup_env script requirements

FROM huginn/huginn:latest

# Set required environment variables that Huginn expects
ENV RAILS_ENV=production
ENV HUGINN_DATABASE_ADAPTER=postgresql
ENV PORT=10000
ENV HUGINN_PORT=10000
ENV IP=0.0.0.0

# Ensure Huginn binds to the correct port for Render.com
# Override any default port settings
ENV UNICORN_PORT=10000

# Set database configuration environment variables
# These will be processed by Huginn's setup_env script
ENV HUGINN_DATABASE_HOST=
ENV HUGINN_DATABASE_PORT=5432
ENV HUGINN_DATABASE_USERNAME=
ENV HUGINN_DATABASE_PASSWORD=
ENV HUGINN_DATABASE_NAME=huginn_production

# Rails configuration
ENV RAILS_LOG_TO_STDOUT=true
ENV RAILS_SERVE_STATIC_FILES=true

# Huginn specific settings
ENV HUGINN_USE_GRAPHVIZ_DOT=dot
ENV HUGINN_ENABLE_INSECURE_AGENTS=false

# Expose port for Render.com
EXPOSE 10000

# Create a wrapper script to ensure proper port binding
COPY start-huginn.sh /scripts/start-huginn.sh
RUN chmod +x /scripts/start-huginn.sh

# Use our wrapper script that ensures proper port configuration
CMD ["/scripts/start-huginn.sh"]