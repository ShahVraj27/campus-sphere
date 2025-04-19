FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    build-essential \
    pkg-config \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt /app/
RUN pip install --upgrade pip \
    && pip install -r requirements.txt --no-cache-dir

# Create wait_for_db management command
RUN mkdir -p /app/api/management/commands
COPY api/management/commands/wait_for_db.py /app/api/management/commands/wait_for_db.py
RUN touch /app/api/management/__init__.py
RUN touch /app/api/management/commands/__init__.py

# Copy project
COPY . /app/

# Run as non-root user
RUN adduser --disabled-password --gecos '' django
RUN chown -R django /app
USER django

# Expose port
EXPOSE 8000

# Run the application
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "campus_sphere.wsgi:application"]