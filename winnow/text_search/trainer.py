# --------------------------------------------------------
# Pytorch W2VV++
# Written by Xirong Li & Chaoxi Xu
# --------------------------------------------------------

from __future__ import print_function

import argparse
import importlib
import json
import os
import shutil
import sys
import time

import numpy as np
import torch
from torch.utils.tensorboard import SummaryWriter

import winnow.text_search.data_provider as data
import winnow.text_search.evaluation as evaluation
import winnow.text_search.util as util
from .bigfile import BigFile
from .common import ROOT_PATH
from .generic_utils import Progbar
from .model import get_model, get_we
from .txt2vec import get_txt2vec


def parse_args():
    parser = argparse.ArgumentParser("W2VVPP training script.")
    parser.add_argument("--rootpath", type=str, default=ROOT_PATH, help="path to datasets. (default: %s)" % ROOT_PATH)
    parser.add_argument("trainCollection", type=str, help="train collection")
    parser.add_argument("valCollection", type=str, help="validation collection")
    parser.add_argument(
        "--overwrite", type=int, default=0, choices=[0, 1], help="overwrite existed vocabulary file. (default: 0)"
    )
    parser.add_argument(
        "--val_set", type=str, default="", help="validation collection set (setA, setB). (default: setA)"
    )
    parser.add_argument(
        "--metric",
        type=str,
        default="mir",
        choices=["r1", "r5", "medr", "meanr", "mir"],
        help="performance metric on validation set",
    )
    parser.add_argument("--num_epochs", default=80, type=int, help="Number of training epochs.")
    parser.add_argument("--batch_size", default=128, type=int, help="Size of a training mini-batch.")
    parser.add_argument("--workers", default=2, type=int, help="Number of data loader workers.")
    parser.add_argument(
        "--model_prefix", default="runs_0", type=str, help="Path to save the model and Tensorboard log."
    )
    parser.add_argument(
        "--config_name",
        type=str,
        default="mean_pyresnext-101_rbps13k",
        help="model configuration file. (default: mean_pyresnext-101_rbps13k",
    )

    args = parser.parse_args()
    return args


def load_config(config_path):
    module = importlib.import_module(config_path)
    return module.config()


def main():
    opt = parse_args()
    print(json.dumps(vars(opt), indent=2))

    rootpath = opt.rootpath
    train_collection = opt.trainCollection
    val_collection = opt.valCollection
    val_set = opt.val_set

    config = load_config("winnow.text_search.configs.%s" % opt.config_name)

    model_path = os.path.join(
        rootpath, train_collection, "w2vvpp_train", val_collection, val_set, opt.config_name, opt.model_prefix
    )
    if util.checkToSkip(os.path.join(model_path, "model_best.pth.tar"), opt.overwrite):
        sys.exit(0)
    util.makedirs(model_path)

    global writer
    writer = SummaryWriter(log_dir=model_path, flush_secs=5)

    collections = {"train": train_collection, "val": val_collection}

    capfiles = {"train": "%s.caption.txt", "val": os.path.join(val_set, "%s.caption.txt")}
    cap_file_paths = {
        x: os.path.join(rootpath, collections[x], "TextData", capfiles[x] % collections[x]) for x in collections
    }
    hijack = 500
    vis_feat_files = {
        x: BigFile(os.path.join(rootpath, collections[x], "FeatureData", config.vid_feat), hijack=hijack)
        for x in collections
    }
    config.vis_fc_layers = map(int, config.vis_fc_layers.split("-"))
    #
    config.vis_fc_layers[0] = hijack or vis_feat_files["train"].ndims

    bow_encoding, w2v_encoding, rnn_encoding = config.text_encoding.split("@")
    rnn_encoding, config.pooling = rnn_encoding.split("_", 1)

    bow_vocab_file = os.path.join(
        rootpath, train_collection, "TextData", "vocab", "%s_%d.pkl" % (bow_encoding, config.threshold)
    )
    config.t2v_bow = get_txt2vec(bow_encoding)(bow_vocab_file, norm=config.bow_norm)

    w2v_data_path = os.path.join(rootpath, "word2vec", "flickr", "vec500flickr30m")
    config.t2v_w2v = get_txt2vec(w2v_encoding)(w2v_data_path)

    rnn_vocab_file = os.path.join(
        rootpath, train_collection, "TextData", "vocab", "%s_%d.pkl" % (rnn_encoding, config.threshold)
    )
    config.t2v_idx = get_txt2vec("idxvec")(rnn_vocab_file)
    if config.we_dim == 500:
        config.we = get_we(config.t2v_idx.vocab, w2v_data_path)

    config.txt_fc_layers = map(int, config.txt_fc_layers.split("-"))
    if config.pooling == "mean_last":
        config.txt_fc_layers[0] = config.rnn_size * 2 + config.t2v_w2v.ndims + config.t2v_bow.ndims
    else:
        config.txt_fc_layers[0] = config.rnn_size + config.t2v_w2v.ndims + config.t2v_bow.ndims

    # Construct the model
    model = get_model("w2vvpp")(config)
    print(model.vis_net)
    print(model.txt_net)

    data_loaders = {
        x: data.pair_provider(
            {
                "vis_feat": vis_feat_files[x],
                "capfile": cap_file_paths[x],
                "pin_memory": True,
                "batch_size": opt.batch_size,
                "num_workers": opt.workers,
                "shuffle": (x == "train"),
            }
        )
        for x in collections
    }

    # Train the Model
    best_perf = 0
    no_impr_counter = 0
    val_perf_hist_fout = open(os.path.join(model_path, "val_perf_hist.txt"), "w")
    for epoch in range(opt.num_epochs):

        print("Epoch[{0} / {1}] LR: {2}".format(epoch, opt.num_epochs, model.learning_rate))
        print("-" * 10)
        writer.add_scalar("train/learning_rate", model.learning_rate[0], epoch)
        # train for one epoch
        train(model, data_loaders["train"], epoch)

        # evaluate on validation set
        cur_perf = validate(model, data_loaders["val"], epoch, measure=config.measure, metric=opt.metric)
        model.lr_step(val_value=cur_perf)

        print(" * Current perf: {}\n * Best perf: {}\n".format(cur_perf, best_perf))
        val_perf_hist_fout.write("epoch_%d:\nText2Video(%s): %f\n" % (epoch, opt.metric, cur_perf))
        val_perf_hist_fout.flush()

        # remember best performance and save checkpoint
        is_best = cur_perf > best_perf
        best_perf = max(cur_perf, best_perf)
        save_checkpoint(
            {"epoch": epoch + 1, "model": model.state_dict(), "best_perf": best_perf, "config": config, "opt": opt},
            is_best,
            logdir=model_path,
            only_best=True,
            filename="checkpoint_epoch_%s.pth.tar" % epoch,
        )
        if is_best:
            no_impr_counter = 0
        else:
            no_impr_counter += 1
            if no_impr_counter > 10:
                print("Early stopping happended.\n")
                break

    val_perf_hist_fout.close()
    message = "best performance on validation:\n Text to video({}): {}".format(opt.metric, best_perf)
    print(message)
    with open(os.path.join(model_path, "val_perf.txt"), "w") as fout:
        fout.write(message)


