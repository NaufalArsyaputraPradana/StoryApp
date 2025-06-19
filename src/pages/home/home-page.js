import { StoryModel } from '../../models/story-model.js';
import { HomePresenter } from './home-presenter.js';
import { AuthHelper } from '../../utils/auth-helper.js';
import { IdbHelper } from '../../utils/idb-helper.js';
import { Sidebar, bindSidebarEvents } from '../../components/sidebar.js';
import { Footer } from '../../components/footer.js';
import { StoryCard, initMiniMap, showFavoriteToast } from '../../components/story-card.js';

const PAGE_SIZE = 9;

class HomePage {
  constructor() {
    this._model = new StoryModel();
    this._presenter = null;
    this._showFavorites = false;
    this._title = 'StoryApp';
    this._currentPage = 1;
    this._totalPages = 1;
    this._searchValue = '';
  }

  async render() {
    if (!AuthHelper.isLoggedIn()) {
      window.location.href = '#/login';
      return '';
    }

    document.title = this._title;
    return `
      <section class="home-page page-transition">
        <div class="hero-banner">
          <div class="hero-content">
            <h1>Temukan Cerita Menarik</h1>
            <p>Bagikan pengalaman dan baca cerita dari komunitas kami</p>
            <div class="search-bar">
              <input type="text" id="search-input" placeholder="Cari cerita..." value="${this._searchValue}" class="form-input" />
              <button id="search-btn" aria-label="Cari"><i class="fas fa-search"></i></button>
            </div>
          </div>
        </div>
        <div class="content-container">
          <div class="content-header">
            <h2>${this._showFavorites ? 'Cerita Favorit' : 'Cerita Terbaru'}</h2>
            <div class="view-controls">
              <button 
                id="toggle-favorites" 
                class="btn btn-icon${this._showFavorites ? ' active' : ''}" 
                aria-pressed="${this._showFavorites}">
                <i class="fas fa-${this._showFavorites ? 'globe' : 'bookmark'}"></i>
                ${this._showFavorites ? 'Lihat Semua' : 'Favorit Saya'}
              </button>
              ${AuthHelper.isLoggedIn() ? `
                <a href="#/add" class="btn btn-primary">
                  <i class="fas fa-plus"></i> Cerita Baru
                </a>
              ` : ''}
            </div>
          </div>
          <div id="stories-container" class="stories-grid">
            <app-loader id="stories-loader"></app-loader>
          </div>
          <div id="error-container" class="error-container hidden"></div>
          <div id="pagination-container" class="pagination-container">
            <div class="pagination">
              <button class="btn" id="prev-page" ${this._currentPage <= 1 ? 'disabled' : ''}>Prev</button>
              <span>Halaman ${this._currentPage} dari ${this._totalPages}</span>
              <button class="btn" id="next-page" ${this._currentPage >= this._totalPages ? 'disabled' : ''}>Next</button>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    if (!AuthHelper.isLoggedIn()) return;

    this._renderSidebarAndFooter();
    if (window.app && typeof window.app._checkAuthStatus === 'function') {
      window.app._checkAuthStatus();
    }
    this._presenter = new HomePresenter(this._model, this);

    this._bindUIEvents();
    await this._refreshContent();
  }

  _renderSidebarAndFooter() {
    const user = AuthHelper.getUserData();
    const sidebarContainer = document.getElementById('navbar-container');
    if (sidebarContainer) {
      sidebarContainer.innerHTML = Sidebar({ user: user ? user.name : '' });
    }
    bindSidebarEvents();
    const footerContainer = document.getElementById('footer-container');
    if (footerContainer) {
      footerContainer.innerHTML = Footer();
    }
  }

  _bindUIEvents() {
    const favBtn = document.getElementById('toggle-favorites');
    favBtn?.addEventListener('click', () => {
      this._showFavorites = !this._showFavorites;
      this._currentPage = 1;
      favBtn.innerHTML = this._showFavorites
        ? `<i class="fas fa-globe"></i> Lihat Semua`
        : `<i class="fas fa-bookmark"></i> Favorit Saya`;
      favBtn.classList.toggle('active', this._showFavorites);
      favBtn.setAttribute('aria-pressed', this._showFavorites ? 'true' : 'false');
      this._refreshContent();
    });

    document.getElementById('search-input')?.addEventListener('input', (e) => {
      this._searchValue = e.target.value;
      this._currentPage = 1;
      this._refreshContent();
    });

    document.getElementById('search-btn')?.addEventListener('click', () => {
      this._currentPage = 1;
      this._refreshContent();
    });

    document.getElementById('prev-page')?.addEventListener('click', () => {
      if (this._currentPage > 1) {
        this._currentPage--;
        this._refreshContent();
      }
    });

    document.getElementById('next-page')?.addEventListener('click', () => {
      if (this._currentPage < this._totalPages) {
        this._currentPage++;
        this._refreshContent();
      }
    });
  }

  async _refreshContent() {
    this.showLoading();

    let stories = [];
    let totalStories = 0;

    if (this._showFavorites) {
      const allFavs = await IdbHelper.getFavorites();
      let filtered = allFavs;
      if (this._searchValue) {
        const q = this._searchValue.toLowerCase();
        filtered = allFavs.filter(story =>
          story.name.toLowerCase().includes(q) ||
          story.description.toLowerCase().includes(q)
        );
      }
      totalStories = filtered.length;
      this._totalPages = Math.max(1, Math.ceil(totalStories / PAGE_SIZE));
      if (this._currentPage > this._totalPages) this._currentPage = this._totalPages;
      const start = (this._currentPage - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE;
      stories = filtered.slice(start, end);
    } else {
      if (this._searchValue) {
        let allStories = [];
        let page = 1;
        let keepFetching = true;
        while (keepFetching && page <= 10) {
          const batch = await this._model.getStories(page, PAGE_SIZE, 0);
          allStories = allStories.concat(batch);
          if (batch.length < PAGE_SIZE) keepFetching = false;
          page++;
        }
        const q = this._searchValue.toLowerCase();
        const filtered = allStories.filter(story =>
          story.name.toLowerCase().includes(q) ||
          story.description.toLowerCase().includes(q)
        );
        totalStories = filtered.length;
        this._totalPages = Math.max(1, Math.ceil(totalStories / PAGE_SIZE));
        if (this._currentPage > this._totalPages) this._currentPage = this._totalPages;
        const start = (this._currentPage - 1) * PAGE_SIZE;
        const end = start + PAGE_SIZE;
        stories = filtered.slice(start, end);
      } else {
        try {
          stories = await this._model.getStories(this._currentPage, PAGE_SIZE, 0);
          this._totalPages = stories.length < PAGE_SIZE && this._currentPage > 1
            ? this._currentPage
            : this._currentPage + 1;
          if (stories.length < PAGE_SIZE) {
            this._totalPages = this._currentPage;
          }
        } catch (err) {
          this.showError('Gagal memuat cerita');
          this.hideLoading();
          return;
        }
      }
    }

    await this.renderStories(stories);
    this._updatePagination();
  }

  showLoading() {
    const loader = document.getElementById('stories-loader');
    if (loader) loader.show('Memuat cerita...');
    const errorContainer = document.getElementById('error-container');
    if (errorContainer) errorContainer.classList.add('hidden');
    const storiesContainer = document.getElementById('stories-container');
    if (storiesContainer) {
      [...storiesContainer.children].forEach(child => {
        if (child.id !== 'stories-loader') child.remove();
      });
    }
  }

  hideLoading() {
    const loader = document.getElementById('stories-loader');
    if (loader) loader.hide();
  }

  async renderStories(stories) {
    this.hideLoading();
    const storiesContainer = document.getElementById('stories-container');
    if (!storiesContainer) return;

    if (stories.length === 0) {
      storiesContainer.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-${this._showFavorites ? 'bookmark' : 'book-open'}"></i>
          <h3>${this._showFavorites ? 'Belum ada cerita favorit' : 'Belum ada cerita'}</h3>
          ${this._showFavorites ? `
            <p>Tambahkan cerita ke favorit untuk melihatnya di sini</p>
            <a href="#/" class="btn">Jelajahi Cerita</a>
          ` : `
            <p>Jadilah yang pertama membagikan cerita</p>
            ${AuthHelper.isLoggedIn() ? `
              <a href="#/add" class="btn btn-primary">Buat Cerita</a>
            ` : `
              <a href="#/login" class="btn btn-primary">Login untuk Membuat Cerita</a>
            `}
          `}
        </div>
      `;
      return;
    }

