import { AuthHelper } from '../../utils/auth-helper.js';

class LoginPresenter {
  constructor(model, view) {
    this._model = model;
    this._view = view;
  }

  async login(email, password) {
    try {
      this._view.clearAlert();
      this._view.showLoading();

      if (!email || !password) throw new Error('Email dan password harus diisi');
      if (password.length < 8) throw new Error('Password minimal 8 karakter');

      const loginResult = await this._model.login(email, password);
      // Pastikan token dari backend disimpan ke field 'token'
      AuthHelper.setUserData({
        ...loginResult,
        token: loginResult.token || loginResult.accessToken || loginResult.idToken
      });

      this._view.showAlert('Login berhasil! Mengalihkan...', 'success');
      setTimeout(() => {
        window.location.href = '#/';
        window.location.reload();
      }, 1200);
    } catch (error) {
      this._view.hideLoading();
      this._view.showAlert(error.message);
    }
  }
}

export { LoginPresenter };