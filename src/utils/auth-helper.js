export class AuthHelper {
  static getUserData() {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }

  static getToken() {
    const userData = localStorage.getItem('userData');
    if (!userData) return null;
    try {
      const user = JSON.parse(userData);
      return user.token || user.accessToken || user.idToken || null;
    } catch {
      return null;
    }
  }

  static setUserData(data) {
    localStorage.setItem('userData', JSON.stringify(data));
  }

  static getUserId() {
    const userData = this.getUserData();
    return userData ? userData.userId : null;
  }

  static getUserName() {
    const userData = this.getUserData();
    return userData ? userData.name : null;
  }

  static isLoggedIn() {
    return !!this.getToken();
  }

  static logout() {
    localStorage.removeItem('userData');
  }
}