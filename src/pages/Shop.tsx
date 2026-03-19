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
          {/* CSS-Injection um die Standard Spreadshop Header/Footer zu verstecken */}
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

            /* Entfernt leere Abstände oben */
            .starting-grid-shop-wrapper #sprd-main,
            .starting-grid-shop-wrapper .sprd-main {
                padding-top: 0 !important;
                margin-top: 0 !important;
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
