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