// JavaScript para la página de inicio - MusicFlow
class MusicFlowInicio {
    constructor() {
        this.accessToken = null;
        this.tracksContainer = document.getElementById('tracksContainer');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.errorMessage = document.getElementById('errorMessage');
        this.refreshBtn = document.getElementById('refreshBtn');
        this.currentTrack = null;
        this.playlistModal = null;
        
        this.init();
    }

    async init() {
        await this.getSpotifyToken();
        this.setupEventListeners();
        if (this.accessToken) {
            await this.loadRecommendations();
        }
    }

    setupEventListeners() {
        this.refreshBtn.addEventListener('click', () => {
            this.loadRecommendations();
        });
        
        // Toggle sidebar en móvil
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebar = document.getElementById('sidebar');
        
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('show');
            });
        }
        
        // Cerrar sidebar al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 992 && 
                sidebar && 
                sidebar.classList.contains('show') &&
                !sidebar.contains(e.target) &&
                !sidebarToggle.contains(e.target)) {
                sidebar.classList.remove('show');
            }
        });
        
        // Eventos del modal de playlists
        this.setupPlaylistModalEvents();
    }

    async getSpotifyToken() {
        try {
            const response = await fetch('http://127.0.0.1:5050/token');
            const data = await response.json();
            
            if (data.access_token) {
                this.accessToken = data.access_token;
                console.log('Token obtenido exitosamente');
            } else {
                throw new Error('No se pudo obtener el token');
            }
        } catch (error) {
            console.error('Error obteniendo token:', error);
            this.showError();
        }
    }

    async loadRecommendations() {
    if (!this.accessToken) {
        await this.getSpotifyToken();
        if (!this.accessToken) return;
    }

    this.showLoading(true);
    this.hideError();

    try {
        const genres = ['pop', 'rock', 'electronic', 'hip-hop', 'indie', 'latin', 'jazz', 'classical'];
        const randomGenres = this.getRandomGenres(genres, 1);

        const genre = randomGenres[0];

        const url = `https://api.spotify.com/v1/search?q=genre:%22${genre}%22&type=track&limit=20&market=US`;

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();

        if (data.tracks && data.tracks.items.length > 0) {
            this.renderTracks(data.tracks.items);
        } else {
            this.showError();
        }
    } catch (error) {
        console.error('Error cargando canciones:', error);
        this.showError();
    } finally {
        this.showLoading(false);
    }
}


    getRandomGenres(genres, count) {
        const shuffled = [...genres].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    renderTracks(tracks) {
        this.tracksContainer.innerHTML = '';
        
        tracks.forEach((track, index) => {
            const trackCard = this.createTrackCard(track, index);
            this.tracksContainer.appendChild(trackCard);
        });
        
        // Agregar event listeners a los botones de las cards
        this.setupTrackCardListeners();
    }

    createTrackCard(track, index) {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4 col-xl-3';
        
        // Obtener información del álbum y artista
        const albumImage = track.album.images.length > 0 ? 
            track.album.images[0].url : 
            'https://via.placeholder.com/300x300?text=Sin+Imagen';
        
        const artistName = track.artists.map(artist => artist.name).join(', ');
        const trackName = track.name.length > 30 ? 
            track.name.substring(0, 30) + '...' : 
            track.name;
        
        // Duración formateada
        const duration = this.formatDuration(track.duration_ms);
        
        col.innerHTML = `
            <div class="track-card" style="animation-delay: ${index * 0.1}s">
                <div class="track-image-container">
                    <img src="${albumImage}" alt="${track.name}" class="track-image">
                    <div class="track-overlay">
                        <button class="play-btn">
                            <i class="bi bi-play-fill"></i>
                        </button>
                    </div>
                </div>
                <div class="track-info">
                    <h6 class="track-title" title="${track.name}">${trackName}</h6>
                    <p class="track-artist">${artistName}</p>
                    <div class="track-meta">
                        <span class="track-duration">${duration}</span>
                        <span class="track-popularity">
                            <i class="bi bi-heart"></i> ${track.popularity}
                        </span>
                    </div>
                </div>
                <div class="track-actions">
                    <button class="btn btn-sm btn-outline-secondary add-to-playlist-btn" title="Agregar a playlist" data-track='${JSON.stringify(track)}'>
                        <i class="bi bi-plus"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-secondary more-options-btn" title="Más opciones" data-track='${JSON.stringify(track)}'>
                        <i class="bi bi-three-dots"></i>
                    </button>
                </div>
            </div>
        `;
        
        return col;
    }

    formatDuration(ms) {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    showLoading(show) {
        if (show) {
            this.loadingSpinner.classList.remove('d-none');
            this.refreshBtn.disabled = true;
        } else {
            this.loadingSpinner.classList.add('d-none');
            this.refreshBtn.disabled = false;
        }
    }

    showError() {
        this.errorMessage.classList.remove('d-none');
        this.tracksContainer.innerHTML = '';
    }

    hideError() {
        this.errorMessage.classList.add('d-none');
    }
    
    // Funciones para manejo de playlists
    setupPlaylistModalEvents() {
        // Inicializar modal de Bootstrap
        this.playlistModal = new bootstrap.Modal(document.getElementById('playlistModal'));
        
        // Botón para crear nueva playlist
        const createBtn = document.getElementById('createPlaylistBtn');
        if (createBtn) {
            createBtn.addEventListener('click', () => this.createNewPlaylist());
        }
        
        // Enter en el input de nueva playlist
        const newPlaylistInput = document.getElementById('newPlaylistName');
        if (newPlaylistInput) {
            newPlaylistInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.createNewPlaylist();
                }
            });
        }
    }
    
    setupTrackCardListeners() {
        // Botones de agregar a playlist
        document.querySelectorAll('.add-to-playlist-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const track = JSON.parse(btn.dataset.track);
                this.openPlaylistModal(track);
            });
        });
        
        // Botones de más opciones (abren el mismo modal por ahora)
        document.querySelectorAll('.more-options-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const track = JSON.parse(btn.dataset.track);
                this.openPlaylistModal(track);
            });
        });
    }
    
    openPlaylistModal(track) {
        this.currentTrack = track;
        this.loadPlaylistsFromStorage();
        this.playlistModal.show();
    }
    
    loadPlaylistsFromStorage() {
        const data = this.getStorageData();
        const playlistsList = document.getElementById('playlistsList');
        
        if (data.playlists.length === 0) {
            playlistsList.innerHTML = `
                <div class="empty-playlists">
                    <i class="bi bi-music-note-list"></i>
                    <p>No tienes playlists creadas</p>
                    <small>Crea una nueva playlist abajo</small>
                </div>
            `;
        } else {
            playlistsList.innerHTML = data.playlists.map(playlist => `
                <div class="playlist-item" data-playlist-id="${playlist.id}">
                    <div>
                        <div class="playlist-item-name">${playlist.name}</div>
                        <small>${playlist.tracks.length} canciones</small>
                    </div>
                    <div class="playlist-item-count">${playlist.tracks.length}</div>
                </div>
            `).join('');
            
            // Agregar event listeners a las playlists
            document.querySelectorAll('.playlist-item').forEach(item => {
                item.addEventListener('click', () => {
                    const playlistId = item.dataset.playlistId;
                    this.addTrackToPlaylist(playlistId);
                });
            });
        }
    }
    
    createNewPlaylist() {
        const input = document.getElementById('newPlaylistName');
        const playlistName = input.value.trim();
        
        if (!playlistName) {
            input.classList.add('is-invalid');
            setTimeout(() => input.classList.remove('is-invalid'), 2000);
            return;
        }
        
        const data = this.getStorageData();
        const newPlaylist = {
            id: 'playlist_' + Date.now(),
            name: playlistName,
            tracks: [],
            createdAt: new Date().toISOString(),
            coverImage: 'https://via.placeholder.com/300x300/667eea/ffffff?text=' + encodeURIComponent(playlistName.charAt(0).toUpperCase())
        };
        
        data.playlists.push(newPlaylist);
        this.saveToLocalStorage(data);
        
        // Agregar la canción actual a la nueva playlist
        if (this.currentTrack) {
            this.addTrackToPlaylist(newPlaylist.id);
        } else {
            // Solo mostrar mensaje de creación
            this.showToast(`Playlist "${playlistName}" creada exitosamente`);
            this.playlistModal.hide();
            input.value = '';
        }
    }
    
    addTrackToPlaylist(playlistId) {
        const data = this.getStorageData();
        const playlist = data.playlists.find(p => p.id === playlistId);
        
        if (!playlist) return;
        
        // Verificar si la canción ya está en la playlist
        const trackId = this.currentTrack.id;
        if (playlist.tracks.includes(trackId)) {
            this.showToast('Esta canción ya está en la playlist', 'warning');
            return;
        }
        
        // Agregar la canción a la playlist
        playlist.tracks.push(trackId);
        
        // Guardar la información de la canción si no existe
        if (!data.tracks[trackId]) {
            data.tracks[trackId] = {
                id: this.currentTrack.id,
                name: this.currentTrack.name,
                artist: this.currentTrack.artists.map(a => a.name).join(', '),
                album: this.currentTrack.album.name,
                image: this.currentTrack.album.images[0]?.url || 'https://via.placeholder.com/300x300',
                duration: this.currentTrack.duration_ms,
                preview_url: this.currentTrack.preview_url
            };
        }
        
        this.saveToLocalStorage(data);
        this.showToast(`"${this.currentTrack.name}" agregada a "${playlist.name}"`);
        this.playlistModal.hide();
        
        // Limpiar input de nueva playlist
        document.getElementById('newPlaylistName').value = '';
    }
    
    getStorageData() {
        const defaultData = {
            playlists: [],
            tracks: {}
        };
        
        try {
            const stored = localStorage.getItem('musicflow_data');
            return stored ? JSON.parse(stored) : defaultData;
        } catch (error) {
            console.error('Error leyendo localStorage:', error);
            return defaultData;
        }
    }
    
    saveToLocalStorage(data) {
        try {
            localStorage.setItem('musicflow_data', JSON.stringify(data));
        } catch (error) {
            console.error('Error guardando en localStorage:', error);
            this.showToast('Error al guardar la playlist', 'error');
        }
    }
    
    showToast(message, type = 'success') {
        const toastEl = document.getElementById('successToast');
        const toastMessage = document.getElementById('toastMessage');
        const toastIcon = toastEl.querySelector('.toast-header i');
        
        // Configurar mensaje e icono
        toastMessage.textContent = message;
        
        // Configurar icono según el tipo
        toastIcon.className = type === 'success' ? 'bi bi-check-circle-fill text-success me-2' :
                              type === 'warning' ? 'bi bi-exclamation-triangle-fill text-warning me-2' :
                              'bi bi-x-circle-fill text-danger me-2';
        
        // Mostrar toast
        const toast = new bootstrap.Toast(toastEl);
        toast.show();
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new MusicFlowInicio();
});