// JavaScript para la página de playlists - MusicFlow
class MusicFlowPlaylists {
    constructor() {
        this.playlistsContainer = document.getElementById('playlistsContainer');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.emptyState = document.getElementById('emptyState');
        this.noResultsState = document.getElementById('noResultsState');
        this.searchInput = document.getElementById('searchPlaylists');
        this.createPlaylistBtn = document.getElementById('createPlaylistBtn');
        this.emptyCreateBtn = document.getElementById('emptyCreateBtn');
        
        // Modals
        this.playlistModal = null;
        this.viewPlaylistModal = null;
        this.deleteConfirmModal = null;
        
        // Form elements
        this.playlistForm = document.getElementById('playlistForm');
        this.playlistNameInput = document.getElementById('playlistName');
        this.playlistDescriptionInput = document.getElementById('playlistDescription');
        this.playlistPublicInput = document.getElementById('playlistPublic');
        this.savePlaylistBtn = document.getElementById('savePlaylistBtn');
        this.deletePlaylistBtn = document.getElementById('deletePlaylistBtn');
        
        // Current state
        this.currentPlaylist = null;
        this.playlists = [];
        this.tracks = {};
        this.filteredPlaylists = [];
        this.selectedColor = '#667eea';
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.setupModals();
        this.setupColorPicker();
        this.loadData();
        this.renderPlaylists();
        this.updateStats();
    }

