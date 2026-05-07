// This event fires every time the page appears (even from the back cache)
window.addEventListener('pageshow', function (event) {
  // 'event.persisted' is true if the page was loaded from the Back-Forward Cache
  var historyTraversal =
    event.persisted ||
    (typeof window.performance != 'undefined' &&
      window.performance.navigation.type === 2);

  if (historyTraversal) {
    // Force a reload. The server will then check the cookie,
    // see it's missing, and redirect to login.
    window.location.reload();
  }
});
