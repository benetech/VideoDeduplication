
class config(object):
    text_encoding = 'bow_nsw@w2v_nsw@gru_mean'
    threshold = 5
    bow_norm = 0
    we_dim = 500
    rnn_size = 1024
    rnn_layer = 1
    txt_fc_layers = '0-2048'
    txt_norm = 2 # L_2 norm
    use_abs = False
    batch_norm = False

    vid_feat = 'mean_pyresnext-101_rbps13k,flatten0_output,os'
    vis_fc_layers = '0-2048'
    vis_norm = 2 # L_2 norm

    # dropout
    dropout = 0
    last_dropout = 0

    # activation
    activation = 'tanh'
    last_activation = 'tanh'

    # loss
    loss = 'mrl'
    margin = 0.2
    direction = 't2i'       # only valid for mrl loss
    # Use max instead of sum in the rank loss
    max_violation = True    # only valid for mrl loss
    # cost style (sum|mean)
    cost_style = 'sum'      # only valid for mrl loss
    # Similarity measure used (cosine|order)
    measure = 'cosine'

    # optimizer
    optimizer ='rmsprop'
    # Initial learning rate.
    lr = 0.0001
    lr_decay_rate = 0.99
    # Gradient clipping threshold
    grad_clip = 2

