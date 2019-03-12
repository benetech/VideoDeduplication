##  8888 Port  for Jupyter  / datadrive directory with input videos / outputdir   / wintest1 container image name 
sudo docker run --runtime=nvidia -it -p 8888:8888 -v /datadrive:/datadrive wintest1
