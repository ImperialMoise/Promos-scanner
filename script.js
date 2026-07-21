// === 1. NAVIGATION MOBILE ===
window.switchTab = function(tabId) {
    if (window.innerWidth >= 1024) return; 
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

// === 3. NOUVEAU DESIGN DES JAUGES CONNECTÉES ===
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
        const saved = localStorage.getItem(v.id);
        if (saved !== null) input.value = saved;

        function render() {
            container.innerHTML = '';
            const currentVal = parseInt(input.value) || 0;
            const start = v.reverse ? v.max : v.min;
            const end = v.reverse ? v.min : v.max;
            const step = v.reverse ? -1 : 1;
            const condition = (i) => v.reverse ? i >= end : i <= end;

            for (let i = start; condition(i); i += step) {
                const box = document.createElement('div');
                box.className = `vital-box ${i === currentVal ? 'active-val' : 'bg-white text-ink-black'}`;
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
        input.addEventListener('change', render);
    });
}
initVitalTracks();

// === 4. ÉLAN & HANDICAPS ===
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
        momentumInput.dispatchEvent(new Event('change'));
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

// === 5. XP ===
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
    else alert("Pas assez d'XP disponible !");
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
    momentumInput.dispatchEvent(new Event('change'));
    burnBtn.classList.add('hidden');
});

function evaluateResult(score, c1, c2) {
    let outcome = "ÉCHEC";
    let color = "text-red-700";
    if (score > c1 && score > c2) { outcome = "COUP FORT"; color = "text-green-700"; }
    else if (score > c1 || score > c2) { outcome = "COUP FAIBLE"; color = "text-yellow-600"; }
    if (c1 === c2) outcome += " (DOUBLE !)";
    
    outcomeText.textContent = outcome;
    outcomeText.className = `font-headline-lg text-4xl uppercase scribble-underline inline-block my-4 text-center w-full ${color}`;
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
        if (boxTicks === 4) { bgClass = 'bg-ink-black text-white'; symbol = '✓'; }
        html += `<div class="progress-box ${bgClass}">${symbol}</div>`;
    }
    return html;
}

