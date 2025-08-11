document.addEventListener('DOMContentLoaded', () => {
    
    // NOVO: Elemento da barra de pesquisa
    const searchInput = document.getElementById('search-input');
    const championGrid = document.getElementById('champion-grid');
    const detailsContainer = document.getElementById('champion-details-container');
    const closeButton = document.getElementById('close-button');

    const ddragonVersion = '15.15.1'; // Verifique sempre a versão mais recente

    // NOVO: Dados manuais para a ordem de habilidades (exemplo)
    // A chave é o ID do campeão (ex: "Aatrox", "MissFortune")
    const skillOrderData = {
        "Aatrox": "Q > E > W",
        "Jinx": "Q > W > E",
        "Lux": "E > Q > W",
        "Garen": "E > Q > W",
        "MissFortune": "Q > W > E",
        "Yasuo": "Q > E > W",
        "Zed": "Q > E > W"
    };

    // Função para carregar todos os campeões na grade
    async function loadChampions() {
        const url = `https://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/data/pt_BR/champion.json`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            displayChampions(data.data);
        } catch (error) {
            console.error("Erro ao carregar os campeões:", error);
            championGrid.innerHTML = '<p>Não foi possível carregar os campeões.</p>';
        }
    }
    
    // Função que cria os ícones na tela
    function displayChampions(champions) {
        championGrid.innerHTML = '';
        for (const key in champions) {
            const champion = champions[key];
            const iconUrl = `https://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/champion/${champion.image.full}`;
            
            const championElement = document.createElement('div');
            championElement.className = 'champion-icon-container'; // Usado para a pesquisa

            const img = document.createElement('img');
            img.src = iconUrl;
            img.alt = champion.name;
            img.title = champion.name;
            img.dataset.championId = champion.id;
            img.dataset.championName = champion.name.toLowerCase(); // Facilita a pesquisa

            img.addEventListener('click', () => showChampionDetails(champion.id));
            
            championElement.appendChild(img);
            championGrid.appendChild(championElement);
        }
    }

    // Função para mostrar os detalhes de um campeão
    async function showChampionDetails(championId) {
        const url = `https://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/data/pt_BR/champion/${championId}.json`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            const champion = data.data[championId];

            // Preenche as informações básicas
            document.getElementById('champion-splash').src = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championId}_0.jpg`;
            document.getElementById('champion-name').textContent = champion.name;
            document.getElementById('champion-title').textContent = champion.title;

            // NOVO: Preenche a ordem das habilidades com nossos dados manuais
            const skillOrderEl = document.getElementById('skill-order');
            if (skillOrderData[championId]) {
                skillOrderEl.textContent = skillOrderData[championId];
                skillOrderEl.parentElement.style.display = 'block';
            } else {
                skillOrderEl.parentElement.style.display = 'none'; // Esconde se não tivermos os dados
            }

            // Preenche as habilidades
            const abilitiesContainer = document.getElementById('champion-abilities');
            abilitiesContainer.innerHTML = ''; 

            // Passiva
            const passive = champion.passive;
            abilitiesContainer.innerHTML += `
                <div class="ability">
                    <img src="http://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/passive/${passive.image.full}" alt="${passive.name}">
                    <div class="ability-info">
                        <h4>${passive.name} (Passiva)</h4>
                        <p>${passive.description}</p>
                    </div>
                </div>
            `;

            // Habilidades (Q, W, E, R)
            champion.spells.forEach((spell, index) => {
                const key = ['Q', 'W', 'E', 'R'][index];
                
                // NOVO: Pega o cooldown. 'cooldownBurn' é a string com todos os níveis
                const cooldowns = spell.cooldownBurn;

                abilitiesContainer.innerHTML += `
                    <div class="ability">
                        <img src="http://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/spell/${spell.image.full}" alt="${spell.name}">
                        <div class="ability-info">
                            <h4>${spell.name} (${key})</h4>
                            <p>${spell.description}</p>
                            <!-- NOVO: Mostra o Cooldown -->
                            <div class="ability-meta">
                                <strong>Cooldown:</strong> ${cooldowns} segundos
                            </div>
                        </div>
                    </div>
                `;
            });
            
            detailsContainer.classList.remove('hidden');

        } catch (error) {
            console.error("Erro ao carregar detalhes do campeão:", error);
        }
    }

    // NOVO: Função para filtrar os campeões na grade
    function filterChampions() {
        const searchTerm = searchInput.value.toLowerCase();
        const allChampions = championGrid.querySelectorAll('img');

        allChampions.forEach(img => {
            const championName = img.dataset.championName;
            const container = img.parentElement; // O 'div' que envolve a imagem
            
            if (championName.includes(searchTerm)) {
                container.style.display = 'block'; // Mostra o campeão
            } else {
                container.style.display = 'none'; // Esconde o campeão
            }
        });
    }

    // Adiciona o evento de 'input' para a pesquisa funcionar em tempo real
    searchInput.addEventListener('input', filterChampions);

    // Evento para fechar a janela de detalhes
    closeButton.addEventListener('click', () => {
        detailsContainer.classList.add('hidden');
    });

    // Inicia tudo
    loadChampions();
});