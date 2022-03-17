# --------------------------------------------------------
# Pytorch W2VV++
# Written by Xirong Li & Chaoxi Xu
# --------------------------------------------------------


from collections import OrderedDict

import numpy as np
import torch
import torch.backends.cudnn as cudnn
import torch.nn as nn
import torch.nn.init
from torch.nn.utils.clip_grad import clip_grad_norm_
from torch.nn.utils.rnn import pack_padded_sequence, pad_packed_sequence

from .bigfile import BigFile
from .loss import MarginRankingLoss

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")


def get_we(vocab, w2v_dir):
    w2v = BigFile(w2v_dir)
    ndims = w2v.ndims
    nr_words = len(vocab)
    words = [vocab[i] for i in range(nr_words)]
    we = np.random.uniform(low=-1.0, high=1.0, size=(nr_words, ndims))

    renamed, vecs = w2v.read(words)
    for i, word in enumerate(renamed):
        idx = vocab.find(word)
        we[idx] = vecs[i]

    return torch.Tensor(we)


def l2norm(X):
    """L2-normalize columns of X"""
    norm = torch.pow(X, 2).sum(dim=1, keepdim=True).sqrt()
    X = torch.div(X, norm)
    return X


def _initialize_weights(m):
    """Initialize module weights"""
    if type(m) == nn.Linear:
        nn.init.xavier_uniform_(m.weight)
        if m.bias is not None:
            nn.init.zeros_(m.bias)
    elif type(m) == nn.BatchNorm1d:
        nn.init.ones_(m.weight)
        nn.init.zeros_(m.bias)


class IdentityNet(nn.Module):
    def __init__(self, opt):
        super(IdentityNet, self).__init__()

    def forward(self, input_x):
        """Extract image feature vectors."""
        return input_x


class TransformNet(nn.Module):
    def __init__(self, fc_layers, opt):
        super(TransformNet, self).__init__()

        self.fc1 = nn.Linear(fc_layers[0], fc_layers[1])
        if opt.batch_norm:
            self.bn1 = nn.BatchNorm1d(fc_layers[1])
        else:
            self.bn1 = None

        if opt.activation == "tanh":
            self.activation = nn.Tanh()
        elif opt.activation == "relu":
            self.activation = nn.ReLU()
        else:
            self.activation = None

        if opt.dropout > 1e-3:
            self.dropout = nn.Dropout(p=opt.dropout)
        else:
            self.dropout = None

        self.init_weights()

    def init_weights(self):
        """Xavier initialization for the fully connected layer"""
        self.apply(_initialize_weights)

    def forward(self, input_x):
        features = self.fc1(input_x.to(device))

        if self.bn1 is not None:
            features = self.bn1(features)

        if self.activation is not None:
            features = self.activation(features)

        if self.dropout is not None:
            features = self.dropout(features)

        return features

    def load_state_dict(self, state_dict):
        """Copies parameters. overwritting the default one to
        accept state_dict from Full model
        """
        own_state = self.state_dict()
        new_state = OrderedDict()
        for name, param in state_dict.items():
            if name in own_state:
                new_state[name] = param

        super(TransformNet, self).load_state_dict(new_state)


class VisTransformNet(TransformNet):
    def __init__(self, opt):
        super(VisTransformNet, self).__init__(opt.vis_fc_layers, opt)


class TxtTransformNet(TransformNet):
    def __init__(self, opt):
        super(TxtTransformNet, self).__init__(opt.txt_fc_layers, opt)


class TxtEncoder(nn.Module):
    def __init__(self, opt):
        super(TxtEncoder, self).__init__()

    def forward(self, txt_input):
        return txt_input


