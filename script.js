// === 1. NAVIGATION MOBILE ===
window.switchTab = function(tabId) {
    if (window.innerWidth >= 1024) return; // Désactivé sur PC (lg)
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    document.querySelectorAll('.tab-btn-mob').forEach(btn => btn.classList.remove('active-mob'));
    event.currentTarget.classList.add('active-mob');
};

// === 2. SAUVEGARDE DE BASE ===
const baseInputs = document.querySelectorAll('input[type="number"]:not(.vital-hidden), input[type="text"], textarea:not(.asset-area)');
baseInputs.forEach(input => {
    if (input.id) {
        const saved = localStorage.getItem(input.id);
        if (saved !== null) input.value = saved;
        input.addEventListener('input', () => localStorage.setItem(input.id, input.value));
    }
});

// === 3. JAUGES VITALES CLIQUABLES (SANTÉ, ESPRIT, PROVISIONS, ÉLAN) ===
function initVitalTracks() {
    const vitals = [
        { id: 'track-health', min: 0, max: 5, reverse: true },
        { id: 'track-spirit', min: 0, max: 5, reverse: true },
        { id: 'track-supply', min: 0, max: 5, reverse: true },
        { id: 'track-momentum', min: -6, max: 10, reverse: false }
    ];

    vitals.forEach(v => {
        const container = document.getElementById(v.id + '-container');
        const input = document.getElementById(v.id);
        
        // Charger la valeur sauvegardée
        const saved = localStorage.getItem(v.id);
        if (saved !== null) input.value = saved;

        function render() {
            container.innerHTML = '';
            const currentVal = parseInt(input.value) || 0;
            const start = v.reverse ? v.max : v.min;
            const end = v.reverse ? v.min : v.max;
            const step = v.reverse ? -1 : 1;

            // Construction conditionnelle pour respecter le sens de la boucle
            const condition = (i) => v.reverse ? i >= end : i <= end;

            for (let i = start; condition(i); i += step) {
                const box = document.createElement('div');
                box.className = `vital-box ${i === currentVal ? 'bg-ink-black text-white transform scale-110' : 'bg-white text-ink-black'}`;
                box.textContent = (i > 0 && v.id === 'track-momentum') ? '+'+i : i;
                
                box.addEventListener('click', () => {
                    input.value = i;
                    localStorage.setItem(v.id, i);
                    render();
                });
                container.appendChild(box);
            }
        }
        
        render();
        // Écouter les changements via le code (ex: quand on brûle l'élan)
        input.addEventListener('change', render);
    });
}
initVitalTracks();

// === 4. COMPORTEMENT DE L'ÉLAN (MOMENTUM) ET HANDICAPS ===
const conditionChecks = document.querySelectorAll('.condition-check');
const momentumInput = document.getElementById('track-momentum');
const momentumLimitsText = document.getElementById('momentum-limits-text');

function updateMomentumLimits() {
    let activeDebilities = 0;
    conditionChecks.forEach(check => { if (check.checked) activeDebilities++; });

    const maxMomentum = 10 - activeDebilities;
    let resetMomentum = 2;
    if (activeDebilities === 1) resetMomentum = 1;
    else if (activeDebilities > 1) resetMomentum = 0;

    momentumInput.max = maxMomentum;
    momentumInput.dataset.reset = resetMomentum;
    momentumLimitsText.textContent = `Max: ${maxMomentum} / Réinit: ${resetMomentum}`;

    if (parseInt(momentumInput.value) > maxMomentum) {
        momentumInput.value = maxMomentum;
        localStorage.setItem('track-momentum', maxMomentum);
        momentumInput.dispatchEvent(new Event('change')); // Met à jour le visuel
    }
}

conditionChecks.forEach(check => {
    const saved = localStorage.getItem(check.id);
    if (saved !== null) check.checked = saved === 'true';
    check.addEventListener('change', () => {
        localStorage.setItem(check.id, check.checked);
        updateMomentumLimits();
    });
});
updateMomentumLimits();

// === 5. CALCULATEUR D'EXPÉRIENCE ===
let xpData = JSON.parse(localStorage.getItem('ironsworn-xp-data')) || { dots: Array(30).fill(false), spent: 0 };
const xpTotalDisplay = document.getElementById('xp-total-display');
const xpSpentDisplay = document.getElementById('xp-spent-display');

function updateXpCounters() {
    let totalXp = xpData.dots.filter(d => d).length;
    xpTotalDisplay.textContent = totalXp;
    xpSpentDisplay.textContent = xpData.spent;
    localStorage.setItem('ironsworn-xp-data', JSON.stringify(xpData));
}

