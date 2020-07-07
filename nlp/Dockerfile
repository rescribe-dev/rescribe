FROM continuumio/miniconda3

# Add Maintainer Info
LABEL maintainer="Rescribe"

# create app directory
WORKDIR /app

# Create the environment
COPY environment.yml .
RUN conda env create -f environment.yml

# Copy app
COPY src .
COPY .global.env .env

EXPOSE 8082
# run environment through conda instead of conda activate
# see https://pythonspeed.com/articles/activate-conda-dockerfile/
ENTRYPOINT ["conda", "run", "-n", "rescribe-nlp", "python", "main.py"]
