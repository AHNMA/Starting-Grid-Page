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

      <main className="flex-grow relative z-10 pt-20 pb-16 md:pt-32 md:pb-32 flex flex-col items-center">
        <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* CSS-Injection für Shop-Integration und Cookie Banner */}
          <style
            dangerouslySetInnerHTML={{
              __html: `
            /* =========================================
               SPREADSHOP CORE ELEMENTS AUSBLENDEN
               ========================================= */
            .starting-grid-shop-wrapper #sprd-header,
            .starting-grid-shop-wrapper .sprd-header,
            .starting-grid-shop-wrapper .sprd-header__wrapper,
            .starting-grid-shop-wrapper header[class*="sprd"] {
                display: none !important;
            }

            .starting-grid-shop-wrapper #sprd-footer,
            .starting-grid-shop-wrapper .sprd-footer,
            .starting-grid-shop-wrapper .sprd-footer__wrapper,
            .starting-grid-shop-wrapper footer[class*="sprd"] {
                display: none !important;
            }

            .starting-grid-shop-wrapper #sprd-main,
            .starting-grid-shop-wrapper .sprd-main {
                padding-top: 0 !important;
                margin-top: 0 !important;
            }

            /* =========================================
               SPREADSHOP DESIGN ANPASSUNGEN (DARK MODE)
               ========================================= */

            /* Container & Hintergrund */
            .starting-grid-shop-wrapper .sprd-main,
            .starting-grid-shop-wrapper .sprd-app-page {
                background-color: transparent !important;
                color: #ffffff !important;
            }

            /* Textfarben für Überschriften und Texte */
            .starting-grid-shop-wrapper h1,
            .starting-grid-shop-wrapper h2,
            .starting-grid-shop-wrapper h3,
            .starting-grid-shop-wrapper h4,
            .starting-grid-shop-wrapper .sprd-h1,
            .starting-grid-shop-wrapper .sprd-h2,
            .starting-grid-shop-wrapper .sprd-h3,
            .starting-grid-shop-wrapper .sprd-text {
                color: #ffffff !important;
                font-family: 'Barlow Condensed', ui-sans-serif, system-ui, sans-serif !important;
            }

            /* Produkt-Kacheln */
            .starting-grid-shop-wrapper .sprd-product-list-item,
            .starting-grid-shop-wrapper .sprd-detail-image-gallery__image {
                background-color: #1a1a1a !important;
                border: 1px solid #333 !important;
                border-radius: 8px !important;
            }

            .starting-grid-shop-wrapper .sprd-product-list-item__name,
            .starting-grid-shop-wrapper .sprd-product-list-item__price {
                color: #e5e7eb !important;
            }

            /* Buttons (F1 Red) */
            .starting-grid-shop-wrapper button,
            .starting-grid-shop-wrapper .sprd-btn,
            .starting-grid-shop-wrapper .sprd-button {
                background-color: #E10600 !important;
                color: #ffffff !important;
                border: none !important;
                border-radius: 4px !important;
                font-weight: 700 !important;
                text-transform: uppercase !important;
                font-family: 'Barlow Condensed', ui-sans-serif, system-ui, sans-serif !important;
                letter-spacing: 0.05em !important;
                transition: background-color 0.2s ease !important;
            }

            .starting-grid-shop-wrapper button:hover,
            .starting-grid-shop-wrapper .sprd-btn:hover,
            .starting-grid-shop-wrapper .sprd-button:hover {
                background-color: #ff1e15 !important;
            }

            /* Sekundäre Buttons */
            .starting-grid-shop-wrapper .sprd-btn--secondary {
                background-color: #333333 !important;
                color: #ffffff !important;
                border: 1px solid #555 !important;
            }
            .starting-grid-shop-wrapper .sprd-btn--secondary:hover {
                background-color: #444444 !important;
            }

            /* Info Boxen (Z.B. "Darauf kannst Du Dich verlassen") */
            .starting-grid-shop-wrapper .sprd-info-footer {
                background-color: transparent !important;
                color: #e5e7eb !important;
            }
            .starting-grid-shop-wrapper .sprd-info-footer__title {
                color: #ffffff !important;
            }

            /* Links */
            .starting-grid-shop-wrapper a {
                color: #E10600 !important;
            }
            .starting-grid-shop-wrapper a:hover {
                color: #ff1e15 !important;
            }

            /* SVG Icons anpassen */
            .starting-grid-shop-wrapper svg,
            .starting-grid-shop-wrapper .sprd-icon {
                fill: currentColor !important;
            }

            /* =========================================
               ONETRUST COOKIE BANNER (GLOBAL)
               ========================================= */

            #onetrust-consent-sdk #onetrust-banner-sdk {
                background-color: #1a1a1a !important;
                border-top: 4px solid #E10600 !important;
                color: #ffffff !important;
                font-family: 'Inter', ui-sans-serif, system-ui, sans-serif !important;
                box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.5) !important;
            }

            #onetrust-consent-sdk #onetrust-policy-title {
                color: #ffffff !important;
                font-family: 'Barlow Condensed', ui-sans-serif, system-ui, sans-serif !important;
                font-size: 1.75rem !important;
                font-weight: 700 !important;
                text-transform: uppercase !important;
                letter-spacing: 0.05em !important;
                margin-bottom: 1rem !important;
            }

            #onetrust-consent-sdk #onetrust-policy-text {
                color: #e5e7eb !important;
                font-size: 0.875rem !important;
                line-height: 1.5 !important;
            }

            #onetrust-consent-sdk #onetrust-policy-text a {
                color: #E10600 !important;
                text-decoration: underline !important;
                transition: color 0.2s !important;
            }

            #onetrust-consent-sdk #onetrust-policy-text a:hover {
                color: #ff1e15 !important;
            }

            #onetrust-consent-sdk #onetrust-button-group {
                display: flex !important;
                gap: 1rem !important;
                margin-top: 1rem !important;
                justify-content: flex-end !important;
            }

            #onetrust-consent-sdk #onetrust-button-group button {
                border-radius: 4px !important;
                font-family: 'Barlow Condensed', ui-sans-serif, system-ui, sans-serif !important;
                font-weight: 700 !important;
                text-transform: uppercase !important;
                padding: 0.75rem 1.5rem !important;
                transition: all 0.2s ease-in-out !important;
                letter-spacing: 0.05em !important;
                font-size: 1rem !important;
                cursor: pointer !important;
            }

            #onetrust-consent-sdk #onetrust-accept-btn-handler {
                background-color: #E10600 !important;
                border: 1px solid #E10600 !important;
                color: #ffffff !important;
            }

            #onetrust-consent-sdk #onetrust-accept-btn-handler:hover {
                background-color: #ff1e15 !important;
                border-color: #ff1e15 !important;
            }

            #onetrust-consent-sdk #onetrust-pc-btn-handler {
                background-color: transparent !important;
                border: 1px solid #555 !important;
                color: #ffffff !important;
            }

            #onetrust-consent-sdk #onetrust-pc-btn-handler:hover {
                background-color: #333333 !important;
                border-color: #777 !important;
            }

            /* Zentrierte Buttons Wrapper anpassen falls OneTrust es in Spalten layoutet */
            #onetrust-consent-sdk .ot-sdk-three.ot-sdk-columns {
                display: flex !important;
                align-items: center !important;
            }

            #onetrust-consent-sdk .ot-sdk-row {
                display: flex !important;
                flex-wrap: wrap !important;
                align-items: center !important;
            }
          `,
            }}
          />

          {/* Container für den Shop */}
          <div id="myShop" className="starting-grid-shop-wrapper w-full">
            <a href="https://starting-grid.myspreadshop.de">starting-grid</a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Shop;
