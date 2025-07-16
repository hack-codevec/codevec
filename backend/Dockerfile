FROM nvidia/cuda:12.8.0-runtime-ubuntu22.04

WORKDIR /app

RUN mkdir codebase

COPY requirements.txt .

RUN apt-get update && apt-get install -y \
    python3.10 python3-pip python3.10-venv \
    build-essential curl git && \
    rm -rf /var/lib/apt/lists/*

RUN pip3 install --upgrade pip 

RUN pip3 uninstall torch torchvision torchaudio

RUN pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu128

RUN pip3 install -r requirements.txt

COPY . .

CMD ["python3", "main.py"]