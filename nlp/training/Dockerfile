FROM continuumio/miniconda3

# Add Maintainer Info
LABEL maintainer="Rescribe"

# create app directory
WORKDIR /opt/ml/code/

# Create the environment
COPY training/environment.yml .
RUN conda env create -f environment.yml
ARG conda_env="rescribe-nlp-training"

# Activate the environment
ENV PATH "/opt/conda/envs/$conda_env/bin:$PATH"
RUN /bin/bash -c "source activate $conda_env"

# Copy app
COPY training/src src
# copy symlinks
COPY dataload/src/shared src/shared
# copy env file
COPY training/.global.env .env

# install sagemaker dependencies
RUN apt-get -y update && apt-get install -y build-essential

# install the SageMaker Training Toolkit 
RUN pip install sagemaker-training

# Defines train.py as script entrypoint
ENV SAGEMAKER_PROGRAM src/main.py
