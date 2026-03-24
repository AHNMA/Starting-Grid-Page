import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import GlobalBackground from "../components/GlobalBackground";
import { PodcastInfo } from "../types";
import { Helmet } from "react-helmet-async";

const Shop: React.FC = () => {
  const [info, setInfo] = useState<PodcastInfo | null>(null);

  useEffect(() => {
    fetch("/api/podcast")
      .then((r) => r.json())
      .then(setInfo);

    // Spreadshop Konfiguration global setzen
    (window as any).spread_shop_config = {
      shopName: "starting-grid",
      locale: "de_DE",
      prefix: "https://starting-grid.myspreadshop.de",
      baseId: "myShop",
      // Zwingt den Shop, direkt mit der Übersicht "Alle Produkte" zu starten
      startToken: "all",
    };

    // Externes Skript dynamisch laden
    const script = document.createElement("script");
    script.src =
      "https://starting-grid.myspreadshop.de/shopfiles/shopclient/shopclient.nocache.js";
    script.type = "text/javascript";
    script.async = true;
    document.body.appendChild(script);

    // Cleanup beim Verlassen der Seite
    return () => {
      const existingScript = document.querySelector(
        `script[src="${script.src}"]`,
      );
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
      delete (window as any).spread_shop_config;
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden text-white font-sans">
      <Helmet>
        <title>Shop - {info?.seo_title || "Starting Grid"}</title>
      </Helmet>

      <GlobalBackground />
      <Header info={info} />

      <main className="pb-16 md:pb-32 px-4 sm:px-6 max-w-7xl mx-auto relative flex-1 w-full flex flex-col">
        <article className="bg-[#151515] border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative">
          <div className="p-6 md:p-12 relative z-auto w-full">
            <div className="w-full">
              {/* CSS-Injection für Spreadshop Elemente */}
              <style
                dangerouslySetInnerHTML={{
                  __html: `
                /* Container des Headers - Verstecke den ursprünglichen Header-Bereich, da Elemente teleportiert werden */
                .starting-grid-shop-wrapper .sprd-header-container {
                    display: block !important;
                    width: 100% !important;
                    margin: 0 !important;
                    padding: 0 !important;
                }

                /* 1. PROMO BANNER (Bleibt normal sichtbar, da nicht Teil des Headers) */
                .starting-grid-shop-wrapper .sprd-promo-header {
                    position: relative !important;
                    top: auto !important;
                    left: auto !important;
                    background: transparent !important;
                    color: white !important;
                    box-shadow: none !important;
                    display: flex !important;
                    flex-wrap: wrap !important;
                    justify-content: center !important;
                    align-items: center !important;
                    padding: 0 0 1rem 0 !important;
                    border-bottom: 1px solid #1f2937 !important; /* Tailwind gray-800 */
                    width: 100% !important;
                }
                .starting-grid-shop-wrapper .sprd-promo-header__center {
                    color: #e5e7eb !important; /* Tailwind gray-200 */
                    display: flex !important;
                    align-items: center !important;
                    gap: 10px !important;
                }
                .starting-grid-shop-wrapper .sprd-promo__button {
                    background: #e10600 !important; /* F1 Red */
                    color: white !important;
                    border: none !important;
                    padding: 4px 12px !important;
                    border-radius: 4px !important;
                    cursor: pointer !important;
                    font-weight: bold !important;
                }
                .starting-grid-shop-wrapper .sprd-promo__toggle {
                    display: none !important;
                }

                /* 2. NAVIGATION (Rechtsbündig neben dem Warenkorb auf Desktop) */
                .starting-grid-shop-wrapper .sprd-navigation {
                    position: fixed !important;
                    top: 0 !important;
                    right: calc(16px + 40px + 16px) !important; /* Standard Tailwind padding + Breite des Warenkorbs + Abstand (16px) */
                    height: 64px !important; /* Standard Header Höhe (h-16) */
                    z-index: 9999 !important;
                    background: transparent !important;
                    padding: 0 !important;
                    margin: 0 !important;
                    box-shadow: none !important;
                    border: none !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: flex-end !important;
                    width: auto !important;
                }

                @media (min-width: 640px) {
                    .starting-grid-shop-wrapper .sprd-navigation {
                        right: calc(24px + 40px + 16px) !important; /* sm:px-6 + Warenkorb + Abstand (16px) */
                    }
                }

                @media (min-width: 768px) {
                    .starting-grid-shop-wrapper .sprd-navigation {
                        height: 80px !important; /* md:h-20 */
                        right: calc(24px + 50px + 16px) !important; /* sm:px-6 + md:w-[50px] Warenkorb + Abstand (16px) */
                    }
                }

                @media (min-width: 1024px) {
                    .starting-grid-shop-wrapper .sprd-navigation {
                        right: calc(24px + 50px + 32px) !important; /* Abstand analog zu lg:gap-8 (32px) */
                    }
                }

                @media (min-width: 1280px) {
                    /* Ab hier greift max-w-7xl (1280px), also ist right abhängig von window width */
                     .starting-grid-shop-wrapper .sprd-navigation {
                         right: calc(max(24px, calc((100vw - 1280px) / 2 + 24px)) + 50px + 32px) !important;
                     }
                }

                /* 3. WARENKORB / BURGER MENU (Rechts fixiert im Top-Menü) */
                .starting-grid-shop-wrapper .sprd-header {
                    position: fixed !important;
                    top: 0 !important;
                    right: 16px !important; /* Standard Tailwind px-4 padding */
                    height: 64px !important; /* Standard Header Höhe (h-16) */
                    width: auto !important;
                    z-index: 9999 !important; /* Über dem Header */
                    background: transparent !important;
                    border: none !important;
                    box-shadow: none !important;
                    padding: 0 !important;
                    margin: 0 !important;
                    display: flex !important;
                    justify-content: flex-end !important;
                    align-items: center !important;
                    flex-direction: row-reverse !important; /* Umkehrung für Mobile: Burger rechts, Warenkorb links */
                }

                @media (min-width: 640px) {
                    .starting-grid-shop-wrapper .sprd-header {
                        right: 24px !important; /* sm:px-6 */
                    }
                }

                @media (min-width: 768px) {
                    .starting-grid-shop-wrapper .sprd-header {
                        height: 80px !important; /* md:h-20 */
                        right: 24px !important; /* sm:px-6 */
                    }
                }

                @media (min-width: 1280px) {
                    /* Ab hier greift max-w-7xl (1280px), also ist right abhängig von window width */
                     .starting-grid-shop-wrapper .sprd-header {
                         right: max(24px, calc((100vw - 1280px) / 2 + 24px)) !important;
                     }
                }

                /* Navigation Links Styling - Angepasst an Top-Menü */
                .starting-grid-shop-wrapper .sprd-department-filter {
                    display: flex !important;
                    flex-wrap: nowrap !important; /* Verhindert Umbrüche im Top-Menü */
                    gap: 16px !important; /* Wie gap-4 im Header */
                    background: transparent !important;
                    align-items: stretch !important; /* Kinder nehmen volle Höhe der Navigation ein */
                    justify-content: center !important;
                    height: 100% !important;
                    margin: 0 !important;
                    padding: 0 !important;
                }

                @media (min-width: 1024px) {
                    .starting-grid-shop-wrapper .sprd-department-filter {
                        gap: 32px !important; /* lg:gap-8 */
                    }
                }

                /* Container für jeden Menüpunkt */
                .starting-grid-shop-wrapper .sprd-department-filter__openmenu {
                    display: flex !important;
                    align-items: center !important;
                    position: relative !important; /* Erlaubt absolute Positionierung des Dropdowns genau darunter */
                    height: 100% !important; /* Nimmt volle Header-Höhe ein */
                }

                .starting-grid-shop-wrapper .sprd-nav-link {
                    color: #9ca3af !important; /* text-gray-400 */
                    text-decoration: none !important;
                    background: transparent !important;
                    padding: 0 !important; /* Keine Padding-Box, da es Textlinks sind */
                    border-radius: 0 !important;
                    transition: all 0.2s ease !important;
                    display: flex !important;
                    align-items: center !important;
                    height: 100% !important; /* Link-Bereich (und damit Hover-Target) geht über gesamte Höhe */
                    gap: 5px !important;
                    border: none !important;

                    /* Styling wie im Header */
                    font-family: var(--font-display, "Barlow Condensed", ui-sans-serif, system-ui, sans-serif) !important;
                    font-size: 0.875rem !important; /* text-sm */
                    line-height: 1.25rem !important;
                    font-weight: 700 !important; /* font-bold */
                    text-transform: uppercase !important; /* uppercase */
                    letter-spacing: 0.1em !important; /* tracking-widest */
                }

                /* Hover & Active States (Wie im Header: weiß & Text-Shadow) */
                .starting-grid-shop-wrapper .sprd-nav-link:hover,
                .starting-grid-shop-wrapper .sprd-nav-link.sprd-nav-link--active,
                .starting-grid-shop-wrapper .customHighlight {
                    background: transparent !important; /* Kein grauer Hintergrund mehr */
                    color: #ffffff !important; /* hover:text-white */
                    text-shadow: 0 0 10px rgba(255, 255, 255, 0.5) !important; /* hover:text-shadow-glow (simuliert) */
                    box-shadow: none !important;
                    border-color: transparent !important;
                }

                /* Spreadshop Roter Balken unter dem aktiven Link verstecken */
                .starting-grid-shop-wrapper .sprd-nav-link::after,
                .starting-grid-shop-wrapper .sprd-nav-link--active::after {
                    display: none !important;
                }

                /* Pfeil-Icon bei Dropdowns anpassen */
                .starting-grid-shop-wrapper .sprd-nav-link__icon {
                    fill: #9ca3af !important;
                    width: 12px !important;
                    height: 12px !important;
                    transition: fill 0.2s ease !important;
                }
                .starting-grid-shop-wrapper .sprd-nav-link:hover .sprd-nav-link__icon,
                .starting-grid-shop-wrapper .sprd-nav-link--active .sprd-nav-link__icon {
                     fill: #ffffff !important;
                }

                /* Dropdown Menüs (falls geöffnet) - an Header angepasst */
                .starting-grid-shop-wrapper .sprd-department-filter__menu {
                    background: #111111 !important; /* f1dark */
                    border: 1px solid rgba(255,255,255,0.1) !important;
                    border-top: 2px solid #E10600 !important; /* f1red border oben wie im Header */
                    border-radius: 0 0 8px 8px !important;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5) !important;
                    padding: 8px 0 !important;
                    margin-top: 0 !important; /* Kein Abstand zum Menü, sonst bricht der Hover ab */
                    position: absolute !important; /* Menü wird absolut unterhalb der Navigation positioniert */
                    top: 100% !important; /* Sitzt exakt bündig am unteren Rand des .sprd-department-filter__openmenu */
                    left: 50% !important;
                    transform: translateX(-50%) !important; /* Mittig zum Navigationspunkt ausrichten */
                }
                .starting-grid-shop-wrapper .sprd-department-filter__entry {
                    color: #9ca3af !important;
                    padding: 10px 20px !important;
                    text-decoration: none !important;
                    display: block !important;

                    /* Styling */
                    font-family: var(--font-display, "Barlow Condensed", ui-sans-serif, system-ui, sans-serif) !important;
                    font-size: 0.875rem !important; /* text-sm */
                    font-weight: 700 !important; /* font-bold */
                    text-transform: uppercase !important; /* uppercase */
                    letter-spacing: 0.1em !important; /* tracking-widest */
                    transition: all 0.2s ease !important;
                }
                .starting-grid-shop-wrapper .sprd-department-filter__entry:hover {
                    background: transparent !important;
                    color: #E10600 !important; /* f1red hover */
                }

                /* Verstecke Logo und Suchleiste */
                .starting-grid-shop-wrapper .sprd-header__title,
                .starting-grid-shop-wrapper .sprd-header__image,
                .starting-grid-shop-wrapper .sprd-header__search,
                .starting-grid-shop-wrapper .sprd-header-search,
                .starting-grid-shop-wrapper .sprd-departments {
                    display: none !important;
                }

                /* Burger Menü für Mobile anzeigen (im Top-Menü verstecken, wenn Desktop) */
                @media (max-width: 767px) {
                    .starting-grid-shop-wrapper .sprd-header__burgerbutton {
                        display: flex !important;
                        align-items: center !important;
                        margin-left: 12px !important; /* Abstand zum Warenkorb (links davon, da row-reverse) */
                        margin-right: 0 !important;
                    }
                    .starting-grid-shop-wrapper .sprd-navigation {
                        display: none !important;
                    }
                }
                @media (min-width: 768px) {
                    .starting-grid-shop-wrapper .sprd-header__burgerbutton {
                        display: none !important;
                    }
                    .starting-grid-shop-wrapper .sprd-header {
                        flex-direction: row !important; /* Desktop: Wieder normale Richtung */
                    }
                }

                /* --- BURGER MENU OVERLAY (SPREADSHOP) --- */
                /* Mobile-Menü Container unter dem React Header platzieren */
                .sprd-burgermenu {
                    background: #111111 !important; /* f1dark */
                    top: 64px !important; /* Unterhalb des Mobile-Headers (h-16) */
                    height: auto !important; /* An Inhalt anpassen anstatt feste Höhe */
                    max-height: calc(100vh - 64px) !important; /* Falls doch mehr Inhalt als Platz, nicht übers Fenster hinaus wachsen */
                    overflow-y: auto !important; /* ... und scrollbar machen */
                    width: 100vw !important;
                    border-top: 1px solid rgba(255,255,255,0.1) !important;
                    z-index: 9998 !important; /* Knapp unter dem Top-Header */
                }

                @media (min-width: 768px) {
                    .sprd-burgermenu {
                        top: 80px !important; /* Unterhalb des md-Headers (h-20) */
                        max-height: calc(100vh - 80px) !important;
                    }
                }

                /* Inneren Header des Spreadshop-Burger-Menüs verstecken (da wir unseren eigenen Top-Header haben) */
                .sprd-burgermenu__header {
                    display: none !important;
                }

                .sprd-burgermenu__content {
                    padding: 16px !important; /* py-4 px-4 wie in Header.tsx */
                    background: #111111 !important;
                }

                .sprd-burgermenu__navigation {
                    display: flex !important;
                    flex-direction: column !important;
                    gap: 16px !important; /* gap-4 */
                    margin: 0 !important;
                    padding: 0 !important;
                }

                .sprd-burgermenu__item {
                    border: none !important;
                    margin: 0 !important;
                    padding: 0 !important;
                }

                /* Menü Links Styling */
                body .sprd-burgermenu .sprd-burgermenu__menu-title,
                body .sprd-burgermenu .sprd-burgermenu__item > a,
                body .sprd-burgermenu .sprd-burgermenu__item > button,
                body nav.sprd-burgermenu .sprd-burgermenu__item > *,
                body nav.sprd-burgermenu .sprd-link {
                    font-family: var(--font-display, "Barlow Condensed", ui-sans-serif, system-ui, sans-serif) !important;
                    font-size: 1.125rem !important; /* text-lg */
                    font-weight: 700 !important; /* font-bold */
                    text-transform: uppercase !important; /* uppercase */
                    letter-spacing: 0.1em !important; /* tracking-widest */
                    color: #e5e7eb !important; /* text-gray-200 / standard für menü */
                    text-decoration: none !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: flex-start !important;
                    width: 100% !important;
                    background: transparent !important;
                    border: none !important;
                    box-shadow: none !important;
                    padding: 0 !important;
                    text-align: left !important;
                    transition: color 0.2s ease !important;
                }

                body nav.sprd-burgermenu .sprd-lbc-s3,
                body .sprd-burgermenu__item.sprd-lbc-s3,
                body .sprd-burgermenu__item,
                body .sprd-burgermenu__header.sprd-lbc-s3,
                body .sprd-burgermenu__menu-title,
                body .sprd-burgermenu__footer,
                body .sprd-burgermenu__footer-item {
                    border-bottom: none !important;
                    border-top: none !important;
                    border: none !important;
                    box-shadow: none !important;
                }

                /* Hover-Farbe f1red */
                body .sprd-burgermenu .sprd-burgermenu__menu-title:hover,
                body .sprd-burgermenu .sprd-burgermenu__item > a:hover,
                body .sprd-burgermenu .sprd-burgermenu__item > button:hover,
                body nav.sprd-burgermenu .sprd-burgermenu__item > *:hover {
                    color: #E10600 !important; /* f1red */
                }

                /* Unterkategorien (Dropdowns) im Mobile Menu anpassen */
                body .sprd-burgermenu__submenu {
                    background: #151515 !important; /* Etwas heller als f1dark für Kontrast */
                    border-left: 2px solid #E10600 !important;
                    margin-top: 8px !important;
                    padding-left: 16px !important;
                    padding-bottom: 8px !important;
                    padding-top: 8px !important;
                }

                body .sprd-burgermenu__submenu .sprd-burgermenu__menu-title {
                    font-size: 1rem !important; /* etwas kleiner für sub-items */
                    color: #9ca3af !important; /* text-gray-400 */
                    margin-bottom: 12px !important;
                }
                body .sprd-burgermenu__submenu .sprd-burgermenu__menu-title:last-child {
                    margin-bottom: 0 !important;
                }

                body .sprd-burgermenu__submenu .sprd-burgermenu__menu-title:hover {
                    color: #ffffff !important;
                }

                /* Pfeil-Icon beim Aufklappen */
                body .sprd-burgermenu__menu-toggle {
                    fill: #9ca3af !important;
                    width: 14px !important;
                    height: 14px !important;
                    margin-left: 8px !important;
                }

                /* Footer-Links im Burgermenü (z.B. "Über uns") */
                body .sprd-burgermenu__footer {
                    margin-top: 32px !important;
                    padding-top: 16px !important;
                    border-top: 1px solid rgba(255,255,255,0.05) !important;
                    display: flex !important;
                    flex-direction: column !important;
                    gap: 16px !important;
                }
                body .sprd-burgermenu__footer-item > a,
                body .sprd-burgermenu__footer-item .sprd-link {
                    font-family: var(--font-display, "Barlow Condensed", ui-sans-serif, system-ui, sans-serif) !important;
                    font-size: 0.875rem !important; /* text-sm */
                    color: #9ca3af !important; /* text-gray-400 */
                    text-decoration: none !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.05em !important;
                }
                body .sprd-burgermenu__footer-item > a:hover,
                body .sprd-burgermenu__footer-item .sprd-link:hover {
                    color: #E10600 !important;
                }

                /* Burger Menü Icon Farbe (Dark Mode) */
                .starting-grid-shop-wrapper .sprd-header__burgerbutton svg {
                    fill: #ffffff !important;
                }

                /* Container für den Warenkorb im Header zwingend sichtbar machen */
                .starting-grid-shop-wrapper .sprd-header__actions {
                    display: flex !important;
                    justify-content: center !important;
                    align-items: center !important;
                    width: 40px !important;
                    height: 40px !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    flex-shrink: 0 !important;
                }

                @media (min-width: 768px) {
                    .starting-grid-shop-wrapper .sprd-header__actions {
                        width: 50px !important;
                        height: 50px !important;
                    }
                }

                /* Sichtbarkeit des Warenkorb-Buttons erzwingen */
                .starting-grid-shop-wrapper .sprd-basket-indicator {
                    display: flex !important;
                    align-items: center !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                }

                /* Footer ausblenden */
                .starting-grid-shop-wrapper #sprd-footer,
                .starting-grid-shop-wrapper .sprd-footer,
                .starting-grid-shop-wrapper .sprd-footer__wrapper,
                .starting-grid-shop-wrapper footer[class*="sprd"] {
                    display: none !important;
                }

                .starting-grid-shop-wrapper #sprd-main,
                .starting-grid-shop-wrapper .sprd-main {
                    padding-top: 0 !important;
                    margin-top: 1rem !important;
                    z-index: auto !important; /* <--- Zerstört die Spreadshop-Barriere */
                }

                /* --- WARENKORB STYLING --- */
                .starting-grid-shop-wrapper #sprd-basket svg,
                .starting-grid-shop-wrapper .sprd-basket-indicator svg {
                    fill: #ffffff !important;
                    width: 28px !important;
                    height: 28px !important;
                }
                .starting-grid-shop-wrapper #sprd-basket .sprd-basket-info,
                .starting-grid-shop-wrapper .sprd-basket-indicator .sprd-basket-info {
                    color: #ffffff !important;
                }

                /* Warenkorb-Badge (Anzahl) */
                .starting-grid-shop-wrapper .sprd-basket-indicator__count {
                    background-color: #e10600 !important; /* F1 Red */
                    color: #ffffff !important;
                }

                /* --- BREADCRUMB STYLING --- */
                .starting-grid-shop-wrapper #sprd-breadcrumb,
                .starting-grid-shop-wrapper .sprd-breadcrumb {
                    color: #9ca3af !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    display: block !important;
                    padding-bottom: 1.5rem !important;
                    padding-top: 1.5rem !important;
                }
                .starting-grid-shop-wrapper #sprd-breadcrumb a,
                .starting-grid-shop-wrapper .sprd-breadcrumb a {
                    color: #ffffff !important;
                    text-decoration: none !important;
                    font-size: 1rem !important;
                    text-transform: uppercase !important;
                    font-weight: bold !important;
                }
                .starting-grid-shop-wrapper #sprd-breadcrumb a:hover,
                .starting-grid-shop-wrapper .sprd-breadcrumb a:hover {
                    color: #e10600 !important;
                }
              `,
                }}
              />

              {/* Container für den eigentlichen Shop */}
              <div id="myShop" className="starting-grid-shop-wrapper w-full">
                <a href="https://starting-grid.myspreadshop.de">
                  starting-grid
                </a>
              </div>
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default Shop;
