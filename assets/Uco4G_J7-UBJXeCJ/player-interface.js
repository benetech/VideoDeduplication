(function() {
  function getParams(url) {
    var querystring = url.split('?')[1];
    if (!querystring) return {};

    return querystring.split('&').reduce(function(memo, param) {
      var tuple = param.split('=', 2);
      memo[tuple[0]] = decodeURIComponent(tuple[1].replace(/\+/g, ' '));
      return memo;
    }, {});
  }

  function buildFlashVars(params) {
    var flashParams = {
      vEnableOne: 'true',
      vInterfaceObject: 'vInterfaceObject',
      vRestoreStateData: params.state
    };

    return Object.keys(flashParams).reduce(function(memo, key) {
      if (flashParams[key]) memo.push(key.concat('=', flashParams[key]));
      return memo;
    }, []).join('&');
  }

  var params = getParams(window.location.href);
  var debug = !!params.debug;

  var handlers = {
    'slide:capture': captureSlide,
    'player:pause': triggerPause,
    'player:play': triggerPlay,
    'player:focus': focusPlayer
  };

  if (params.hasOwnProperty('wmode')) {
    window.g_strWMode = params['wmode'];
  }

  window.autoSpider     = true;
  window.g_strFlashVars = buildFlashVars(params);
  window.vEnableOne     = true;
  window.addEventListener('message', handleMessage);

  window.vRestoreStateData = params.state;

  window.vInterfaceObject = {
    isRise: !!params.rise,
    OnSlideStarted: function(id) {
      sendParentMessage({
        type: 'slide:change',
        data: id
      });
    },
    OnSlideTransition: function(id, duration) {
      sendParentMessage({
        type: 'slide:transition',
        data: {
          id: id,
          duration: duration
        }
      });
    },
    OnPlayButtonShown: function() {
      sendParentMessage({
        type: 'playButton:shown'
      });
    },
    OnEnterFullscreen: function() {
      sendParentMessage({
        type: 'fullscreen:enter',
        windowName: window.name
      });
    },
    OnExitFullscreen: function() {
      sendParentMessage({
        type: 'fullscreen:exit',
        windowName: window.name
      });
    },
    OnPlayerClicked: function() {
      sendParentMessage({
        type: 'player:click'
      });
    },
    LmsUpdate: function(data) {
      sendParentMessage({
        type: 'course:update',
        payload: data,
        windowName: window.name
      });
    }
  };

  function captureSlide(data) {
    var player = window.GetPlayer();
    if (typeof player.CaptureSlideImage !== 'function') {
      log('player-interface.js: player.CaptureSlideImage is not a function! returning early');
      return;
    }
    sendParentMessage({
      type: 'slide:capture',
      data: {
        commentId: data.commentId,
        snapshot: player.CaptureSlideImage()
      }
    });
  }

  function triggerPause() {
    var player = window.GetPlayer();
    if (typeof player.TriggerPause !== 'function') {
      log('player-interface.js: player.TriggerPause is not a function! returning early');
      return;
    }
    player.TriggerPause();
  }

  function triggerPlay() {
    var player = window.GetPlayer();
    if (typeof player.TriggerPlay !== 'function') {
      log('player-interface.js: player.TriggerPlay is not a function! returning early');
      return;
    }
    player.TriggerPlay();
  }

  function focusPlayer() {
    window.focus();
  }

  function handleMessage(e) {
    var event = e.data;
    log('player-interface.js: received post message from parent window', event);
    if (typeof event !== 'object') return;
    var handler = handlers[event.type];
    if (!handler) return;
    try {
      handler(event.data);
    } catch (err) {
      log('player-interface.js: error executing ' + event.type + ' message handler', err);
      window.playerInterfaceError = err;
      sendParentMessage({
        type: 'error',
        data: {
          eventType: event.type,
          eventData: event.data,
          errorJson: stringifyError(err),
          playerVersion: (window.globals && window.globals.playerVersion) || 'unknown'
        }
      });
    }
  }

  function sendParentMessage(message) {
    log('player-interface.js: sending post message to parent window', message)
    window.parent.postMessage(message, '*');
  }

  function log() {
    if (!debug) return;
    console.log.apply(console, arguments)
  }

  function stringifyError(err) {
    var jsonify = function (obj) {
      return JSON.stringify(obj, Object.getOwnPropertyNames(obj));
    };

    var safeToString = function (obj, fallback) {
      return typeof obj.toString === 'function' ? obj.toString() || fallback : fallback;
    };

    var json = jsonify(err);

    if (json !== '{}') {
      var rehydrated = JSON.parse(json);

      if (!rehydrated.message) {
        rehydrated.message = err.message || safeToString(err, '[failed to obtain error message]');
        json = jsonify(rehydrated);
      }

      return json;
    }

    var pseudoError = {
      message: safeToString(err, '[unable to convert error to json/string]')
    };

    return jsonify(pseudoError);
  }
})();
