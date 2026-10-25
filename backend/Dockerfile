FROM python:3.11-slim

WORKDIR /app

# Install system dependencies required for WeasyPrint (PDF generation)
RUN apt-get update && apt-get install -y \
    libpango-1.0-0 \
    libharfbuzz0b \
    libpangoft2-1.0-0 \
    libffi-dev \
    libjpeg-dev \
    libopenjp2-7-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Default command (FastAPI API & Compliance Report Service)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
