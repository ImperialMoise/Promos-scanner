const offers = [
  {
    brand: "Domino's",
    title: "Mardi Fou",
    description: "Le classique à surveiller le mardi : pizzas à prix réduit selon le restaurant participant.",
    price: "dès 7,99€",
    badge: "🔥 Aujourd'hui",
    badgeClass: "badge--hot",
    category: "Pizza",
    district: "Bordeaux centre",
    timing: "Tous les mardis",
  },
  {
    brand: "KFC",
    title: "Box événement",
    description: "Une box limitée à repérer pendant les grands événements sportifs ou les opérations nationales.",
    price: "à vérifier",
    badge: "⏳ Limitée",
    badgeClass: "badge--limited",
    category: "Poulet",
    district: "Mériadeck / Lac",
    timing: "Offre temporaire",
  },
  {
    brand: "Black & White",
    title: "Menu étudiant",
    description: "Burger, accompagnement et boisson avec tarif étudiant sur présentation d'un justificatif.",
    price: "- étudiant",
    badge: "🎓 Étudiant",
    badgeClass: "badge--student",
    category: "Burger",
    district: "Victoire",
    timing: "En semaine",
  },
  {
    brand: "Burger King",
    title: "Coupons app",
    description: "Des coupons qui changent souvent : parfait pour trouver un menu rapide sous les 10€.",
    price: "- coupons",
    badge: "📱 App",
    badgeClass: "",
    category: "Burger",
    district: "Gare / Centre",
    timing: "Variable",
  },
  {
    brand: "Subway",
    title: "Formule midi",
    description: "Une piste intéressante pour les midis pressés autour des campus et zones de bureaux.",
    price: "~ 8€",
    badge: "🥪 Midi",
    badgeClass: "",
    category: "Sandwich",
    district: "Talence",
    timing: "Midi",
  },
  {
    brand: "Spot local",
    title: "Promo à proposer",
    description: "Un bon plan repéré en ville ? L'objectif sera de permettre aux utilisateurs de le signaler.",
    price: "?",
    badge: "📍 Local",
    badgeClass: "badge--hot",
    category: "Local",
    district: "Bordeaux",
    timing: "À vérifier",
  },
];

function OfferCard({ offer }) {
  return (
    <article className="offer-card">
      <div>
        <div className="offer-card__top">
          <span className={`badge ${offer.badgeClass}`}>{offer.badge}</span>
          <span className="price">{offer.price}</span>
        </div>
        <h3>{offer.brand}</h3>
        <p><strong>{offer.title}</strong> — {offer.description}</p>
      </div>
      <div className="meta-list">
        <span>🍽️ {offer.category}</span>
        <span>📍 {offer.district}</span>
        <span>🕒 {offer.timing}</span>
      </div>
    </article>
  );
}

function App() {
  const filters = ["🔥 Aujourd'hui", "🎓 Étudiant", "🍕 Pizza", "🍔 Burger", "📍 Bordeaux"];

  return (
    <main className="app">
      <header className="topbar">
        <a href="#top" className="brand" aria-label="Accueil Promos Scanner">
          <span className="brand__logo">🍟</span>
          <span>Promos Scanner</span>
        </a>
        <nav className="nav" aria-label="Navigation principale">
          <a href="#offers">Offres</a>
          <a href="#submit">Proposer</a>
          <a href="mailto:hello@promos-scanner.fr">Contact</a>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="hero__copy">
          <p className="kicker">📍 MVP Bordeaux</p>
          <h1>Les bons plans food avant qu'ils disparaissent.</h1>
          <p className="hero__lead">
            Promos Scanner centralise les offres fast-food, menus étudiants et promos limitées autour de Bordeaux. On commence simple : des offres claires, vérifiées, faciles à filtrer.
          </p>
          <div className="hero__actions">
            <a className="btn btn--primary" href="#offers">Voir les offres</a>
            <a className="btn" href="#submit">Proposer un bon plan</a>
          </div>
        </div>

        <aside className="today-card" aria-label="Résumé des promos du jour">
          <div>
            <span className="today-card__label">Aujourd'hui</span>
            <h2>3 pistes à vérifier pour manger moins cher.</h2>
            <p>
              Une première version volontairement simple : on affiche les bons plans connus, puis on branchera Supabase pour les rendre dynamiques.
            </p>
          </div>
          <div className="stat-row">
            <div className="stat"><strong>6</strong><span>offres exemple</span></div>
            <div className="stat"><strong>5</strong><span>filtres MVP</span></div>
            <div className="stat"><strong>1</strong><span>ville cible</span></div>
          </div>
        </aside>
      </section>

      <section id="offers" aria-labelledby="offers-title">
        <div className="section-head">
          <div>
            <h2 id="offers-title">Offres repérées</h2>
            <p>Une base de départ pour valider le concept avant Supabase.</p>
          </div>
          <div className="filters" aria-label="Filtres visuels non fonctionnels pour le prototype">
            {filters.map((filter, index) => (
              <button className={`filter ${index === 0 ? "filter--active" : ""}`} type="button" key={filter}>
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="offers-grid">
          {offers.map((offer) => (
            <OfferCard offer={offer} key={`${offer.brand}-${offer.title}`} />
          ))}
        </div>
      </section>

      <section className="panel submit-panel" id="submit">
        <div>
          <h2>Tu as vu une promo ?</h2>
          <p>
            La prochaine étape sera un formulaire connecté à Supabase pour envoyer une offre en attente de validation. Pour le MVP, ce bouton prépare simplement le parcours utilisateur.
          </p>
        </div>
        <a className="btn btn--primary" href="mailto:hello@promos-scanner.fr?subject=Nouveau bon plan food à Bordeaux">
          Envoyer une offre
        </a>
      </section>

      <footer className="footer">
        Prototype React CDN/Babel — pensé mobile-first pour Bordeaux.
      </footer>
    </main>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);