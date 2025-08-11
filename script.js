document.addEventListener('DOMContentLoaded', () => {
    
    const searchInput = document.getElementById('search-input');
    const championGrid = document.getElementById('champion-grid');
    const detailsContainer = document.getElementById('champion-details-container');
    const closeButton = document.getElementById('close-button');
    
    // MELHORIA 3: Pegar os botões de filtro
    const filterButtons = document.querySelectorAll('.filter-btn');

    const ddragonVersion = '15.15.1'; 

    const skillOrderData = {
        "Aatrox": "Q > E > W", "Jinx": "Q > W > E", "Lux": "E > Q > W",
        "Garen": "E > Q > W", "MissFortune": "Q > W > E", "Yasuo": "Q > E > W",
        "Zed": "Q > E > W"
    };
    
    // Armazenar os dados de todos os campeões para evitar múltiplas chamadas à API
    let allChampionsData = {};

    async function loadChampions() {
        const url = `https://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/data/pt_BR/champion.json`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            allChampionsData = data.data; // Salva os dados
            displayChampions(allChampionsData);
        } catch (error) {
            console.error("Erro ao carregar os campeões:", error);
            championGrid.innerHTML = '<p>Não foi possível carregar os campeões.</p>';
        }
    }
    
    function displayChampions(champions) {
        championGrid.innerHTML = '';
        for (const key in champions) {
            const champion = champions[key];
            const iconUrl = `https://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/champion/${champion.image.full}`;
            
            const championElement = document.createElement('div');
            championElement.className = 'champion-icon-container'; 

            const img = document.createElement('img');
            img.src = iconUrl;
            img.alt = champion.name;
            img.title = champion.name;
            img.dataset.championId = champion.id;
            img.dataset.championName = champion.name.toLowerCase(); 
            // MELHORIA 3: Adicionar as tags do campeão ao elemento para o filtro
            img.dataset.tags = champion.tags.join(','); // Ex: "Fighter,Tank"

            img.addEventListener('click', () => showChampionDetails(champion.id));
            
            championElement.appendChild(img);
            championGrid.appendChild(championElement);
        }
    }

    async function showChampionDetails(championId) {
        const url = `https://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/data/pt_BR/champion/${championId}.json`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            const champion = data.data[championId];

            document.getElementById('champion-splash').src = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championId}_0.jpg`;
            document.getElementById('champion-name').textContent = champion.name;
            document.getElementById('champion-title').textContent = champion.title;

            const skillOrderEl = document.getElementById('skill-order');
            if (skillOrderData[championId]) {
                skillOrderEl.textContent = skillOrderData[championId];
                skillOrderEl.parentElement.style.display = 'block';
            } else {
                skillOrderEl.parentElement.style.display = 'none';
            }

            // --- INÍCIO DAS NOVAS MELHORIAS DE CONTEÚDO ---

            // MELHORIA 2: Preencher a Galeria de Skins
            const skinsGrid = document.getElementById('skins-grid');
            skinsGrid.innerHTML = ''; // Limpa a galeria anterior
            champion.skins.forEach(skin => {
                if (skin.num > 0) { // Não mostra a skin base, que já está no splash
                    const skinItem = document.createElement('div');
                    skinItem.className = 'skin-item';
                    const skinImgUrl = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championId}_${skin.num}.jpg`;
                    skinItem.innerHTML = `<img src="${skinImgUrl}" alt="${skin.name}"><p>${skin.name}</p>`;
                    skinsGrid.appendChild(skinItem);
                }
            });

            // MELHORIA 1: Preencher os Atributos
            const stats = champion.stats;
            document.getElementById('champion-stats').innerHTML = `
                <strong>Vida:</strong> ${stats.hp} (+${stats.hpperlevel} por nível)<br>
                <strong>Mana:</strong> ${stats.mp} (+${stats.mpperlevel} por nível)<br>
                <strong>Armadura:</strong> ${stats.armor} (+${stats.armorperlevel} por nível)<br>
                <strong>Dano de Ataque:</strong> ${stats.attackdamage} (+${stats.attackdamageperlevel} por nível)<br>
                <strong>Veloc. de Movimento:</strong> ${stats.movespeed}
            `;

            // MELHORIA 1: Preencher a Lore
            document.getElementById('champion-lore').innerHTML = champion.lore;

            // MELHORIA 1: Preencher as Dicas
            const tipsContainer = document.getElementById('champion-tips');
            tipsContainer.innerHTML = '';
            if (champion.allytips.length > 0) {
                let allyTipsHtml = '<h5>Jogando COM:</h5><ul>';
                champion.allytips.forEach(tip => { allyTipsHtml += `<li>${tip}</li>`; });
                allyTipsHtml += '</ul>';
                tipsContainer.innerHTML += allyTipsHtml;
            }
            if (champion.enemytips.length > 0) {
                let enemyTipsHtml = '<h5>Jogando CONTRA:</h5><ul>';
                champion.enemytips.forEach(tip => { enemyTipsHtml += `<li>${tip}</li>`; });
                enemyTipsHtml += '</ul>';
                tipsContainer.innerHTML += enemyTipsHtml;
            }

            // --- FIM DAS NOVAS MELHORIAS DE CONTEÚDO ---


            const abilitiesContainer = document.getElementById('champion-abilities');
            abilitiesContainer.innerHTML = ''; 

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

            champion.spells.forEach((spell, index) => {
                const key = ['Q', 'W', 'E', 'R'][index];
                const cooldowns = spell.cooldownBurn;
                abilitiesContainer.innerHTML += `
                    <div class="ability">
                        <img src="http://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/spell/${spell.image.full}" alt="${spell.name}">
                        <div class="ability-info">
                            <h4>${spell.name} (${key})</h4>
                            <p>${spell.description}</p>
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

    function filterChampions() {
        const searchTerm = searchInput.value.toLowerCase();
        const allChampions = championGrid.querySelectorAll('img');
        allChampions.forEach(img => {
            const championName = img.dataset.championName;
            const container = img.parentElement;
            if (championName.includes(searchTerm)) {
                container.style.display = 'block';
            } else {
                container.style.display = 'none';
            }
        });
    }

    // MELHORIA 3: Função para filtrar por tag
    function filterByTag(tag) {
        const allChampionIcons = document.querySelectorAll('#champion-grid .champion-icon-container');
        allChampionIcons.forEach(container => {
            const img = container.querySelector('img');
            const championTags = img.dataset.tags; // Ex: "Fighter,Tank"

            if (tag === 'All' || championTags.includes(tag)) {
                container.style.display = 'block';
            } else {
                container.style.display = 'none';
            }
        });
    }

    // MELHORIA 3: Adicionar evento de clique aos botões de filtro
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove a classe 'active' de todos os botões
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Adiciona a classe 'active' ao botão clicado
            button.classList.add('active');
            
            const tag = button.dataset.tag;
            filterByTag(tag);
        });
    });

    searchInput.addEventListener('input', filterChampions);

    closeButton.addEventListener('click', () => {
        detailsContainer.classList.add('hidden');
    });

    loadChampions();
});