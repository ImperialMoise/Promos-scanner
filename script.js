// === 1. SAUVEGARDE ET CHARGEMENT (LocalStorage) ===
// On cible tous les champs de texte et de nombres
const inputs = document.querySelectorAll('input');

inputs.forEach(input => {
    // A. Charger les données si elles existent déjà
    const savedValue = localStorage.getItem(input.id);
    if (savedValue !== null) {
        input.value = savedValue;
    }
    
    // B. Sauvegarder automatiquement à chaque fois qu'on tape ou change un chiffre
    input.addEventListener('input', () => {
        localStorage.setItem(input.id, input.value);
    });
});

// === 2. MOTEUR DE RÉSOLUTION IRONSWORN ===
const rollBtn = document.getElementById('roll-btn');
const rollResult = document.getElementById('roll-result');
const outcomeText = document.getElementById('outcome-text');
const burnBtn = document.getElementById('burn-momentum-btn');

rollBtn.addEventListener('click', () => {
    const statSelect = document.getElementById('stat-selector').value;
    const statValue = parseInt(document.getElementById('stat-' + statSelect).value) || 0;
    const modifier = parseInt(document.getElementById('modifier').value) || 0;

    const actionDie = Math.floor(Math.random() * 6) + 1; // 1d6
    const challenge1 = Math.floor(Math.random() * 10) + 1; // 1d10
    const challenge2 = Math.floor(Math.random() * 10) + 1; // 1d10

    let actionScore = actionDie + statValue + modifier;
    if (actionScore > 10) {
        actionScore = 10;
    }

    document.getElementById('action-die-val').textContent = actionDie;
    document.getElementById('stat-val').textContent = statValue + modifier;
    document.getElementById('action-total').textContent = actionScore;
    document.getElementById('challenge1').textContent = challenge1;
    document.getElementById('challenge2').textContent = challenge2;

    evaluateResult(actionScore, challenge1, challenge2);
    
    // Vérifier si l'on peut brûler l'élan (seulement si l'élan est supérieur au score d'action)
    const currentMomentum = parseInt(document.getElementById('track-momentum').value) || 0;
    if (currentMomentum > actionScore) {
        burnBtn.classList.remove('hidden');
    } else {
        burnBtn.classList.add('hidden');
    }

    rollResult.classList.remove('hidden');
});

// === 3. BRÛLER L'ÉLAN ===
burnBtn.addEventListener('click', () => {
    const currentMomentum = parseInt(document.getElementById('track-momentum').value) || 0;
    const c1 = parseInt(document.getElementById('challenge1').textContent);
    const c2 = parseInt(document.getElementById('challenge2').textContent);

    // L'élan remplace le score d'action
    document.getElementById('action-total').textContent = currentMomentum;
    document.getElementById('action-die-val').textContent = "ÉLAN";
    document.getElementById('stat-val').textContent = "BRÛLÉ";

    evaluateResult(currentMomentum, c1, c2);

    // Réinitialisation de l'élan à +2 (valeur de base) et sauvegarde automatique
    const momentumInput = document.getElementById('track-momentum');
    momentumInput.value = 2;
    localStorage.setItem('track-momentum', 2);

    // On cache le bouton après l'avoir utilisé
    burnBtn.classList.add('hidden');
});

// Fonction utilitaire pour éviter de répéter le code de calcul
function evaluateResult(score, c1, c2) {
    let outcome = "";
    let color = "";
    
    if (score > c1 && score > c2) {
        outcome = "Coup Fort !";
        color = "#4CAF50"; 
    } else if (score > c1 || score > c2) {
        outcome = "Coup Faible";
        color = "#FFC107"; 
    } else {
        outcome = "Échec";
        color = "#F44336"; 
    }

    if (c1 === c2) {
        outcome += " — DOUBLE ! (Rebondissement)";
    }

    outcomeText.textContent = outcome;
    outcomeText.style.color = color;
}

// === 4. GESTION DES PROGRESSIONS (VŒUX / PÉRIPILES) ===
let tracks = JSON.parse(localStorage.getItem('ironsworn-tracks')) || [];

const tracksContainer = document.getElementById('tracks-container');
const addTrackBtn = document.getElementById('add-track-btn');

const diffLabels = {
    troublesome: 'Pénible',
    dangerous: 'Dangereux',
    formidable: 'Redoutable',
    extreme: 'Extrême',
    epic: 'Épique'
};

