FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY requirements.txt .
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    gcc \
    libcairo2 \
    libcairo2-dev \
    libffi-dev \
    libfreetype6-dev \
    pkg-config \
    python3-dev \
  && rm -rf /var/lib/apt/lists/*
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire service folder to ensure all modules are present
COPY . /app
RUN python -m compileall -q /app

EXPOSE 5000

CMD ["sh", "-c", "gunicorn -b 0.0.0.0:${PORT:-5000} app:app --workers 2 --timeout 120"]
