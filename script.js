document.addEventListener('DOMContentLoaded', () => {
    
    const searchInput = document.getElementById('search-input');
    const championGrid = document.getElementById('champion-grid');
    const detailsContainer = document.getElementById('champion-details-container');
    const closeButton = document.getElementById('close-button');
    const filterButtons = document.querySelectorAll('.filter-btn');

    const ddragonVersion = '15.15.1'; 

    const skillOrderData = {
        "Aatrox": "Q > E > W", "Jinx": "Q > W > E", "Lux": "E > Q > W",
        "Garen": "E > Q > W", "MissFortune": "Q > W > E", "Yasuo": "Q > E > W",
        "Zed": "Q > E > W"
    };
    
    let allChampionsData = {};

    async function loadChampions() {
        const url = `https://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/data/pt_BR/champion.json`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            allChampionsData = data.data;
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
            img.dataset.tags = champion.tags.join(',');

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
            
            const statsLink = document.getElementById('stats-link');
            statsLink.href = `https://u.gg/lol/champions/${championId.toLowerCase()}/build`;
    
            const skillOrderEl = document.getElementById('skill-order');
            if (skillOrderData[championId]) {
                skillOrderEl.textContent = skillOrderData[championId];
                skillOrderEl.parentElement.style.display = 'block';
            } else {
                skillOrderEl.parentElement.style.display = 'none';
            }
    
            const stats = champion.stats;
            document.getElementById('champion-stats').innerHTML = `
                <strong>Vida:</strong> ${stats.hp} (+${stats.hpperlevel} por nível)<br>
                <strong>Mana:</strong> ${stats.mp} (+${stats.mpperlevel} por nível)<br>
                <strong>Armadura:</strong> ${stats.armor} (+${stats.armorperlevel} por nível)<br>
                <strong>Dano de Ataque:</strong> ${stats.attackdamage} (+${stats.attackdamageperlevel} por nível)<br>
                <strong>Veloc. de Movimento:</strong> ${stats.movespeed}
            `;
    
            document.getElementById('champion-lore').innerHTML = champion.lore;
    
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
    
            const abilitiesContainer = document.getElementById('champion-abilities');
            abilitiesContainer.innerHTML = '';
            
            const championKey = champion.key.padStart(4, '0');

            const passive = champion.passive;
            const passiveVideoUrl = `https://d28xe8vt774jo5.cloudfront.net/champion-abilities/${championKey}/ability_${championKey}_P1.webm`;
            abilitiesContainer.innerHTML += `
                <div class="ability">
                    <img src="https://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/passive/${passive.image.full}" alt="${passive.name}">
                    <div class="ability-info">
                        <h4>${passive.name} (Passiva)</h4>
                        <p>${passive.description}</p>
                        <video class="ability-video" autoplay loop muted playsinline src="${passiveVideoUrl}"></video>
                    </div>
                </div>
            `;
    
            champion.spells.forEach((spell, index) => {
                const key = ['Q', 'W', 'E', 'R'][index];
                const cooldowns = spell.cooldownBurn;
                const spellVideoUrl = `https://d28xe8vt774jo5.cloudfront.net/champion-abilities/${championKey}/ability_${championKey}_${key}1.webm`;
                abilitiesContainer.innerHTML += `
                    <div class="ability">
                        <img src="https://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/spell/${spell.image.full}" alt="${spell.name}">
                        <div class="ability-info">
                            <h4>${spell.name} (${key})</h4>
                            <p>${spell.description}</p>
                            <div class="ability-meta">
                                <strong>Cooldown:</strong> ${cooldowns} segundos
                            </div>
                            <video class="ability-video" autoplay loop muted playsinline src="${spellVideoUrl}"></video>
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

    function filterByTag(tag) {
        const allChampionIcons = document.querySelectorAll('#champion-grid .champion-icon-container');
        allChampionIcons.forEach(container => {
            const img = container.querySelector('img');
            const championTags = img.dataset.tags; 

            if (tag === 'All' || championTags.includes(tag)) {
                container.style.display = 'block';
            } else {
                container.style.display = 'none';
            }
        });
    }

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
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