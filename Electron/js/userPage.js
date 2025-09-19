document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.querySelector('.sidebar-logout');
    
    logoutBtn.addEventListener('click', async () => {
        const success = await logout();
        if (!success) {
            alert('Erro ao fazer logout. Tente novamente.');
        }
    });
});

document.getElementById("formAviso").addEventListener("submit", function(event) {
    event.preventDefault();

    const tipoAviso = document.getElementById("tipoAviso").value;
    const tituloAviso = document.getElementById("tituloAviso").value;
    const descricaoAviso = document.getElementById("descricaoAviso").value;

    const avisoDiv = document.createElement("div");
    avisoDiv.classList.add("aviso");

    avisoDiv.classList.add(tipoAviso);

    const tipoAvisoElement = document.createElement("div");
    tipoAvisoElement.classList.add("tipo-aviso");
    tipoAvisoElement.textContent = tipoAviso.charAt(0).toUpperCase() + tipoAviso.slice(1); 

    const tituloAvisoElement = document.createElement("h4");
    tituloAvisoElement.textContent = tituloAviso;

    const descricaoAvisoElement = document.createElement("p");
    descricaoAvisoElement.textContent = descricaoAviso;

    avisoDiv.appendChild(tipoAvisoElement);
    avisoDiv.appendChild(tituloAvisoElement);
    avisoDiv.appendChild(descricaoAvisoElement);

    document.getElementById("avisosList").appendChild(avisoDiv);

    document.getElementById("formAviso").reset();
});