function saveTracks() {
    localStorage.setItem('ironsworn-tracks', JSON.stringify(tracks));
    renderTracks();
}

function renderTracks() {
    tracksContainer.innerHTML = '';
    tracks.forEach((track, index) => {
        const card = document.createElement('div');
        card.className = 'track-card';
        
        // Construction visuelle des 10 cases (40 coches au total max)
        let boxesHtml = '';
        for (let i = 0; i < 10; i++) {
            let boxTicks = 0;
            if (track.ticks >= (i + 1) * 4) {
                boxTicks = 4;
            } else if (track.ticks > i * 4) {
                boxTicks = track.ticks % 4;
            }
            
            let symbol = '';
            if (boxTicks === 1) symbol = '¼';
            if (boxTicks === 2) symbol = '½';
            if (boxTicks === 3) symbol = '¾';
            if (boxTicks === 4) symbol = 'X';
            
            let activeClass = boxTicks > 0 ? 'filled' : '';
            boxesHtml += `<div class="progress-box ${activeClass}">${symbol}</div>`;
        }

        const progressScore = Math.floor(track.ticks / 4);

        card.innerHTML = `
            <div class="track-header">
                <p class="track-title">${track.name}</p>
                <span class="track-diff">${diffLabels[track.diff] || track.diff}</span>
            </div>
            <div class="boxes-container">${boxesHtml}</div>
            <div class="track-actions">
                <button class="btn-mark" onclick="markProgress(${index})">+ Progrès</button>
                <button class="btn-resolve" onclick="resolveProgress(${index})">Jet (${progressScore})</button>
                <button class="btn-delete" onclick="deleteTrack(${index})">Suppr.</button>
            </div>
            <div id="track-res-${index}" class="hidden track-result-box"></div>
        `;
        tracksContainer.appendChild(card);
    });
}

addTrackBtn.addEventListener('click', () => {
    const nameInput = document.getElementById('new-track-name');
    const diffSelect = document.getElementById('new-track-difficulty');
    
    if (!nameInput.value.trim()) return;

    tracks.push({
        name: nameInput.value.trim(),
        diff: diffSelect.value,
        ticks: 0
    });

    nameInput.value = '';
    saveTracks();
});

window.markProgress = function(index) {
    const track = tracks[index];
    let amount = 0;
    
    // Règles officielles d'Ironsworn pour marquer un progrès
    if (track.diff === 'troublesome') amount = 12; // 3 cases pleines
    if (track.diff === 'dangerous') amount = 8;    // 2 cases pleines
    if (track.diff === 'formidable') amount = 4;   // 1 case pleine
    if (track.diff === 'extreme') amount = 2;      // 2 coches (demi-case)
    if (track.diff === 'epic') amount = 1;         // 1 coche (quart de case)

    track.ticks = Math.min(40, track.ticks + amount);
    saveTracks();
};

window.deleteTrack = function(index) {
    if (confirm('Supprimer définitivement cette ligne de progression ?')) {
        tracks.splice(index, 1);
        saveTracks();
    }
};

window.resolveProgress = function(index) {
    const track = tracks[index];
    const progressScore = Math.floor(track.ticks / 4);
    
    // Jet de Progrès : Uniquement 2d10 contre le score actuel
    const c1 = Math.floor(Math.random() * 10) + 1;
    const c2 = Math.floor(Math.random() * 10) + 1;
    
    let outcome = "";
    let color = "";
    
    if (progressScore > c1 && progressScore > c2) {
        outcome = "Coup Fort !";
        color = "#4CAF50";
    } else if (progressScore > c1 || progressScore > c2) {
        outcome = "Coup Faible";
        color = "#FFC107";
    } else {
        outcome = "Échec";
        color = "#F44336";
    }
    
    if (c1 === c2) {
        outcome += " — DOUBLE ! (Rebondissement)";
    }

    const resDiv = document.getElementById(`track-res-${index}`);
    resDiv.innerHTML = `Score de Progrès : <strong>${progressScore}</strong> CONTRE <strong>${c1}</strong> et <strong>${c2}</strong><br><span style="color:${color}; font-weight:bold; display:inline-block; margin-top:5px;">${outcome}</span>`;
    resDiv.classList.remove('hidden');
};

// Lancement automatique au chargement de la page
renderTracks();