function renderTracks() {
    bondsContainer.innerHTML = buildBoxesHtml(bondTicks);
    tracksContainer.innerHTML = '';
    tracks.forEach((track, index) => {
        const card = document.createElement('div');
        card.className = 'border-4 border-ink-black p-4 rounded bg-white relative shadow-[4px_4px_0px_0px_#000] mb-4';
        card.innerHTML = `
            <div class="flex justify-between items-baseline mb-3">
                <span class="font-headline-lg text-2xl">${track.name}</span>
                <span class="font-label-md font-bold border-2 border-ink-black px-2 py-0.5 text-xs transform rotate-1 uppercase bg-yellow-100">${diffLabels[track.diff]}</span>
            </div>
            <div class="flex gap-1.5 flex-wrap mb-4 justify-center track-group p-1 border-none shadow-none">${buildBoxesHtml(track.ticks)}</div>
            <div class="flex gap-2">
                <button onclick="markProgress(${index})" class="border-2 border-ink-black font-headline-lg text-lg px-3 py-1 rounded bg-white hover:bg-gray-100 shadow-[2px_2px_0px_0px_#000]">+ Progrès</button>
                <button onclick="resolveProgress(${index})" class="border-2 border-ink-black bg-ink-black text-white font-headline-lg text-lg px-3 py-1 rounded shadow-[2px_2px_0px_0px_#888] hover:translate-y-1 transition-transform">Résoudre</button>
                <button onclick="deleteTrack(${index})" class="text-red-700 font-headline-lg text-lg ml-auto hover:underline">Suppr.</button>
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
    resBox.innerHTML = `<h4 class="font-headline-lg text-xl mb-1 text-gray-700">Jet pour "${track.name}"</h4>
                        <p class="font-hand text-2xl">Score <span class="font-bold text-3xl">${progressScore}</span> VS [${c1}] & [${c2}]</p>
                        <p class="font-headline-lg text-4xl uppercase mt-3 text-ink-black">${outcome}</p>`;
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
        card.className = 'border-4 border-ink-black p-4 rounded bg-white relative shadow-[4px_4px_0px_0px_#000]';
        card.innerHTML = `
            <div class="flex justify-between items-center mb-4 border-b-2 border-dashed border-gray-300 pb-2">
                <input type="text" class="a-title font-headline-lg text-2xl outline-none w-3/4 bg-transparent" placeholder="Nom de l'Atout..." value="${asset.title || ''}">
                <button onclick="deleteAsset(${index})" class="font-headline-lg text-red-700 text-xl hover:scale-110 transition-transform">X</button>
            </div>
            ${[1, 2, 3].map(i => `
                <div class="flex gap-4 mb-3 items-start">
                    <input type="checkbox" class="a-c${i} hand-checkbox mt-1" ${asset['c'+i] ? 'checked' : ''}>
                    <textarea class="a-t${i} asset-area font-hand text-2xl w-full outline-none bg-transparent resize-none h-16 leading-tight">${asset['t'+i] || ''}</textarea>
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
    danger: "<strong>Faire Face au Danger :</strong> Quand vous tentez quelque chose de risqué, décrivez votre approche et lancez 1d6 + Carac appropriée. <br><br>• <i>Coup Fort :</i> Réussite totale. +1 élan.<br>• <i>Coup Faible :</i> Vous réussissez, mais avec un prix (-1 Santé, Esprit ou Provisions).<br>• <i>Échec :</i> Le danger se concrétise.",
    avantage: "<strong>Sécuriser un Avantage :</strong> Vous prenez le temps de vous préparer. Lancez +Carac.<br><br>• <i>Coup Fort :</i> Avantage pris ! +2 Élan ou +1 au prochain jet.<br>• <i>Coup Faible :</i> Succès mineur. +1 Élan.",
    infos: "<strong>Récolter des Informations :</strong> Vous fouillez ou questionnez. Lancez +Astuce.<br><br>• <i>Coup Fort :</i> Vérité utile découverte. +2 Élan.<br>• <i>Coup Faible :</i> Information partielle, complication. +1 Élan.",
    frapper: "<strong>Frapper :</strong> Attaque avec l'avantage. Lancez +Fer (mêlée) ou +Vivacité (distance).<br><br>• <i>Coup Fort :</i> Infligez les dégâts (min 2). Vous gardez l'initiative.<br>• <i>Coup Faible :</i> Infligez les dégâts, mais vous perdez l'initiative.",
    opposer: "<strong>S'opposer :</strong> Défense face à une attaque. Lancez +Fer ou +Vivacité.<br><br>• <i>Coup Fort :</i> Esquive/Parade réussie. Reprenez l'initiative ou +2 Élan.<br>• <i>Coup Faible :</i> Vous évitez le pire mais restez sur la défensive. Payez le Prix.",
    voeu: "<strong>Jurer un Vœu de Fer :</strong> Vous lancez une quête. Lancez +Cœur.<br><br>• <i>Coup Fort :</i> Vous êtes motivé. +2 Élan.<br>• <i>Coup Faible :</i> Vous partez, mais un doute survient. +1 Élan.<br>• <i>Échec :</i> Un obstacle majeur se dresse immédiatement."
};
const rulesSelector = document.getElementById('rules-selector');
const rulesDisplayBox = document.getElementById('rules-display-box');
rulesSelector.addEventListener('change', () => rulesDisplayBox.innerHTML = movesDatabase[rulesSelector.value]);
rulesDisplayBox.innerHTML = movesDatabase.danger;

document.getElementById('oracle-yes-no-btn').addEventListener('click', () => {
    const roll = Math.floor(Math.random() * 100) + 1;
    let a = roll <= 25 ? "NON" : roll <= 50 ? "Peut-être pas (Non mitigé)" : roll <= 85 ? "OUI" : "OUI ABSOLU !";
    const res = document.getElementById('oracle-res');
    res.innerHTML = `Résultat : <span class="text-ink-black font-bold">${roll}</span> <br>➔ <span class="text-red-800 underline">${a}</span>`;
    res.classList.remove('hidden');
});