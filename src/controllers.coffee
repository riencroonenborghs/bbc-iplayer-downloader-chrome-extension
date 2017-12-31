app = angular.module "bbc-iplayer-downloader.controllers", []

app.controller "authController", ["$scope", "$rootScope", "Server", "$auth", "Logging", "$mdDialog",
($scope, $rootScope, Server, $auth, Logging, $mdDialog) ->
  $scope.model = {email: "", password: ""}
  $scope.logIn = ->
    $scope.error = ""
    $auth.submitLogin($scope.model).then (d) -> 
      $mdDialog.hide()
      $rootScope.$broadcast("reload")
      $rootScope.$emit("reload")
    .catch (d) -> $scope.error = d.errors.join(", ")
]

app.controller "appController", ["$scope", "$rootScope", "$mdMedia", "$http", "$mdDialog", "Server", "Logging", "$auth", "ICONS",
($scope, $rootScope, $mdMedia, $http, $mdDialog, Server, Logging, $auth, ICONS) ->
  $scope.tabs = for label, icon of ICONS
    {title: label, icon: icon}
  $scope.tabStatuses = Object.keys(ICONS)

  $scope.Server = Server
  # ---------- authentication ----------
  $scope.path = "Authenticate"
  $scope.user = null
  parseInitials = ->
    initials = for split in $scope.user.email.split(/@/)
      split[0].toUpperCase()
    $scope.user.initials = initials.slice(0,2).join("")
  $auth.validateUser().then (data) ->
    $scope.user = data
    parseInitials()
    $scope.getDownloads()
  , () ->
    $mdDialog.show
      templateUrl: "/app/views/sessions/new.html"
      controller: "authController"
      clickOutsideToClose: false
  $scope.logOut = ->
    $auth.signOut().then ->
      $scope.downloads = []
      $scope.user = null
      $mdDialog.show
        templateUrl: "/app/views/sessions/new.html"
        controller: "authController"
        clickOutsideToClose: false
  $rootScope.$on "auth:login-success", (ev, user) ->
    $scope.user = user
    parseInitials()

  # ---------- downloads CRUD ----------
  $rootScope.$on "reload", () ->
    $scope.getDownloads()
  $scope.getDownloads = ->    
    $scope.downloads = false
    $scope.path = "Downloads"
    $http
      method: "GET"
      url: Server.service.build("/api/v1/downloads.json")
      dataType: "jsonp"
    .then (data) ->
      newData = {}
      for item in data.data.items
        item.visible = false
        item.icon = ICONS[item.status]
        item.hasPointer = (item.status != "initial" && item.status != "queued")
        item.canDelete = (item.status != "started" && item.status != "queued")
        item.canCancel = (item.status == "queued")
        item.canQueue = (item.status == "initial" || item.status == "finished" || item.status == "error" || item.status == "cancelled")
        newData[item.status] ||= []
        newData[item.status].push item
      $scope.downloads = newData

  $scope.newDownload = ($event) ->
    $scope.path = "New Download"
    $mdDialog.show
      templateUrl: "/app/views/downloads/new.html"
      controller: "DialogController"
      clickOutsideToClose: false
    .then ->
      $scope.getDownloads()

  $scope.deleteDownload = (download, $event) ->
    $scope.path = "Delete Download"
    confirm = $mdDialog.confirm()
      .title("Delete Download")
      .content("Are you sure you want to delete '#{download.url}'?")
      .ok("BE GONE WITH IT!")
      .cancel("No")
      .targetEvent($event)
    $mdDialog.show(confirm).then (() -> deleteDownload(download)), () -> $scope.getDownloads()
  
  deleteDownload = (download) ->
    return unless download.canDelete
    $http
      method: "DELETE"
      url: Server.service.build("/api/v1/downloads/#{download.id}")
      dataType: "jsonp"
    .then () -> $scope.getDownloads()

  $scope.cancelDownload = (download) ->
    return unless download.canCancel
    $http
      method: "PUT"
      url: Server.service.build("/api/v1/downloads/#{download.id}/cancel")
      dataType: "jsonp"
    .then () -> $scope.getDownloads()

  $scope.queueDownload = (download) ->
    return unless download.canQueue
    $http
      method: "PUT"
      url: Server.service.build("/api/v1/downloads/#{download.id}/queue")
      dataType: "jsonp"
    .then () -> $scope.getDownloads()
]

app.controller "DialogController", ["$scope", "$rootScope", "$mdDialog", "$http", "Server", "Logging",
($scope, $rootScope, $mdDialog, $http, Server, Logging) ->
  $scope.model = {url: ""}
  $scope.forms = {}
  $scope.error = null
  $scope.save = () ->
    Logging.debug "post"
    Server.service.post($scope.model)
    .then () ->
      $rootScope.$broadcast("reload")
      $rootScope.$emit("reload")
      $mdDialog.hide()
      return
    , (message) ->
      $scope.error = message
      return
  $scope.close = -> $mdDialog.hide()
]