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

      <main className="pb-16 md:pb-32 px-4 sm:px-6 max-w-7xl mx-auto relative z-10 flex-1 w-full flex flex-col">
        <article className="bg-[#151515] border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative">
          <div className="p-6 md:p-12 relative z-10 w-full">
            <div className="w-full">
              {/* CSS-Injection für Spreadshop Elemente */}
              <style
                dangerouslySetInnerHTML={{
                  __html: `
                /* Container des Headers - CSS Grid für perfekte Ausrichtung */
                .starting-grid-shop-wrapper .sprd-header-container {
                    display: grid !important;
                    grid-template-columns: 1fr auto !important;
                    grid-template-rows: auto auto !important;
                    grid-template-areas:
                        "promo promo"
                        "nav cart" !important;
                    width: 100% !important;
                    gap: 1rem 0 !important; /* Abstand nach Promo */
                    align-items: center !important;
                }

                /* 1. PROMO BANNER (Ganz oben, über beide Spalten) */
                .starting-grid-shop-wrapper .sprd-promo-header {
                    grid-area: promo !important;
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

                /* 2. NAVIGATION (Linke Seite) */
                .starting-grid-shop-wrapper .sprd-navigation {
                    grid-area: nav !important;
                    background: transparent !important;
                    padding: 0 !important;
                    margin: 0 !important;
                    box-shadow: none !important;
                    border: none !important;
                }

                /* 3. WARENKORB (Rechte Seite im Header) */
                .starting-grid-shop-wrapper .sprd-header {
                    grid-area: cart !important;
                    position: static !important;
                    width: auto !important;
                    height: auto !important;
                    background: transparent !important;
                    border: none !important;
                    box-shadow: none !important;
                    padding: 0 !important;
                    margin: 0 !important;
                    display: flex !important;
                    justify-content: flex-end !important;
                    align-items: center !important;
                }

                /* Navigation Links Styling für Dark Mode */
                .starting-grid-shop-wrapper .sprd-department-filter {
                    display: flex !important;
                    flex-wrap: wrap !important;
                    gap: 15px !important;
                    background: transparent !important;
                    justify-content: flex-start !important;
                }
                .starting-grid-shop-wrapper .sprd-nav-link {
                    color: #9ca3af !important; /* Tailwind gray-400 */
                    text-decoration: none !important;
                    font-weight: 500 !important;
                    background: transparent !important;
                    padding: 8px 12px !important;
                    border-radius: 6px !important;
                    transition: all 0.2s ease !important;
                    display: flex !important;
                    align-items: center !important;
                    gap: 5px !important;
                    border: none !important; /* Verstecke Spreadshop Borders */
                }

                /* Spreadshop "Active" oder Hover Style überschreiben */
                .starting-grid-shop-wrapper .sprd-nav-link:hover,
                .starting-grid-shop-wrapper .sprd-nav-link.sprd-nav-link--active,
                .starting-grid-shop-wrapper .customHighlight {
                    background: #1f2937 !important; /* Tailwind gray-800 */
                    color: #ffffff !important;
                    box-shadow: none !important;
                    border-color: transparent !important;
                }

                /* Spreadshop Roter Balken unter dem aktiven Link (pseudo-element) verstecken */
                .starting-grid-shop-wrapper .sprd-nav-link::after,
                .starting-grid-shop-wrapper .sprd-nav-link--active::after {
                    display: none !important;
                }

                .starting-grid-shop-wrapper .sprd-nav-link__icon {
                    fill: #9ca3af !important;
                    width: 10px !important;
                    height: 10px !important;
                }
                .starting-grid-shop-wrapper .sprd-nav-link:hover .sprd-nav-link__icon,
                .starting-grid-shop-wrapper .sprd-nav-link--active .sprd-nav-link__icon {
                     fill: #ffffff !important;
                }

                /* Dropdown Menüs (falls geöffnet) */
                .starting-grid-shop-wrapper .sprd-department-filter__menu {
                    background: #1f2937 !important; /* Tailwind gray-800 */
                    border: 1px solid rgba(255,255,255,0.1) !important;
                    border-radius: 8px !important;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5) !important;
                    padding: 8px 0 !important;
                    margin-top: 5px !important;
                }
                .starting-grid-shop-wrapper .sprd-department-filter__entry {
                    color: #d1d5db !important;
                    padding: 8px 16px !important;
                    font-size: 0.9rem !important;
                    text-decoration: none !important;
                    display: block !important;
                }
                .starting-grid-shop-wrapper .sprd-department-filter__entry:hover {
                    background: rgba(255,255,255,0.05) !important;
                    color: #ffffff !important;
                }

                /* Verstecke Logo und Suchleiste */
                .starting-grid-shop-wrapper .sprd-header__title,
                .starting-grid-shop-wrapper .sprd-header__image,
                .starting-grid-shop-wrapper .sprd-header__search,
                .starting-grid-shop-wrapper .sprd-header-search,
                .starting-grid-shop-wrapper .sprd-departments {
                    display: none !important;
                }

                /* Burger Menü für Mobile anzeigen */
                @media (max-width: 767px) {
                    .starting-grid-shop-wrapper .sprd-header__burgerbutton {
                        display: flex !important;
                        align-items: center !important;
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
                    justify-content: flex-end !important;
                    width: auto !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    flex-shrink: 0 !important;
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