function renderXpDots(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    xpData.dots.forEach((isFilled, index) => {
        const dot = document.createElement('div');
        dot.className = `exp-dot ${isFilled ? 'filled' : ''}`;
        dot.addEventListener('click', () => {
            xpData.dots[index] = !xpData.dots[index];
            updateXpCounters();
            renderXpDots('xp-dots-container-desktop');
            renderXpDots('xp-dots-container-mobile');
        });
        container.appendChild(dot);
    });
}

document.querySelectorAll('.btn-spend-xp').forEach(btn => btn.addEventListener('click', () => {
    let totalXp = xpData.dots.filter(d => d).length;
    if (totalXp - xpData.spent >= 2) { xpData.spent += 2; updateXpCounters(); }
    else alert("Pas assez d'XP !");
}));

document.querySelectorAll('.btn-refund-xp').forEach(btn => btn.addEventListener('click', () => {
    if (xpData.spent >= 2) { xpData.spent -= 2; updateXpCounters(); }
}));

renderXpDots('xp-dots-container-desktop');
renderXpDots('xp-dots-container-mobile');
updateXpCounters();

// === 6. MOTEUR DE DÉS ===
const rollBtn = document.getElementById('roll-btn');
const rollResult = document.getElementById('roll-result');
const outcomeText = document.getElementById('outcome-text');
const burnBtn = document.getElementById('burn-momentum-btn');

rollBtn.addEventListener('click', () => {
    const statSelect = document.getElementById('stat-selector').value;
    const statValue = parseInt(document.getElementById('stat-' + statSelect).value) || 0;
    const modifier = parseInt(document.getElementById('modifier').value) || 0;

    let actionScore = Math.floor(Math.random() * 6) + 1 + statValue + modifier;
    if (actionScore > 10) actionScore = 10;
    const c1 = Math.floor(Math.random() * 10) + 1;
    const c2 = Math.floor(Math.random() * 10) + 1;

    document.getElementById('action-total').textContent = actionScore;
    document.getElementById('challenge1').textContent = c1;
    document.getElementById('challenge2').textContent = c2;

    evaluateResult(actionScore, c1, c2);
    
    const currentMomentum = parseInt(momentumInput.value) || 0;
    if (currentMomentum > actionScore) burnBtn.classList.remove('hidden');
    else burnBtn.classList.add('hidden');
    rollResult.classList.remove('hidden');
});

burnBtn.addEventListener('click', () => {
    const currentMomentum = parseInt(momentumInput.value) || 0;
    const c1 = parseInt(document.getElementById('challenge1').textContent);
    const c2 = parseInt(document.getElementById('challenge2').textContent);

    document.getElementById('action-total').textContent = currentMomentum;
    evaluateResult(currentMomentum, c1, c2);

    const resetVal = parseInt(momentumInput.dataset.reset) || 2;
    momentumInput.value = resetVal;
    localStorage.setItem('track-momentum', resetVal);
    momentumInput.dispatchEvent(new Event('change')); // Met à jour le visuel des cases d'élan
    burnBtn.classList.add('hidden');
});

function evaluateResult(score, c1, c2) {
    let outcome = "ÉCHEC";
    if (score > c1 && score > c2) outcome = "COUP FORT !";
    else if (score > c1 || score > c2) outcome = "COUP FAIBLE";
    if (c1 === c2) outcome += " (DOUBLE !)";
    outcomeText.textContent = outcome;
}

// === 7. QUÊTES & LIENS ===
let tracks = JSON.parse(localStorage.getItem('ironsworn-tracks')) || [];
let bondTicks = parseInt(localStorage.getItem('ironsworn-bond-ticks')) || 0;
const tracksContainer = document.getElementById('tracks-container');
const bondsContainer = document.getElementById('bonds-track-container');
const diffLabels = { troublesome: 'Pénible', dangerous: 'Dangereux', formidable: 'Redoutable', extreme: 'Extrême', epic: 'Épique' };

function buildBoxesHtml(ticks) {
    let html = '';
    for (let i = 0; i < 10; i++) {
        let boxTicks = 0;
        if (ticks >= (i + 1) * 4) boxTicks = 4;
        else if (ticks > i * 4) boxTicks = ticks % 4;
        
        let symbol = '', bgClass = 'bg-white';
        if (boxTicks === 1) symbol = '/';
        if (boxTicks === 2) symbol = 'X';
        if (boxTicks === 3) symbol = '*';
        if (boxTicks === 4) bgClass = 'bg-ink-black';
        html += `<div class="progress-box ${bgClass}">${symbol}</div>`;
    }
    return html;
}

