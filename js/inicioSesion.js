// Sistema de inicio de sesion
class LoginManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkExistingSession();
    }

    setupEventListeners() {
        const form = document.getElementById('loginForm');
        const togglePassword = document.getElementById('togglePassword');
        const password = document.getElementById('password');

        // manejar envio del formulario
        if (form) {
            form.addEventListener('submit', (e) => this.handleLogin(e));
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

    checkExistingSession() {
        const currentUserId = localStorage.getItem('musicflow_current_user_id');
        if (currentUserId) {
            const users = JSON.parse(localStorage.getItem('musicflow_users') || '[]');
            const currentUser = users.find(user => user.id === currentUserId);
            
            if (currentUser) {
                // si ya hay una sesion activa, redirigir al perfil
                window.location.href = 'perfilUsuario.html';
            }
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        // obtener datos del formulario
        const formData = this.getFormData();
        
        // validar datos
        const validation = this.validateFormData(formData);
        if (!validation.isValid) {
            this.showNotification(validation.message, 'error');
            return;
        }

        // intentar iniciar sesion
        try {
            const user = this.authenticateUser(formData.email, formData.password);
            
            if (user) {
                // establecer sesion
                this.setSession(user);
                
                this.showNotification('¡Inicio de sesion exitoso! Redirigiendo...', 'success');
                
                // redirigir al perfil despues de 1.5 segundos
                setTimeout(() => {
                    window.location.href = 'perfilUsuario.html';
                }, 1500);
                
            } else {
                this.showNotification('Correo electronico o contraseña incorrectos', 'error');
            }
            
        } catch (error) {
            this.showNotification('Error al iniciar sesion. Intentalo nuevamente.', 'error');
            console.error('Login error:', error);
        }
    }

    getFormData() {
        return {
            email: document.getElementById('email')?.value || '',
            password: document.getElementById('password')?.value || '',
            rememberMe: document.getElementById('rememberMe')?.checked || false
        };
    }

    validateFormData(data) {
        // validar campos requeridos
        if (!data.email || !data.password) {
            return { isValid: false, message: 'Por favor completa todos los campos' };
        }

        // validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            return { isValid: false, message: 'Por favor ingresa un correo electronico valido' };
        }

        return { isValid: true, message: 'Datos validos' };
    }

    authenticateUser(email, password) {
        const users = JSON.parse(localStorage.getItem('musicflow_users') || '[]');
        
        // buscar usuario por email
        const user = users.find(u => u.email === email);
        
        if (user && user.password === password) {
            // en produccion, aqui deberia verificarse el hash de la contraseña
            return user;
        }
        
        return null;
    }

    setSession(user) {
        // establecer usuario actual
        localStorage.setItem('musicflow_current_user_id', user.id);
        
        // si se selecciono "recordarme", guardar sesion persistente
        if (document.getElementById('rememberMe')?.checked) {
            localStorage.setItem('musicflow_remember_me', 'true');
        } else {
            localStorage.removeItem('musicflow_remember_me');
        }
        
        // actualizar ultimo inicio de sesion
        const users = JSON.parse(localStorage.getItem('musicflow_users') || '[]');
        const userIndex = users.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
            users[userIndex].lastLogin = new Date().toISOString();
            localStorage.setItem('musicflow_users', JSON.stringify(users));
        }
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

    // metodo estatico para cerrar sesion
    static logout() {
        localStorage.removeItem('musicflow_current_user_id');
        localStorage.removeItem('musicflow_remember_me');
        window.location.href = 'inicioSesion.html';
    }
}

// Inicializar el gestor de login cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    window.loginManager = new LoginManager();
});