from server.queue.model import (
    ProcessDirectory,
    ProcessFileList,
    TestTask,
    MatchTemplates,
    FindFrame,
    ProcessOnlineVideo,
    PushFingerprints,
    PullFingerprints,
    MatchRemoteFingerprints,
    PrepareSemanticSearch,
    GenerateTiles,
)
from server.queue.request_transformer import RequestTransformer

request_transformer = RequestTransformer(
    ProcessDirectory,
    ProcessFileList,
    TestTask,
    MatchTemplates,
    FindFrame,
    ProcessOnlineVideo,
    PushFingerprints,
    PullFingerprints,
    MatchRemoteFingerprints,
    PrepareSemanticSearch,
    GenerateTiles,
)