function renderTracks() {
    bondsContainer.innerHTML = buildBoxesHtml(bondTicks);
    tracksContainer.innerHTML = '';
    tracks.forEach((track, index) => {
        const card = document.createElement('div');
        card.className = 'border-2 border-ink-black p-4 rounded bg-white relative';
        card.innerHTML = `
            <div class="flex justify-between items-baseline mb-2">
                <span class="font-scrawl text-2xl">${track.name}</span>
                <span class="font-label-sm font-bold border border-ink-black px-1.5 text-xs transform rotate-1">${diffLabels[track.diff]}</span>
            </div>
            <div class="flex gap-1.5 flex-wrap mb-4 justify-center">${buildBoxesHtml(track.ticks)}</div>
            <div class="flex gap-2">
                <button onclick="markProgress(${index})" class="border border-ink-black font-scrawl text-lg px-2.5 py-1 rounded bg-white hover:bg-gray-100">+ Progrès</button>
                <button onclick="resolveProgress(${index})" class="border border-ink-black bg-ink-black text-white font-scrawl text-lg px-2.5 py-1 rounded">Résoudre</button>
                <button onclick="deleteTrack(${index})" class="text-red-700 font-scrawl text-lg ml-auto">Suppr.</button>
            </div>
        `;
        tracksContainer.appendChild(card);
    });
}

window.markProgress = function(index) {
    if (index === -1) {
        bondTicks = Math.min(40, bondTicks + 1);
        localStorage.setItem('ironsworn-bond-ticks', bondTicks);
    } else {
        const track = tracks[index];
        let amount = { troublesome: 12, dangerous: 8, formidable: 4, extreme: 2, epic: 1 }[track.diff];
        track.ticks = Math.min(40, track.ticks + amount);
        localStorage.setItem('ironsworn-tracks', JSON.stringify(tracks));
    }
    renderTracks();
};

window.deleteTrack = function(index) {
    if (confirm('Supprimer cette quête ?')) { tracks.splice(index, 1); localStorage.setItem('ironsworn-tracks', JSON.stringify(tracks)); renderTracks(); }
};

window.resolveProgress = function(index) {
    const track = tracks[index];
    const progressScore = Math.floor(track.ticks / 4);
    const c1 = Math.floor(Math.random() * 10) + 1;
    const c2 = Math.floor(Math.random() * 10) + 1;
    
    let outcome = "ÉCHEC";
    if (progressScore > c1 && progressScore > c2) outcome = "COUP FORT !";
    else if (progressScore > c1 || progressScore > c2) outcome = "COUP FAIBLE";
    if (c1 === c2) outcome += " (DOUBLE !)";

    const resBox = document.getElementById('progress-roll-result');
    resBox.innerHTML = `<p class="font-hand text-xl">Jet pour "${track.name}" : Score ${progressScore} VS [${c1}] & [${c2}]</p>
                        <p class="font-headline-lg text-3xl uppercase mt-2">${outcome}</p>`;
    resBox.classList.remove('hidden');
};

document.getElementById('add-track-btn').addEventListener('click', () => {
    const nameInput = document.getElementById('new-track-name');
    if (!nameInput.value.trim()) return;
    tracks.push({ name: nameInput.value.trim(), diff: document.getElementById('new-track-difficulty').value, ticks: 0 });
    nameInput.value = '';
    localStorage.setItem('ironsworn-tracks', JSON.stringify(tracks));
    renderTracks();
});
renderTracks();

// === 8. ATOUTS ===
let assets = JSON.parse(localStorage.getItem('ironsworn-assets')) || [];
const assetsContainer = document.getElementById('assets-container');

function saveAssets() {
    const cards = document.querySelectorAll('.asset-card');
    let updated = [];
    cards.forEach(card => {
        updated.push({
            title: card.querySelector('.a-title').value,
            c1: card.querySelector('.a-c1').checked, t1: card.querySelector('.a-t1').value,
            c2: card.querySelector('.a-c2').checked, t2: card.querySelector('.a-t2').value,
            c3: card.querySelector('.a-c3').checked, t3: card.querySelector('.a-t3').value
        });
    });
    localStorage.setItem('ironsworn-assets', JSON.stringify(updated));
}

