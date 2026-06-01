import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidad — TattooVision AI",
  description:
    "Conoce cómo TattooVision AI recopila, usa y protege tu información personal.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-tv-bg text-foreground font-sans">
      {/* Header */}
      <header className="border-b border-border bg-tv-surface">
        <div className="max-w-3xl mx-auto px-5 py-5 flex items-center justify-between">
          <Link
            href="/"
            className="font-playfair text-xl font-bold text-foreground uppercase tracking-wide hover:text-primary transition-colors"
          >
            TattooVision AI
          </Link>
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Volver al inicio
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-5 py-16">
        <h1 className="font-playfair text-4xl font-bold text-foreground mb-2">
          Política de Privacidad
        </h1>
        <p className="text-sm text-muted-foreground mb-12">
          Última actualización: junio de 2026
        </p>

        <Section title="1. Introducción">
          <p>
            TattooVision AI (&quot;nosotros&quot;, &quot;nuestro&quot; o
            &quot;la plataforma&quot;) se compromete a proteger la privacidad de
            los usuarios. Esta Política de Privacidad describe qué datos
            recopilamos, cómo los usamos y los derechos que tienes sobre tu
            información.
          </p>
          <p className="mt-3">
            Al usar TattooVision AI aceptas los términos descritos en este
            documento.
          </p>
        </Section>

        <Section title="2. Datos que recopilamos">
          <p>Recopilamos la siguiente información cuando usas la plataforma:</p>
          <ul className="mt-3 space-y-2 list-disc list-inside text-muted-foreground">
            <li>
              <span className="text-foreground font-medium">
                Información de cuenta:
              </span>{" "}
              nombre completo, dirección de correo electrónico y contraseña
              (gestionada de forma segura por Clerk).
            </li>
            <li>
              <span className="text-foreground font-medium">
                Información de negocio:
              </span>{" "}
              nombre del estudio, dirección, teléfono de contacto y datos de
              configuración del perfil.
            </li>
            <li>
              <span className="text-foreground font-medium">
                Datos de clientes:
              </span>{" "}
              información de clientes que ingresas en el CRM (nombre, teléfono,
              email, historial de citas).
            </li>
            <li>
              <span className="text-foreground font-medium">
                Datos de uso:
              </span>{" "}
              registros de actividad, eventos de sesión y métricas de uso de la
              plataforma para mejorar el servicio.
            </li>
            <li>
              <span className="text-foreground font-medium">
                Datos de integración:
              </span>{" "}
              tokens de acceso de Meta (Facebook/Instagram) necesarios para
              gestionar campañas publicitarias.
            </li>
          </ul>
        </Section>

        <Section title="3. Cómo usamos tu información">
          <p>Usamos los datos recopilados para:</p>
          <ul className="mt-3 space-y-2 list-disc list-inside text-muted-foreground">
            <li>Proveer y mantener las funcionalidades de la plataforma.</li>
            <li>
              Gestionar autenticación segura y control de acceso a tu cuenta.
            </li>
            <li>
              Ejecutar campañas de publicidad en Meta cuando lo solicitas.
            </li>
            <li>
              Generar contenido con inteligencia artificial a través de Anthropic
              Claude.
            </li>
            <li>
              Enviar notificaciones del sistema y comunicaciones relacionadas con
              el servicio.
            </li>
            <li>
              Mejorar la plataforma mediante análisis de patrones de uso
              agregados y anonimizados.
            </li>
          </ul>
          <p className="mt-3">
            No vendemos ni compartimos tu información personal con terceros con
            fines comerciales.
          </p>
        </Section>

        <Section title="4. Servicios de terceros">
          <p>
            TattooVision AI utiliza los siguientes servicios de terceros, cada
            uno con sus propias políticas de privacidad:
          </p>
          <div className="mt-4 space-y-4">
            <ThirdParty
              name="Clerk"
              purpose="Autenticación y gestión de sesiones de usuario."
              url="https://clerk.com/privacy"
            />
            <ThirdParty
              name="Supabase"
              purpose="Base de datos y almacenamiento en la nube para datos de la plataforma."
              url="https://supabase.com/privacy"
            />
            <ThirdParty
              name="Meta (Facebook / Instagram)"
              purpose="Integración para gestión de campañas publicitarias. Solo se accede con tu autorización explícita."
              url="https://www.facebook.com/privacy/policy"
            />
            <ThirdParty
              name="Anthropic (Claude AI)"
              purpose="Generación de contenido inteligente (copies, sugerencias, análisis)."
              url="https://www.anthropic.com/privacy"
            />
          </div>
        </Section>

        <Section title="5. Retención de datos">
          <p>
            Conservamos tus datos mientras mantengas una cuenta activa en
            TattooVision AI. Si cancelas tu suscripción, retenemos la información
            por un período de 30 días para facilitar la recuperación antes de
            proceder a la eliminación definitiva.
          </p>
        </Section>

        <Section title="6. Tus derechos">
          <p>Tienes derecho a:</p>
          <ul className="mt-3 space-y-2 list-disc list-inside text-muted-foreground">
            <li>
              <span className="text-foreground font-medium">Acceso:</span>{" "}
              solicitar una copia de los datos que tenemos sobre ti.
            </li>
            <li>
              <span className="text-foreground font-medium">Rectificación:</span>{" "}
              corregir datos incorrectos o incompletos.
            </li>
            <li>
              <span className="text-foreground font-medium">Eliminación:</span>{" "}
              solicitar la eliminación de tu cuenta y todos los datos asociados.
            </li>
            <li>
              <span className="text-foreground font-medium">Portabilidad:</span>{" "}
              recibir tus datos en un formato estructurado y legible por máquina.
            </li>
            <li>
              <span className="text-foreground font-medium">Oposición:</span>{" "}
              oponerte al uso de tus datos en determinadas circunstancias.
            </li>
          </ul>
          <p className="mt-3">
            Para ejercer cualquiera de estos derechos, contáctanos en{" "}
            <a
              href="mailto:support@tattoovision.ai"
              className="text-primary hover:underline"
            >
              support@tattoovision.ai
            </a>
            .
          </p>
        </Section>

        <Section title="7. Seguridad">
          <p>
            Implementamos medidas técnicas y organizativas para proteger tu
            información contra acceso no autorizado, pérdida o alteración. Sin
            embargo, ningún sistema es completamente invulnerable y no podemos
            garantizar seguridad absoluta.
          </p>
        </Section>

        <Section title="8. Cambios a esta política">
          <p>
            Podemos actualizar esta Política de Privacidad periódicamente. Te
            notificaremos sobre cambios significativos por correo electrónico o
            mediante un aviso destacado en la plataforma. El uso continuado del
            servicio después de los cambios implica aceptación de la política
            actualizada.
          </p>
        </Section>

        <Section title="9. Contacto">
          <p>
            Si tienes preguntas sobre esta Política de Privacidad o sobre el
            tratamiento de tus datos personales, puedes contactarnos en:
          </p>
          <div className="mt-4 p-4 rounded-lg bg-tv-surface border border-border">
            <p className="font-medium text-foreground">TattooVision AI</p>
            <p className="text-muted-foreground mt-1">
              Email:{" "}
              <a
                href="mailto:support@tattoovision.ai"
                className="text-primary hover:underline"
              >
                support@tattoovision.ai
              </a>
            </p>
          </div>
        </Section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-tv-surface mt-8">
        <div className="max-w-3xl mx-auto px-5 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} TattooVision AI. Todos los derechos
            reservados.
          </p>
          <div className="flex gap-6 text-sm">
            <Link
              href="/privacy"
              className="text-primary hover:underline transition-colors"
            >
              Privacidad
            </Link>
            <Link
              href="/terms"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Términos
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="font-playfair text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border">
        {title}
      </h2>
      <div className="text-muted-foreground leading-relaxed">{children}</div>
    </section>
  );
}

function ThirdParty({
  name,
  purpose,
  url,
}: {
  name: string;
  purpose: string;
  url: string;
}) {
  return (
    <div className="p-4 rounded-lg bg-tv-surface border border-border">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-medium text-foreground">{name}</p>
          <p className="text-sm text-muted-foreground mt-1">{purpose}</p>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline whitespace-nowrap shrink-0"
        >
          Política →
        </a>
      </div>
    </div>
  );
}
