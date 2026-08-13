FROM python:3.12-slim

WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1

RUN groupadd -r app -g 10001 \
    && useradd -r -u 10001 -g app app \
    && mkdir -p /app/data \
    && chown -R app:app /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

EXPOSE 8001

USER app

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
