// Sistema de gestion del sidebar y sesion
document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('partialsLoaded', function() {
        setupSidebarHandlers();
        checkAuthStatus();
    });
});

function setupSidebarHandlers() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout();
        });
    }
}

function checkAuthStatus() {
    const currentUserId = localStorage.getItem('user_id');
    
    if (!currentUserId) {
        const currentPage = window.location.pathname;
        if (!currentPage.includes('index.html') && 
            !currentPage.includes('registrarUsuario.html') && 
            !currentPage.includes('inicioSesion.html')) {
            window.location.href = 'inicioSesion.html';
        }
    } else {
        updateSidebarUserInfo();
    }
}

function updateSidebarUserInfo() {
    const currentUserId = localStorage.getItem('user_id');
    if (!currentUserId) return;

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const currentUser = users.find(user => user.id === currentUserId);
    
    if (currentUser) {
        const userNameElement = document.querySelector('.sidebar-user-name');
        if (userNameElement) {
            userNameElement.textContent = `${currentUser.firstName} ${currentUser.lastName}`.trim();
        }
    }
}

function handleLogout() {
    if (confirm('¿Estas seguro de que quieres cerrar sesion?')) {
        localStorage.removeItem('user_id');
        localStorage.removeItem('remember_me');
        
        showNotification('Sesion cerrada correctamente', 'success');
        
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 1000);
    }
}

function showNotification(message, type = 'info') {
    const existingNotifications = document.querySelectorAll('.auth-notification');
    existingNotifications.forEach(notification => notification.remove());

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
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

window.SidebarManager = {
    checkAuthStatus,
    updateSidebarUserInfo,
    handleLogout,
    showNotification
};