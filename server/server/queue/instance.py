from server.queue.model import ProcessDirectory, ProcessFileList, TestTask, MatchTemplates, FindFrame
from server.queue.request_transformer import RequestTransformer

request_transformer = RequestTransformer(ProcessDirectory, ProcessFileList, TestTask, MatchTemplates, FindFrame)