function renderAssets() {
    assetsContainer.innerHTML = '';
    assets.forEach((asset, index) => {
        const card = document.createElement('div');
        card.className = 'ink-border p-4 bg-white asset-card';
        card.innerHTML = `
            <div class="flex justify-between items-center mb-3">
                <input type="text" class="a-title font-scrawl text-2xl outline-none border-b-2 border-ink-black w-3/4" placeholder="Nom de l'Atout..." value="${asset.title || ''}">
                <button onclick="deleteAsset(${index})" class="font-scrawl text-red-700 text-lg">X</button>
            </div>
            ${[1, 2, 3].map(i => `
                <div class="flex gap-3 mb-2 items-start">
                    <input type="checkbox" class="a-c${i} hand-checkbox mt-1" ${asset['c'+i] ? 'checked' : ''}>
                    <textarea class="a-t${i} asset-area font-hand text-2xl w-full outline-none border-b border-dashed border-gray-400 bg-transparent resize-none h-14">${asset['t'+i] || ''}</textarea>
                </div>
            `).join('')}
        `;
        card.querySelectorAll('input, textarea').forEach(el => el.addEventListener('input', saveAssets));
        assetsContainer.appendChild(card);
    });
}

document.getElementById('add-asset-btn').addEventListener('click', () => {
    assets.push({ title: '', c1: false, t1: '', c2: false, t2: '', c3: false, t3: '' });
    renderAssets(); saveAssets();
});
window.deleteAsset = function(index) { if (confirm('Supprimer cet atout ?')) { assets.splice(index, 1); saveAssets(); renderAssets(); } };
renderAssets();

// === 9. REGLES & ORACLE ===
const movesDatabase = {
    danger: "<strong>Faire Face au Danger :</strong> Quand vous tentez quelque chose de risqué, décrivez votre approche et lancez 1d6 + votre caractéristique appropriée. <br>• <i>Coup Fort :</i> Vous réussissez. Prenez +1 élan.<br>• <i>Coup Faible :</i> Vous réussissez, mais vous devez payer un prix (-1 Santé, Esprit ou Provisions).<br>• <i>Échec :</i> Le danger se concrétise.",
    avantage: "<strong>Sécuriser un Avantage :</strong> Vous préparez le terrain. Lancez +Carac.<br>• <i>Coup Fort :</i> Prenez l'avantage ! Prenez +2 Élan ou ajoutez +1 au prochain jet.<br>• <i>Coup Faible :</i> Succès mineur. Prenez +1 Élan.",
    infos: "<strong>Récolter des Informations :</strong> Vous fouillez un lieu ou questionnez un PNJ. Lancez +Astuce.<br>• <i>Coup Fort :</i> Vous découvrez une vérité utile. Prenez +2 Élan.<br>• <i>Coup Faible :</i> Information partielle, mais le chemin se complique. Prenez +1 Élan.",
    frapper: "<strong>Frapper :</strong> Attaque offensive en combat. Lancez +Fer (mêlée) ou +Vivacité (distance).<br>• <i>Coup Fort :</i> Infligez vos dégâts (généralement 2) et conservez l'initiative.<br>• <i>Coup Faible :</i> Infligez vos dégâts, mais vous perdez l'initiative.",
    opposer: "<strong>S'opposer :</strong> Vous parez une attaque ennemie. Lancez +Fer ou +Vivacité.<br>• <i>Coup Fort :</i> Vous esquivez/parez. Prenez l'initiative ou +2 Élan.<br>• <i>Coup Faible :</i> Vous évitez le pire mais perdez l'initiative. Payez le Prix.",
    voeu: "<strong>Jurer un Vœu de Fer :</strong> Vous lancez une quête sacrée. Lancez +Cœur.<br>• <i>Coup Fort :</i> Vous êtes béni. Prenez +2 Élan.<br>• <i>Coup Faible :</i> Vous commencez, mais un doute ou un obstacle se dresse. Prenez +1 Élan.<br>• <i>Échec :</i> Un obstacle majeur se dresse avant même le départ."
};
const rulesSelector = document.getElementById('rules-selector');
const rulesDisplayBox = document.getElementById('rules-display-box');
rulesSelector.addEventListener('change', () => rulesDisplayBox.innerHTML = movesDatabase[rulesSelector.value]);
rulesDisplayBox.innerHTML = movesDatabase.danger;

document.getElementById('oracle-yes-no-btn').addEventListener('click', () => {
    const roll = Math.floor(Math.random() * 100) + 1;
    let a = roll <= 25 ? "NON" : roll <= 50 ? "Peut-être pas (Non mitigé)" : roll <= 85 ? "OUI" : "OUI ABSOLU !";
    const res = document.getElementById('oracle-res');
    res.innerHTML = `Résultat : <span class="text-red-800">${roll}</span> ➔ <span class="underline">${a}</span>`;
    res.classList.remove('hidden');
});