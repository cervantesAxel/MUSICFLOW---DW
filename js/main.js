// JavaScript basico para MusicFlow
document.addEventListener('DOMContentLoaded', function() {
    console.log('MusicFlow - Pagina cargada correctamente');
    
    // animacion suave al hacer scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // observar elementos para animaciones
    const animateElements = document.querySelectorAll('.feature-card');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // efecto hover en botones
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // animacion del visualizador de musica
    const bars = document.querySelectorAll('.bar');
    bars.forEach((bar, index) => {
        setInterval(() => {
            const randomHeight = Math.random() * 100 + 40;
            bar.style.height = randomHeight + 'px';
        }, 1000 + (index * 200));
    });
});