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
          <div className="p-6 md:p-12 relative w-full">
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

                /* 2. NAVIGATION (Zentriert im Top-Menü auf Desktop) */
                .starting-grid-shop-wrapper .sprd-navigation {
                    position: fixed !important;
                    top: 0 !important;
                    left: 50% !important;
                    transform: translateX(-50%) !important;
                    height: 64px !important; /* Standard Header Höhe (h-16) */
                    z-index: 9999 !important;
                    background: transparent !important;
                    padding: 0 !important;
                    margin: 0 !important;
                    box-shadow: none !important;
                    border: none !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    width: auto !important;
                }

                @media (min-width: 768px) {
                    .starting-grid-shop-wrapper .sprd-navigation {
                        height: 80px !important; /* md:h-20 */
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
                    align-items: center !important;
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

                .starting-grid-shop-wrapper .sprd-nav-link {
                    color: #9ca3af !important; /* text-gray-400 */
                    text-decoration: none !important;
                    background: transparent !important;
                    padding: 0 !important; /* Keine Padding-Box, da es Textlinks sind */
                    border-radius: 0 !important;
                    transition: all 0.2s ease !important;
                    display: flex !important;
                    align-items: center !important;
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
                    margin-top: 15px !important; /* Abstand zum Menü */
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
                        margin-right: 12px !important; /* Abstand zum Warenkorb */
                    }
                    .starting-grid-shop-wrapper .sprd-navigation {
                        display: none !important;
                    }
                }
                @media (min-width: 768px) {
                    .starting-grid-shop-wrapper .sprd-header__burgerbutton {
                        display: none !important;
                    }
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
