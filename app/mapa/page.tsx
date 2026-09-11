import MapaCampus from "@/components/MapaCampus";

export const metadata = {
  title: "Mapa del campus",
  description:
    "Los quince puntos del UPEC Libro Fest 2026 sobre la vista aérea del campus. Toca un punto y mira qué hay ahí ahora y después.",
};

export default function Mapa() {
  return <MapaCampus />;
}
