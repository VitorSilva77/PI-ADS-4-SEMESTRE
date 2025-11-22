document.addEventListener('DOMContentLoaded', () => {
    const popupHTML = `
        <div id="custom-popup" class="popup-overlay">
            <div class="popup-content">
                <div id="popup-icon" class="popup-icon"></div>
                <h3 id="popup-title">Título</h3>
                <p id="popup-message">Mensagem</p>
                <button id="popup-close-btn" class="popup-btn">OK</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', popupHTML);

    const popup = document.getElementById('custom-popup');
    const closeBtn = document.getElementById('popup-close-btn');

    closeBtn.addEventListener('click', closePopup);
    popup.addEventListener('click', (e) => {
        if (e.target === popup) closePopup();
    });
});

function closePopup() {
    document.getElementById('custom-popup').classList.remove('show');
}

/**
 * @param {string} message - A mensagem a ser exibida.
 * @param {boolean} isSuccess - true para sucesso, false para erro
 * @param {string} [title] - Título
 */
window.showPopup = function(message, isSuccess, title = null) {
    const popup = document.getElementById('custom-popup');
    const content = popup.querySelector('.popup-content');
    const titleEl = document.getElementById('popup-title');
    const msgEl = document.getElementById('popup-message');
    const iconEl = document.getElementById('popup-icon');

    content.className = 'popup-content ' + (isSuccess ? 'popup-success' : 'popup-error');
    
    iconEl.innerHTML = isSuccess ? '<i class="fa-solid fa-circle-check"></i>' : '<i class="fa-solid fa-circle-xmark"></i>';
    titleEl.textContent = title || (isSuccess ? 'Sucesso!' : 'Erro!');
    msgEl.textContent = message;

    popup.classList.add('show');
};