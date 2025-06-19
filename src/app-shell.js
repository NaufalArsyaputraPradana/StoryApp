import Swal from 'sweetalert2';
import { Sidebar, bindSidebarEvents } from './components/sidebar.js';
import { Footer } from './components/footer.js';

/**
 * AppShell: Handles rendering of the main app shell (sidebar & footer)
 * and provides global toast/alert helpers.
 */
class AppShell {
  /**
   * Initialize the app shell with user info.
   * @param {string} user - The current user's name (optional).
   */
  static init(user) {
    // Render Sidebar and Footer
    const navbarContainer = document.getElementById('navbar-container');
    const footerContainer = document.getElementById('footer-container');
    if (navbarContainer) {
      navbarContainer.innerHTML = Sidebar({ user });
      bindSidebarEvents();
    }
    if (footerContainer) {
      footerContainer.innerHTML = Footer();
    }
    // Animate sidebar and footer for better UX
    AppShell._animateShell();
  }

  /**
   * Animate the sidebar and footer for a smooth entrance.
   */
  static _animateShell() {
    const navbar = document.getElementById('navbar-container');
    const footer = document.getElementById('footer-container');
    if (navbar) {
      navbar.style.opacity = '0';
      navbar.style.transform = 'translateY(-20px)';
      setTimeout(() => {
        navbar.style.transition = 'opacity 0.4s, transform 0.4s';
        navbar.style.opacity = '1';
        navbar.style.transform = 'translateY(0)';
      }, 100);
    }
    if (footer) {
      footer.style.opacity = '0';
      footer.style.transform = 'translateY(20px)';
      setTimeout(() => {
        footer.style.transition = 'opacity 0.4s, transform 0.4s';
        footer.style.opacity = '1';
        footer.style.transform = 'translateY(0)';
      }, 200);
    }
  }

  /**
   * Show a validation error toast using SweetAlert2.
   * @param {string} msg - The error message.
   */
  static showValidationError(msg) {
    Swal.fire({
      icon: 'error',
      title: 'Validasi Gagal',
      text: msg,
      toast: true,
      position: 'top-end',
      timer: 3000,
      showConfirmButton: false,
      customClass: {
        popup: 'toast show',
      },
    });
  }

  /**
   * Show a success toast using SweetAlert2.
   * @param {string} msg - The success message.
   */
  static showSuccessToast(msg) {
    Swal.fire({
      icon: 'success',
      title: msg,
      toast: true,
      position: 'top-end',
      timer: 2000,
      showConfirmButton: false,
      customClass: {
        popup: 'toast show',
      },
    });
  }

  /**
   * Hide the PWA install banner.
   */
  static hideInstallBanner() {
    const banner = document.getElementById('pwa-install-banner');
    if (banner) {
      banner.classList.remove('show');
      banner.classList.add('hide');
      setTimeout(() => banner.classList.remove('hide'), 400);
    }
  }
}

// Hide loader on shell init
const loader = document.querySelector('app-loader');
if (loader) {
  loader.removeAttribute('fullscreen');
  loader.hide();
}

export { AppShell };