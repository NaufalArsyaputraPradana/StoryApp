import { StoryModel } from '../../models/story-model.js';
import { AddStoryPresenter } from './add-story-presenter.js';
import { NotificationHelper } from '../../utils/notification-helper.js';

class AddStoryPage {
  constructor() {
    this._model = new StoryModel();
    this._presenter = null;
    this._map = null;
    this._marker = null;
    this._cameraStream = null;
    this._photoBlob = null;
    this._selectedLocation = null;
    this._photoSource = null;
    this._hashChangeHandler = null;
  }

  async render() {
    return `
      <section class="add-story-page page-transition">
        <div class="coordinator-layout">
          <div class="coordinator-header">
            <div>
              <h2 class="coordinator-title">Tambah Cerita Baru</h2>
              <p>Bagikan pengalaman dan cerita menarikmu dengan komunitas</p>
            </div>
          </div>
          <div class="form-container">
            <div id="alert-container"></div>
            <form id="add-story-form">
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-camera"></i> Foto Cerita
                </label>
                <div class="camera-container">
                  <div class="camera-preview">
                    <video id="camera-stream" autoplay playsinline></video>
                    <canvas id="photo-canvas" class="hidden"></canvas>
                    <img id="photo-preview" class="hidden" alt="Preview foto yang diambil">
                  </div>
                  <div class="camera-buttons">
                    <button type="button" id="start-camera" class="btn">
                      <i class="fas fa-camera"></i> Mulai Kamera
                    </button>
                    <button type="button" id="upload-photo" class="btn">
                      <i class="fas fa-upload"></i> Upload Foto
                    </button>
                    <input type="file" id="photo-upload" accept="image/*" class="hidden">
                    <button type="button" id="capture-photo" class="btn hidden" disabled>
                      <i class="fas fa-camera-retro"></i> Ambil Foto
                    </button>
                    <button type="button" id="retake-photo" class="btn hidden">
                      <i class="fas fa-redo"></i> Ambil Ulang
                    </button>
                  </div>
                </div>
              </div>
              <div class="form-group">
                <label for="description" class="form-label">
                  <i class="fas fa-pen"></i> Deskripsi Cerita
                </label>
                <textarea 
                  id="description" 
                  name="description" 
                  class="form-textarea" 
                  required
                  placeholder="Ceritakan pengalamanmu..."
                ></textarea>
              </div>
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-map-marker-alt"></i> Lokasi
                </label>
                <p class="form-help">Klik pada peta untuk menandai lokasi ceritamu</p>
                <div id="storyMap" class="map-container"></div>
                <div id="location-info" class="location-info hidden">
                  <div>
                    <i class="fas fa-map-marker-alt"></i>
                    <span>Koordinat: <span id="location-text"></span></span>
                  </div>
                  <button type="button" id="clear-location" class="btn btn-sm btn-danger">
                    <i class="fas fa-times"></i> Hapus Lokasi
                  </button>
                </div>
              </div>
              <div class="form-actions">
                <a href="#/" class="btn btn-secondary">Batal</a>
                <button type="submit" class="btn btn-success">
                  <i class="fas fa-paper-plane"></i> Bagikan Cerita
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this._presenter = new AddStoryPresenter(this._model, this);
    setTimeout(() => this._initMap(), 100);
    this._initCameraButtons();
    this._initFormSubmission();
    this._setupHashChangeListener();
  }

  _setupHashChangeListener() {
    this._hashChangeHandler = () => {
      this._stopCameraStream();
    };
    window.addEventListener('hashchange', this._hashChangeHandler);
  }

  _initMap() {
    try {
      this._map = L.map('storyMap').setView([-2.5489, 118.0149], 5);
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

      this._map.on('click', (e) => this._handleMapClick(e.latlng));
      this._map.locate({ setView: true, maxZoom: 16 });
      this._map.on('locationfound', (e) => this._map.setView(e.latlng, 16));
      setTimeout(() => this._map.invalidateSize(), 100);
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  _handleMapClick(latlng) {
    if (this._marker) this._map.removeLayer(this._marker);
    this._marker = L.marker(latlng).addTo(this._map);
    this._marker.bindPopup('Lokasi cerita Anda').openPopup();
    this._selectedLocation = { lat: latlng.lat, lon: latlng.lng };

    const locationInfo = document.getElementById('location-info');
    const locationText = document.getElementById('location-text');
    if (locationInfo && locationText) {
      locationInfo.classList.remove('hidden');
      locationText.textContent = `${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`;
      const clearLocationButton = document.getElementById('clear-location');
      if (clearLocationButton) {
        clearLocationButton.addEventListener('click', () => this._clearLocation());
      }
    }
  }

  _clearLocation() {
    if (this._marker) {
      this._map.removeLayer(this._marker);
      this._marker = null;
    }
    this._selectedLocation = null;
    const locationInfo = document.getElementById('location-info');
    if (locationInfo) locationInfo.classList.add('hidden');
  }

  _initCameraButtons() {
    const startCameraButton = document.getElementById('start-camera');
    const capturePhotoButton = document.getElementById('capture-photo');
    const retakePhotoButton = document.getElementById('retake-photo');
    const uploadPhotoButton = document.getElementById('upload-photo');
    const photoUploadInput = document.getElementById('photo-upload');
    if (!startCameraButton || !capturePhotoButton || !retakePhotoButton || !uploadPhotoButton || !photoUploadInput) return;

    startCameraButton.addEventListener('click', () => this._startCamera());
    capturePhotoButton.addEventListener('click', () => this._capturePhoto());
    retakePhotoButton.addEventListener('click', () => this._retakePhoto());
    uploadPhotoButton.addEventListener('click', () => photoUploadInput.click());
    photoUploadInput.addEventListener('change', (event) => this._handlePhotoUpload(event));
  }

  _handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.showAlert('Silakan pilih file gambar');
      return;
    }
    this._photoSource = 'upload';
    const reader = new FileReader();
    reader.onload = (e) => {
      const photoPreviewElement = document.getElementById('photo-preview');
      if (photoPreviewElement) {
        photoPreviewElement.src = e.target.result;
        photoPreviewElement.classList.remove('hidden');
      }
      const videoElement = document.getElementById('camera-stream');
      if (videoElement) videoElement.classList.add('hidden');
      this._stopCameraStream();
      fetch(e.target.result)
        .then(res => res.blob())
        .then(blob => { this._photoBlob = blob; });
      this._toggleCameraButtons('upload');
    };
    reader.readAsDataURL(file);
  }

  async _startCamera() {
    try {
      this._cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      const videoElement = document.getElementById('camera-stream');
      if (!videoElement) throw new Error('Video element not found');
      videoElement.srcObject = this._cameraStream;
      videoElement.classList.remove('hidden');
      const photoPreview = document.getElementById('photo-preview');
      if (photoPreview) photoPreview.classList.add('hidden');
      this._toggleCameraButtons('camera');
    } catch (error) {
      this.showAlert('Tidak dapat mengakses kamera: ' + error.message);
    }
  }

  _capturePhoto() {
    try {
      const videoElement = document.getElementById('camera-stream');
      const canvasElement = document.getElementById('photo-canvas');
      const photoPreviewElement = document.getElementById('photo-preview');
      if (!videoElement || !canvasElement || !photoPreviewElement) throw new Error('Required elements not found');
      canvasElement.width = videoElement.videoWidth;
      canvasElement.height = videoElement.videoHeight;
      const context = canvasElement.getContext('2d');
      context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
      canvasElement.toBlob((blob) => {
        this._photoBlob = blob;
        this._photoSource = 'camera';
        const imageUrl = URL.createObjectURL(blob);
        photoPreviewElement.src = imageUrl;
        photoPreviewElement.classList.remove('hidden');
        videoElement.classList.add('hidden');
        this._stopCameraStream();
        this._toggleCameraButtons('captured');
      }, 'image/jpeg', 0.8);
    } catch (error) {
      this.showAlert('Error capturing photo: ' + error.message);
    }
  }

  _retakePhoto() {
    this._photoBlob = null;
    this._photoSource = null;
    const startButton = document.getElementById('start-camera');
    const uploadButton = document.getElementById('upload-photo');
    if (startButton) startButton.classList.remove('hidden');
    if (uploadButton) uploadButton.classList.remove('hidden');
    const retakeButton = document.getElementById('retake-photo');
    if (retakeButton) retakeButton.classList.add('hidden');
    const photoPreview = document.getElementById('photo-preview');
    if (photoPreview) photoPreview.classList.add('hidden');
    const captureButton = document.getElementById('capture-photo');
    if (captureButton) {
      captureButton.classList.add('hidden');
      captureButton.disabled = true;
    }
    const videoElement = document.getElementById('camera-stream');
    if (videoElement) videoElement.classList.add('hidden');
    const photoUploadInput = document.getElementById('photo-upload');
    if (photoUploadInput) photoUploadInput.value = '';
  }

  _toggleCameraButtons(state) {
    const startButton = document.getElementById('start-camera');
    const uploadButton = document.getElementById('upload-photo');
    const captureButton = document.getElementById('capture-photo');
    const retakeButton = document.getElementById('retake-photo');
    if (state === 'camera') {
      if (captureButton) {
        captureButton.disabled = false;
        captureButton.classList.remove('hidden');
      }
      if (startButton) startButton.classList.add('hidden');
      if (uploadButton) uploadButton.classList.add('hidden');
      if (retakeButton) retakeButton.classList.add('hidden');
    } else if (state === 'upload') {
      if (startButton) startButton.classList.add('hidden');
      if (uploadButton) uploadButton.classList.add('hidden');
      if (captureButton) {
        captureButton.classList.add('hidden');
        captureButton.disabled = true;
      }
      if (retakeButton) {
        retakeButton.classList.remove('hidden');
        retakeButton.innerHTML = '<i class="fas fa-redo"></i> Upload Ulang';
      }
    } else if (state === 'captured') {
      if (retakeButton) {
        retakeButton.classList.remove('hidden');
        retakeButton.innerHTML = '<i class="fas fa-redo"></i> Ambil Ulang';
      }
      if (captureButton) {
        captureButton.classList.add('hidden');
        captureButton.disabled = true;
      }
      if (startButton) startButton.classList.add('hidden');
      if (uploadButton) uploadButton.classList.add('hidden');
    }
  }

  _stopCameraStream() {
    if (this._cameraStream) {
      const tracks = this._cameraStream.getTracks();
      tracks.forEach((track) => track.stop());
      this._cameraStream = null;
    }
  }

  _initFormSubmission() {
    const form = document.getElementById('add-story-form');
    if (!form) return;
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const description = document.getElementById('description').value;
      if (!this._photoBlob) {
        this.showAlert('Silakan ambil foto terlebih dahulu');
        return;
      }
      if (!description) {
        this.showAlert('Silakan masukkan deskripsi cerita');
        return;
      }
      const lat = this._selectedLocation ? this._selectedLocation.lat : null;
      const lon = this._selectedLocation ? this._selectedLocation.lon : null;
      await this._presenter.addStory(description, this._photoBlob, lat, lon);
      NotificationHelper.showToast('Cerita berhasil dibagikan!', 'success');
      NotificationHelper.showNotification('Cerita berhasil dibagikan!', {
        body: 'Cerita kamu sudah terpublikasi.',
        tag: 'storyapp-add-story'
      });
    });
  }

  showLoading() {
    const submitButton = document.querySelector('#add-story-form button[type="submit"]');
    if (submitButton) {
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';
      submitButton.disabled = true;
    }
  }

  hideLoading() {
    const submitButton = document.querySelector('#add-story-form button[type="submit"]');
    if (submitButton) {
      submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Bagikan Cerita';
      submitButton.disabled = false;
    }
  }

  showAlert(message, type = 'danger') {
    const alertContainer = document.getElementById('alert-container');
    if (!alertContainer) return;
    alertContainer.innerHTML = `
      <div class="alert alert-${type}">
        <i class="fas fa-${type === 'danger' ? 'exclamation-triangle' : 'check-circle'}"></i>
        ${message}
      </div>
    `;
    alertContainer.scrollIntoView({ behavior: 'smooth' });
  }

  clearAlert() {
    const alertContainer = document.getElementById('alert-container');
    if (alertContainer) alertContainer.innerHTML = '';
  }

  beforeUnload() {
    this._stopCameraStream();
    if (this._hashChangeHandler) {
      window.removeEventListener('hashchange', this._hashChangeHandler);
      this._hashChangeHandler = null;
    }
    if (this._map) {
      this._map.remove();
      this._map = null;
    }
  }
}

export { AddStoryPage };