"use client";

import Link from "next/link";
import { Search, ShoppingCart, User, Heart, Menu, X, ChevronDown } from "lucide-react";
import styles from "./Header.module.css";
import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCartStore, useWishlistStore } from "@/lib/store";
import { FilterSidebar } from "./FilterSidebar";
import { useLang } from "@/lib/i18n/LanguageContext";
import type { Lang } from "@/lib/i18n/translations";

interface Suggestion {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
}

interface HeaderProps {
  categories?: any[];
  brands?: any[];
}

export function Header({ categories = [], brands = [] }: HeaderProps) {
  const router = useRouter();
  const { t, lang, setLang, isRTL } = useLang();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileCatsOpen, setIsMobileCatsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const searchRef = useRef<HTMLFormElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const getCartCount = useCartStore((s) => s.getItemCount);
  const getWishlistCount = useWishlistStore((s) => s.getItemCount);

  useEffect(() => {
    setCartCount(getCartCount());
    setWishlistCount(getWishlistCount());
  }, [getCartCount, getWishlistCount]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchExpanded(false);
  }, [router]);

  // Search suggestions
  useEffect(() => {
    const fetch_ = async () => {
      if (searchQuery.trim().length < 2) { setSuggestions([]); return; }
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery.trim())}`);
        if (res.ok) { const d = await res.json(); setSuggestions(d.results || []); }
      } catch { /**/ } finally { setIsSearching(false); }
    };
    const t_ = setTimeout(fetch_, 280);
    return () => clearTimeout(t_);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      setIsSearchExpanded(false);
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const toggleLang = () => setLang(lang === "en" ? "ar" : "en" as Lang);

  const navLinks = [
    { href: "/", label: t("home") },
    { href: "/shop", label: t("shop") },
    { href: "/offers", label: t("specialOffers") },
    { href: "/contact", label: t("contactUs") },
  ];

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>

        {/* ══ MAIN BAR ══ */}
        <div className={styles.mainBar}>
          <div className={`container ${styles.mainBarInner}`}>

            {/* Mobile: hamburger */}
            <button
              className={styles.hamburger}
              onClick={() => setIsMobileMenuOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Logo */}
            <Link href="/" className={styles.logo}>
              <span className={styles.logoZoma}>Zoma</span>
              <span className={styles.logoTech}>Tech</span>
            </Link>

            {/* Desktop search */}
            <form
              ref={searchRef}
              className={styles.searchForm}
              onSubmit={handleSearch}
            >
              <Search size={17} className={styles.searchIcon} />
              <input
                type="text"
                placeholder={t("searchPlaceholder")}
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                aria-label={t("searchPlaceholder")}
                dir={isRTL ? "rtl" : "ltr"}
              />
              {searchQuery && (
                <button
                  type="button"
                  className={styles.searchClear}
                  onClick={() => { setSearchQuery(""); setSuggestions([]); }}
                  aria-label={t("clearSearch")}
                >×</button>
              )}

              {/* Autocomplete */}
              {showSuggestions && searchQuery.trim().length >= 2 && (
                <div className={styles.suggestions}>
                  {isSearching ? (
                    <div className={styles.suggestionsState}>{t("searching")}</div>
                  ) : suggestions.length > 0 ? (
                    <ul className={styles.suggestionsList}>
                      {suggestions.map((p) => (
                        <li key={p.id}>
                          <Link
                            href={`/product/${p.slug}`}
                            className={styles.suggestionItem}
                            onClick={() => { setShowSuggestions(false); setSearchQuery(""); }}
                          >
                            <div className={styles.suggestionImg}>
                              <Image src={p.image} alt={p.name} width={40} height={40} style={{ objectFit: "contain" }} />
                            </div>
                            <div className={styles.suggestionInfo}>
                              <span className={styles.suggestionName}>{p.name}</span>
                              <span className={styles.suggestionPrice}>{p.price.toLocaleString()} EGP</span>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className={styles.suggestionsState}>{t("searchNoResults")} &ldquo;{searchQuery}&rdquo;</div>
                  )}
                </div>
              )}
            </form>

            {/* Right actions */}
            <div className={styles.actions}>

              {/* Mobile search toggle */}
              <button
                className={styles.mobileSearchBtn}
                onClick={() => setIsSearchExpanded((v) => !v)}
                aria-label="Search"
              >
                <Search size={22} />
              </button>

              {/* Lang toggle */}
              <button className={styles.langBtn} onClick={toggleLang} aria-label="Switch language">
                {lang === "en" ? "ع" : "EN"}
              </button>

              <Link href="/account" className={styles.action}>
                <div className={styles.actionIcon}><User size={22} /></div>
                <span className={styles.actionLabel}>{t("account")}</span>
              </Link>
              <Link href="/wishlist" className={styles.action}>
                <div className={styles.actionIcon}>
                  <Heart size={22} />
                  {wishlistCount > 0 && <span className={styles.badge}>{wishlistCount}</span>}
                </div>
                <span className={styles.actionLabel}>{t("wishlist")}</span>
              </Link>
              <Link href="/cart" className={styles.action}>
                <div className={styles.actionIcon}>
                  <ShoppingCart size={22} />
                  {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
                </div>
                <span className={styles.actionLabel}>{t("cart")}</span>
              </Link>
            </div>
          </div>

          {/* Mobile search bar (expands below) */}
          {isSearchExpanded && (
            <div className={styles.mobileSearchBar}>
              <form className={styles.mobileSearchForm} onSubmit={handleSearch}>
                <Search size={16} className={styles.mobileSearchIcon} />
                <input
                  type="text"
                  placeholder={t("searchPlaceholder")}
                  className={styles.mobileSearchInput}
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
                  autoFocus
                  dir={isRTL ? "rtl" : "ltr"}
                />
                {searchQuery && (
                  <button type="button" className={styles.searchClear}
                    onClick={() => { setSearchQuery(""); setSuggestions([]); }}>×</button>
                )}
              </form>
              {/* Mobile suggestions */}
              {showSuggestions && searchQuery.trim().length >= 2 && suggestions.length > 0 && (
                <div className={styles.mobileSuggestions}>
                  {suggestions.map((p) => (
                    <Link key={p.id} href={`/product/${p.slug}`}
                      className={styles.suggestionItem}
                      onClick={() => { setShowSuggestions(false); setIsSearchExpanded(false); setSearchQuery(""); }}>
                      <div className={styles.suggestionImg}>
                        <Image src={p.image} alt={p.name} width={36} height={36} style={{ objectFit: "contain" }} />
                      </div>
                      <div className={styles.suggestionInfo}>
                        <span className={styles.suggestionName}>{p.name}</span>
                        <span className={styles.suggestionPrice}>{p.price.toLocaleString()} EGP</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ══ DESKTOP NAV ══ */}
        <nav className={styles.nav}>
          <div className={`container ${styles.navInner}`}>
            <button className={styles.allCatsBtn} onClick={() => setIsFilterOpen(true)} aria-label={t("allCategories")}>
              <Menu size={17} />
              <span>{t("allCategories")}</span>
            </button>

            <div className={styles.navLinks}>
              {navLinks.map((l) => (
                <Link key={l.href} href={l.href} className={styles.navLink}>
                  {l.label}
                </Link>
              ))}

              {/* Categories dropdown — CSS hover + focus-within */}
              <div className={styles.navDropdown}>
                <div className={styles.navLink} role="button" tabIndex={0}>
                  {t("categories")} <ChevronDown size={14} className={styles.dropdownChevron} />
                </div>
                <div className={styles.dropdownPanel}>
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/shop?category=${cat.slug}`}
                      className={styles.dropdownItem}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* ══ MOBILE MENU DRAWER ══ */}
        {isMobileMenuOpen && (
          <div className={styles.mobileOverlay} onClick={() => setIsMobileMenuOpen(false)} />
        )}
        <div
          ref={mobileMenuRef}
          className={`${styles.mobileDrawer} ${isMobileMenuOpen ? styles.mobileDrawerOpen : ""}`}
        >
          <div className={styles.mobileDrawerHeader}>
            <span className={styles.logo}>
              <span className={styles.logoZoma}>Zoma</span>
              <span className={styles.logoTech}>Tech</span>
            </span>
            <button onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu">
              <X size={22} color="white" />
            </button>
          </div>

          <nav className={styles.mobileNav}>
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} className={styles.mobileNavLink}
                onClick={() => setIsMobileMenuOpen(false)}>
                {l.label}
              </Link>
            ))}

            {/* Mobile categories accordion */}
            <button
              className={styles.mobileCatsToggle}
              onClick={() => setIsMobileCatsOpen((v) => !v)}
            >
              <span>{t("categories")}</span>
              <ChevronDown size={16} style={{ transform: isMobileCatsOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
            </button>
            {isMobileCatsOpen && (
              <div className={styles.mobileCatsList}>
                {categories.map((cat) => (
                  <Link key={cat.id} href={`/shop?category=${cat.slug}`}
                    className={styles.mobileCatItem}
                    onClick={() => setIsMobileMenuOpen(false)}>
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </nav>

          {/* Mobile lang switch */}
          <div className={styles.mobileLangRow}>
            <button
              className={`${styles.mobileLangBtn} ${lang === "en" ? styles.mobileLangActive : ""}`}
              onClick={() => { setLang("en"); }}>
              English
            </button>
            <button
              className={`${styles.mobileLangBtn} ${lang === "ar" ? styles.mobileLangActive : ""}`}
              onClick={() => { setLang("ar"); }}>
              العربية
            </button>
          </div>
        </div>
      </header>

      <Suspense fallback={null}>
        <FilterSidebar isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} categories={categories} brands={brands} />
      </Suspense>
    </>
  );
}
