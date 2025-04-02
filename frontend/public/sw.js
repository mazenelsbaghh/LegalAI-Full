// Service Worker for Push Notifications
self.addEventListener('push', function(event) {
  const data = event.data.json();
  
  const options = {
    body: data.message,
    icon: '/notification-icon.png',
    badge: '/notification-badge.png',
    data: data.metadata,
    actions: [
      {
        action: 'view',
        title: 'عرض'
      },
      {
        action: 'close',
        title: 'إغلاق'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  if (event.action === 'view') {
    const urlToOpen = new URL(event.notification.data.url, self.location.origin);

    event.waitUntil(
      clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      })
      .then((windowClients) => {
        // Check if there is already a window/tab open with the target URL
        for (var i = 0; i < windowClients.length; i++) {
          var client = windowClients[i];
          if (client.url === urlToOpen.href && 'focus' in client) {
            return client.focus();
          }
        }
        // If no window/tab is already open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen.href);
        }
      })
    );
  }
});