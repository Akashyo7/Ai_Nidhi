# Huginn Docker Configuration for ANIDHI Personal Branding Platform
# Simplified for Render.com free tier deployment

FROM huginn/huginn:latest

# Set environment variables for production
ENV RAILS_ENV=production
ENV HUGINN_DATABASE_ADAPTER=postgresql
ENV PORT=10000

# Expose port for Render.com
EXPOSE 10000

# Start command - let Huginn handle the startup process
CMD ["bin/rails", "server", "-b", "0.0.0.0", "-p", "10000"]