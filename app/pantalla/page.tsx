import Pantalla from "@/components/Pantalla";

export const metadata = {
  title: "Modo pantalla",
  description: "Vista a pantalla completa con lo que está en curso y lo que viene, para televisores en la entrada del campus.",
  robots: { index: false },
};

export default function Pagina() {
  return <Pantalla />;
}
