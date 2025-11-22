var api = window.api;

if (!api) {
  console.error(
    'Erro fatal: A API do preload (window.api) não foi encontrada. ' +
    'Verifique se o preload.js está sendo carregado corretamente no main.js.'
  );
  alert('Erro de inicialização. A aplicação não pode continuar.');
}

// Funções de API para Cursos
api.updateCourse = (courseId, courseData) => {
  return window.api.invoke('courses:update', courseId, courseData);
};

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

function checkSidebarPermissions()
{
  try {
      const storedUser = localStorage.getItem('profuturo_currentUser');
      if (!storedUser) return; 
      
      const user = JSON.parse(storedUser);

      if (user.role_name === 'TI') {
        const restrictedItems = document.querySelectorAll('.ti-only');
        restrictedItems.forEach(item => {
          item.classList.remove('ti-only');
          item.style.display = 'flex';
        });
      }
  } catch (error) {
      console.error('Erro ao verificar permissões da sidebar:', error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
    initializeThemeSwitcher();
    checkSidebarPermissions();
});
