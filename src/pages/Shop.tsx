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
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-f1dark text-white font-sans">
      <Helmet>
        <title>Shop - {info?.seo_title || "Starting Grid"}</title>
      </Helmet>

      <GlobalBackground />
      {info && <Header info={info} />}

      <main className="relative z-10 flex-grow pt-32 pb-16 md:pb-32 px-4 sm:px-6 max-w-7xl mx-auto w-full flex flex-col">
        <article className="bg-[#151515] border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative">
          <div className="p-6 md:p-12 relative z-10 w-full">
            <div className="w-full">
              {/* CSS-Injection für Spreadshop Elemente */}
              <style
                dangerouslySetInnerHTML={{
                  __html: `
                /* Container des Headers anzeigen, um Spreadshop Layout intakt zu lassen */
                .starting-grid-shop-wrapper .sprd-header-container {
                    display: block !important;
                    position: relative !important;
                }

                /* --- PROMO BANNER KORREKTUR --- */
                /* Promo Banner - Ganz oben, volle Breite, zentriert */
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
                    margin-bottom: 1rem !important;
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

                /* Den Header-Container (mit dem Warenkorb) auf die rechte Seite schieben */
                .starting-grid-shop-wrapper #sprd-header,
                .starting-grid-shop-wrapper .sprd-header__wrapper {
                    display: flex !important;
                    justify-content: flex-end !important;
                    align-items: center !important;
                    border-bottom: none !important;
                    padding-bottom: 0 !important;
                    margin-bottom: 0 !important;
                    background: transparent !important;
                    box-shadow: none !important;
                    padding-top: 0 !important;
                    padding-left: 0 !important;
                    padding-right: 0 !important;
                    position: absolute !important;
                    top: 100% !important;
                    right: 0 !important;
                    z-index: 10 !important;
                }

                /* Verstecke Logo, Navigation, Suchleiste im Header radikal */
                .sprd-header__title,
                .sprd-header__image,
                .sprd-navigation,
                .sprd-departments,
                .sprd-header__search,
                .sprd-header-search {
                    display: none !important;
                }

                /* Container für den Warenkorb im Header zwingend sichtbar machen */
                .starting-grid-shop-wrapper .sprd-header__actions {
                    display: flex !important;
                    justify-content: flex-end !important;
                    width: auto !important;
                    margin: 0 !important;
                    padding: 0 !important;
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
