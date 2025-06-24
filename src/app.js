import { routes } from './routes/routes.js';
import { UrlParser } from './utils/url-parser.js';
import { AuthHelper } from './utils/auth-helper.js';
import { IdbHelper } from './utils/idb-helper.js';
import { NotificationHelper } from './utils/notification-helper.js';
import { NetworkStatus } from './utils/network-status.js';
import { PwaInstaller } from './utils/pwa-installer.js';
import './components/loader.js';

window.selectedStoryId = null;

class App {
  constructor() {
    this._currentPage = null;
    this._initializeApp();
  }

  async _initializeApp() {
    console.log('Initializing app...');
    await this._initIndexedDB();
    await this._initServiceWorker();
    NetworkStatus.init();
    PwaInstaller.init();
    await this._subscribeToPushNotification();

    this._handleRoute();

    window.addEventListener('hashchange', () => {
      this._cleanupCurrentPage();
      this._handleRoute();
    });

    window.addEventListener('beforeunload', () => {
      this._cleanupCurrentPage();
    });

    document.addEventListener('click', (event) => {
      // SPA navigation with View Transition API support
      if (event.target.tagName === 'A' && event.target.href.includes('#/')) {
        if (document.startViewTransition) {
          event.preventDefault();
          document.startViewTransition(() => {
            window.location.href = event.target.href;
          });
        }
      }
    });
  }

  async _initServiceWorker() {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('./sw.js', { scope: './' });
        console.log('Service Worker registered successfully:', registration);

        registration.addEventListener('updatefound', () => {
          console.log('New service worker found, updating...');
        });

        if (AuthHelper.isLoggedIn()) {
          const permission = await NotificationHelper.requestPermission();
          if (permission && registration) {
            await NotificationHelper.subscribePushNotification(registration);
          }
        }
        return registration;
      }
      console.warn('Service Worker not supported');
      return null;
    } catch (error) {
      console.error('Error initializing service worker:', error);
      return null;
    }
  }

  async _initIndexedDB() {
    try {
      await IdbHelper.openDB();
      console.log('IndexedDB initialized successfully');
    } catch (error) {
      console.error('Failed to initialize IndexedDB:', error);
    }
  }

  _checkAuthStatus() {
    const isLoggedIn = AuthHelper.isLoggedIn();
    const loginMenuItem = document.getElementById('login-menu');
    const registerMenuItem = document.getElementById('register-menu');
    const logoutMenuItem = document.getElementById('logout-menu');
    // Jangan tampilkan warning jika menu belum ada, cukup return
    if (!loginMenuItem || !registerMenuItem || !logoutMenuItem) {
      return;
    }

    if (isLoggedIn) {
      loginMenuItem.classList.add('hidden');
      registerMenuItem.classList.add('hidden');
      logoutMenuItem.classList.remove('hidden');
      this._subscribeToPushNotification();
    } else {
      loginMenuItem.classList.remove('hidden');
      registerMenuItem.classList.remove('hidden');
      logoutMenuItem.classList.add('hidden');
    }

    logoutMenuItem.addEventListener('click', (event) => {
      event.preventDefault();
      this._handleLogout();
    });
  }

  async _subscribeToPushNotification() {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const permission = await NotificationHelper.requestPermission();
        if (permission && registration) {
          await NotificationHelper.subscribePushNotification(registration);
        }
      }
    } catch (error) {
      console.error('Error subscribing to push notification:', error);
    }
  }

  async _handleLogout() {
    this._cleanupCurrentPage();
    AuthHelper.logout();
    try {
      await IdbHelper.clearStories();
      console.log('Stories cleared from IndexedDB after logout');
    } catch (error) {
      console.error('Error clearing stories from IndexedDB:', error);
    }
    window.location.href = '#/';
    window.location.reload();
  }

  _cleanupCurrentPage() {
    if (this._currentPage && typeof this._currentPage.beforeUnload === 'function') {
      this._currentPage.beforeUnload();
      this._currentPage = null;
    }
  }

  async _handleRoute() {
    this._cleanupCurrentPage();
    // Support for #/detail/:id
    const urlParts = window.location.hash.slice(1).split('/');
    if (urlParts.length > 2 && urlParts[1] === 'detail') {
      window.selectedStoryId = urlParts[2];
      window.history.replaceState(null, null, '#/detail');
    }
    const url = UrlParser.parseActiveUrlWithCombiner();
    let page;
    if (routes[url]) {
      page = routes[url];
    } else {
      page = routes['/404'];
    }
    try {
      // Redirect if already logged in or not allowed
      if ((url === '/login' || url === '/register') && AuthHelper.isLoggedIn()) {
        window.location.href = '#/';
        return;
      }
      if ((url === '/add' || url === '/map' || url === '/favorites') && !AuthHelper.isLoggedIn()) {
        window.location.href = '#/login';
        return;
      }
      const contentContainer = document.querySelector('#content');
      if (!contentContainer) {
        console.error('Content container not found');
        return;
      }
      contentContainer.innerHTML = '';
      this._currentPage = new page.view();
      const content = await this._currentPage.render();
      contentContainer.innerHTML = content;
      await this._currentPage.afterRender();
      // Aksesibilitas: fokus ke konten utama
      document.getElementById('main-content')?.focus();
    } catch (error) {
      console.error('Error rendering page:', error);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
