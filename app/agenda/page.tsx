import AgendaFiltrable from "@/components/AgendaFiltrable";

export const metadata = {
  title: "Agenda completa",
  description:
    "Las 188 actividades del UPEC Libro Fest 2026, filtrables por día, tipo y lugar, con buscador por título, autor y ponente.",
};

export default function Agenda() {
  return <AgendaFiltrable />;
}