class GruTxtEncoder(TxtEncoder):
    def _init_rnn(self, opt):
        self.rnn = nn.GRU(opt.we_dim, opt.rnn_size, opt.rnn_layer, batch_first=True)

    def __init__(self, opt):
        super(GruTxtEncoder, self).__init__(opt)
        self.pooling = opt.pooling
        self.rnn_size = opt.rnn_size
        self.t2v_idx = opt.t2v_idx
        self.we = nn.Embedding(len(self.t2v_idx.vocab), opt.we_dim)
        if opt.we_dim == 500:
            self.we.weight = nn.Parameter(opt.we)  # initialize with a pre-trained 500-dim w2v

        self._init_rnn(opt)

    def forward(self, txt_input):
        """Handles variable size captions"""
        batch_size = len(txt_input)

        # caption encoding
        idx_vecs = [self.t2v_idx.encoding(caption) for caption in txt_input]
        lengths = [len(vec) for vec in idx_vecs]

        x = torch.zeros(batch_size, max(lengths)).long().to(device)
        for i, vec in enumerate(idx_vecs):
            end = lengths[i]
            x[i, :end] = torch.Tensor(vec)

        # caption embedding
        x = self.we(x)
        packed = pack_padded_sequence(x, lengths, batch_first=True)

        # Forward propagate RNN
        out, _ = self.rnn(packed)
        # Reshape *final* output to (batch_size, hidden_size)
        padded = pad_packed_sequence(out, batch_first=True)

        if self.pooling == "mean":
            out = torch.zeros(batch_size, self.rnn_size).to(device)
            for i, ln in enumerate(lengths):
                out[i] = torch.mean(padded[0][i][:ln], dim=0)
        elif self.pooling == "last":
            I = torch.LongTensor(lengths).view(-1, 1, 1)  # noqa: E741
            I = I.expand(batch_size, 1, self.rnn_size) - 1  # noqa: E741
            I = I.cuda()  # noqa: E741
            out = torch.gather(padded[0], 1, I).squeeze(1)
        elif self.rnn_type == "mean_last":
            out1 = torch.zeros(batch_size, self.rnn_size).to(device)
            for i, ln in enumerate(lengths):
                out1[i] = torch.mean(padded[0][i][:ln], dim=0)

            I = torch.LongTensor(lengths).view(-1, 1, 1)  # noqa: E741
            I = I.expand(batch_size, 1, self.rnn_size) - 1  # noqa: E741
            I = I.cuda()  # noqa: E741
            out2 = torch.gather(padded[0], 1, I).squeeze(1)
            out = torch.cat((out1, out2), dim=1)
        return out


class BoWTxtEncoder(TxtEncoder):
    def __init__(self, opt):
        super(BoWTxtEncoder, self).__init__(opt)
        self.t2v_bow = opt.t2v_bow

    def forward(self, txt_input):
        bow_out = torch.Tensor([self.t2v_bow.encoding(caption) for caption in txt_input]).to(device)
        return bow_out


class W2VTxtEncoder(TxtEncoder):
    def __init__(self, opt):
        super(W2VTxtEncoder, self).__init__(opt)
        self.t2v_w2v = opt.t2v_w2v

    def forward(self, txt_input):
        w2v_out = torch.Tensor([self.t2v_w2v.encoding(caption) for caption in txt_input]).to(device)
        return w2v_out


class MultiScaleTxtEncoder(TxtEncoder):
    def __init__(self, opt):
        super(MultiScaleTxtEncoder, self).__init__(opt)
        self.rnn_encoder = GruTxtEncoder(opt)
        self.w2v_encoder = W2VTxtEncoder(opt)
        self.bow_encoder = BoWTxtEncoder(opt)

    def forward(self, txt_input):
        """Handles variable size captions"""
        # Embed word ids to vectors
        rnn_out = self.rnn_encoder(txt_input)
        w2v_out = self.w2v_encoder(txt_input)
        bow_out = self.bow_encoder(txt_input)
        out = torch.cat((rnn_out, w2v_out, bow_out), dim=1)
        return out


class TxtNet(nn.Module):
    def _init_encoder(self, opt):
        self.encoder = TxtEncoder(opt)

    def _init_transformer(self, opt):
        self.transformer = TxtTransformNet(opt)

    def __init__(self, opt):
        super(TxtNet, self).__init__()
        self._init_encoder(opt)
        self._init_transformer(opt)

    def forward(self, txt_input):
        features = self.encoder(txt_input)
        features = self.transformer(features)
        return features


class MultiScaleTxtNet(TxtNet):
    def _init_encoder(self, opt):
        self.encoder = MultiScaleTxtEncoder(opt)


