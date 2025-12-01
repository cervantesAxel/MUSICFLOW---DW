// Sistema de gestion del sidebar y sesion
document.addEventListener('DOMContentLoaded', function() {
    // esperar a que los partials se carguen
    document.addEventListener('partialsLoaded', function() {
        setupSidebarHandlers();
        checkAuthStatus();
    });
});

function setupSidebarHandlers() {
    // configurar el boton de cerrar sesion
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout();
        });
    }
}

function checkAuthStatus() {
    const currentUserId = localStorage.getItem('musicflow_current_user_id');
    const sidebarLinks = document.querySelectorAll('.side-card[data-page]');
    
    if (!currentUserId) {
        // si no hay sesion, redirigir al inicio de sesion
        // solo si no estamos ya en paginas publicas
        const currentPage = window.location.pathname;
        if (!currentPage.includes('index.html') && 
            !currentPage.includes('registrarUsuario.html') && 
            !currentPage.includes('inicioSesion.html')) {
            window.location.href = 'inicioSesion.html';
        }
    } else {
        // si hay sesion, actualizar informacion del usuario en el sidebar si es necesario
        updateSidebarUserInfo();
    }
}

function updateSidebarUserInfo() {
    const currentUserId = localStorage.getItem('musicflow_current_user_id');
    if (!currentUserId) return;

    const users = JSON.parse(localStorage.getItem('musicflow_users') || '[]');
    const currentUser = users.find(user => user.id === currentUserId);
    
    if (currentUser) {
        // actualizar nombre de usuario en el sidebar si existe un elemento para ello
        const userNameElement = document.querySelector('.sidebar-user-name');
        if (userNameElement) {
            userNameElement.textContent = `${currentUser.firstName} ${currentUser.lastName}`.trim() || 'Usuario';
        }
    }
}

function handleLogout() {
    // mostrar confirmacion
    if (confirm('¿Estas seguro de que quieres cerrar sesion?')) {
        // cerrar sesion
        localStorage.removeItem('musicflow_current_user_id');
        localStorage.removeItem('musicflow_remember_me');
        
        // mostrar notificacion
        showNotification('Sesion cerrada correctamente', 'success');
        
        // redirigir al inicio
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 1000);
    }
}

function showNotification(message, type = 'info') {
    // eliminar notificaciones existentes
    const existingNotifications = document.querySelectorAll('.auth-notification');
    existingNotifications.forEach(notification => notification.remove());

    // crear nueva notificacion
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : 'success'} auth-notification position-fixed top-0 end-0 m-3`;
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

// exportar funciones para uso global
window.SidebarManager = {
    checkAuthStatus,
    updateSidebarUserInfo,
    handleLogout,
    showNotification
};