    setupEventListeners() {
        // Create playlist buttons
        this.createPlaylistBtn.addEventListener('click', () => this.openCreateModal());
        this.emptyCreateBtn.addEventListener('click', () => this.openCreateModal());
        
        // Search functionality
        this.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        
        // Sort buttons
        document.getElementById('sortByNameBtn').addEventListener('click', () => this.sortPlaylists('name'));
        document.getElementById('sortByDateBtn').addEventListener('click', () => this.sortPlaylists('date'));
        document.getElementById('sortByTracksBtn').addEventListener('click', () => this.sortPlaylists('tracks'));
        
        // Form submission
        this.savePlaylistBtn.addEventListener('click', () => this.savePlaylist());
        this.deletePlaylistBtn.addEventListener('click', () => this.confirmDelete());
        
        // Enter key in form
        this.playlistNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.savePlaylist();
            }
        });
        
        // Modal view playlist actions
        document.getElementById('playAllBtn')?.addEventListener('click', () => this.playAll());
        document.getElementById('shuffleBtn')?.addEventListener('click', () => this.shufflePlaylist());
        document.getElementById('editFromViewBtn')?.addEventListener('click', () => this.editFromView());
        
        // Confirm delete
        document.getElementById('confirmDeleteBtn')?.addEventListener('click', () => this.deletePlaylist());
        
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
    }

    setupModals() {
        this.playlistModal = new bootstrap.Modal(document.getElementById('playlistModal'));
        this.viewPlaylistModal = new bootstrap.Modal(document.getElementById('viewPlaylistModal'));
        this.deleteConfirmModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
    }

    setupColorPicker() {
        const colorOptions = document.querySelectorAll('.color-option');
        colorOptions.forEach(option => {
            option.addEventListener('click', () => {
                colorOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                this.selectedColor = option.dataset.color;
            });
        });
        
        // Select first color by default
        if (colorOptions.length > 0) {
            colorOptions[0].classList.add('selected');
        }
    }

    loadData() {
        const data = this.getStorageData();
        this.playlists = data.playlists || [];
        this.tracks = data.tracks || {};
        this.filteredPlaylists = [...this.playlists];
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
            this.showToast('Error al guardar los datos', 'error');
        }
    }

    renderPlaylists() {
        this.showLoading(true);
        
        setTimeout(() => {
            this.playlistsContainer.innerHTML = '';
            
            if (this.filteredPlaylists.length === 0) {
                if (this.playlists.length === 0) {
                    this.showEmptyState();
                } else {
                    this.showNoResultsState();
                }
            } else {
                this.hideEmptyStates();
                this.filteredPlaylists.forEach((playlist, index) => {
                    const playlistCard = this.createPlaylistCard(playlist, index);
                    this.playlistsContainer.appendChild(playlistCard);
                });
                this.setupPlaylistCardListeners();
            }
            
            this.showLoading(false);
        }, 300);
    }

    createPlaylistCard(playlist, index) {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4 col-xl-3';
        
        const coverImage = playlist.coverImage || this.generateCoverImage(playlist);
        const trackCount = playlist.tracks ? playlist.tracks.length : 0;
        const createdDate = new Date(playlist.createdAt).toLocaleDateString('es-ES');
        
        col.innerHTML = `
            <div class="playlist-card" data-playlist-id="${playlist.id}" style="animation-delay: ${index * 0.1}s">
                <div class="playlist-cover-container">
                    <img src="${coverImage}" alt="${playlist.name}" class="playlist-cover">
                    <div class="playlist-overlay">
                        <button class="playlist-play-btn">
                            <i class="bi bi-play-fill"></i>
                        </button>
                    </div>
                </div>
                <div class="playlist-info">
                    <h6 class="playlist-title" title="${playlist.name}">${playlist.name}</h6>
                    <p class="playlist-description">${playlist.description || 'Sin descripción'}</p>
                    <div class="playlist-meta">
                        <span class="playlist-track-count">
                            <i class="bi bi-music-note"></i> ${trackCount} canciones
                        </span>
                        <span class="playlist-date">${createdDate}</span>
                    </div>
                </div>
                <div class="playlist-actions">
                    <button class="btn btn-sm btn-outline-secondary view-playlist-btn" title="Ver playlist">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-secondary edit-playlist-btn" title="Editar">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-secondary delete-playlist-btn" title="Eliminar">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        return col;
    }

    generateCoverImage(playlist) {
        const firstLetter = playlist.name.charAt(0).toUpperCase();
        const color = playlist.color || '#667eea';
        return `https://via.placeholder.com/300x300/${color.replace('#', '')}/ffffff?text=${firstLetter}`;
    }

    setupPlaylistCardListeners() {
        document.querySelectorAll('.playlist-card').forEach(card => {
            const playlistId = card.dataset.playlistId;
            
            // Play button
            const playBtn = card.querySelector('.playlist-play-btn');
            playBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.playPlaylist(playlistId);
            });
            
            // View button
            const viewBtn = card.querySelector('.view-playlist-btn');
            viewBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.viewPlaylist(playlistId);
            });
            
            // Edit button
            const editBtn = card.querySelector('.edit-playlist-btn');
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.editPlaylist(playlistId);
            });
            
            // Delete button
            const deleteBtn = card.querySelector('.delete-playlist-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deletePlaylistWithConfirm(playlistId);
            });
            
            // Card click
            card.addEventListener('click', () => {
                this.viewPlaylist(playlistId);
            });
        });
    }

    openCreateModal() {
        this.currentPlaylist = null;
        this.resetForm();
        document.getElementById('modalTitle').innerHTML = '<i class="bi bi-plus-circle me-2"></i>Crear Nueva Playlist';
        this.deletePlaylistBtn.classList.add('d-none');
        this.playlistModal.show();
    }

    editPlaylist(playlistId) {
        const playlist = this.playlists.find(p => p.id === playlistId);
        if (!playlist) return;
        
        this.currentPlaylist = playlist;
        this.populateForm(playlist);
        document.getElementById('modalTitle').innerHTML = '<i class="bi bi-pencil me-2"></i>Editar Playlist';
        this.deletePlaylistBtn.classList.remove('d-none');
        this.playlistModal.show();
    }

    populateForm(playlist) {
        this.playlistNameInput.value = playlist.name || '';
        this.playlistDescriptionInput.value = playlist.description || '';
        this.playlistPublicInput.checked = playlist.isPublic || false;
        
        // Set color
        this.selectedColor = playlist.color || '#667eea';
        document.querySelectorAll('.color-option').forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.color === this.selectedColor) {
                option.classList.add('selected');
            }
        });
    }

    resetForm() {
        this.playlistForm.reset();
        this.selectedColor = '#667eea';
        document.querySelectorAll('.color-option').forEach(option => {
            option.classList.remove('selected');
        });
        document.querySelector('.color-option[data-color="#667eea"]').classList.add('selected');
    }

    savePlaylist() {
        const name = this.playlistNameInput.value.trim();
        
        if (!name) {
            this.playlistNameInput.classList.add('is-invalid');
            setTimeout(() => this.playlistNameInput.classList.remove('is-invalid'), 2000);
            return;
        }
        
        const data = this.getStorageData();
        
        if (this.currentPlaylist) {
            // Edit existing playlist
            const playlistIndex = data.playlists.findIndex(p => p.id === this.currentPlaylist.id);
            if (playlistIndex !== -1) {
                data.playlists[playlistIndex] = {
                    ...data.playlists[playlistIndex],
                    name: name,
                    description: this.playlistDescriptionInput.value.trim(),
                    isPublic: this.playlistPublicInput.checked,
                    color: this.selectedColor,
                    updatedAt: new Date().toISOString()
                };
            }
            this.showToast('Playlist actualizada exitosamente');
        } else {
            // Create new playlist
            const newPlaylist = {
                id: 'playlist_' + Date.now(),
                name: name,
                description: this.playlistDescriptionInput.value.trim(),
                color: this.selectedColor,
                tracks: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isPublic: this.playlistPublicInput.checked
            };
            
            data.playlists.push(newPlaylist);
            this.showToast(`Playlist "${name}" creada exitosamente`);
        }
        
        this.saveToLocalStorage(data);
        this.loadData();
        this.renderPlaylists();
        this.updateStats();
        this.playlistModal.hide();
    }

    deletePlaylistWithConfirm(playlistId) {
        const playlist = this.playlists.find(p => p.id === playlistId);
        if (!playlist) return;
        
        this.currentPlaylist = playlist;
        document.getElementById('deletePlaylistName').textContent = playlist.name;
        this.deleteConfirmModal.show();
    }

    confirmDelete() {
        if (!this.currentPlaylist) return;
        
        this.playlistModal.hide();
        document.getElementById('deletePlaylistName').textContent = this.currentPlaylist.name;
        this.deleteConfirmModal.show();
    }

    deletePlaylist() {
        if (!this.currentPlaylist) return;
        
        const data = this.getStorageData();
        data.playlists = data.playlists.filter(p => p.id !== this.currentPlaylist.id);
        
        this.saveToLocalStorage(data);
        this.showToast(`Playlist "${this.currentPlaylist.name}" eliminada`);
        
        this.deleteConfirmModal.hide();
        this.loadData();
        this.renderPlaylists();
        this.updateStats();
    }

    viewPlaylist(playlistId) {
        const playlist = this.playlists.find(p => p.id === playlistId);
        if (!playlist) return;
        
        this.currentPlaylist = playlist;
        
        // Update modal header
        document.getElementById('modalPlaylistTitle').textContent = playlist.name;
        document.getElementById('modalPlaylistInfo').textContent = 
            `${playlist.tracks.length} canciones • ${playlist.isPublic ? 'Pública' : 'Privada'}`;
        
        // Update cover
        const coverElement = document.getElementById('modalPlaylistCover');
        const coverImage = playlist.coverImage || this.generateCoverImage(playlist);
        coverElement.style.background = `url('${coverImage}') center/cover`;
        if (!playlist.coverImage) {
            coverElement.style.background = `${playlist.color || '#667eea'}`;
            coverElement.textContent = playlist.name.charAt(0).toUpperCase();
        } else {
            coverElement.textContent = '';
        }
        
        // Load tracks
        this.loadPlaylistTracks(playlist);
        
        this.viewPlaylistModal.show();
    }

    loadPlaylistTracks(playlist) {
        const tracksList = document.getElementById('modalTracksList');
        const emptyTracksState = document.getElementById('emptyTracksState');
        
        if (!playlist.tracks || playlist.tracks.length === 0) {
            tracksList.innerHTML = '';
            emptyTracksState.classList.remove('d-none');
            return;
        }
        
        emptyTracksState.classList.add('d-none');
        tracksList.innerHTML = '';
        
        playlist.tracks.forEach(trackId => {
            const track = this.tracks[trackId];
            if (track) {
                const trackElement = this.createTrackElement(track);
                tracksList.appendChild(trackElement);
            }
        });
        
        this.setupTrackListeners();
    }

    createTrackElement(track) {
        const div = document.createElement('div');
        div.className = 'track-item';
        div.dataset.trackId = track.id;
        
        const duration = this.formatDuration(track.duration);
        
        div.innerHTML = `
            <img src="${track.image || 'https://via.placeholder.com/50x50'}" alt="${track.name}" class="track-image">
            <div class="track-info">
                <div class="track-name">${track.name}</div>
                <div class="track-artist">${track.artist}</div>
            </div>
            <div class="track-duration">${duration}</div>
            <div class="track-actions">
                <button class="btn btn-sm play-track-btn" title="Reproducir">
                    <i class="bi bi-play-fill"></i>
                </button>
                <button class="btn btn-sm remove-track-btn" title="Quitar de playlist">
                    <i class="bi bi-dash"></i>
                </button>
            </div>
        `;
        
        return div;
    }

    setupTrackListeners() {
        document.querySelectorAll('.play-track-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const trackId = btn.closest('.track-item').dataset.trackId;
                this.playTrack(trackId);
            });
        });
        
        document.querySelectorAll('.remove-track-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const trackId = btn.closest('.track-item').dataset.trackId;
                this.removeTrackFromPlaylist(trackId);
            });
        });
    }

    removeTrackFromPlaylist(trackId) {
        if (!this.currentPlaylist) return;
        
        const data = this.getStorageData();
        const playlist = data.playlists.find(p => p.id === this.currentPlaylist.id);
        
        if (playlist) {
            playlist.tracks = playlist.tracks.filter(id => id !== trackId);
            this.saveToLocalStorage(data);
            
            // Update current playlist
            this.currentPlaylist = playlist;
            this.loadData();
            
            // Reload tracks in modal
            this.loadPlaylistTracks(playlist);
            
            // Update stats
            this.updateStats();
            
            // Re-render playlists to update track count
            this.renderPlaylists();
            
            this.showToast('Canción eliminada de la playlist');
        }
    }

    editFromView() {
        if (!this.currentPlaylist) return;
        
        this.viewPlaylistModal.hide();
        setTimeout(() => {
            this.editPlaylist(this.currentPlaylist.id);
        }, 300);
    }

    playPlaylist(playlistId) {
        const playlist = this.playlists.find(p => p.id === playlistId);
        if (playlist && playlist.tracks.length > 0) {
            this.showToast(`Reproduciendo "${playlist.name}"`);
            // Here you would integrate with actual music player
        } else {
            this.showToast('La playlist está vacía', 'warning');
        }
    }

    playAll() {
        if (!this.currentPlaylist) return;
        this.playPlaylist(this.currentPlaylist.id);
    }

    shufflePlaylist() {
        if (!this.currentPlaylist) return;
        this.showToast(`Mezclando "${this.currentPlaylist.name}"`);
        // Here you would implement shuffle functionality
    }

    playTrack(trackId) {
        const track = this.tracks[trackId];
        if (track) {
            this.showToast(`Reproduciendo "${track.name}"`);
            // Here you would integrate with actual music player
        }
    }

    handleSearch(query) {
        const searchTerm = query.toLowerCase().trim();
        
        if (searchTerm === '') {
            this.filteredPlaylists = [...this.playlists];
        } else {
            this.filteredPlaylists = this.playlists.filter(playlist => 
                playlist.name.toLowerCase().includes(searchTerm) ||
                (playlist.description && playlist.description.toLowerCase().includes(searchTerm))
            );
        }
        
        this.renderPlaylists();
    }

    sortPlaylists(criteria) {
        switch (criteria) {
            case 'name':
                this.filteredPlaylists.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'date':
                this.filteredPlaylists.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'tracks':
                this.filteredPlaylists.sort((a, b) => (b.tracks?.length || 0) - (a.tracks?.length || 0));
                break;
        }
        
        this.renderPlaylists();
    }

    updateStats() {
        const totalPlaylists = this.playlists.length;
        const totalTracks = this.playlists.reduce((sum, playlist) => sum + (playlist.tracks?.length || 0), 0);
        const totalDuration = this.calculateTotalDuration();
        
        document.getElementById('totalPlaylists').textContent = totalPlaylists;
        document.getElementById('totalTracks').textContent = totalTracks;
        document.getElementById('totalDuration').textContent = totalDuration;
    }

    calculateTotalDuration() {
        let totalMs = 0;
        
        this.playlists.forEach(playlist => {
            if (playlist.tracks) {
                playlist.tracks.forEach(trackId => {
                    const track = this.tracks[trackId];
                    if (track && track.duration) {
                        totalMs += track.duration;
                    }
                });
            }
        });
        
        const hours = Math.floor(totalMs / 3600000);
        const minutes = Math.floor((totalMs % 3600000) / 60000);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    }

    formatDuration(ms) {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    showLoading(show) {
        if (show) {
            this.loadingSpinner.classList.remove('d-none');
        } else {
            this.loadingSpinner.classList.add('d-none');
        }
    }

    showEmptyState() {
        this.emptyState.classList.remove('d-none');
        this.noResultsState.classList.add('d-none');
    }

    showNoResultsState() {
        this.emptyState.classList.add('d-none');
        this.noResultsState.classList.remove('d-none');
    }

    hideEmptyStates() {
        this.emptyState.classList.add('d-none');
        this.noResultsState.classList.add('d-none');
    }

    showToast(message, type = 'success') {
        const toastEl = document.getElementById('successToast');
        const toastMessage = document.getElementById('toastMessage');
        const toastIcon = toastEl.querySelector('.toast-header i');
        
        toastMessage.textContent = message;
        
        toastIcon.className = type === 'success' ? 'bi bi-check-circle-fill text-success me-2' :
                              type === 'warning' ? 'bi bi-exclamation-triangle-fill text-warning me-2' :
                              'bi bi-x-circle-fill text-danger me-2';
        
        const toast = new bootstrap.Toast(toastEl);
        toast.show();
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new MusicFlowPlaylists();
});