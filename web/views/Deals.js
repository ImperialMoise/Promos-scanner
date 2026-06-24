// ════════════════════════════════════════════════════════════
// Deals.js — Vue Bons plans food
// ════════════════════════════════════════════════════════════
//
// Rôle :
// - Afficher les offres food autour de Bordeaux.
// - Rester simple pour le MVP.
// - Utiliser des données locales en dur avant le branchement Supabase.
//
// Dépendances globales :
// - React
// - window.Icon
//
// Export :
// - window.DealsView
//
// ════════════════════════════════════════════════════════════

(function initDealsView() {
  const DEALS = [
    {
      id: 'dominos-mardi-fou',
      brand: 'Domino’s Pizza',
      title: 'Mardi Fou',
      description: 'Une offre récurrente idéale pour partager une pizza sans exploser le budget.',
      price: 'Selon pizza',
      area: 'Bordeaux Centre',
      day: 'Mardi',
      tags: ['Aujourd’hui si mardi', 'Pizza', 'À vérifier'],
      accent: 'pizza'
    },
    {
      id: 'dominos-jeudi-fou',
      brand: 'Domino’s Pizza',
      title: 'Jeudi Fou',
      description: 'Le bon plan de fin de semaine pour commander à plusieurs.',
      price: 'Selon pizza',
      area: 'Bordeaux',
      day: 'Jeudi',
      tags: ['Jeudi', 'Pizza', 'Groupe'],
      accent: 'pizza'
    },
    {
      id: 'kfc-box-event',
      brand: 'KFC',
      title: 'Box événement',
      description: 'Une box temporaire à surveiller pendant les grands événements sportifs.',
      price: 'Prix variable',
      area: 'Mériadeck / Bordeaux Lac',
      day: 'Temporaire',
      tags: ['Poulet', 'Événement', 'App'],
      accent: 'chicken'
    },
    {
      id: 'black-white-student',
      brand: 'Black and White',
      title: 'Menu étudiant',
      description: 'Un menu pensé pour les étudiants, à confirmer selon le restaurant.',
      price: 'À partir de 8–10 €',
      area: 'Victoire / Campus',
      day: 'Semaine',
      tags: ['Étudiant', 'Burger', '-10 €'],
      accent: 'student'
    },
    {
      id: 'burger-king-coupons',
      brand: 'Burger King',
      title: 'Coupons appli',
      description: 'Des offres régulières disponibles dans l’application ou en restaurant.',
      price: 'Variable',
      area: 'Bordeaux',
      day: 'Tous les jours',
      tags: ['App', 'Burger', 'Coupons'],
      accent: 'burger'
    }
  ];

  const FILTERS = [
    'Aujourd’hui',
    'Étudiant',
    'Moins de 10 €',
    'Pizza',
    'Burger',
    'Poulet'
  ];

  function DealsView() {
    const [activeFilter, setActiveFilter] = React.useState('Aujourd’hui');

    const visibleDeals = DEALS.filter(function filterDeal(deal) {
      if (activeFilter === 'Aujourd’hui') {
        return true;
      }

      if (activeFilter === 'Moins de 10 €') {
        return deal.tags.some(tag => tag.includes('-10'));
      }

      return deal.tags.some(function matchTag(tag) {
        return tag.toLowerCase().includes(activeFilter.toLowerCase());
      });
    });

    return (
      <div className="deals-view">
        <section className="deals-hero">
          <div>
            <div className="deals-kicker">Bordeaux · MVP local</div>

            <h1 className="deals-title">
              Bons plans food autour de toi
            </h1>

            <p className="deals-intro">
              Une première version simple pour repérer les offres fast-food,
              menus étudiants et promos à vérifier avant de commander.
            </p>
          </div>

          <div className="deals-hero-card">
            <span className="deals-hero-number">{DEALS.length}</span>
            <span className="deals-hero-label">offres repérées</span>
          </div>
        </section>

        <section className="deals-filters" aria-label="Filtres bons plans">
          {FILTERS.map(function renderFilter(filter) {
            const active = filter === activeFilter;

            return (
              <button
                key={filter}
                type="button"
                className={'deals-filter' + (active ? ' active' : '')}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            );
          })}
        </section>

        <section className="deals-grid">
          {visibleDeals.map(function renderDeal(deal) {
            return (
              <DealCard key={deal.id} deal={deal} />
            );
          })}
        </section>

        <section className="deals-note">
          <strong>Note MVP :</strong> les offres affichées ici sont des exemples
          de départ. Il faudra toujours vérifier les conditions exactes sur
          l’application officielle, le site du restaurant ou directement en caisse.
        </section>
      </div>
    );
  }

  function DealCard({ deal }) {
    const Icon = window.Icon;

    return (
      <article className={'deal-card deal-card-' + deal.accent}>
        <div className="deal-card-top">
          <div className="deal-logo">
            {deal.brand.slice(0, 1)}
          </div>

          <div className="deal-main">
            <div className="deal-brand">{deal.brand}</div>
            <h2 className="deal-title">{deal.title}</h2>
          </div>
        </div>

        <p className="deal-description">
          {deal.description}
        </p>

        <div className="deal-meta">
          <span>
            {Icon && <Icon name="pin" size={13} />}
            {deal.area}
          </span>

          <span>
            {Icon && <Icon name="cal" size={13} />}
            {deal.day}
          </span>

          <span>
            {Icon && <Icon name="budget" size={13} />}
            {deal.price}
          </span>
        </div>

        <div className="deal-tags">
          {deal.tags.map(function renderTag(tag) {
            return (
              <span key={tag} className="deal-tag">
                {tag}
              </span>
            );
          })}
        </div>

        <button
          type="button"
          className="deal-action"
          onClick={() => {
            if (window.Store?.showToast) {
              window.Store.showToast('Dans la V2, ce bouton ouvrira le détail de l’offre.');
            }
          }}
        >
          Voir l’offre
        </button>
      </article>
    );
  }

  window.DealsView = DealsView;
})();
