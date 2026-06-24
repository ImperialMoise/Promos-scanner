const deals = [
  {
    title: "Menu Étudiant",
    price: "5€",
    brand: "Burger King",
    brandInitials: "BK",
    brandColor: "bg-error-container text-on-error-container",
    badge: "Étudiant",
    badgeIcon: "school",
    badgeClass: "bg-secondary text-on-secondary",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80",
    timeIcon: "timer",
    timeText: "Expire ce soir",
    timeClass: "text-error",
    action: "Profiter",
    primaryAction: true,
  },
  {
    title: "Offre Ciné + Burger",
    price: "12€",
    oldPrice: "18€",
    brand: "UGC + FastFood Local",
    brandIcon: "movie",
    badge: "Combo",
    badgeIcon: "local_activity",
    badgeClass: "bg-tertiary-container text-on-tertiary-container",
    image: "https://images.unsplash.com/photo-1627225924765-552d49cf47ad?auto=format&fit=crop&w=900&q=80",
    timeIcon: "calendar_today",
    timeText: "Valable 7j",
    timeClass: "text-on-surface-variant",
    action: "Détails",
    primaryAction: false,
  },
  {
    title: "Mardi Fou Dominos",
    price: "1+1",
    brand: "Dominos Pizza",
    brandInitials: "DP",
    brandColor: "bg-secondary text-on-secondary",
    badge: "Flash Deal",
    badgeIcon: "local_fire_department",
    badgeClass: "bg-primary-container text-on-primary-container border border-primary",
    image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=900&q=80",
    code: "MARDI50",
    action: "Copier & Commander",
    primaryAction: true,
    wideOnTablet: true,
  },
];

const filters = [
  { label: "Dominos", icon: "local_pizza" },
  { label: "KFC", icon: "restaurant" },
  { label: "Étudiant", icon: "school", active: true },
  { label: "Mardi Fou", icon: "schedule" },
  { label: "Price Range", icon: "payments" },
];

function Icon({ name, className = "" }) {
  return <span className={`material-symbols-outlined ${className}`}>{name}</span>;
}

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-surface-variant bg-surface">
      <nav className="mx-auto flex w-full max-w-container-max items-center justify-between px-md py-sm">
        <a className="flex items-center gap-2" href="#top" aria-label="Accueil FastOffres">
          <Icon name="local_fire_department" className="text-3xl text-primary" />
          <span className="hidden font-display text-display-lg font-black text-primary md:block">FastOffres</span>
          <span className="block font-display text-display-lg-mobile font-black text-primary md:hidden">FastOffres</span>
        </a>

        <div className="relative mx-md hidden max-w-md flex-1 md:flex">
          <Icon name="location_on" className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
          <input
            className="w-full rounded-full border-2 border-secondary bg-surface-container-lowest py-2 pl-10 pr-4 text-body-md text-on-surface transition-colors focus:border-primary focus:outline-none"
            placeholder="Bordeaux..."
            type="text"
          />
        </div>

        <div className="flex items-center gap-md">
          <a className="flex scale-95 items-center gap-1 border-b-2 border-primary pb-1 text-label-bold font-bold text-primary transition-colors" href="#deals">
            Offres du Jour
          </a>
          <a className="hidden scale-95 items-center gap-1 text-label-bold font-bold text-on-surface-variant transition-colors hover:text-primary md:flex" href="#brands">
            Par Enseignes
          </a>
          <button className="ml-sm rounded-full bg-primary-container px-4 py-2 text-label-bold font-bold text-on-primary-container transition-colors hover:bg-primary hover:text-on-primary">
            Mon Profil
          </button>
        </div>
      </nav>
    </header>
  );
}

