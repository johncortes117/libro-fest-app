import Link from "next/link";
import Image from "next/image";
import { CIFRAS, GENERADO } from "@/lib/datos";
import { IconoInfo } from "@/components/Iconos";

export const metadata = {
  title: "Sobre esta agenda",
  description:
    "De dónde salen los datos del UPEC Libro Fest 2026, qué está confirmado por la organización y qué es deducción nuestra.",
};

/**
 * Todo lo que antes se contaba en cada fila, en cada ficha y en el pie de las 188
 * páginas, reunido en un solo sitio.
 *
 * La procedencia de los datos importa —y bastante—, pero no le importa a quien
 * está de pie en la Plaza Roja intentando llegar a una charla. Le importa a la
 * organización, a quien detecte un error y a quien herede el proyecto. Esos tres
 * llegan hasta aquí sin problema; el asistente no tiene que tropezarse con ello.
 */
export default function Datos() {
  const fecha = new Date(GENERADO).toLocaleDateString("es-EC", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="pagina">
      <header>
        <div className="datos-marcas-cabecera">
          <div className="datos-upec-pill">
            <Image
              src="/logos/upec.png"
              alt="Universidad Politécnica Estatal del Carchi"
              width={112}
              height={43}
            />
          </div>
          <span className="datos-divisor-marcas" aria-hidden="true" />
          <Image
            src="/logos/ulif.png"
            alt="UPEC Libro Fest 2026"
            width={124}
            height={48}
            className="datos-logo-ulif"
          />
        </div>
        <p className="eyebrow">Procedencia y limitaciones</p>
        <h1 className="titulo-pagina">Sobre esta agenda</h1>
        <p className="entradilla">
          Toda la programación procede de la agenda oficial de la Universidad Politécnica Estatal del
          Carchi para el festival UPEC Libro Fest 2026. Las horas corresponden a Ecuador (UTC−5).
        </p>
      </header>

      <div className="heroe-resumen">
        <div className="resumen-dato">
          <span className="v">{CIFRAS.total}</span>
          <span className="l">actividades</span>
        </div>
        <div className="resumen-dato">
          <span className="v">{CIFRAS.lugares}</span>
          <span className="l">lugares</span>
        </div>
        <div className="resumen-dato">
          <span className="v">{CIFRAS.personas}</span>
          <span className="l">ponentes y autores</span>
        </div>
        <div className="resumen-dato">
          <span className="v">{CIFRAS.porConfirmar}</span>
          <span className="l">con sala por confirmar</span>
        </div>
      </div>

      <section className="bloque">
        <div className="bloque-cabecera">
          <h2>Lo que no sabemos</h2>
        </div>

        <dl className="datos">
          <div className="dato">
            <IconoInfo />
            <div>
              <dt>«Sala 1» y «Sala 2»</dt>
              <dd>
                {CIFRAS.porConfirmar} presentaciones de libros dicen solo «Sala 1» o «Sala 2», sin
                indicar edificio. El punto 14 del mapa oficial es el único que menciona una sala de
                presentaciones de libros, así que deducimos el Centro de convenciones.
                <span className="secundario">
                  Es deducción nuestra, no dato de la organización. Va marcado como «sala por
                  confirmar» en cada ficha.
                </span>
              </dd>
            </div>
          </div>

          <div className="dato">
            <IconoInfo />
            <div>
              <dt>Hora de cierre de las actividades permanentes</dt>
              <dd>
                La agenda dice «desde las 08:30» y no dice hasta cuándo. Mostramos las 18:00 como
                estimación en las {CIFRAS.permanentes} salas, muestras y exposiciones abiertas todo
                el día.
              </dd>
            </div>
          </div>

          <div className="dato">
            <IconoInfo />
            <div>
              <dt>Títulos cortados</dt>
              <dd>
                Catorce títulos llegan truncados desde la transcripción del documento original. Se
                muestran tal cual, marcados con <span className="cortado">[…]</span>, sin
                completarlos por nuestra cuenta.
              </dd>
            </div>
          </div>

          <div className="dato">
            <IconoInfo />
            <div>
              <dt>Nombres de sala</dt>
              <dd>
                La agenda y el mapa oficial no usan los mismos nombres: donde la agenda dice
                «Auditorio Edificio central», el mapa dice «Auditorio Edificio Principal». Mostramos
                el nombre del mapa, que es el que está escrito en el edificio.
              </dd>
            </div>
          </div>
        </dl>
      </section>

      <section className="bloque">
        <div className="bloque-cabecera">
          <h2>Si encuentras un error</h2>
        </div>
        <p className="entradilla" style={{ marginTop: 0 }}>
          Un horario o un lugar equivocado se corrige en minutos. Mandar a alguien al edificio
          equivocado es el peor fallo que puede tener esto, así que avisar de verdad ayuda.
        </p>
        <p className="nota">
          <span>
            Programación regenerada el {fecha}. Si la organización publica una versión más reciente
            de la agenda, todo se vuelve a generar sobre ella.
          </span>
        </p>
      </section>

      <div className="botonera">
        <Link href="/agenda/" className="boton primario">
          Volver a la agenda
        </Link>
      </div>
    </div>
  );
}
