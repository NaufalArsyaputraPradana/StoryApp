import { AuthModel } from '../../models/auth-model.js';
import { RegisterPresenter } from './register-presenter.js';

class RegisterPage {
  constructor() {
    this._model = new AuthModel();
    this._presenter = null;
  }

  async render() {
    return `
      <section class="register-page page-transition">
        <div class="form-container">
          <h2 class="form-title"><i class="fas fa-user-plus"></i> Daftar Akun Baru</h2>
          <div id="alert-container"></div>
          <form id="register-form" autocomplete="on">
            <div class="form-group">
              <label for="name" class="form-label">Nama</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                class="form-input"
                required
                placeholder="Masukkan nama Anda"
                autocomplete="name"
              >
            </div>
            <div class="form-group">
              <label for="email" class="form-label">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                class="form-input"
                required
                placeholder="Masukkan email Anda"
                autocomplete="email"
              >
            </div>
            <div class="form-group">
              <label for="password" class="form-label">Password</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                class="form-input"
                required
                placeholder="Masukkan password"
                minlength="8"
                autocomplete="new-password"
              >
              <small>Password minimal 8 karakter</small>
            </div>
            <div class="form-group">
              <label for="confirmPassword" class="form-label">Konfirmasi Password</label>
              <input 
                type="password" 
                id="confirmPassword" 
                name="confirmPassword" 
                class="form-input"
                required
                placeholder="Konfirmasi password Anda"
                minlength="8"
                autocomplete="new-password"
              >
            </div>
            <button type="submit" class="btn btn-block btn-primary">
              <i class="fas fa-user-plus"></i> Daftar
            </button>
          </form>
          <div class="form-footer">
            <p>Sudah memiliki akun? <a href="#/login">Login Sekarang</a></p>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this._presenter = new RegisterPresenter(this._model, this);
    const registerForm = document.getElementById('register-form');
    if (!registerForm) return;
    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      await this._presenter.register(name, email, password, confirmPassword);
    });
  }

  showLoading() {
    const submitButton = document.querySelector('#register-form button[type="submit"]');
    if (submitButton) {
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
      submitButton.disabled = true;
    }
  }

  hideLoading() {
    const submitButton = document.querySelector('#register-form button[type="submit"]');
    if (submitButton) {
      submitButton.innerHTML = '<i class="fas fa-user-plus"></i> Daftar';
      submitButton.disabled = false;
    }
  }

  showAlert(message, type = 'danger') {
    const alertContainer = document.getElementById('alert-container');
    if (alertContainer) {
      alertContainer.innerHTML = `
        <div class="alert alert-${type}">
          ${type === 'success' ? '<i class="fas fa-check-circle"></i>' : '<i class="fas fa-exclamation-circle"></i>'}
          ${message}
        </div>
      `;
      alertContainer.scrollIntoView({ behavior: 'smooth' });
    }
  }

  clearAlert() {
    const alertContainer = document.getElementById('alert-container');
    if (alertContainer) alertContainer.innerHTML = '';
  }
}

export { RegisterPage };