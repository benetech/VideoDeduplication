# --------------------------------------------------------
# Pytorch W2VV++
# Written by Xirong Li & Chaoxi Xu
# Adapted for this project
# --------------------------------------------------------

from __future__ import print_function

import numpy as np
import torch

from .generic_utils import Progbar
from .util import timer


def l2norm(X):
    """L2-normalize columns of X"""
    norm = np.linalg.norm(X, axis=1, keepdims=True)
    return 1.0 * X / norm


@timer
def cosine_sim(query_embs, retro_embs):
    query_embs = l2norm(query_embs)
    retro_embs = l2norm(retro_embs)

    return query_embs.dot(retro_embs.T)


def compute_sim(query_embs, retro_embs, measure="cosine"):
    if measure == "cosine":
        return cosine_sim(query_embs, retro_embs)

    elif measure == "euclidean":
        raise Exception("Not implemented")
    else:
        raise Exception("%s is invalid" % measure)


def encode_data(model, data_loader):
    """Encode all images and captions loadable by `data_loader`"""
    model.switch_to_eval()

    vis_embs = None
    txt_embs = None
    vis_ids = [""] * len(data_loader.dataset)
    txt_ids = [""] * len(data_loader.dataset)

    pbar = Progbar(len(data_loader.dataset))
    for i, (vis_input, txt_input, idxs, batch_vis_ids, batch_txt_ids) in enumerate(data_loader):

        with torch.no_grad():
            vis_emb = model.vis_net(vis_input)
            txt_emb = model.txt_net(txt_input)

        if vis_embs is None:
            vis_embs = np.zeros((len(data_loader.dataset), vis_emb.size(1)))
            txt_embs = np.zeros((len(data_loader.dataset), txt_emb.size(1)))

        vis_embs[idxs] = vis_emb.data.cpu().numpy().copy()
        txt_embs[idxs] = txt_emb.data.cpu().numpy().copy()

        for j, idx in enumerate(idxs):
            txt_ids[idx] = batch_txt_ids[j]
            vis_ids[idx] = batch_vis_ids[j]

        pbar.add(vis_emb.size(0))

    return vis_embs, txt_embs, vis_ids, txt_ids


@timer
def encode_vis(model, data_loader):
    model.switch_to_eval()

    vis_embs = None
    vis_ids = [""] * len(data_loader.dataset)
    pbar = Progbar(len(data_loader.dataset))
    for i, (vis_input, idxs, batch_vis_ids) in enumerate(data_loader):
        with torch.no_grad():
            vis_emb = model.vis_net(vis_input)

        if vis_embs is None:
            vis_embs = np.zeros((len(data_loader.dataset), vis_emb.size(1)))

        vis_embs[idxs] = vis_emb.data.cpu().numpy().copy()
        for j, idx in enumerate(idxs):
            vis_ids[idx] = batch_vis_ids[j]

        pbar.add(len(idxs))

    return vis_embs, vis_ids


@timer
def encode_txt(model, data_loader):
    model.switch_to_eval()

    txt_embs = None
    txt_ids = [""] * len(data_loader.dataset)
    pbar = Progbar(len(data_loader.dataset))
    for i, (txt_input, idxs, batch_txt_ids) in enumerate(data_loader):
        with torch.no_grad():
            txt_emb = model.txt_net(txt_input)

        if txt_embs is None:
            txt_embs = np.zeros((len(data_loader.dataset), txt_emb.size(1)))

        txt_embs[idxs] = txt_emb.data.cpu().numpy().copy()
        for j, idx in enumerate(idxs):
            txt_ids[idx] = batch_txt_ids[j]

        pbar.add(len(idxs))

    return txt_embs, txt_ids


def eval_qry2retro(qry2retro_sim, n_qry=1):
    """
    Query->Retrieval
    qry2retro_sim: (n_qry*N, N) matrix of query to video similarity
    """

    assert qry2retro_sim.shape[0] / qry2retro_sim.shape[1] == n_qry, qry2retro_sim.shape
    ranks = np.zeros(qry2retro_sim.shape[0])

    inds = np.argsort(qry2retro_sim, axis=1)

    for index in range(len(ranks)):
        ind = inds[index][::-1]

        rank = np.where(ind == index / n_qry)[0][0]
        ranks[index] = rank

    # Compute metrics
    r1 = 100.0 * len(np.where(ranks < 1)[0]) / len(ranks)
    r5 = 100.0 * len(np.where(ranks < 5)[0]) / len(ranks)
    r10 = 100.0 * len(np.where(ranks < 10)[0]) / len(ranks)
    medr = np.floor(np.median(ranks)) + 1
    meanr = ranks.mean() + 1
    mir = (1.0 / (ranks + 1)).mean()

    return (r1, r5, r10, medr, meanr, mir)


def eval(label_matrix):
    ranks = np.zeros(label_matrix.shape[0])
    aps = np.zeros(label_matrix.shape[0])

    for index in range(len(ranks)):
        rank = np.where(label_matrix[index] == 1)[0] + 1
        ranks[index] = rank[0]

        aps[index] = np.mean([(i + 1.0) / rank[i] for i in range(len(rank))])

    r1, r5, r10 = [100.0 * np.mean([x <= k for x in ranks]) for k in [1, 5, 10]]
    medr = np.floor(np.median(ranks))
    meanr = ranks.mean()
    mir = (1.0 / ranks).mean()
    mAP = aps.mean()

    return (r1, r5, r10, medr, meanr, mir, mAP)
