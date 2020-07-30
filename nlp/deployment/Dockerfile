FROM continuumio/miniconda3

# Add Maintainer Info
LABEL maintainer="reScribe"

# create app directory
WORKDIR /app

# Create the environment
COPY deployment/environment.yml .
RUN conda env create -f environment.yml

# Copy app
COPY deployment/src src
# copy env file
COPY deployment/.global.env .env

EXPOSE 8082
# run environment through conda instead of conda activate
# see https://pythonspeed.com/articles/activate-conda-dockerfile/
ENTRYPOINT ["conda", "run", "-n", "rescribe-nlp-deployment", "python", "src/main.py"]
