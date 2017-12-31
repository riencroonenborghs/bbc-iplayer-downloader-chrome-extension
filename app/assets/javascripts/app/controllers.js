var app;

app = angular.module("bbc-iplayer-downloader.controllers", []);

app.controller("authController", [
  "$scope", "$rootScope", "Server", "$auth", "Logging", "$mdDialog", function($scope, $rootScope, Server, $auth, Logging, $mdDialog) {
    $scope.model = {
      email: "",
      password: ""
    };
    return $scope.logIn = function() {
      $scope.error = "";
      return $auth.submitLogin($scope.model).then(function(d) {
        $mdDialog.hide();
        $rootScope.$broadcast("reload");
        return $rootScope.$emit("reload");
      })["catch"](function(d) {
        return $scope.error = d.errors.join(", ");
      });
    };
  }
]);

app.controller("appController", [
  "$scope", "$rootScope", "$mdMedia", "$http", "$mdDialog", "Server", "Logging", "$auth", "ICONS", function($scope, $rootScope, $mdMedia, $http, $mdDialog, Server, Logging, $auth, ICONS) {
    var deleteDownload, icon, label, parseInitials;
    $scope.tabs = (function() {
      var results;
      results = [];
      for (label in ICONS) {
        icon = ICONS[label];
        results.push({
          title: label,
          icon: icon
        });
      }
      return results;
    })();
    $scope.tabStatuses = Object.keys(ICONS);
    $scope.Server = Server;
    $scope.path = "Authenticate";
    $scope.user = null;
    parseInitials = function() {
      var initials, split;
      initials = (function() {
        var i, len, ref, results;
        ref = $scope.user.email.split(/@/);
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          split = ref[i];
          results.push(split[0].toUpperCase());
        }
        return results;
      })();
      return $scope.user.initials = initials.slice(0, 2).join("");
    };
    $auth.validateUser().then(function(data) {
      $scope.user = data;
      parseInitials();
      return $scope.getDownloads();
    }, function() {
      return $mdDialog.show({
        templateUrl: "/app/views/sessions/new.html",
        controller: "authController",
        clickOutsideToClose: false
      });
    });
    $scope.logOut = function() {
      return $auth.signOut().then(function() {
        $scope.downloads = [];
        $scope.user = null;
        return $mdDialog.show({
          templateUrl: "/app/views/sessions/new.html",
          controller: "authController",
          clickOutsideToClose: false
        });
      });
    };
    $rootScope.$on("auth:login-success", function(ev, user) {
      $scope.user = user;
      return parseInitials();
    });
    $rootScope.$on("reload", function() {
      return $scope.getDownloads();
    });
    $scope.getDownloads = function() {
      $scope.downloads = false;
      $scope.path = "Downloads";
      return $http({
        method: "GET",
        url: Server.service.build("/api/v1/downloads.json"),
        dataType: "jsonp"
      }).then(function(data) {
        var i, item, len, name, newData, ref;
        newData = {};
        ref = data.data.items;
        for (i = 0, len = ref.length; i < len; i++) {
          item = ref[i];
          item.visible = false;
          item.icon = ICONS[item.status];
          item.hasPointer = item.status !== "initial" && item.status !== "queued";
          item.canDelete = item.status !== "started" && item.status !== "queued";
          item.canCancel = item.status === "queued";
          item.canQueue = item.status === "initial" || item.status === "finished" || item.status === "error" || item.status === "cancelled";
          newData[name = item.status] || (newData[name] = []);
          newData[item.status].push(item);
        }
        return $scope.downloads = newData;
      });
    };
    $scope.newDownload = function($event) {
      $scope.path = "New Download";
      return $mdDialog.show({
        templateUrl: "/app/views/downloads/new.html",
        controller: "DialogController",
        clickOutsideToClose: false
      }).then(function() {
        return $scope.getDownloads();
      });
    };
    $scope.deleteDownload = function(download, $event) {
      var confirm;
      $scope.path = "Delete Download";
      confirm = $mdDialog.confirm().title("Delete Download").content("Are you sure you want to delete '" + download.url + "'?").ok("BE GONE WITH IT!").cancel("No").targetEvent($event);
      return $mdDialog.show(confirm).then((function() {
        return deleteDownload(download);
      }), function() {
        return $scope.getDownloads();
      });
    };
    deleteDownload = function(download) {
      if (!download.canDelete) {
        return;
      }
      return $http({
        method: "DELETE",
        url: Server.service.build("/api/v1/downloads/" + download.id),
        dataType: "jsonp"
      }).then(function() {
        return $scope.getDownloads();
      });
    };
    $scope.cancelDownload = function(download) {
      if (!download.canCancel) {
        return;
      }
      return $http({
        method: "PUT",
        url: Server.service.build("/api/v1/downloads/" + download.id + "/cancel"),
        dataType: "jsonp"
      }).then(function() {
        return $scope.getDownloads();
      });
    };
    return $scope.queueDownload = function(download) {
      if (!download.canQueue) {
        return;
      }
      return $http({
        method: "PUT",
        url: Server.service.build("/api/v1/downloads/" + download.id + "/queue"),
        dataType: "jsonp"
      }).then(function() {
        return $scope.getDownloads();
      });
    };
  }
]);

app.controller("DialogController", [
  "$scope", "$rootScope", "$mdDialog", "$http", "Server", "Logging", function($scope, $rootScope, $mdDialog, $http, Server, Logging) {
    $scope.model = {
      url: ""
    };
    $scope.forms = {};
    $scope.error = null;
    $scope.save = function() {
      Logging.debug("post");
      return Server.service.post($scope.model).then(function() {
        $rootScope.$broadcast("reload");
        $rootScope.$emit("reload");
        $mdDialog.hide();
      }, function(message) {
        $scope.error = message;
      });
    };
    return $scope.close = function() {
      return $mdDialog.hide();
    };
  }
]);
