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

rollBtn.addEventListener('click', () => {
    // 1. Récupérer les valeurs
    const statSelect = document.getElementById('stat-selector').value;
    const statValue = parseInt(document.getElementById('stat-' + statSelect).value) || 0;
    const modifier = parseInt(document.getElementById('modifier').value) || 0;

    // 2. Lancer les dés
    const actionDie = Math.floor(Math.random() * 6) + 1; // 1d6
    const challenge1 = Math.floor(Math.random() * 10) + 1; // 1d10
    const challenge2 = Math.floor(Math.random() * 10) + 1; // 1d10

    // 3. Calcul du score d'action
    // Règle d'Ironsworn : Le score d'action ne peut jamais dépasser 10.
    let actionScore = actionDie + statValue + modifier;
    if (actionScore > 10) {
        actionScore = 10;
    }

    // 4. Affichage des chiffres sur l'écran
    document.getElementById('action-die-val').textContent = actionDie;
    document.getElementById('stat-val').textContent = statValue + modifier;
    document.getElementById('action-total').textContent = actionScore;
    document.getElementById('challenge1').textContent = challenge1;
    document.getElementById('challenge2').textContent = challenge2;

    // 5. Interprétation des résultats
    let outcome = "";
    let color = "";
    
    if (actionScore > challenge1 && actionScore > challenge2) {
        outcome = "Coup Fort !";
        color = "#4CAF50"; // Vert
    } else if (actionScore > challenge1 || actionScore > challenge2) {
        outcome = "Coup Faible";
        color = "#FFC107"; // Jaune
    } else {
        outcome = "Échec";
        color = "#F44336"; // Rouge
    }

    // 6. Gestion des égalités sur les dés de défi (Rebondissement)
    if (challenge1 === challenge2) {
        outcome += " — DOUBLE ! (Rebondissement/Opportunité)";
    }

    outcomeText.textContent = outcome;
    outcomeText.style.color = color;
    
    // On rend visible la zone de résultat qui était cachée
    rollResult.classList.remove('hidden');
});