# Dockerfile — place this in your backend/ root folder
# Hugging Face Spaces requires port 7860

FROM python:3.11-slim

# Create non-root user (HF Spaces requirement)
RUN useradd -m -u 1000 user

WORKDIR /app

# Copy and install dependencies first (better caching)
COPY --chown=user requirements.txt requirements.txt
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# Switch to non-root user
USER user
ENV PATH="/home/user/.local/bin:$PATH"

# Copy all app code
COPY --chown=user . .

# Hugging Face Spaces expects port 7860
EXPOSE 7860

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]