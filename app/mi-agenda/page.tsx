import MiAgenda from "@/components/MiAgenda";

export const metadata = {
  title: "Mi agenda",
  description:
    "Las sesiones del UPEC Libro Fest 2026 que has guardado, con aviso de cuáles se pisan entre sí y exportación al calendario.",
};

export default function Pagina() {
  return <MiAgenda />;
}
