# Huginn Docker Configuration for ANIDHI Personal Branding Platform
# Optimized for Render.com free tier deployment

FROM huginn/huginn:latest

# Set environment variables for production
ENV RAILS_ENV=production
ENV HUGINN_DATABASE_ADAPTER=postgresql
ENV PORT=10000

# Install additional dependencies for our use case
USER root
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    jq \
    && rm -rf /var/lib/apt/lists/*

# Switch back to huginn user
USER huginn

# Copy custom configuration if needed
# COPY --chown=huginn:huginn config/ /app/config/

# Expose port for Render.com
EXPOSE 10000

# Health check for Render.com
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:10000/health || exit 1

# Start command
CMD ["bin/rails", "server", "-b", "0.0.0.0", "-p", "10000"]