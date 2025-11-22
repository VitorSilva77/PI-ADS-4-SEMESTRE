document.addEventListener('DOMContentLoaded', () => {
    const btnLogout = document.getElementById('btn-logout');

    if (btnLogout) {
        btnLogout.addEventListener('click', async () => {
            try {
                localStorage.removeItem('profuturo_currentUser');
                await window.api.logout();
                window.location.href = 'index.html';
            } catch (err) {
                console.error('Erro ao fazer logout:', err);
                window.location.href = 'index.html';
            }
        });
    }

    createParticles();
});

function createParticles() {
    const container = document.getElementById('particles-container');
    const particleCount = 50; 

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');

        const size = Math.random() * 4 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;

        particle.style.left = `${Math.random() * 100}vw`;

        const duration = Math.random() * 10 + 5;
        particle.style.animationDuration = `${duration}s`;

        particle.style.animationDelay = `${Math.random() * 10}s`;

        particle.style.opacity = Math.random() * 0.5 + 0.2;

        container.appendChild(particle);
    }
}