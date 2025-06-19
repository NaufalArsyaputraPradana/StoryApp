export function Footer() {
  return `
    <footer class="app-shell-footer">
      <div class="footer-content">
        <div class="footer-main">
          <div class="footer-brand">
            <img src="/note.png" alt="Logo StoryApp" class="footer-logo" />
            <h3 class="footer-title">StoryApp</h3>
            <p class="footer-tagline">Berbagi cerita dengan komunitas</p>
          </div>
          <nav class="footer-links" aria-label="Footer Navigation">
            <div class="link-group">
              <h4>Navigasi</h4>
              <a href="#/">Beranda</a>
              <a href="#/map">Peta Cerita</a>
              <a href="#/about">Tentang Kami</a>
            </div>
            <div class="link-group">
              <h4>Akun</h4>
              <a href="#/login">Login</a>
              <a href="#/register">Daftar</a>
              <a href="#/favorites">Favorit</a>
            </div>
          </nav>
        </div>
        <div class="footer-bottom">
          <div class="footer-divider"></div>
          <div class="footer-meta">
            <span>© ${new Date().getFullYear()} <b>StoryApp</b> &mdash; Naufal Arsyaputra Pradana</span>
            <div class="social-links">
              <a href="https://github.com/NaufalArsyaputraPradana/" target="_blank" aria-label="GitHub"><i class="fab fa-github"></i></a>
          <a href="https://www.linkedin.com/in/naufalarsyaputrapradana/" target="_blank" aria-label="LinkedIn"><i class="fab fa-linkedin"></i></a>
          <a href="https://www.instagram.com/arsya.pradana_/" target="_blank" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  `;
}