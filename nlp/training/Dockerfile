FROM continuumio/miniconda3

# Add Maintainer Info
LABEL maintainer="Rescribe"

# create app directory
WORKDIR /opt/ml/code/

# Create the environment
COPY environment.yml .
RUN conda env create -f environment.yml
RUN conda_env="rescribe-nlp-training"

# Activate a file
ENV PATH "/opt/conda/envs/$conda_env/bin:$PATH"
RUN /bin/bash -c "source activate $conda_env"

# Copy app
COPY src .
COPY .global.env .env

# Defines train.py as script entrypoint
ENV SAGEMAKER_PROGRAM main.py
