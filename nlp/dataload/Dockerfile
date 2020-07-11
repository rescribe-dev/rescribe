FROM continuumio/miniconda3

# Add Maintainer Info
LABEL maintainer="Rescribe"

# create app directory
WORKDIR /opt/ml/code/

# Create the environment
COPY environment.yml .
RUN conda env create -f environment.yml
ARG conda_env=rescribe-nlp-dataload

# Activate environment
ENV PATH "/opt/conda/envs/$conda_env/bin:$PATH"
RUN /bin/bash -c "source activate $conda_env"

# Copy app
COPY src datasets clean_data ./
COPY .global.env .env

# install sagemaker dependencies
RUN apt-get -y update && apt-get install -y build-essential

# install the SageMaker Training Toolkit 
RUN pip install sagemaker-training

# Defines train.py as script entrypoint
ENV SAGEMAKER_PROGRAM src/main.py