def train(model, train_loader, epoch):
    # average meters to record the training statistics
    batch_time = util.AverageMeter()
    data_time = util.AverageMeter()

    # switch to train mode
    model.switch_to_train()

    progbar = Progbar(len(train_loader.dataset))
    end = time.time()
    for i, train_data in enumerate(train_loader):

        data_time.update(time.time() - end)

        vis_input, txt_input, _, _, _ = train_data
        loss = model.train(vis_input, txt_input)

        progbar.add(
            vis_input.size(0), values=[("data_time", data_time.val), ("batch_time", batch_time.val), ("loss", loss)]
        )

        # measure elapsed time
        batch_time.update(time.time() - end)
        end = time.time()

        # Record logs in tensorboard
        writer.add_scalar("train/Loss", loss, model.iters)


def validate(model, val_loader, epoch, measure="cosine", metric="mir"):
    # compute the encoding for all the validation videos and captions
    vis_embs, txt_embs, vis_ids, txt_ids = evaluation.encode_data(model, val_loader)

    keep_vis_order = []
    keep_vis_ids = []
    for i, vid in enumerate(vis_ids):
        if vid not in keep_vis_ids:
            keep_vis_order.append(i)
            keep_vis_ids.append(vid)
    vis_embs = vis_embs[keep_vis_order]
    vis_ids = keep_vis_ids

    # video retrieval
    txt2vis_sim = evaluation.compute_sim(txt_embs, vis_embs, measure)
    # (r1, r5, r10, medr, meanr, mir) = evaluation.eval_qry2retro(txt2vis_sim, n_qry=1)
    inds = np.argsort(txt2vis_sim, axis=1)
    label_matrix = np.zeros(inds.shape)
    for index in range(inds.shape[0]):
        ind = inds[index][::-1]
        label_matrix[index][np.where(np.array(vis_ids)[ind] == txt_ids[index].split("#")[0])[0]] = 1

    (r1, r5, r10, medr, meanr, mir, mAP) = evaluation.eval(label_matrix)
    sum_recall = r1 + r5 + r10
    print(" * Text to video:")
    print(" * r_1_5_10: {}".format([round(r1, 3), round(r5, 3), round(r10, 3)]))
    print(" * medr, meanr, mir: {}".format([round(medr, 3), round(meanr, 3), round(mir, 3)]))
    print(" * mAP: {}".format(round(mAP, 3)))
    print(" * " + "-" * 10)

    writer.add_scalar("val/r1", r1, epoch)
    writer.add_scalar("val/r5", r5, epoch)
    writer.add_scalar("val/r10", r10, epoch)
    writer.add_scalar("val/medr", medr, epoch)
    writer.add_scalar("val/meanr", meanr, epoch)
    writer.add_scalar("val/mir", mir, epoch)
    writer.add_scalar("val/mAP", mAP, epoch)

    return locals().get(metric, mir)


def save_checkpoint(state, is_best, filename="checkpoint.pth.tar", only_best=False, logdir=""):
    resfile = os.path.join(logdir, filename)
    torch.save(state, resfile)
    if is_best:
        shutil.copyfile(resfile, os.path.join(logdir, "model_best.pth.tar"))

    if only_best:
        os.remove(resfile)


if __name__ == "__main__":
    main()
