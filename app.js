const fallbackDeals = [
  {
    id: 1,
    title: "Mardi Fou",
    brand: "Domino's Pizza",
    badge: "Flash",
    badgeIcon: "schedule",
    badgeClass: "bg-tertiary-fixed text-on-tertiary-fixed border border-tertiary-fixed-dim",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80",
    oldPrice: "24.90€",
    price: "7.99€",
    distance: "1.2 km",
    category: "flash",
    city: "Bordeaux",
  },
  {
    id: 2,
    title: "Student Box",
    brand: "KFC",
    badge: "Étudiant",
    badgeIcon: "school",
    badgeClass: "bg-secondary text-on-secondary border border-secondary-fixed-dim",
    image: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=900&q=80",
    price: "-50%",
    distance: "0.8 km",
    category: "student",
    city: "Bordeaux",
  },
  {
    id: 3,
    title: "King Deal",
    brand: "Burger King",
    badge: "Soir",
    badgeIcon: "dark_mode",
    badgeClass: "bg-primary-container text-on-primary-container border border-primary",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80",
    oldPrice: "12.90€",
    price: "8.90€",
    distance: "1.6 km",
    category: "night",
    city: "Bordeaux",
  },
  {
    id: 4,
    title: "Nouveau Wrap",
    brand: "FastFood Local",
    badge: "Nouveau",
    badgeIcon: "auto_awesome",
    badgeClass: "bg-tertiary text-on-tertiary border border-tertiary",
    image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=900&q=80",
    price: "6.50€",
    distance: "2.1 km",
    category: "new",
    city: "Bordeaux",
  },
];

const categories = [
  {
    id: "student",
    eyebrow: "Populaire",
    title: "Meilleures Offres Étudiantes",
    badgeClass: "bg-secondary text-on-secondary",
    image: "https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "night",
    eyebrow: "Dès 20h",
    title: "Deals du Soir",
    badgeClass: "bg-primary-container text-on-primary-container",
    image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "new",
    eyebrow: "À Découvrir",
    title: "Nouveautés",
    badgeClass: "bg-tertiary text-on-tertiary",
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=80",
  },
];

function normalizeOffer(offer) {
  return {
    id: offer.id,
    title: offer.title,
    brand: offer.brand,
    badge: offer.badge || (offer.confidence_score >= 80 ? "Vérifiée" : "À vérifier"),
    badgeIcon: offer.badge_icon || (offer.confidence_score >= 80 ? "verified" : "visibility"),
    badgeClass: badgeClassForCategory(offer.category),
    image: offer.image || imageForCategory(offer.category),
    oldPrice: offer.old_price,
    price: offer.price || "À vérifier",
    distance: offer.distance || "Bordeaux",
    category: offer.category || "new",
    city: offer.city || "Bordeaux",
    sourceUrl: offer.source_url,
    description: offer.description,
    confidenceScore: offer.confidence_score,
  };
}

function badgeClassForCategory(category) {
  if (category === "student") return "bg-secondary text-on-secondary border border-secondary-fixed-dim";
  if (category === "night") return "bg-primary-container text-on-primary-container border border-primary";
  if (category === "flash") return "bg-tertiary-fixed text-on-tertiary-fixed border border-tertiary-fixed-dim";
  return "bg-tertiary text-on-tertiary border border-tertiary";
}

function imageForCategory(category) {
  if (category === "student") return "https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=900&q=80";
  if (category === "night") return "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=900&q=80";
  if (category === "flash") return "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80";
  return "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=80";
}

