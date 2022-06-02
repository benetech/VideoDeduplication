<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta  name="referrer" content="origin" />
    <script>
      /* jshint ignore:start */
      // jscs:disable
      // https://gist.github.com/982883
      var uuid = function(a) {
        return a           // if the placeholder was passed, return
          ? (              // a random number from 0 to 15
            a ^            // unless b is 8,
            Math.random()  // in which case
            * 16           // a random number from
            >> a/4         // 8 to 11
            ).toString(16) // in hexadecimal
          : (              // or otherwise a concatenated string:
            [1e7] +        // 10000000 +
            -1e3 +         // -1000 +
            -4e3 +         // -4000 +
            -8e3 +         // -80000000 +
            -1e11          // -100000000000,
            ).replace(     // replacing
              /[018]/g,    // zeroes, ones, and eights with
              uuid         // random hex digits
            );
      };

      window.frameHash = window.location.hash.replace(/^#/, '');

      var postToParent = function(message) {
        if (window.parent.postMessage != null) {
          window.parent.postMessage(message, '*');
        }
      };

      var onDidReceiveMessage = function(e) {
        if (e.data.id === frameHash) {
          var xhr = new XMLHttpRequest(),
              now = new Date(),
              data = {
                messageId: uuid(),
                sentAt: now.toISOString(),
                batch: [ {
                  event: e.data.event,
                  properties: e.data.properties,
                  type: 'track',
                  messageId: uuid(),
                  timestamp: now.toISOString(),
                  context: {
                    ip: '0.0.0.0',
                    page: {
                      path: '/',
                      referrer: '',
                      search: '',
                      title: '',
                      url: 'http://'
                    }
                  },
                  integrations: {},
                  userId: e.data.aid
                } ]
              };

          xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
              postToParent({
                id: frameHash,
                message: 'xhr sent'
              });
              window.onDidReceiveMessage = null;
            }
          };

          xhr.open('POST', 'https://metrics.articulate.com/v1/import');
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.send(JSON.stringify(data));
        }
      };

      if ('onmessage' in window) {
        window.addEventListener('message', onDidReceiveMessage, false);
      } else {
        // coming from flash, we will use older JS since we can expect some older IE versions
        var validProps = [
          'os', 'browser', 'playerVersion', 'playerType', 'lmsPresent', 'tinCanPresent',
          'aoSupport', 'publishSource', 'protocol', 'productChannel', 'cid'
        ];
        var aid,
            props = window.location.search.replace(/^\?/, '').split('&'),
            config = {};

        for (var i = 0, ii = props.length, currProp; i < ii; i++) {
          currProp = props[i].split('=');
          if (validProps.indexOf(currProp[0]) > -1 && currProp.length === 2) {
            config[currProp[0]] = currProp[1];
          } else if (currProp[0] === 'aid') {
            aid = currProp[1];
          }
        }

        window.onDidReceiveMessage({
          data: {
            id: frameHash,
            event: 'player_course_load',
            properties: config,
            aid: aid
          }
        })

      }
      /* jshint ignore:end */
      // jscs:enable
    </script>
  </head>
  <body>
  </body>
  <script>
    postToParent({
      id: window.frameHash,
      message: 'loaded'
    });
  </script>
</html>
