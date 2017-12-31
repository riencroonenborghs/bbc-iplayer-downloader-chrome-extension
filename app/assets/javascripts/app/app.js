var app, debug, port, server;

app = angular.module("bbc-iplayer-downloader", ["ng-token-auth", "ngAria", "ngAnimate", "ngMaterial", "ngMdIcons", "bbc-iplayer-downloader.controllers", "bbc-iplayer-downloader.factories"]);

app.constant("ICONS", {
  queued: "cloud",
  started: "cloud_download",
  finished: "done",
  error: "error",
  cancelled: "cloud_off"
});

debug = true;

app.config(function($mdThemingProvider) {
  return $mdThemingProvider.theme("default").primaryPalette("pink").accentPalette("orange");
});

app.service("Logging", [
  function() {
    return {
      debug: function(message) {
        if (debug) {
          return console.debug(message);
        }
      }
    };
  }
]);

server = "iplayer.croonenborghs.net";

port = 80;

app.config(function($authProvider) {
  return $authProvider.configure({
    apiUrl: "http://" + server + ":" + port
  });
});
