export class Loader extends HTMLElement {
  constructor() {
    super();
    this.message = 'Loading...';
    this._timeout = null;
    this._isVisible = false;
  }

  static get observedAttributes() {
    return ['message'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'message' && oldValue !== newValue) {
      this.message = newValue;
      this.renderMessage();
    }
  }

  connectedCallback() {
    this.render();
    this.hide();
  }

  show(message = '', withTimeout = 0) {
    if (message) {
      this.message = message;
      this.renderMessage();
    }
    this.style.display = 'flex';
    this._isVisible = true;
    this.setAttribute('aria-busy', 'true');
    if (withTimeout > 0) {
      clearTimeout(this._timeout);
      this._timeout = setTimeout(() => this.hide(), withTimeout);
    }
  }

  hide() {
    this.style.display = 'none';
    this._isVisible = false;
    this.setAttribute('aria-busy', 'false');
    clearTimeout(this._timeout);
  }

  render() {
    this.innerHTML = `
      <div class="loading-spinner" aria-live="polite" aria-busy="true">
        <div class="spinner"></div>
        <p class="loading-message">${this.message}</p>
      </div>
    `;
    this.style.display = 'none';
    this.style.justifyContent = 'center';
    this.style.alignItems = 'center';
    this.style.width = '100%';
    this.style.minHeight = '120px';
    this.style.background = 'rgba(255,255,255,0.85)';
    this.style.position = 'relative';
    this.style.zIndex = '100';
  }

  renderMessage() {
    const messageElement = this.querySelector('.loading-message');
    if (messageElement) {
      messageElement.textContent = this.message;
    }
  }
}

customElements.define('app-loader', Loader);
