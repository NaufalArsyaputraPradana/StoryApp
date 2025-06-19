export function Sidebar({ user }) {
  const isLoggedIn = !!user;
  return `
    <button id="sidebar-open" class="sidebar-open-btn" aria-label="Buka menu">
      <i class="fas fa-chevron-right"></i>
    </button>
    <aside class="app-sidebar" id="app-sidebar" aria-label="Navigasi utama">
      <button id="sidebar-toggle" class="sidebar-close-btn" aria-label="Tutup menu">
        <i class="fas fa-chevron-left"></i>
      </button>
      <div class="sidebar-header">
        <img src="/note.png" alt="Logo StoryApp" class="sidebar-logo" />
        <h1 class="sidebar-title"><a href="#/">StoryApp</a></h1>
      </div>
      <nav class="sidebar-nav" aria-label="Menu">
        <ul>
          <li><a href="#/"><i class="fas fa-home"></i> Beranda</a></li>
          ${isLoggedIn ? `
            <li><a href="#/add" id="add-menu"><i class="fas fa-plus-circle"></i> Tambah Cerita</a></li>
            <li><a href="#/map" id="map-menu"><i class="fas fa-map-marked-alt"></i> Peta Cerita</a></li>
            <li><a href="#/favorites" id="favorites-menu"><i class="fas fa-bookmark"></i> Favorit</a></li>
          ` : ''}
          <li><a href="#/about" id="about-menu"><i class="fas fa-info-circle"></i> Tentang Kami</a></li>
        </ul>
      </nav>
      <div class="sidebar-user">
        ${isLoggedIn
          ? `<div class="sidebar-user-info">
                <i class="fas fa-user-circle"></i>
                <span>${user.name || user}</span>
             </div>
             <button id="logout-menu" class="sidebar-btn"><i class="fas fa-sign-out-alt"></i> Logout</button>`
          : `<a href="#/login" id="login-menu" class="sidebar-btn"><i class="fas fa-sign-in-alt"></i> Login</a>
             <a href="#/register" id="register-menu" class="sidebar-btn"><i class="fas fa-user-plus"></i> Register</a>`
        }
      </div>
      <div class="sidebar-footer">
        <div class="sidebar-social">
          <a href="https://github.com/NaufalArsyaputraPradana/" target="_blank" aria-label="GitHub"><i class="fab fa-github"></i></a>
          <a href="https://www.linkedin.com/in/naufalarsyaputrapradana/" target="_blank" aria-label="LinkedIn"><i class="fab fa-linkedin"></i></a>
          <a href="https://www.instagram.com/arsya.pradana_/" target="_blank" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
        </div>
      </div>
    </aside>
  `;
}

export function bindSidebarEvents() {
  const sidebar = document.getElementById('app-sidebar');
  const openBtn = document.getElementById('sidebar-open');
  const closeBtn = document.getElementById('sidebar-toggle');
  if (openBtn && sidebar) {
    openBtn.onclick = () => {
      sidebar.classList.add('open');
      document.body.classList.add('sidebar-opened');
      openBtn.classList.add('hide');
    };
  }
  if (closeBtn && sidebar) {
    closeBtn.onclick = () => {
      sidebar.classList.remove('open');
      document.body.classList.remove('sidebar-opened');
      openBtn.classList.remove('hide');
    };
  }
  sidebar?.querySelectorAll('a').forEach(link => {
    link.onclick = () => {
      sidebar.classList.remove('open');
      document.body.classList.remove('sidebar-opened');
      openBtn.classList.remove('hide');
    };
  });
}