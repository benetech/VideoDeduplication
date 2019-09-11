FROM tensorflow/tensorflow:latest-gpu

RUN apt-get update
RUN apt-get --yes install curl
RUN curl -LO https://repo.anaconda.com/archive/Anaconda3-2019.07-Linux-x86_64.sh 
RUN bash Anaconda3-2019.07-Linux-x86_64.sh -p /anaconda -b
RUN rm Anaconda3-2019.07-Linux-x86_64.sh
ENV PATH=/anaconda/bin:${PATH}
RUN conda update -y conda


ADD environment-lean-gpu.yaml /tmp/environment-lean-gpu.yaml

RUN conda env create -f /tmp/environment-lean-gpu.yaml python=3.7

RUN echo "source activate $(head -1 /tmp/environment-lean-gpu.yml | cut -d' ' -f2)" > ~/.bashrc

ENV PATH /opt/conda/envs/$(head -1 /tmp/environment-lean-gpu.yml | cut -d' ' -f2)/bin:$PATH

RUN mkdir project

ADD . project/

WORKDIR project/

RUN pip install -e .

RUN apt update 

RUN apt-get install -y libsm6 libxext6 libxrender-dev nano
