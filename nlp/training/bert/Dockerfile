FROM continuumio/miniconda3

# Add Maintainer Info
LABEL maintainer="reScribe"

# create app directory
WORKDIR /opt/ml/code/

# Create the environment
COPY training/environment.yml .
RUN conda env create -f environment.yml
ARG conda_env="rescribe-nlp-training"
ENV PATH "/opt/conda/envs/$conda_env/bin:$PATH"

# install sagemaker dependencies
RUN apt-get -y update && apt-get install -y build-essential

# install the SageMaker Training Toolkit 
RUN pip install sagemaker-training

# Copy app
COPY training/src src
# copy symlinks
COPY deployment/src/shared src/shared
# copy env file
COPY training/.global.env .env

# disregard cache to activate
ARG CACHEBUST=1
RUN echo "$CACHEBUST"

# Activate the environment
RUN /bin/bash -c "source activate $conda_env"

# Defines train.py as script entrypoint
ENV SAGEMAKER_PROGRAM src/main.py
