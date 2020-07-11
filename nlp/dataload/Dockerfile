FROM continuumio/miniconda3

# Add Maintainer Info
LABEL maintainer="Rescribe"

# create app directory
WORKDIR /opt/ml/code/

# Create the environment
COPY dataload/environment.yml .
RUN conda env create -f environment.yml
ARG conda_env=rescribe-nlp-dataload

# install sagemaker dependencies
RUN apt-get -y update && apt-get install -y build-essential

# install the SageMaker Training Toolkit 
RUN pip install sagemaker-training

# Activate environment
ENV PATH "/opt/conda/envs/$conda_env/bin:$PATH"
RUN /bin/bash -c "source activate $conda_env"

# Copy app
COPY dataload/src src
# copy folders
COPY dataload/datasets datasets
COPY dataload/clean_data clean_data
# copy env file
COPY dataload/.global.env .env

# Defines train.py as script entrypoint
ENV SAGEMAKER_PROGRAM src/main.py
