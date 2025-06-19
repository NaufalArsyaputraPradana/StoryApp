import '../../components/footer';
import '../../components/loader';
import '../../components/sidebar';

export default class AboutPage {
  async render() {
    document.title = 'About - Dicoding Story';
    return `
      <app-sidebar></app-sidebar>
      <app-header></app-header>
      <main id="main-content" class="main-content page-transition" tabindex="-1">
        <section class="about-page-container">
          <div class="about-header-card">
            <h1 class="about-title">
              <i class="fas fa-info-circle"></i>
              Tentang Aplikasi
            </h1>
            <p class="about-subtitle">
              Platform berbagi pengalaman belajar dan cerita teknologi untuk komunitas developer Indonesia.
            </p>
          </div>
          <div class="about-content-grid">
            <div class="about-card">
              <h2><i class="fas fa-book-open"></i> Dicoding Story</h2>
              <p>
                <strong>Dicoding Story</strong> adalah platform untuk berbagi pengalaman belajar, menulis cerita, dan menjelajah kisah dari pengguna lain.
              </p>
              <p>
                Aplikasi ini dibuat sebagai submission kelas <em>Menjadi Front-End Web Developer Expert</em> Dicoding.
              </p>
            </div>
            <div class="about-card">
              <h2><i class="fas fa-feather-alt"></i> Fitur</h2>
              <ul class="feature-list">
                <li><i class="fas fa-check-circle"></i> Berbagi cerita dengan gambar</li>
                <li><i class="fas fa-check-circle"></i> Lokasi interaktif di peta</li>
                <li><i class="fas fa-check-circle"></i> Favorit & simpan offline</li>
                <li><i class="fas fa-check-circle"></i> PWA & notifikasi</li>
                <li><i class="fas fa-check-circle"></i> UI/UX modern & responsif</li>
              </ul>
            </div>
            <div class="about-card">
              <h2><i class="fas fa-code"></i> Teknologi</h2>
              <div class="tech-stack">
                <div class="tech-item"><i class="fab fa-html5"></i><span>HTML5</span></div>
                <div class="tech-item"><i class="fab fa-css3-alt"></i><span>CSS3</span></div>
                <div class="tech-item"><i class="fab fa-js"></i><span>JavaScript</span></div>
                <div class="tech-item"><i class="fas fa-map-marked-alt"></i><span>Leaflet.js</span></div>
                <div class="tech-item"><i class="fas fa-mobile-alt"></i><span>PWA</span></div>
              </div>
            </div>
            <div class="about-card">
              <h2><i class="fas fa-user-tie"></i> Developer</h2>
              <p>
                Dibuat oleh <strong>Naufal Arsyaputra Pradana</strong> untuk submission Dicoding.
              </p>
              <div class="tech-stack mt-2">
                <div class="tech-item">
                  <a href="https://github.com/NaufalArsyaputraPradana/" target="_blank" rel="noopener noreferrer">
                    <i class="fab fa-github"></i>
                    <span>GitHub</span>
                  </a>
                </div>
                <div class="tech-item">
                  <a href="https://www.linkedin.com/in/naufalarsyaputrapradana/" target="_blank" rel="noopener noreferrer">
                    <i class="fab fa-linkedin"></i>
                    <span>LinkedIn</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <app-footer></app-footer>
    `;
  }

  async afterRender() {
    // Animate about cards (aksesibilitas & UX)
    if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
      const cards = [
        document.getElementById('about-app'),
        document.getElementById('about-features'),
        document.getElementById('about-tech'),
        document.getElementById('about-developer'),
      ];
      cards.forEach((card, index) => {
        if (card) {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          card.style.transition = 'opacity 0.3s, transform 0.3s';
          setTimeout(
            () => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            },
            index * 100 + 300
          );
        }
      });
    }

    // Fokus otomatis ke main content untuk aksesibilitas
    const mainContent = document.getElementById('main-content');
    if (mainContent) setTimeout(() => mainContent.focus(), 200);
  }
}

export { AboutPage };