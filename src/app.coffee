app = angular.module "bbc-iplayer-downloader", [
  "ng-token-auth",
  "ngAria", 
  "ngAnimate", 
  "ngMaterial", 
  "ngMdIcons",
  "bbc-iplayer-downloader.controllers",
  "bbc-iplayer-downloader.factories"
]

app.constant "ICONS",
  # initial: "cloud_circle"
  queued: "cloud"
  started: "cloud_download"
  finished: "done"
  error: "error"
  cancelled: "cloud_off"
debug = true

app.config ($mdThemingProvider) ->
  $mdThemingProvider.theme("default")
    .primaryPalette("pink")
    .accentPalette("orange")

app.service "Logging", [->
  debug: (message) ->
    console.debug message if debug
]

server = "iplayer.croonenborghs.net"
port = 80

app.config ($authProvider) ->
  $authProvider.configure
    apiUrl: "http://#{server}:#{port}"


