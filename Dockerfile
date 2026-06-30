# Dockerfile — place this in the ROOT of ur repo (glinston-world/)
# Hugging Face Spaces requires port 7860

FROM python:3.11-slim

# Create non-root user (HF Spaces requirement)
RUN useradd -m -u 1000 user

WORKDIR /app

# Copy and install dependencies first (better caching)
# requirements.txt is inside the backend/ subfolder
COPY --chown=user backend/requirements.txt requirements.txt
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# Switch to non-root user
USER user
ENV PATH="/home/user/.local/bin:$PATH"

# Copy only the backend/ subfolder contents into /app
COPY --chown=user backend/ .

# Hugging Face Spaces expects port 7860
EXPOSE 7860

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]