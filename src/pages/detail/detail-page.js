import { StoryModel } from '../../models/story-model.js';
import { DetailPresenter } from './detail-presenter.js';

class DetailPage {
  constructor() {
    this._model = new StoryModel();
    this._presenter = null;
    this._map = null;
  }

  async render() {
    document.title = 'Detail Cerita - StoryApp';
    return `
      <section class="detail-page page-transition">
        <div id="story-detail-container" class="story-detail-card">
          <div class="loader" id="detail-loader"></div>
        </div>
        <div id="error-container" class="error-container hidden"></div>
      </section>
    `;
  }

  async afterRender() {
    const storyId = window.selectedStoryId;
    if (!storyId) {
      this.showError('ID cerita tidak ditemukan');
      return;
    }
    this._presenter = new DetailPresenter(this._model, this);
    await this._presenter.getStoryDetail(storyId);
  }

  showLoading() {
    const loader = document.getElementById('detail-loader');
    if (loader) loader.classList.remove('hidden');
    const errorContainer = document.getElementById('error-container');
    if (errorContainer) errorContainer.classList.add('hidden');
  }

  hideLoading() {
    const loader = document.getElementById('detail-loader');
    if (loader) loader.classList.add('hidden');
  }

  renderStoryDetail(story) {
    this.hideLoading();
    const detailContainer = document.getElementById('story-detail-container');
    if (!detailContainer) return;

    const initial = story.name.charAt(0).toUpperCase();
    detailContainer.innerHTML = `
      <div class="detail-card">
        <div class="detail-header">
          <button class="modal-close" aria-label="Tutup">&times;</button>
          <div class="user-info">
            <div class="user-avatar">${initial}</div>
            <div>
              <span class="user-name">${story.name}</span>
              <span class="story-date"><i class="fas fa-calendar-alt"></i> ${this._formatDate(story.createdAt)}</span>
            </div>
          </div>
        </div>
        <div class="detail-image-container">
          <img 
            src="${story.photoUrl}" 
            alt="Cerita dari ${story.name}" 
            class="detail-image"
            loading="lazy"
            onerror="this.src='./fallback.jpg';"
          />
        </div>
        <div class="detail-content">
          <div class="story-meta">
            ${story.lat && story.lon ? 
              `<div class="story-info">
                <i class="fas fa-map-marker-alt"></i>
                <span>Koordinat: ${story.lat.toFixed(6)}, ${story.lon.toFixed(6)}</span>
              </div>` : 
              `<div class="story-info">
                <i class="fas fa-map-marker-alt"></i>
                <span>Tidak ada informasi lokasi</span>
              </div>`
            }
          </div>
          <div class="story-description-full">
            <h3><i class="fas fa-book-open"></i> Cerita</h3>
            <p>${story.description}</p>
          </div>
          ${story.lat && story.lon ? 
            `<div class="story-location">
              <h3><i class="fas fa-map-marked-alt"></i> Lokasi</h3>
              <div class="story-location-map" id="detail-map"></div>
            </div>` : ''
          }
        </div>
        <div class="detail-footer">
          <a href="#/" class="btn btn-secondary"><i class="fas fa-arrow-left"></i> Kembali ke Beranda</a>
        </div>
      </div>
    `;

    // Close button event
    const closeButton = detailContainer.querySelector('.modal-close');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        window.location.href = '#/';
      });
    }

    // Map
    if (story.lat && story.lon) {
      setTimeout(() => {
        this._initMap(story);
      }, 100);
    }
  }

  _initMap(story) {
    try {
      this._map = L.map('detail-map').setView([story.lat, story.lon], 13);

      const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      });

      const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 19
      });

      const topoLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
        maxZoom: 17
      });

      const baseMaps = {
        "OpenStreetMap": osmLayer,
        "Satelit": satelliteLayer,
        "Topografi": topoLayer
      };

      L.control.layers(baseMaps).addTo(this._map);
      osmLayer.addTo(this._map);

      const marker = L.marker([story.lat, story.lon]).addTo(this._map);
      marker.bindPopup(`<b>${story.name}'s Story</b><br>${this._truncateText(story.description, 100)}`).openPopup();

      setTimeout(() => {
        this._map.invalidateSize();
      }, 100);
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  showError(message) {
    this.hideLoading();
    const errorContainer = document.getElementById('error-container');
    if (!errorContainer) return;
    errorContainer.classList.remove('hidden');
    errorContainer.innerHTML = `
      <div class="error-content">
        <i class="fas fa-exclamation-triangle fa-3x"></i>
        <h3>Story not found</h3>
        <p>${message}</p>
        <a href="#/" class="btn">Kembali ke Beranda</a>
      </div>
    `;
  }

  _formatDate(dateString) {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  }
  
  _truncateText(text, maxLength) {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substr(0, maxLength) + '...';
  }

  beforeUnload() {
    if (this._map) {
      this._map.remove();
      this._map = null;
    }
  }
}

export { DetailPage };