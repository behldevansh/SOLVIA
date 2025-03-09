# Use the official Python image from the Docker Hub
FROM python:3.12-slim

# Set the working directory in the container
WORKDIR /app

# Install Poetry
RUN pip install poetry

# Copy the pyproject.toml and poetry.lock files to the container
COPY pyproject.toml poetry.lock /app/

# Install the dependencies
RUN poetry install --no-root

# Copy the rest of the application code to the container
COPY . /app

ENV SCALER_URL="https://8b3vb99n75.ufs.sh/f/gRDkujBFDmLCH1BzHiVyCvMZYem6iTx8tPU4KBIzNwE2hlcs"
ENV MODEL_URL="https://8b3vb99n75.ufs.sh/f/gRDkujBFDmLCzTcJQ4lUXZkYCPS2oEaT3pf8iqyOn0HKB7DG"

# Expose the port that the app runs on
EXPOSE 8000

# Command to run the application
CMD ["poetry", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]