    storiesContainer.innerHTML = '';

    for (const story of stories) {
      const isFavorite = await IdbHelper.isFavorite(story.id);
      storiesContainer.innerHTML += StoryCard({ story, isFavorite });
    }

    stories.forEach(story => {
      if (story.lat && story.lon) initMiniMap(story);
    });

    stories.forEach(story => {
      const card = storiesContainer.querySelector(`[data-id="${story.id}"]`)?.closest('.story-card');
      if (!card) return;
      card.querySelector('.view-details-btn').addEventListener('click', (e) => {
        e.preventDefault();
        window.selectedStoryId = story.id;
        window.location.href = '#/detail';
      });
      card.querySelector('.favorite-btn').addEventListener('click', async (e) => {
        e.preventDefault();
        try {
          const isFav = await IdbHelper.isFavorite(story.id);
          const icon = card.querySelector('.favorite-btn i');
          if (isFav) {
            await IdbHelper.removeFromFavorites(story.id);
            card.querySelector('.favorite-btn').classList.remove('favorited');
            icon.classList.replace('fa-solid', 'fa-regular');
            showFavoriteToast(true, false);
          } else {
            await IdbHelper.addToFavorites(story);
            card.querySelector('.favorite-btn').classList.add('favorited');
            icon.classList.replace('fa-regular', 'fa-solid');
            showFavoriteToast(true, true);
          }
          if (this._showFavorites) this._refreshContent();
        } catch (error) {
          showFavoriteToast(false, false);
        }
      });
    });
  }

  _updatePagination() {
    const prevPageButton = document.getElementById('prev-page');
    const nextPageButton = document.getElementById('next-page');
    const pageInfo = document.querySelector('.pagination span');

    if (pageInfo) {
      pageInfo.textContent = `Halaman ${this._currentPage} dari ${this._totalPages}`;
    }
    if (prevPageButton) {
      prevPageButton.disabled = this._currentPage <= 1;
    }
    if (nextPageButton) {
      if (!this._showFavorites) {
        nextPageButton.disabled = this._totalPages === this._currentPage;
      } else {
        nextPageButton.disabled = this._currentPage >= this._totalPages;
      }
    }
  }
}

export { HomePage };
