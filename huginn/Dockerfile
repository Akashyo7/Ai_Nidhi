# Huginn Docker Configuration for ANIDHI Personal Branding Platform
# Simplified approach - create .env file directly in Dockerfile

FROM huginn/huginn:latest

# Set environment variables for production
ENV RAILS_ENV=production
ENV HUGINN_DATABASE_ADAPTER=postgresql
ENV PORT=10000

# Create a basic .env file that Huginn expects
# The actual values will come from environment variables
RUN echo "# Basic .env file for Huginn" > /app/.env && \
    echo "RAILS_ENV=production" >> /app/.env && \
    echo "PORT=10000" >> /app/.env && \
    chown huginn:huginn /app/.env

# Expose port for Render.com
EXPOSE 10000

# Use the standard Huginn startup but with environment variables
CMD ["bin/rails", "server", "-b", "0.0.0.0", "-p", "10000"]