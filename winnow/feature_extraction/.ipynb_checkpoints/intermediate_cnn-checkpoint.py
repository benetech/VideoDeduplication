from .extraction_routine import start_video_extraction


class IntermediateCnnExtractor:

    def __init__(self,video_src,output_path):
        self.video_src = video_src
        self.output_path = output_path
    
    def start(self,batch_size=8,cores=4):
        print('Starting feature extraction process from {}'.format(self.video_src))
        start_video_extraction(self.video_src,self.output_path,batch_sz=batch_size,cores=cores)
        

