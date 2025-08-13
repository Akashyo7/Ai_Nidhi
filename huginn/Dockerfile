# Huginn Docker Configuration for ANIDHI Personal Branding Platform
# Simplified approach focusing on port binding for Render.com

FROM huginn/huginn:latest

# Critical: Set PORT environment variable for Render.com
# Render requires services to bind to 0.0.0.0:10000
ENV PORT=10000
ENV HUGINN_PORT=10000
ENV IP=0.0.0.0

# Basic Rails configuration
ENV RAILS_ENV=production
ENV HUGINN_DATABASE_ADAPTER=postgresql
ENV RAILS_LOG_TO_STDOUT=true
ENV RAILS_SERVE_STATIC_FILES=true

# Expose port for Render.com
EXPOSE 10000

# Use Huginn's standard initialization
# The setup_env script should handle PORT correctly
CMD ["/scripts/init"]