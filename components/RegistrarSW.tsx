"use client";

import { useEffect } from "react";

/** Registra el service worker que hace que la aplicación abra sin conexión. */
export default function RegistrarSW() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    if (window.location.hostname === "localhost") return;

    const id = window.setTimeout(() => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Sin service worker la aplicación funciona igual, solo que necesita red.
      });
    }, 1200);

    return () => window.clearTimeout(id);
  }, []);

  return null;
}
