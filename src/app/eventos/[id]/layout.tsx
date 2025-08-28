import { Metadata } from "next";
import { supabase } from "@/lib/supabaseClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    // Fetch event data for dynamic metadata
    const { data: event } = await supabase
      .from('events')
      .select('name, description, event_date, prize_amount, prize_currency, status')
      .eq('id', id)
      .single();

    if (!event) {
      return {
        title: "Evento no encontrado - ArgenStats",
        description: "El evento de predicción que buscas no existe o ha sido eliminado.",
      };
    }

    const eventDate = new Date(event.event_date);
    const eventDateFormatted = eventDate.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const title = `${event.name} | Gana ${event.prize_currency} ${event.prize_amount} - ArgenStats`;
    const description = `${event.description} Participa hasta el ${eventDateFormatted}. Competencia gratuita con resultados 100% transparentes basados en datos oficiales del INDEC.`;

    return {
      title,
      description,
      keywords: [
        "predicción IPC",
        "inflación Argentina",
        "INDEC",
        event.name,
        `${event.prize_currency} ${event.prize_amount}`,
        "concurso económico",
        "predicción económica",
        "datos oficiales",
        "ArgenStats",
        "competencia transparente"
      ],
      openGraph: {
        title,
        description,
        type: "website",
        locale: "es_AR",
        url: `https://argenstats.com/eventos/${id}`,
        siteName: "ArgenStats",
        images: [
          {
            url: `https://argenstats.com/og-evento-${id}.jpg`,
            width: 1200,
            height: 630,
            alt: `${event.name} - ArgenStats`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [`https://argenstats.com/og-evento-${id}.jpg`],
      },
      robots: {
        index: event.status === 'active' || event.status === 'upcoming',
        follow: true,
        googleBot: {
          index: event.status === 'active' || event.status === 'upcoming',
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
      alternates: {
        canonical: `https://argenstats.com/eventos/${id}`,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: "Evento de Predicción - ArgenStats",
      description: "Participa en eventos de predicción económica y gana premios en ArgenStats.",
    };
  }
}

export default function EventLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}