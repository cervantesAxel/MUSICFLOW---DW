class UserProfileManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        // cargar datos del usuario actual al iniciar la pagina
        this.loadUserProfile();
        this.setupEventListeners();
        this.updateUI();
    }

    // obtener el usuario actual del localStorage
    getCurrentUser() {
        const users = JSON.parse(localStorage.getItem('musicflow_users') || '[]');
        const currentUserId = localStorage.getItem('musicflow_current_user_id');
        
        if (currentUserId) {
            return users.find(user => user.id === currentUserId) || null;
        }
        return null;
    }

    // cargar perfil del usuario actual
    loadUserProfile() {
        this.currentUser = this.getCurrentUser();
        
        // si no hay usuario actual, crear uno temporal para demostracion
        if (!this.currentUser) {
            this.currentUser = this.createDefaultUser();
        }
    }

    // crear usuario por defecto para demostracion
    createDefaultUser() {
        return {
            id: 'temp_user_' + Date.now(),
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            bio: '',
            genres: [],
            subscriptionType: 'Free',
            memberSince: new Date().toISOString(),
            stats: {
                songs: 0,
                playlists: 0,
                months: 0
            }
        };
    }

    // guardar perfil del usuario en localStorage
    saveUserProfile(userData) {
        const users = JSON.parse(localStorage.getItem('musicflow_users') || '[]');
        const userIndex = users.findIndex(user => user.id === this.currentUser.id);
        
        if (userIndex !== -1) {
            // actualizar usuario existente
            users[userIndex] = { ...users[userIndex], ...userData };
        } else {
            // agregar nuevo usuario
            users.push({ ...this.currentUser, ...userData });
        }
        
        localStorage.setItem('musicflow_users', JSON.stringify(users));
        this.currentUser = { ...this.currentUser, ...userData };
        
        // actualizar usuario actual si es necesario
        localStorage.setItem('musicflow_current_user_id', this.currentUser.id);
        
        return true;
    }

    // actualizar la interfaz con los datos del usuario
    updateUI() {
        if (!this.currentUser) return;

        // actualizar informacion del perfil
        this.updateProfileInfo();
        this.updateUserStats();
        this.updateUserGenres();
    }

    // actualizar informacion personal
    updateProfileInfo() {
        const fullName = `${this.currentUser.firstName || ''} ${this.currentUser.lastName || ''}`.trim() || 'Usuario';
        const email = this.currentUser.email || 'usuario@musicflow.com';
        const phone = this.currentUser.phone || 'No especificado';
        const bio = this.currentUser.bio || 'Aun no has agregado una biografia';
        const memberDate = this.currentUser.memberSince ? new Date(this.currentUser.memberSince).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }) : 'Fecha no disponible';
        const subscription = this.currentUser.subscriptionType || 'Free';

        // actualizar elementos del DOM
        const elements = {
            userName: document.getElementById('userName'),
            userEmail: document.getElementById('userEmail'),
            userEmailDisplay: document.getElementById('userEmailDisplay'),
            userPhone: document.getElementById('userPhone'),
            userBio: document.getElementById('userBio'),
            memberSince: document.getElementById('memberSince'),
            subscriptionType: document.getElementById('subscriptionType'),
            fullName: document.getElementById('fullName')
        };

        if (elements.userName) elements.userName.textContent = fullName;
        if (elements.userEmail) elements.userEmail.textContent = email;
        if (elements.userEmailDisplay) elements.userEmailDisplay.textContent = email;
        if (elements.userPhone) elements.userPhone.textContent = phone;
        if (elements.userBio) elements.userBio.textContent = bio;
        if (elements.memberSince) elements.memberSince.textContent = memberDate;
        if (elements.subscriptionType) {
            elements.subscriptionType.textContent = subscription;
            elements.subscriptionType.className = subscription === 'Premium' ? 'info-value subscription-premium' : 'info-value';
        }
        if (elements.fullName) elements.fullName.textContent = fullName;
    }

    // actualizar estadisticas del usuario
    updateUserStats() {
        const stats = this.currentUser.stats || { songs: 0, playlists: 0, months: 0 };
        
        // calcular meses de membresia
        if (this.currentUser.memberSince) {
            const memberDate = new Date(this.currentUser.memberSince);
            const currentDate = new Date();
            stats.months = Math.max(1, Math.floor((currentDate - memberDate) / (1000 * 60 * 60 * 24 * 30)));
        }

        // actualizar elementos de estadisticas
        const statElements = document.querySelectorAll('.stat-number');
        if (statElements[0]) statElements[0].textContent = stats.songs;
        if (statElements[1]) statElements[1].textContent = stats.playlists;
        if (statElements[2]) statElements[2].textContent = stats.months;
    }

    // actualizar generos musicales
    updateUserGenres() {
        const genres = this.currentUser.genres || [];
        const genresContainer = document.querySelector('.genres-grid');
        
        if (genresContainer) {
            genresContainer.innerHTML = '';
            
            if (genres.length === 0) {
                genresContainer.innerHTML = '<span class="text-muted">No has seleccionado generos aun</span>';
            } else {
                genres.forEach(genre => {
                    const genreTag = document.createElement('span');
                    genreTag.className = 'genre-tag';
                    genreTag.textContent = genre;
                    genresContainer.appendChild(genreTag);
                });
            }
        }
    }

    // configurar event listeners
    setupEventListeners() {
        // boton de guardar en el modal
        const saveBtn = document.getElementById('saveProfileBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.handleSaveProfile());
        }

        // formulario de edicion
        const editForm = document.getElementById('editProfileForm');
        if (editForm) {
            editForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSaveProfile();
            });
        }

        // cargar datos en el modal cuando se abre
        const editModal = document.getElementById('editProfileModal');
        if (editModal) {
            editModal.addEventListener('show.bs.modal', () => {
                this.loadEditFormData();
            });
        }
    }

    // cargar datos del formulario de edicion
    loadEditFormData() {
        if (!this.currentUser) return;

        const fields = {
            editFirstName: this.currentUser.firstName || '',
            editLastName: this.currentUser.lastName || '',
            editEmail: this.currentUser.email || '',
            editPhone: this.currentUser.phone || '',
            editBio: this.currentUser.bio || ''
        };

        Object.entries(fields).forEach(([fieldId, value]) => {
            const element = document.getElementById(fieldId);
            if (element) {
                element.value = value;
            }
        });
    }

    // manejar guardado del perfil
    handleSaveProfile() {
        if (!this.currentUser) return;

        // obtener datos del formulario
        const formData = {
            firstName: document.getElementById('editFirstName')?.value || '',
            lastName: document.getElementById('editLastName')?.value || '',
            email: document.getElementById('editEmail')?.value || '',
            phone: document.getElementById('editPhone')?.value || '',
            bio: document.getElementById('editBio')?.value || ''
        };

        // validar datos basicos
        if (!formData.email) {
            this.showNotification('El correo electronico es requerido', 'error');
            return;
        }

        // guardar en localStorage
        if (this.saveUserProfile(formData)) {
            // actualizar UI
            this.updateUI();
            
            // cerrar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('editProfileModal'));
            if (modal) {
                modal.hide();
            }
            
            // mostrar notificacion
            this.showNotification('Perfil actualizado correctamente', 'success');
        } else {
            this.showNotification('Error al guardar el perfil', 'error');
        }
    }

    // mostrar notificaciones
    showNotification(message, type = 'info') {
        // crear elemento de notificacion
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'} position-fixed top-0 end-0 m-3`;
        notification.style.zIndex = '9999';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // remover despues de 3 segundos
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // metodo para registrar nuevos usuarios (sera usado por el sistema de registro)
    static registerUser(userData) {
        const users = JSON.parse(localStorage.getItem('musicflow_users') || '[]');
        const newUser = {
            id: 'user_' + Date.now(),
            ...userData,
            memberSince: new Date().toISOString(),
            stats: {
                songs: 0,
                playlists: 0,
                months: 0
            }
        };
        
        users.push(newUser);
        localStorage.setItem('musicflow_users', JSON.stringify(users));
        
        return newUser;
    }

    // metodo para iniciar sesion
    static loginUser(email, password) {
        const users = JSON.parse(localStorage.getItem('musicflow_users') || '[]');
        const user = users.find(u => u.email === email);
        
        if (user) {
            localStorage.setItem('musicflow_current_user_id', user.id);
            return user;
        }
        
        return null;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    window.profileManager = new UserProfileManager();
});

window.UserProfileManager = UserProfileManager;