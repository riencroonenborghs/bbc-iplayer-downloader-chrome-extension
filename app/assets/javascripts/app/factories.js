var app;

app = angular.module("bbc-iplayer-downloader.factories", []);

app.factory("Server", [
  "$q", "$http", function($q, $http) {
    return {
      service: {
        toString: function() {
          return "http://" + this.server + ":" + this.port;
        },
        server: server,
        port: port,
        build: function(path) {
          return "http://" + this.server + ":" + this.port + path;
        },
        post: function(model) {
          var data, deferred;
          deferred = $q.defer();
          data = {
            download: model
          };
          $http({
            method: "POST",
            url: this.build("/api/v1/downloads.json"),
            data: data
          }).then(function() {
            deferred.resolve();
          }, function(message) {
            deferred.reject(message.data.error);
          });
          return deferred.promise;
        }
      }
    };
  }
]);
