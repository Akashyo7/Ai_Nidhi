# Huginn Docker Configuration for ANIDHI Personal Branding Platform
# Fixed for Render.com deployment with .env file generation

FROM huginn/huginn:latest

# Set environment variables for production
ENV RAILS_ENV=production
ENV HUGINN_DATABASE_ADAPTER=postgresql
ENV PORT=10000

# Copy startup script
COPY --chown=huginn:huginn start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Expose port for Render.com
EXPOSE 10000

# Use our startup script that generates .env file
CMD ["/app/start.sh"]