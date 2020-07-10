FROM continuumio/miniconda3

# Add Maintainer Info
LABEL maintainer="Rescribe"

# create app directory
WORKDIR /opt/ml/code/

# Create the environment
COPY environment.yml .
RUN conda env create -f environment.yml
RUN conda_env="rescribe-nlp-dataload"

# Activate a file
ENV PATH "/opt/conda/envs/$conda_env/bin:$PATH"
RUN /bin/bash -c "source activate $conda_env"

# Copy app
COPY src datasets clean_data ./
COPY .global.env .env

# Defines train.py as script entrypoint
ENV SAGEMAKER_PROGRAM src/main.py
