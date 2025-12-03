// Sistema de registro de usuarios
class RegistrationManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        const form = document.getElementById('registerForm');
        const togglePassword = document.getElementById('togglePassword');
        const password = document.getElementById('password');

        // manejar envio del formulario
        if (form) {
            form.addEventListener('submit', (e) => this.handleRegistration(e));
        }

        // toggle contraseña
        if (togglePassword && password) {
            togglePassword.addEventListener('click', () => {
                const type = password.type === 'password' ? 'text' : 'password';
                password.type = type;
                togglePassword.innerHTML = type === 'password' ? 
                    '<i class="bi bi-eye"></i>' : '<i class="bi bi-eye-slash"></i>';
            });
        }
    }

    async handleRegistration(e) {
        e.preventDefault();
        
        // obtener datos del formulario
        const formData = this.getFormData();
        
        // validar datos
        const validation = this.validateFormData(formData);
        if (!validation.isValid) {
            this.showNotification(validation.message, 'error');
            return;
        }

        // verificar si el usuario ya existe
        if (this.userExists(formData.email)) {
            this.showNotification('Ya existe una cuenta con este correo electronico', 'error');
            return;
        }

        // registrar usuario
        try {
            const user = this.registerUser(formData);
            this.showNotification('¡Cuenta creada exitosamente! Redirigiendo...', 'success');
            
            // redirigir al perfil despues de 2 segundos
            setTimeout(() => {
                window.location.href = 'inicio.html';
            }, 2000);
            
        } catch (error) {
            this.showNotification('Error al crear la cuenta. Intentalo nuevamente.', 'error');
            console.error('Registration error:', error);
        }
    }

    getFormData() {
        const genres = [];
        document.querySelectorAll('input[type="checkbox"][id^="genre-"]:checked').forEach(checkbox => {
            genres.push(checkbox.value);
        });

        return {
            firstName: document.getElementById('firstName')?.value || '',
            lastName: document.getElementById('lastName')?.value || '',
            email: document.getElementById('email')?.value || '',
            phone: document.getElementById('phone')?.value || '',
            password: document.getElementById('password')?.value || '',
            confirmPassword: document.getElementById('confirmPassword')?.value || '',
            genres: genres,
            termsAccepted: document.getElementById('terms')?.checked || false,
            subscriptionType: 'Free'
        };
    }

    validateFormData(data) {
        // validar campos requeridos
        if (!data.firstName || !data.lastName || !data.email || !data.password) {
            return { isValid: false, message: 'Por favor completa todos los campos requeridos' };
        }

        // validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            return { isValid: false, message: 'Por favor ingresa un correo electronico valido' };
        }

        // validar contraseña
        if (data.password.length < 6) {
            return { isValid: false, message: 'La contraseña debe tener al menos 6 caracteres' };
        }

        // validar que las contraseñas coincidan
        if (data.password !== data.confirmPassword) {
            return { isValid: false, message: 'Las contraseñas no coinciden' };
        }

        // validar terminos y condiciones
        if (!data.termsAccepted) {
            return { isValid: false, message: 'Debes aceptar los terminos y condiciones' };
        }

        return { isValid: true, message: 'Datos validos' };
    }

    userExists(email) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        return users.some(user => user.email === email);
    }

    registerUser(userData) {
        // obtener usuarios existentes
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // crear nuevo usuario
        const newUser = {
            id: 'user_' + Date.now(),
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            phone: userData.phone,
            password: userData.password, // en produccion, esto deberia estar hasheado
            genres: userData.genres,
            bio: '',
            subscriptionType: userData.subscriptionType,
            memberSince: new Date().toISOString(),
            stats: {
                songs: 0,
                playlists: 0,
                months: 0
            }
        };

        // agregar usuario a la lista
        users.push(newUser);
        
        // guardar en localStorage
        localStorage.setItem('users', JSON.stringify(users));
        
        // establecer como usuario actual
        localStorage.setItem('user_id', newUser.id);
        
        return newUser;
    }

    showNotification(message, type = 'info') {
        // eliminar notificaciones existentes
        const existingNotifications = document.querySelectorAll('.auth-notification');
        existingNotifications.forEach(notification => notification.remove());

        // crear nueva notificacion
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'error' ? 'danger' : 'success'} auth-notification position-fixed top-0 start-50 translate-middle-x mt-3`;
        notification.style.zIndex = '9999';
        notification.style.minWidth = '300px';
        notification.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="bi ${type === 'error' ? 'bi-exclamation-circle' : 'bi-check-circle'} me-2"></i>
                ${message}
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // remover despues de 3 segundos
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Inicializar el gestor de registro cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    window.registrationManager = new RegistrationManager();
});