# StoryApp - Berbagi Cerita Komunitas

**Dibuat oleh:** Naufal Arsyaputra Pradana  
**Cohort ID:** FC007D5Y1312  
**Deploy:** [https://arsyastoryapp.netlify.app]

---

## ✨ Tentang StoryApp

StoryApp adalah aplikasi Progressive Web App (PWA) untuk berbagi cerita, pengalaman, dan inspirasi berbasis lokasi. Setiap pengguna dapat menulis cerita, menambahkan foto, memilih lokasi di peta, serta menyimpan cerita favorit untuk diakses secara offline. Aplikasi ini mengutamakan pengalaman pengguna modern, aksesibilitas, dan keamanan.

---

## 🛠️ Fitur Aplikasi

- **Autentikasi Pengguna**
  - Registrasi & login akun
  - Proteksi halaman (hanya user login yang bisa mengakses home, tambah cerita, peta, favorit)

- **Berbagi Cerita**
  - Tambah cerita dengan foto (kamera/upload)
  - Deskripsi cerita
  - Pilih lokasi pada peta interaktif (Leaflet + OpenStreetMap)
  - Lihat detail cerita dengan peta mini

- **Peta Cerita**
  - Peta interaktif dengan cluster marker
  - Filter dan lihat semua cerita yang memiliki lokasi
  - Popup detail cerita langsung di peta

- **Favorit & Offline**
  - Simpan cerita ke favorit (IndexedDB)
  - Akses cerita favorit secara offline
  - Hapus/tambah favorit dengan notifikasi

- **PWA & Notifikasi**
  - Installable ke homescreen (Android/iOS/desktop)
  - Offline mode otomatis (Service Worker + Workbox)
  - Push notification (notifikasi cerita baru/favorit)
  - Banner install PWA

- **UI/UX Modern**
  - Responsive di semua device
  - Sidebar navigasi, footer, dan card-card modern
  - Transisi halaman halus (View Transition API)
  - Aksesibilitas: skip link, label form, alt gambar

- **Fitur Lain**
  - Pencarian cerita (search bar)
  - Pagination cerita
  - Error & empty state yang informatif
  - Loader animasi di setiap proses

---

## ⚙️ Cara Setup & Instalasi

1. **Clone repository**
   ```sh
   git clone https://github.com/NaufalArsyaputraPradana/StoryApp.git
   cd story-app
   ```

2. **Buka file `index.html` di browser**

3. **Instalasi PWA**
   - Untuk pengguna Android: Gunakan Chrome, buka menu, dan pilih "Add to Home screen"
   - Untuk pengguna iOS: Gunakan Safari, buka menu, dan pilih "Add to Home Screen"
   - Untuk pengguna Desktop: Gunakan Chrome/Edge, buka menu, dan pilih "Install"

4. **Mengaktifkan Service Worker (jika diperlukan)**

5. **Menggunakan aplikasi:**
   - Registrasi atau login
   - Tambah, lihat, dan favoritkan cerita
   - Eksplorasi peta cerita
   - Nikmati pengalaman offline

---

## 🚀 Deployment

Aplikasi ini di-deploy menggunakan GitHub Pages dan dapat diakses melalui:
[https://arsyastoryapp.netlify.app]

---

## 👨‍💻 Developer

Aplikasi ini dikembangkan oleh **Naufal Arsyaputra Pradana** sebagai submission untuk kelas Dicoding "Membangun Progressive Web Apps".

---

## 📄 Lisensi

© 2025 Naufal Arsyaputra Pradana - StoryApp - Berbagi Cerita Komunitas

Proyek ini adalah bagian dari pembelajaran dan tidak untuk digunakan untuk keperluan komersial tanpa izin.
# StoryApp
