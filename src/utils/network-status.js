export class NetworkStatus {
  static init() {
    this._createOfflineIndicator();
    this._setupNetworkListeners();
    this._updateOfflineStatus(!navigator.onLine);
  }

  static _setupNetworkListeners() {
    window.addEventListener('online', () => {
      this._updateOfflineStatus(false);
      this._showToast('Anda kembali online', 'success');
    });

    window.addEventListener('offline', () => {
      this._updateOfflineStatus(true);
      this._showToast('Anda sedang offline. Beberapa fitur mungkin terbatas.', 'warning');
    });
  }

  static _createOfflineIndicator() {
    if (!document.getElementById('offline-indicator')) {
      const offlineIndicator = document.createElement('div');
      offlineIndicator.id = 'offline-indicator';
      offlineIndicator.className = 'offline-indicator';
      offlineIndicator.innerHTML = `
        <i class="fas fa-wifi"></i>
        <span>Anda sedang offline. Beberapa fitur mungkin terbatas.</span>
      `;
      document.body.insertBefore(offlineIndicator, document.body.firstChild);
    }
  }

  static _updateOfflineStatus(isOffline) {
    const offlineIndicator = document.getElementById('offline-indicator');
    if (offlineIndicator) {
      if (isOffline) {
        offlineIndicator.classList.add('show');
        clearTimeout(this._offlineTimeout);
        this._offlineTimeout = setTimeout(() => {
          offlineIndicator.classList.remove('show');
        }, 4000);
      } else {
        offlineIndicator.classList.remove('show');
        clearTimeout(this._offlineTimeout);
      }
    }
  }

  static _showToast(message, type = 'info') {
    let toast = document.getElementById('network-toast');
    if (toast) {
      toast.remove();
    }

    toast = document.createElement('div');
    toast.id = 'network-toast';
    toast.className = `network-toast ${type}`;
    toast.innerHTML = `
      <span class="toast-icon">
        ${type === 'success' ? '<i class="fas fa-signal"></i>' : '<i class="fas fa-exclamation-triangle"></i>'}
      </span>
      <span class="toast-message">${message}</span>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('hide');
      setTimeout(() => toast.remove(), 400);
    }, 3000);
  }

  static isOnline() {
    return navigator.onLine;
  }
}