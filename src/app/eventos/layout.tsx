import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Eventos de Predicción IPC | Gana USD 100 - ArgenStats",
  description: "Participa en eventos de predicción del IPC argentino y gana hasta USD 100. Predice la inflación de agosto 2025 con datos oficiales del INDEC. Competencia gratuita y transparente.",
  keywords: [
    "predicción IPC",
    "inflación Argentina",
    "INDEC",
    "concurso económico",
    "premios USD",
    "predicción económica",
    "IPC agosto 2025",
    "competencia transparente",
    "datos oficiales",
    "ArgenStats"
  ],
  openGraph: {
    title: "Eventos de Predicción IPC | Gana USD 100 - ArgenStats",
    description: "Participa en eventos de predicción del IPC argentino y gana hasta USD 100. Predice la inflación de agosto 2025 con datos oficiales del INDEC.",
    type: "website",
    locale: "es_AR",
    url: "https://argenstats.com/eventos",
    siteName: "ArgenStats",
    images: [
      {
        url: "https://argenstats.com/og-eventos.jpg",
        width: 1200,
        height: 630,
        alt: "Eventos de Predicción IPC - ArgenStats",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Eventos de Predicción IPC | Gana USD 100 - ArgenStats",
    description: "Participa en eventos de predicción del IPC argentino y gana hasta USD 100. Predice la inflación de agosto 2025.",
    images: ["https://argenstats.com/og-eventos.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://argenstats.com/eventos",
  },
};

export default function EventosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}