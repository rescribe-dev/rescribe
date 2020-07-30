FROM continuumio/miniconda3

# Add Maintainer Info
LABEL maintainer="reScribe"

# create app directory
WORKDIR /opt/ml/code/

# Create the environment
COPY dataload/search-classifier/environment.yml .
RUN conda env create -f environment.yml
ARG conda_env=rescribe-nlp-dataload-search-classifier
ENV PATH "/opt/conda/envs/$conda_env/bin:$PATH"

# install sagemaker dependencies
RUN apt-get -y update && apt-get install -y build-essential

# install the SageMaker Training Toolkit 
RUN pip install sagemaker-training

# Copy app
COPY dataload/search-classifier/src src
# copy folders
COPY dataload/search-classifier/datasets datasets
COPY dataload/search-classifier/clean_data clean_data
# copy symlinks
COPY deployment/src/shared src/shared
# copy env file
COPY dataload/search-classifier/.global.env .env

# disregard cache to activate
ARG CACHEBUST=1
RUN echo "$CACHEBUST"

# Activate environment
RUN /bin/bash -c "source activate $conda_env"

# Defines train.py as script entrypoint
ENV SAGEMAKER_PROGRAM src/main.py
