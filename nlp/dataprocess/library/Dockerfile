FROM continuumio/miniconda3

# Add Maintainer Info
LABEL maintainer="reScribe"

# create app directory
WORKDIR /opt/ml/code/

# Create the environment
COPY dataprocess/library/environment.yml .
RUN conda env create -f environment.yml
ARG conda_env=rescribe-nlp-dataprocess-library
ENV PATH "/opt/conda/envs/$conda_env/bin:$PATH"

# install sagemaker dependencies
RUN apt-get -y update && apt-get install -y build-essential

# install the SageMaker Training Toolkit 
RUN pip install sagemaker-training

# Copy app
COPY dataprocess/library/dist .
# copy env file
COPY dataprocess/library/.global.env dataprocess/library/.env

# disregard cache to activate
ARG CACHEBUST=1
RUN echo "$CACHEBUST"

# Activate environment
RUN /bin/bash -c "source activate $conda_env"

# Defines train.py as script entrypoint
ENV SAGEMAKER_PROGRAM dataprocess/library/src/main.py
