// === 1. NAVIGATION DES ONGLETS ===
window.switchTab = function(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');

    // Reset styles
    document.querySelectorAll('.tab-btn-desk').forEach(btn => {
        btn.classList.remove('active-desk');
        btn.classList.add('text-graphite');
    });
    document.querySelectorAll('.tab-btn-mob').forEach(btn => btn.classList.remove('active-mob'));

    // Apply active style based on event target
    const btn = event.currentTarget;
    if (btn.classList.contains('tab-btn-desk')) {
        btn.classList.add('active-desk');
        btn.classList.remove('text-graphite');
    } else {
        btn.classList.add('active-mob');
    }
};

// === 2. SAUVEGARDE ET CHARGEMENT (LocalStorage) ===
const inputs = document.querySelectorAll('input[type="number"], input[type="text"], input[type="checkbox"], textarea');

inputs.forEach(input => {
    if (input.id) {
        // Load
        const savedValue = localStorage.getItem(input.id);
        if (savedValue !== null) {
            if (input.type === 'checkbox') input.checked = savedValue === 'true';
            else input.value = savedValue;
        }
        
        // Save on change
        input.addEventListener('input', () => {
            if (input.type === 'checkbox') localStorage.setItem(input.id, input.checked);
            else localStorage.setItem(input.id, input.value);
        });
    }
});

// === 3. MOTEUR DE DÉS ===
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
    
    // Check momentum
    const currentMomentum = parseInt(document.getElementById('track-momentum').value) || 0;
    if (currentMomentum > actionScore) burnBtn.classList.remove('hidden');
    else burnBtn.classList.add('hidden');

    rollResult.classList.remove('hidden');
});

burnBtn.addEventListener('click', () => {
    const currentMomentum = parseInt(document.getElementById('track-momentum').value) || 0;
    const c1 = parseInt(document.getElementById('challenge1').textContent);
    const c2 = parseInt(document.getElementById('challenge2').textContent);

    document.getElementById('action-total').textContent = currentMomentum;
    evaluateResult(currentMomentum, c1, c2);

    const momentumInput = document.getElementById('track-momentum');
    momentumInput.value = 2;
    localStorage.setItem('track-momentum', 2);
    burnBtn.classList.add('hidden');
});

function evaluateResult(score, c1, c2) {
    let outcome = "ÉCHEC";
    if (score > c1 && score > c2) outcome = "COUP FORT";
    else if (score > c1 || score > c2) outcome = "COUP FAIBLE";
    
    if (c1 === c2) outcome += " (DOUBLE !)";
    outcomeText.textContent = outcome;
}

// === 4. VŒUX & PROGRESSIONS ===
let tracks = JSON.parse(localStorage.getItem('ironsworn-tracks')) || [];
const tracksContainer = document.getElementById('tracks-container');
const addTrackBtn = document.getElementById('add-track-btn');
const diffLabels = { troublesome: 'Pénible', dangerous: 'Dangereux', formidable: 'Redoutable', extreme: 'Extrême', epic: 'Épique' };

function saveTracks() {
    localStorage.setItem('ironsworn-tracks', JSON.stringify(tracks));
    renderTracks();
}

function renderTracks() {
    tracksContainer.innerHTML = '';
    tracks.forEach((track, index) => {
        let boxesHtml = '';
        for (let i = 0; i < 10; i++) {
            let boxTicks = 0;
            if (track.ticks >= (i + 1) * 4) boxTicks = 4;
            else if (track.ticks > i * 4) boxTicks = track.ticks % 4;
            
            let symbol = '';
            if (boxTicks === 1) symbol = '-';
            if (boxTicks === 2) symbol = '+';
            if (boxTicks === 3) symbol = '*';
            if (boxTicks === 4) symbol = 'X';
            
            boxesHtml += `<div class="progress-box bg-white">${symbol}</div>`;
        }

        const card = document.createElement('div');
        card.className = 'mb-10 relative';
        card.innerHTML = `
            <div class="flex justify-between items-baseline mb-3">
                <span class="font-scrawl text-xl">${track.name}</span>
                <span class="font-label-sm font-bold border-2 border-ink-black px-2 py-1 transform rotate-1">${diffLabels[track.diff]}</span>
            </div>
            <div class="flex gap-2 flex-wrap mb-4">${boxesHtml}</div>
            <div class="flex gap-4">
                <button onclick="markProgress(${index})" class="border-2 border-ink-black font-scrawl px-3 py-1 rounded bg-white hover:bg-gray-100">+ Progrès</button>
                <button onclick="deleteTrack(${index})" class="border-2 border-ink-black font-scrawl px-3 py-1 rounded bg-white text-red-700 hover:bg-gray-100">Supprimer</button>
            </div>
        `;
        tracksContainer.appendChild(card);
    });
}

addTrackBtn.addEventListener('click', () => {
    const nameInput = document.getElementById('new-track-name');
    if (!nameInput.value.trim()) return;
    tracks.push({ name: nameInput.value.trim(), diff: document.getElementById('new-track-difficulty').value, ticks: 0 });
    nameInput.value = '';
    saveTracks();
});

window.markProgress = function(index) {
    const track = tracks[index];
    let amount = { troublesome: 12, dangerous: 8, formidable: 4, extreme: 2, epic: 1 }[track.diff];
    track.ticks = Math.min(40, track.ticks + amount);
    saveTracks();
};

window.deleteTrack = function(index) {
    if (confirm('Supprimer ce vœu ?')) { tracks.splice(index, 1); saveTracks(); }
};
renderTracks();

// === 5. ATOUTS (CARTES) ===
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
            <div class="flex justify-between mb-4">
                <input type="text" class="a-title font-scrawl text-2xl outline-none border-b-2 border-ink-black w-3/4" placeholder="Nom de l'Atout..." value="${asset.title || ''}">
                <button onclick="deleteAsset(${index})" class="font-scrawl text-red-700">X</button>
            </div>
            ${[1, 2, 3].map(i => `
                <div class="flex gap-3 mb-3 items-start">
                    <input type="checkbox" class="a-c${i} hand-checkbox mt-1" ${asset['c'+i] ? 'checked' : ''}>
                    <textarea class="a-t${i} font-hand text-xl w-full outline-none border-b border-dashed border-gray-400 bg-transparent resize-none" rows="2">${asset['t'+i] || ''}</textarea>
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

// === 6. ORACLE ===
document.getElementById('oracle-yes-no-btn').addEventListener('click', () => {
    const roll = Math.floor(Math.random() * 100) + 1;
    let a = roll <= 25 ? "NON" : roll <= 50 ? "Non mitigé" : roll <= 85 ? "OUI" : "OUI ABSOLU !";
    const res = document.getElementById('oracle-res');
    res.textContent = `${roll} : ${a}`;
    res.classList.remove('hidden');
});