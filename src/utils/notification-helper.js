class NotificationHelper {
  /**
   * Show a native notification via Service Worker.
   * Only shows notification if tab is not focused (to avoid double notification with toast).
   * Uses a tag to prevent spam (replace previous notification with same tag).
   * @param {string} title
   * @param {object} options
   * @returns {Promise<boolean>}
   */
  static async showNotification(title, options = {}) {
    if (!('Notification' in window)) {
      console.warn('Browser tidak mendukung notifikasi');
      return false;
    }

    // Only request permission if not already granted/denied
    let permission = Notification.permission;
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }
    if (permission !== 'granted') {
      console.warn('Izin notifikasi tidak diberikan');
      return false;
    }

    // Prevent notification spam: use a unique tag for each logical event
    const tag = options.tag || 'storyapp-add-story';
    options.tag = tag;

    // Only show notification if tab is not focused (background)
    if (!document.hasFocus()) {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        // Close previous notifications with the same tag (if any)
        if (registration.getNotifications) {
          const existing = await registration.getNotifications({ tag, includeTriggered: true });
          existing.forEach(n => n.close());
        }
        await registration.showNotification(title, {
          badge: '/icons/badge-96x96.png',
          icon: '/icons/icon-192x192.png',
          vibrate: [200, 100, 200],
          ...options
        });
      } else {
        new Notification(title, {
          badge: '/icons/badge-96x96.png',
          icon: '/icons/icon-192x192.png',
          vibrate: [200, 100, 200],
          ...options
        });
      }
    }
    return true;
  }

  /**
   * Show a custom toast notification in the UI.
   * Always shows toast, regardless of tab focus.
   * @param {string} message
   * @param {'success'|'error'|'warning'|'info'} type
   */
  static showToast(message, type = 'info') {
    // Remove existing toast if any
    const oldToast = document.querySelector('.toast.show');
    if (oldToast) oldToast.remove();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-icon">
        <i class="fas fa-${this.getIconForType(type)}"></i>
      </div>
      <div class="toast-message">${message}</div>
    `;

    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  static getIconForType(type) {
    const icons = {
      success: 'check-circle',
      error: 'exclamation-circle',
      warning: 'exclamation-triangle',
      info: 'info-circle'
    };
    return icons[type] || 'info-circle';
  }

  // --- Push Subscription & Permission Helpers ---

  static async registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      console.log('Service Worker tidak didukung di browser ini');
      return null;
    }
    try {
      const registration = await navigator.serviceWorker.register('./sw.js', { scope: './' });
      console.log('Service Worker berhasil didaftarkan', registration);
      return registration;
    } catch (error) {
      console.error('Registrasi Service Worker gagal:', error);
      return null;
    }
  }

  static async requestPermission() {
    if (!('Notification' in window)) {
      console.log('Browser tidak mendukung notifikasi');
      return false;
    }
    const result = await Notification.requestPermission();
    if (result === 'denied') {
      console.log('Fitur notifikasi tidak diizinkan');
      return false;
    }
    if (result === 'default') {
      console.log('Pengguna menutup kotak dialog permintaan izin');
      return false;
    }
    return true;
  }

  static async getVapidPublicKey() {
    return 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';
  }

  static async subscribePushNotification(registration) {
    if (!registration.active) {
      console.error('Service Worker tidak aktif');
      return;
    }
    const vapidPublicKey = await this.getVapidPublicKey();
    const convertedVapidKey = this._urlBase64ToUint8Array(vapidPublicKey);

    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      });

      console.log('Berhasil melakukan subscribe dengan endpoint:', subscription.endpoint);
      await this._sendSubscriptionToServer(subscription);
      return subscription;
    } catch (error) {
      console.error('Gagal melakukan subscribe:', error);
      return null;
    }
  }

  static async _sendSubscriptionToServer(subscription) {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('User perlu login untuk menerima notifikasi');
      return;
    }
    try {
      const response = await fetch('https://story-api.dicoding.dev/v1/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.getKey('p256dh'),
            auth: subscription.getKey('auth'),
          },
        }),
      });

      const responseJson = await response.json();

      if (!response.ok || responseJson.error) {
        throw new Error(responseJson.message || 'Subscription failed');
      }

      console.log('Subscription berhasil dikirim ke server:', responseJson);
    } catch (error) {
      console.error('Gagal mengirim subscription ke server:', error);
    }
  }

  static _urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; i++) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }
}

export { NotificationHelper };