function Icon({ name, className = "", fill = true }) {
  const style = { fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24` };
  return <span className={`material-symbols-outlined ${className}`} style={style}>{name}</span>;
}

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-surface-variant bg-surface">
      <nav className="mx-auto flex w-full max-w-container-max items-center justify-between px-md py-sm">
        <a className="font-display-lg text-display-lg-mobile font-black text-primary md:text-display-lg" href="#top">
          FastOffres
        </a>

        <ul className="hidden items-center gap-lg md:flex">
          <li>
            <a className="border-b-2 border-primary pb-1 font-label-bold text-label-bold text-primary transition-colors hover:text-primary" href="#deals">
              Offres du Jour
            </a>
          </li>
          <li>
            <a className="font-label-bold text-label-bold text-on-surface-variant transition-colors duration-100 hover:text-primary" href="#categories">
              Par Enseignes
            </a>
          </li>
        </ul>

        <button className="flex items-center justify-center rounded-full p-sm font-label-bold text-label-bold text-primary transition-colors duration-100 hover:bg-surface-container" type="button">
          <Icon name="person" fill={false} />
          <span className="ml-xs hidden md:inline">Mon Profil</span>
        </button>
      </nav>
    </header>
  );
}

function Hero({ city, setCity, onSearch }) {
  return (
    <section className="relative flex flex-col items-center gap-md overflow-hidden rounded-xl border border-surface-variant bg-surface-container-low px-md py-lg text-center">
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary-container opacity-20 blur-3xl" />
      <h1 className="z-10 max-w-2xl font-display-lg text-display-lg-mobile text-on-surface md:text-display-lg">
        Trouvez les meilleures offres fast-food à
      </h1>

      <form className="z-10 mt-sm w-full max-w-xl" onSubmit={onSearch}>
        <div className="flex items-center overflow-hidden rounded-lg border-2 border-secondary bg-surface-container-lowest shadow-sm transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary">
          <div className="flex items-center justify-center py-sm pl-md pr-sm text-secondary">
            <Icon name="location_on" />
          </div>
          <input
            className="w-full border-none bg-transparent px-xs py-sm font-headline-sm text-headline-sm text-on-surface placeholder-on-surface-variant focus:ring-0"
            placeholder="Votre ville..."
            type="text"
            value={city}
            onChange={(event) => setCity(event.target.value)}
          />
          <button className="h-full bg-primary px-md py-sm font-label-bold text-label-bold text-on-primary transition-colors hover:bg-surface-tint md:px-lg" type="submit">
            Rechercher
          </button>
        </div>
      </form>
    </section>
  );
}

function DealCard({ deal, onSelect }) {
  return (
    <article className="deal-card relative flex min-w-[280px] flex-shrink-0 flex-col overflow-hidden rounded-xl border border-surface-variant bg-surface-container-lowest md:min-w-[320px]">
      <div className={`absolute left-sm top-sm z-10 flex items-center gap-xs rounded-full px-sm py-xs font-label-bold text-label-bold shadow-sm ${deal.badgeClass}`}>
        <Icon name={deal.badgeIcon} className="text-[16px]" />
        {deal.badge}
      </div>

      <div className="relative h-40 w-full bg-surface-variant">
        <img className="absolute inset-0 h-full w-full object-cover" src={deal.image} alt={`${deal.title} chez ${deal.brand}`} />
      </div>

      <div className="flex flex-grow flex-col gap-sm p-md">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">{deal.title}</h3>
            <div className="mt-xs flex items-center gap-xs text-on-surface-variant">
              <span className="font-label-bold text-label-bold">{deal.brand}</span>
              <Icon name="verified" className="text-[16px] text-primary-container" />
            </div>
          </div>

          <div className="rounded bg-surface-container px-sm py-xs text-center">
            {deal.oldPrice && <span className="block font-label-sm text-label-sm text-on-surface-variant line-through">{deal.oldPrice}</span>}
            <span className="block font-headline-sm text-headline-sm text-primary">{deal.price}</span>
          </div>
        </div>

        {deal.sourceUrl && (
  <p className="font-label-sm text-label-sm text-on-surface-variant">
    Source officielle disponible
  </p>
)}

<div className="mt-auto flex items-center justify-between border-t border-surface-variant pt-sm">
          <span className="flex items-center gap-xs font-label-sm text-label-sm text-secondary">
            <Icon name="location_on" className="text-[14px]" fill={false} />
            {deal.distance}
          </span>
          <button className="rounded bg-primary px-sm py-xs font-label-bold text-label-bold text-on-primary transition-colors hover:bg-surface-tint" type="button" onClick={() => onSelect(deal)}>
            Profiter
          </button>
        </div>
      </div>
    </article>
  );
}

function DealsSection({ dealsToShow, onSelect, onReset }) {
  return (
    <section className="flex flex-col gap-md" id="deals">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="flex items-center gap-sm font-headline-md text-headline-md text-on-surface">
            <Icon name="local_fire_department" className="text-primary-container" />
            Offres Flash du Jour
          </h2>
          <p className="mt-xs font-body-md text-body-md text-on-surface-variant">Ces deals disparaissent bientôt !</p>
        </div>
        <button className="hidden items-center gap-xs font-label-bold text-label-bold text-secondary transition-colors hover:text-primary md:flex" type="button" onClick={onReset}>
          Voir tout <Icon name="arrow_forward" className="text-sm" fill={false} />
        </button>
      </div>

      <div className="hide-scrollbar -mx-gutter flex gap-md overflow-x-auto px-gutter pb-sm md:mx-0 md:px-0">
        {dealsToShow.map((deal) => (
          <DealCard deal={deal} key={deal.id} onSelect={onSelect} />
        ))}
      </div>
    </section>
  );
}

function CategoryCard({ category, onPick }) {
  return (
    <button className="category-card group relative flex h-48 items-end overflow-hidden rounded-xl border border-surface-variant bg-surface-container-low p-md text-left md:h-64" type="button" onClick={() => onPick(category.id)}>
      <div className="absolute inset-0 z-0">
        <img className="h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100" src={category.image} alt={category.title} />
        <div className="absolute inset-0 bg-gradient-to-t from-on-surface via-transparent to-transparent opacity-80" />
      </div>
      <div className="relative z-10 flex flex-col gap-xs">
        <span className={`w-fit rounded px-xs py-[2px] font-label-sm text-label-sm uppercase tracking-wider ${category.badgeClass}`}>
          {category.eyebrow}
        </span>
        <h3 className="font-headline-md text-headline-md text-on-primary">{category.title}</h3>
      </div>
    </button>
  );
}

function CategoriesSection({ onPick }) {
  return (
    <section className="grid grid-cols-1 gap-md md:grid-cols-3" id="categories">
      {categories.map((category) => (
        <CategoryCard category={category} key={category.id} onPick={onPick} />
      ))}
    </section>
  );
}

function Footer() {
  return (
    <footer className="mt-auto flex w-full flex-col items-center gap-md bg-on-secondary-fixed px-md py-lg text-primary-fixed">
      <div className="font-headline-md text-headline-md font-black text-primary-container">FastOffres</div>
      <ul className="flex flex-wrap justify-center gap-md">
        {['Villes', 'Mentions Légales', 'Confidentialité', 'Aide'].map((link) => (
          <li key={link}>
            <a className="font-label-sm text-label-sm text-surface-variant opacity-80 transition-colors hover:text-primary-container hover:opacity-100" href="#top">
              {link}
            </a>
          </li>
        ))}
      </ul>
      <div className="mt-sm text-center font-body-md text-body-md text-surface-dim">© 2026 FastOffres. Tous droits réservés.</div>
    </footer>
  );
}

function App() {
  const [city, setCity] = React.useState("Bordeaux");
  const [searchedCity, setSearchedCity] = React.useState("Bordeaux");
  const [category, setCategory] = React.useState("all");
  const [message, setMessage] = React.useState("");
  const [deals, setDeals] = React.useState(fallbackDeals);
  const [isLoading, setIsLoading] = React.useState(false);
  const [dataMode, setDataMode] = React.useState("demo");

  React.useEffect(() => {
    const config = window.FASTOFFRES_CONFIG || {};

    if (!config.supabaseUrl || !config.supabaseAnonKey || !window.supabase) {
      setDataMode("demo");
      setMessage("Mode démo : les offres affichées sont des exemples. Ajoute tes clés Supabase dans index.html pour afficher uniquement les vraies offres validées.");
      return;
    }

    const client = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
    setIsLoading(true);

    client
      .from("offers")
      .select("id, title, description, brand, badge, badge_icon, category, city, image, old_price, price, distance, source_url, confidence_score, last_seen_at")
      .eq("status", "published")
      .order("last_seen_at", { ascending: false })
      .limit(20)
      .then(({ data, error }) => {
        if (error) throw error;

        if (data && data.length > 0) {
          setDeals(data.map(normalizeOffer));
          setDataMode("supabase");
          setMessage(`${data.length} offre(s) publiée(s) chargée(s) depuis Supabase.`);
        } else {
          setDeals(fallbackDeals);
          setDataMode("empty");
          setMessage("Aucune offre vérifiée pour l’instant");
        }
      })
      .catch((error) => {
        setDeals(fallbackDeals);
        setDataMode("error");
        setMessage(`Lecture Supabase impossible : ${error.message}. Les cartes de démo restent affichées.`);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const filteredDeals = deals.filter((deal) => category === "all" || deal.category === category);

  function handleSearch(event) {
    event.preventDefault();
    const nextCity = city.trim() || "Bordeaux";
    setCity(nextCity);
    setSearchedCity(nextCity);
    setMessage(`Recherche lancée pour ${nextCity}. Pour l'instant, seules les offres validées dans Supabase peuvent réellement changer.`);
  }

  function handlePickCategory(nextCategory) {
    setCategory(nextCategory);
    setMessage("Catégorie filtrée. Clique sur “Voir tout” pour revenir aux offres flash.");
  }

  function handleReset() {
    setCategory("all");
    setMessage("Toutes les offres flash sont à nouveau affichées.");
  }

function handleSelectDeal(deal) {
  if (deal.sourceUrl) {
    window.open(deal.sourceUrl, "_blank", "noopener,noreferrer");
    setMessage(`Ouverture de la source officielle pour “${deal.title}” chez ${deal.brand}.`);
    return;
  }

  setMessage(`Cette offre est un exemple de démo : aucune source officielle n'est liée pour l'instant.`);
}

  return (
    <div className="flex min-h-screen flex-col" id="top">
      <Header />
      <main className="mx-auto flex w-full max-w-container-max flex-grow flex-col gap-lg px-gutter py-lg md:px-md">
        <Hero city={city} setCity={setCity} onSearch={handleSearch} />

        {message && (
          <div className="rounded-lg border border-primary-fixed bg-primary-fixed px-md py-sm font-label-bold text-label-bold text-on-primary-fixed-variant" role="status">
            {message}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-sm font-label-bold text-label-bold text-on-surface-variant">
          <span>Ville active : <span className="text-primary">{searchedCity}</span></span>
          <span className="rounded-full bg-surface-container px-sm py-xs text-label-sm uppercase tracking-wide">
            Source : {dataMode === "supabase" ? "Supabase" : "Démo"}
          </span>
          {isLoading && <span className="text-primary">Chargement des offres...</span>}
        </div>

        <DealsSection dealsToShow={filteredDeals} onSelect={handleSelectDeal} onReset={handleReset} />
        <CategoriesSection onPick={handlePickCategory} />
      </main>
      <Footer />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);