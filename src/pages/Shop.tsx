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
      basketId: "myBasket",
      // NEU: Zwingt den Shop, direkt mit der Übersicht "Alle Produkte" zu starten
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
            {/* Custom Shop Navigation (Zurück & Warenkorb) */}
            <div className="flex justify-end items-center mb-6 pb-4 border-b border-gray-800 min-h-[50px]">
              {/* Container für den ausgelagerten Spreadshop Warenkorb */}
              <div id="myBasket" className="starting-grid-basket"></div>
            </div>

            {/* CSS-Injection um ungewollte Spreadshop Elemente zu verstecken */}
            <style
              dangerouslySetInnerHTML={{
                __html: `
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

            /* Breadcrumbs Styling für dunklen Hintergrund */
            .starting-grid-shop-wrapper #sprd-breadcrumb,
            .starting-grid-shop-wrapper .sprd-breadcrumb {
                color: #9ca3af !important;
            }

            .starting-grid-shop-wrapper #sprd-breadcrumb a,
            .starting-grid-shop-wrapper .sprd-breadcrumb a {
                color: #ffffff !important;
                text-decoration: none !important;
            }

            .starting-grid-shop-wrapper #sprd-breadcrumb a:hover,
            .starting-grid-shop-wrapper .sprd-breadcrumb a:hover {
                color: #e10600 !important;
            }

            .starting-grid-shop-wrapper #sprd-main,
            .starting-grid-shop-wrapper .sprd-main {
                padding-top: 0 !important;
                margin-top: 0 !important;
            }

            /* Helles Icon für den Warenkorb auf dunklem Grund */
            .starting-grid-basket svg {
                fill: #ffffff !important;
                width: 28px !important;
                height: 28px !important;
            }
            .starting-grid-basket .sprd-basket-info {
                color: #ffffff !important;
            }
          `,
              }}
            />

            {/* Container für den eigentlichen Shop */}
            <div id="myShop" className="starting-grid-shop-wrapper w-full">
              <a href="https://starting-grid.myspreadshop.de">starting-grid</a>
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default Shop;
