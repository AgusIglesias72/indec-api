import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Eventos de Predicción | ArgentStats",
  description: "Participa en nuestros eventos de predicción económica y gana premios",
  openGraph: {
    title: "Eventos de Predicción | ArgentStats",
    description: "Participa en nuestros eventos de predicción económica y gana premios",
  },
};

export default function EventosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}