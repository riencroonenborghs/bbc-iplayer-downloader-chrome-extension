app = angular.module "bbc-iplayer-downloader.factories", []

app.factory "Server", [ "$q", "$http", ($q, $http) ->
  service:
    toString: -> "http://#{@server}:#{@port}"
    server: server
    port: port
    build: (path) ->
      "http://#{@server}:#{@port}#{path}"
    post: (model) ->
      deferred = $q.defer()
      data = {download: model}
      $http
        method: "POST"
        url: @build("/api/v1/downloads.json")
        data: data
      .then () ->
        deferred.resolve()
        return
      , (message) ->      
        deferred.reject(message.data.error)
        return
      deferred.promise
] 