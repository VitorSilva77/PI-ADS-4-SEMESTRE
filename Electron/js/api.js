const API_URL = 'http://localhost:3000/api';

async function login(funcional, senha) {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ funcional, senha })
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        throw error;
    }
}

async function fetchCourses() {
    try {
        const response = await fetch(`${API_URL}/courses`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Cursos recebidos:', data); // Debug
        return data;

    } catch (error) {
        console.error('Erro ao buscar cursos:', error);
        throw error;
    }
}

async function getCourseStats(courseId = null) {
    try {
        const url = courseId 
            ? `${API_URL}/courses/${courseId}/stats` 
            : `${API_URL}/courses/stats/overview`;
            
        const response = await fetch(url, {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Estatísticas recebidas:', data); // Debug
        return data;

    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        throw error;
    }
}


async function logout() {
    try {
        const response = await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Falha no logout');
        }

        localStorage.clear();
        sessionStorage.clear();
        
        window.location.replace('../index.html');
        return true;

    } catch (error) {
        console.error('Erro no logout:', error);
        return false;
    }
}