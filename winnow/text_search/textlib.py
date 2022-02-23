# -*- coding: utf-8 -*-
# --------------------------------------------------------
# Pytorch W2VV++
# Written by Xirong Li & Chaoxi Xu
# --------------------------------------------------------

import logging
import os
import re
import sys

logger = logging.getLogger(__file__)
logging.basicConfig(
    format="[%(asctime)s - %(filename)s:line %(lineno)s] %(message)s", datefmt="%d %b %H:%M:%S", level=logging.INFO
)

en_stop_fname = os.path.join(os.path.dirname(__file__), "stopwords_en.txt")
zh_stop_fname = os.path.join(os.path.dirname(__file__), "stopwords_zh.txt")
ENGLISH_STOP_WORDS = set(map(str.strip, open(en_stop_fname).readlines()))
CHINESE_STOP_WORDS = set(map(str.strip, open(zh_stop_fname).readlines()))

if 3 == sys.version_info[0]:
    CHN_DEL_SET = "， 。 、 ！ 《 》 “ ” ； ？ ‘ ’ ".split()
else:
    CHN_DEL_SET = [x.decode("utf-8") for x in "， 。 、 ！ 《 》 “ ” ； ？ ‘ ’ ".split()]


class TextTool:
    @staticmethod
    def tokenize(input_str, clean=True, language="en", remove_stopword=False):
        if "en" == language:  # English
            # delete non-ascii chars
            # sent = input_str.decode('utf-8').encode('ascii', 'ignore')
            sent = input_str
            if clean:
                sent = sent.replace("\r", " ")
                sent = re.sub(r"[^A-Za-z0-9]", " ", sent).strip().lower()
            tokens = sent.split()
            if remove_stopword:
                tokens = [x for x in tokens if x not in ENGLISH_STOP_WORDS]
        else:  # Chinese
            # sent = input_str #string.decode('utf-8')
            sent = input_str.decode("utf-8")

            if clean:
                for elem in CHN_DEL_SET:
                    sent = sent.replace(elem, "")
            sent = sent.encode("utf-8")
            sent = re.sub("[A-Za-z]", "", sent)
            tokens = [x for x in sent.split()]
            if remove_stopword:
                tokens = [x for x in tokens if x not in CHINESE_STOP_WORDS]

        return tokens


class Vocabulary(object):
    """Simple vocabulary wrapper."""

    def __init__(self, encoding):
        self.word2idx = {}
        self.idx2word = {}
        self.encoding = encoding

    def add(self, word):
        if word not in self.word2idx:
            idx = len(self.word2idx)
            self.word2idx[word] = idx
            self.idx2word[idx] = word

    def find(self, word):
        return self.word2idx.get(word, -1)

    def __getitem__(self, index):
        return self.idx2word[index]

    def __call__(self, word):
        if word not in self.word2idx:
            if "gru" in self.encoding:
                return self.word2idx["<unk>"]
            else:
                raise Exception("word out of vocab: %s" % word)
        else:
            return self.word2idx[word]

    def __len__(self):
        return len(self.word2idx)


if __name__ == "__main__":
    test_strs = """a Dog is running
The dog runs
dogs-x runs""".split(
        "\n"
    )

    for t in test_strs:
        print(t, "->", TextTool.tokenize(t, clean=True, language="en"), "->", TextTool.tokenize(t, "en", True))

    test_strs = """一间 干净 整洁 的 房间 。
一只 黄色 的 小狗 趴在 长椅 上""".split(
        "\n"
    )

    for t in test_strs:
        print(
            t,
            "->",
            " ".join(TextTool.tokenize(t, clean=True, language="zh")),
            "->",
            " ".join(TextTool.tokenize(t, "zh", True)),
        )
