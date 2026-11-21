FROM python:3.11-slim

WORKDIR /app

# Install Poetry
RUN pip install --no-cache-dir poetry

# Copy pyproject and lock files
COPY pyproject.toml poetry.lock* ./

# Install dependencies
RUN poetry config virtualenvs.create false && \
    poetry install --no-interaction --no-ansi --only main

# Copy source code
COPY . .

# Expose port
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
