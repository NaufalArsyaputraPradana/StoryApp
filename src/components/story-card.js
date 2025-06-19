import Swal from 'sweetalert2';

/**
 * Render a single story card.
 * @param {Object} params
 * @param {Object} params.story
 * @param {boolean} params.isFavorite
 * @returns {string}
 */
export function StoryCard({ story, isFavorite }) {
  const initial = story.name ? story.name.charAt(0).toUpperCase() : '?';
  return `
    <article class="story-card" data-id="${story.id}">
      <div class="story-image-container">
        <img 
          src="${story.photoUrl}" 
          alt="Cerita dari ${story.name}" 
          class="story-image"
          loading="lazy"
          onerror="this.src='/fallback.jpg';"
        />
        <button class="favorite-btn${isFavorite ? ' favorited' : ''}" data-id="${story.id}" aria-label="${isFavorite ? 'Hapus dari favorit' : 'Tambah ke favorit'}" title="${isFavorite ? 'Hapus dari favorit' : 'Tambah ke favorit'}">
          <i class="fa-${isFavorite ? 'solid' : 'regular'} fa-bookmark"></i>
        </button>
      </div>
      <div class="story-content">
        <div class="user-info">
          <div class="user-avatar">${initial}</div>
          <span class="user-name">${story.name}</span>
        </div>
        <h3 class="story-title">${story.name}</h3>
        <p class="story-description">${story.description}</p>
        <div class="story-meta">
          <div class="story-info">
            <i class="fas fa-calendar-alt"></i>
            <span>${new Date(story.createdAt).toLocaleDateString('id-ID')}</span>
          </div>
          ${story.lat && story.lon ? `
            <div class="story-info">
              <i class="fas fa-map-marker-alt"></i>
              <span>Lokasi tersedia</span>
            </div>
          ` : ''}
        </div>
        ${story.lat && story.lon ? `
          <div class="story-minimap" id="minimap-${story.id}" style="height:120px;border-radius:8px;overflow:hidden;margin-bottom:8px;"></div>
        ` : ''}
        <div class="story-actions">
          <a href="#" class="view-details-btn" data-id="${story.id}" aria-label="Lihat detail cerita">Lihat Detail</a>
        </div>
      </div>
    </article>
  `;
}

/**
 * Initialize a static minimap for a story card.
 * @param {Object} story
 */
export function initMiniMap(story) {
  if (story.lat && story.lon && window.L) {
    setTimeout(() => {
      const map = L.map(`minimap-${story.id}`, {
        center: [story.lat, story.lon],
        zoom: 13,
        attributionControl: false,
        zoomControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
        tap: false,
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
      L.marker([story.lat, story.lon]).addTo(map);
    }, 0);
  }
}

/**
 * Show a toast for favorite/unfavorite action.
 * @param {boolean} success
 * @param {boolean} isAdd
 */
export function showFavoriteToast(success, isAdd) {
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon: success ? 'success' : 'error',
    title: success
      ? (isAdd ? 'Ditambahkan ke favorit!' : 'Dihapus dari favorit!')
      : 'Gagal mengubah favorit',
    showConfirmButton: false,
    timer: 1800,
    timerProgressBar: true,
  });
}