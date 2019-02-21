from .loading_utils import frame_to_global


class frameToVideoRepresentation:

    def __init__(self,src,dst):

        self.src = src
        self.dst = dst
    def start(self):
        frame_to_global(self.src,self.dst)




    