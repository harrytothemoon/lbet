import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const useFavicon = () => {
  const location = useLocation();

  useEffect(() => {
    const favicon = document.querySelector("link[rel='icon']");
    if (!favicon) {
      const newFavicon = document.createElement("link");
      newFavicon.rel = "icon";
      document.head.appendChild(newFavicon);
    }

    const brandConfigs = {
      lawin: {
        favicon: `${process.env.PUBLIC_URL}/lawin/favicon.ico`,
        title: "LAWINPLAY SLOT MACHINE",
      },
      lodibet: {
        favicon: `${process.env.PUBLIC_URL}/lodibet/favicon.ico`,
        title: "LODIBET SLOT MACHINE",
      },
      integrate: {
        favicon: `${process.env.PUBLIC_URL}/integrate/favicon.ico`,
        title: "INTEGRATED LOTTERY SYSTEM",
      },
      naseebet: {
        favicon: `${process.env.PUBLIC_URL}/naseebet/favicon.ico`,
        title: "NASEEBET SLOT MACHINE",
      },
      progress: {
        favicon: `${process.env.PUBLIC_URL}/progress/favicon.ico`,
        title: "PROGRESS LOTTERY SYSTEM",
      },
      "betting-rank-lodibet": {
        favicon: `${process.env.PUBLIC_URL}/BettingRankLodibet/favicon.ico`,
        title: "Lodibet - Weekly Betting Rankings",
      },
      "betting-rank-hawk": {
        favicon: `${process.env.PUBLIC_URL}/BettingRankHawk/favicon.ico`,
        title: "HawkPlay - Weekly Betting Rankings",
      },
    };

    const path = location.pathname;

    if (path.includes("/betting-rank-lodibet")) {
      document.querySelector("link[rel='icon']").href =
        brandConfigs["betting-rank-lodibet"].favicon;
      document.title = brandConfigs["betting-rank-lodibet"].title;
    } else if (path.includes("/betting-rank-hawk")) {
      document.querySelector("link[rel='icon']").href =
        brandConfigs["betting-rank-hawk"].favicon;
      document.title = brandConfigs["betting-rank-hawk"].title;
    } else if (path.includes("/lawin")) {
      document.querySelector("link[rel='icon']").href =
        brandConfigs.lawin.favicon;
      document.title = brandConfigs.lawin.title;
    } else if (path.includes("/lodibet")) {
      document.querySelector("link[rel='icon']").href =
        brandConfigs.lodibet.favicon;
      document.title = brandConfigs.lodibet.title;
    } else if (path.includes("/integrate")) {
      document.querySelector("link[rel='icon']").href =
        brandConfigs.integrate.favicon;
      document.title = brandConfigs.integrate.title;
    } else if (path.includes("/naseebet")) {
      document.querySelector("link[rel='icon']").href =
        brandConfigs.naseebet.favicon;
      document.title = brandConfigs.naseebet.title;
    } else if (path.includes("/progress")) {
      document.querySelector("link[rel='icon']").href =
        brandConfigs.progress.favicon;
      document.title = brandConfigs.progress.title;
    }
  }, [location]);
};

export default useFavicon;
