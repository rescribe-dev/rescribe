FROM continuumio/miniconda3

# create app directory
WORKDIR /app

# Create the environment
COPY environment.yml .
RUN conda env create -f environment.yml

# Activate the environment
RUN conda activate myenv

# Copy app
COPY src .

EXPOSE 8082
ENTRYPOINT ["python", "main.py"]