function Sidebar() {
  return (
    <aside className="sticky top-[80px] hidden h-[calc(100vh-80px)] w-64 flex-col gap-base rounded-r-xl border-r border-surface-variant bg-surface-container-low p-md shadow-sm lg:flex">
      <div className="mb-sm">
        <h2 className="text-headline-sm font-bold text-on-surface">Filtres</h2>
        <p className="mt-1 text-body-md text-on-surface-variant">Affinez vos recherches</p>
      </div>

      <nav className="flex flex-col gap-xs" aria-label="Filtres par enseigne et type d'offre">
        {filters.map((filter) => (
          <button
            className={`flex w-full items-center gap-3 rounded-lg p-3 text-left text-label-bold font-bold transition-all duration-200 ${
              filter.active
                ? "bg-secondary-container text-on-secondary-container"
                : "text-on-surface-variant hover:bg-surface-variant"
            }`}
            type="button"
            key={filter.label}
          >
            <Icon name={filter.icon} className="text-[20px]" />
            {filter.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

function BrandLine({ deal }) {
  return (
    <div className="mb-4 flex items-center gap-2 text-on-surface-variant">
      {deal.brandInitials ? (
        <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${deal.brandColor}`}>
          {deal.brandInitials}
        </div>
      ) : (
        <Icon name={deal.brandIcon} className="text-secondary" />
      )}
      <span className="text-label-bold font-bold">{deal.brand}</span>
      {deal.brandInitials && <Icon name="verified" className="text-sm text-tertiary-container" />}
    </div>
  );
}

function DealCard({ deal }) {
  return (
    <article className={`card-hover group relative flex flex-col overflow-hidden rounded-xl border border-surface-variant bg-surface-container-lowest transition-all duration-300 ${deal.wideOnTablet ? "sm:col-span-2 xl:col-span-1" : ""}`}>
      <div className="relative aspect-video w-full overflow-hidden bg-surface-variant">
        <div className="deal-image h-full w-full transition-transform duration-500 group-hover:scale-105" style={{ backgroundImage: `url('${deal.image}')` }} />
        <div className={`absolute left-sm top-sm flex items-center gap-1 rounded-full px-3 py-1 shadow-sm ${deal.badgeClass}`}>
          <Icon name={deal.badgeIcon} className="text-[16px]" />
          <span className="text-label-sm font-bold uppercase tracking-wider">{deal.badge}</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-md">
        <div className="mb-2 flex items-start justify-between">
          <h3 className="text-headline-md font-bold leading-tight text-on-surface">{deal.title}</h3>
          <div className="ml-2 flex shrink-0 flex-col items-end">
            <span className="font-display text-display-lg-mobile font-black leading-none text-primary">{deal.price}</span>
            {deal.oldPrice && <span className="text-sm text-on-surface-variant line-through">{deal.oldPrice}</span>}
          </div>
        </div>

        <BrandLine deal={deal} />

        {deal.code ? (
          <div className="mt-auto flex flex-col gap-3 border-t border-surface-variant pt-4">
            <div className="flex items-center justify-between rounded-md bg-surface-container-high p-2">
              <span className="text-sm font-bold text-on-surface-variant">Code Promo:</span>
              <span className="font-mono font-bold tracking-widest text-primary">{deal.code}</span>
            </div>
            <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-label-bold font-bold text-on-primary transition-colors hover:bg-on-primary-fixed hover:text-primary-fixed">
              <Icon name="content_copy" />
              {deal.action}
            </button>
          </div>
        ) : (
          <div className="mt-auto flex items-center justify-between border-t border-surface-variant pt-4">
            <div className={`flex items-center gap-1 text-label-sm font-bold ${deal.timeClass}`}>
              <Icon name={deal.timeIcon} className="text-[18px]" />
              {deal.timeText}
            </div>
            <button className={deal.primaryAction ? "rounded-lg bg-primary px-4 py-2 text-label-bold font-bold text-on-primary transition-colors hover:bg-on-primary-fixed hover:text-primary-fixed" : "rounded-lg border-2 border-primary px-4 py-1.5 text-label-bold font-bold text-primary transition-colors hover:bg-primary-fixed hover:text-on-primary-fixed"}>
              {deal.action}
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

function App() {
  return (
    <div id="top" className="flex min-h-screen flex-col bg-surface text-on-surface">
      <Header />

      <div className="mx-auto flex w-full max-w-container-max flex-1">
        <Sidebar />

        <main className="flex-1 p-gutter md:p-md lg:pl-lg" id="deals">
          <div className="mb-md flex items-end justify-between">
            <div>
              <h1 className="font-display text-display-lg-mobile font-black uppercase leading-none tracking-tight text-on-surface md:text-display-lg">
                Bordeaux <span className="block text-primary-container md:inline">Hot Deals</span>
              </h1>
              <p className="mt-2 max-w-2xl text-body-lg text-on-surface-variant">
                Les meilleures réductions rapides autour de vous. Vite, ça part vite !
              </p>
            </div>
            <button className="flex items-center justify-center rounded-full bg-surface-variant p-2 text-on-surface lg:hidden" type="button" aria-label="Ouvrir les filtres">
              <Icon name="tune" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-md sm:grid-cols-2 lg:gap-lg xl:grid-cols-3">
            {deals.map((deal) => (
              <DealCard deal={deal} key={deal.title} />
            ))}
          </div>
        </main>
      </div>

      <footer className="mt-xl flex w-full flex-col items-center gap-md border-t-4 border-primary bg-on-secondary-fixed px-md py-lg">
        <div className="text-headline-md font-black text-primary-container">FastOffres</div>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">
          <a className="text-label-sm text-surface-variant opacity-80 transition-colors hover:text-primary-container hover:opacity-100" href="#top">Villes</a>
          <a className="text-label-sm text-surface-variant opacity-80 transition-colors hover:text-primary-container hover:opacity-100" href="#top">Mentions Légales</a>
          <a className="text-label-sm text-surface-variant opacity-80 transition-colors hover:text-primary-container hover:opacity-100" href="#top">Confidentialité</a>
          <a className="text-label-sm text-surface-variant opacity-80 transition-colors hover:text-primary-container hover:opacity-100" href="#top">Aide</a>
        </div>
        <p className="mt-4 text-center text-body-md text-surface-variant">© 2026 FastOffres. Tous droits réservés.</p>
      </footer>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);