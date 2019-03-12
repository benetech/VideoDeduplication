FROM tensorflow/tensorflow:latest-gpu

RUN curl -LO http://repo.continuum.io/miniconda/Miniconda-latest-Linux-x86_64.sh
RUN bash Miniconda-latest-Linux-x86_64.sh -p /miniconda -b
RUN rm Miniconda-latest-Linux-x86_64.sh
ENV PATH=/miniconda/bin:${PATH}
RUN conda update -y conda

RUN apt update
RUN apt --yes  install libgl1-mesa-glx

ADD environment.yaml /tmp/environment.yaml

RUN conda env create -f /tmp/environment.yaml

RUN echo "source activate $(head -1 /tmp/environment.yaml | cut -d' ' -f2)" > ~/.bashrc

ENV PATH /opt/conda/envs/$(head -1 /tmp/environment.yaml | cut -d' ' -f2)/bin:$PATH

RUN mkdir project

ADD . project/

WORKDIR project/

RUN pip install -e .

RUN apt update 

RUN apt-get install -y libsm6 libxext6 libxrender-dev