class CrossModalNetwork(object):
    def _init_vis_net(self, opt):
        # FIXME: undefined symbol VisNet
        self.vis_net = VisNet(opt)  # noqa: F821

    def _init_txt_net(self, opt):
        self.txt_net = TxtNet(opt)

    def __init__(self, opt):
        self._init_vis_net(opt)
        self._init_txt_net(opt)

        self.grad_clip = opt.grad_clip
        if torch.cuda.is_available():
            self.vis_net.cuda()
            self.txt_net.cuda()
            cudnn.benchmark = True

        self.criterion = MarginRankingLoss(
            margin=opt.margin,
            measure=opt.measure,
            max_violation=opt.max_violation,
            cost_style=opt.cost_style,
            direction=opt.direction,
        )

        params = list(self.vis_net.parameters())
        params += list(self.txt_net.parameters())
        self.params = params

        if opt.optimizer == "adam":
            self.optimizer = torch.optim.Adam(params, lr=opt.lr)
        elif opt.optimizer == "rmsprop":
            self.optimizer = torch.optim.RMSprop(params, lr=opt.lr)

        self.lr_schedulers = [
            torch.optim.lr_scheduler.StepLR(self.optimizer, step_size=1, gamma=opt.lr_decay_rate),
            torch.optim.lr_scheduler.ReduceLROnPlateau(self.optimizer, mode="max", factor=0.5, patience=2),
        ]

        self.iters = 0

    def state_dict(self):
        state_dict = [self.vis_net.state_dict(), self.txt_net.state_dict()]
        return state_dict

    def load_state_dict(self, state_dict):
        self.vis_net.load_state_dict(state_dict[0])
        self.txt_net.load_state_dict(state_dict[1])

    def switch_to_train(self):
        self.vis_net.train()
        self.txt_net.train()

    def switch_to_eval(self):
        self.vis_net.eval()
        self.txt_net.eval()

    @property
    def learning_rate(self):
        """Return learning rate"""
        lr_list = []
        for param_group in self.optimizer.param_groups:
            lr_list.append(param_group["lr"])
        return lr_list

    def lr_step(self, val_value):
        self.lr_schedulers[0].step()
        self.lr_schedulers[1].step(val_value)

    def compute_loss(self, vis_embs, txt_embs):
        """Compute the loss given pairs of image and caption embeddings"""
        loss = self.criterion(txt_embs, vis_embs)
        return loss

    def train(self, vis_input, txt_input):
        """One training step given vis_feats and captions."""
        self.iters += 1

        # compute the embeddings
        vis_embs = self.vis_net(vis_input)
        txt_embs = self.txt_net(txt_input)

        # measure accuracy and record loss
        self.optimizer.zero_grad()
        loss = self.compute_loss(vis_embs, txt_embs)

        loss_value = loss.item()

        # compute gradient and do SGD step
        loss.backward()
        if self.grad_clip > 0:
            clip_grad_norm_(self.params, self.grad_clip)
        self.optimizer.step()

        return loss_value

    def embed_vis(self, vis_input):
        self.switch_to_eval()
        vis_input = np.array(vis_input)
        if vis_input.ndim == 1:
            vis_input = [vis_input]

        with torch.no_grad():
            vis_input = torch.Tensor(vis_input).to(device)
            vis_embs = self.vis_net(vis_input)

        return vis_embs.cpu()

    def embed_txt(self, txt_input):
        self.switch_to_eval()
        if isinstance(txt_input, str):
            txt_input = [txt_input]

        with torch.no_grad():
            txt_embs = self.txt_net(txt_input)

        return txt_embs.cpu()


"""
class W2VV (CrossModalNetwork):
    def __init_vis_net(self, opt):
        self.vis_net = IdentityNet(opt)

    def __init_txt_net(self, opt):
        self.txt_net = MultiScaleTxtNet(opt)
"""


class W2VVPP(CrossModalNetwork):
    def _init_vis_net(self, opt):
        self.vis_net = VisTransformNet(opt)

    def _init_txt_net(self, opt):
        self.txt_net = MultiScaleTxtNet(opt)


NAME_TO_MODELS = {"w2vvpp": W2VVPP}


def get_model(name):
    assert name in NAME_TO_MODELS, "%s not supported." % name
    return NAME_TO_MODELS[name]


if __name__ == "__main__":
    model = get_model("w2vvpp")
