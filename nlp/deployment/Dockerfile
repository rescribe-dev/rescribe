FROM continuumio/miniconda3

# Add Maintainer Info
LABEL maintainer="reScribe"

# create app directory
WORKDIR /app

# Create the environment
COPY environment.yml .
RUN conda env create -f environment.yml

# Copy app
COPY deployment/dist .
# copy env file
COPY deployment/.global.env deployment/.env

EXPOSE 8082
# run environment through conda instead of conda activate
# see https://pythonspeed.com/articles/activate-conda-dockerfile/
ENTRYPOINT ["conda", "run", "-n", "rescribe-nlp-deployment", "python", "deployment/src/main.py"]
