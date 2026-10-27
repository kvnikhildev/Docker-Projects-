FROM python:3.14.9-alpine

WORKDIR /app

COPY requirements.txt .

RUN pip install -r requirements.txt

COPY . . 

EXPOSE 5000

CMD ["python", "app.py"]