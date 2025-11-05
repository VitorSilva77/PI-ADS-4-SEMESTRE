var api = window.api;

if (!api) {
  console.error(
    'Erro fatal: A API do preload (window.api) não foi encontrada. ' +
    'Verifique se o preload.js está sendo carregado corretamente no main.js.'
  );
  alert('Erro de inicialização. A aplicação não pode continuar.');
}
function initializeThemeSwitcher() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;
    if (!darkModeToggle) return;
    const applyTheme = () => {
        if (darkModeToggle.checked) {
            body.classList.add('dark-mode');
            localStorage.setItem('darkMode', 'enabled');
        } else {
            body.classList.remove('dark-mode');
            localStorage.setItem('darkMode', 'disabled');
        }
    };
    if (localStorage.getItem('darkMode') === 'enabled') {
        darkModeToggle.checked = true;
    }
    applyTheme();
    darkModeToggle.addEventListener('change', applyTheme);
}

document.addEventListener('DOMContentLoaded', initializeThemeSwitcher);