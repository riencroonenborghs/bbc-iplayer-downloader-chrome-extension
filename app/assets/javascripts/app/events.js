var options;

options = {
  title: "Queue in BBC iPlayer Downloader",
  contexts: ["link"],
  id: "BBC-iPlayer-Downloader"
};

chrome.contextMenus.remove(options.id);

chrome.contextMenus.create(options);

chrome.contextMenus.onClicked.addListener(function(info, tab) {
  if (tab) {
    angular.element("body").scope().Server.service.post({
      url: info.linkUrl
    });
    return alert("BBC iPlayer Queued " + info.linkUrl);
  }
});
