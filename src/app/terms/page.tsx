import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Términos de Servicio — TattooVision AI",
  description:
    "Lee los Términos de Servicio de TattooVision AI antes de usar la plataforma.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen" style={{ background: "#0a0a0a", color: "#e8e0d4" }}>

      {/* Header */}
      <header style={{ borderBottom: "1px solid #1e1e1e", background: "#0d0d0d" }}>
        <div className="max-w-3xl mx-auto px-5 py-5 flex items-center justify-between">
          <Link
            href="/"
            className="font-bold text-lg tracking-tight"
            style={{ color: "#c8a97e" }}
          >
            TattooVision AI
          </Link>
          <Link
            href="/"
            className="text-sm transition-colors"
            style={{ color: "#9a8e82" }}
          >
            ← Volver al inicio
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-5 py-16">
        <h1 className="text-4xl font-bold mb-2" style={{ color: "#e8e0d4" }}>
          Términos de Servicio
        </h1>
        <p className="text-sm mb-12" style={{ color: "#9a8e82" }}>
          Última actualización: junio de 2026
        </p>

        <Section title="1. Aceptación de los términos">
          <p>
            Al acceder o usar TattooVision AI — ya sea creando una cuenta, completando el
            proceso de onboarding o utilizando cualquier funcionalidad de la plataforma —
            aceptas quedar vinculado por estos Términos de Servicio (&quot;Términos&quot;) y
            nuestra{" "}
            <Link href="/privacy" style={{ color: "#c8a97e" }}>
              Política de Privacidad
            </Link>
            .
          </p>
          <p className="mt-3">
            Si no estás de acuerdo con alguno de estos términos, no debes usar la
            plataforma. Si usas TattooVision AI en nombre de un negocio, declaras tener
            autoridad para aceptar estos términos en nombre de dicha entidad.
          </p>
        </Section>

        <Section title="2. Descripción del servicio">
          <p>
            TattooVision AI es una plataforma SaaS (Software as a Service) diseñada
            para profesionales y estudios de tatuajes en Latinoamérica. La plataforma
            incluye:
          </p>
          <ul className="mt-3 space-y-2 list-disc list-inside" style={{ color: "#9a8e82" }}>
            <li>
              <strong style={{ color: "#e8e0d4" }}>CRM de clientes:</strong> gestión de
              leads, seguimiento del pipeline de ventas e historial de interacciones.
            </li>
            <li>
              <strong style={{ color: "#e8e0d4" }}>Agenda inteligente:</strong> calendario
              de citas con link de reserva público para que tus clientes agenden directamente.
            </li>
            <li>
              <strong style={{ color: "#e8e0d4" }}>Generación de contenido IA:</strong> creación
              de copies, captions y estrategias de contenido para redes sociales mediante
              inteligencia artificial (Anthropic Claude).
            </li>
            <li>
              <strong style={{ color: "#e8e0d4" }}>Campañas Meta Ads:</strong> integración
              con Meta Business para crear y gestionar campañas publicitarias en Facebook e
              Instagram desde la plataforma.
            </li>
            <li>
              <strong style={{ color: "#e8e0d4" }}>Automatizaciones:</strong> flujos
              automatizados de seguimiento y comunicación con clientes.
            </li>
            <li>
              <strong style={{ color: "#e8e0d4" }}>TV Tokens:</strong> sistema de créditos
              para el uso de funcionalidades basadas en IA, asignados mensualmente según
              el plan contratado.
            </li>
          </ul>
          <p className="mt-3">
            TattooVision AI se reserva el derecho de modificar, suspender o descontinuar
            cualquier funcionalidad del servicio con previo aviso razonable.
          </p>
        </Section>

        <Section title="3. Cuentas de usuario">
          <p>
            Para usar TattooVision AI debes registrarte proporcionando información
            veraz, precisa y completa. Eres responsable de:
          </p>
          <ul className="mt-3 space-y-2 list-disc list-inside" style={{ color: "#9a8e82" }}>
            <li>Mantener la confidencialidad de tus credenciales de acceso.</li>
            <li>Todas las actividades que ocurran bajo tu cuenta, autorizadas o no.</li>
            <li>
              Notificarnos de inmediato a{" "}
              <a href="mailto:support@tattovision-ai.com" style={{ color: "#c8a97e" }}>
                support@tattovision-ai.com
              </a>{" "}
              ante cualquier uso no autorizado de tu cuenta.
            </li>
            <li>
              Mantener actualizada la información de tu cuenta, especialmente el correo
              electrónico de contacto.
            </li>
          </ul>
          <p className="mt-3">
            No puedes crear cuentas de forma automática, masiva o mediante bots. Cada
            cuenta representa a un único negocio o profesional. Nos reservamos el derecho
            de suspender o cancelar cuentas que incumplan estos términos o que detectemos
            como fraudulentas.
          </p>
        </Section>

        <Section title="4. Integración con la plataforma Meta">
          <p>
            TattooVision AI permite conectar tu cuenta de Meta Business para crear y
            gestionar campañas publicitarias. Al activar esta integración, aceptas las
            siguientes condiciones:
          </p>

          <div className="mt-4 space-y-3">
            <InfoCard accent>
              <strong style={{ color: "#c8a97e" }}>Campañas en estado PAUSADO por defecto:</strong>{" "}
              todas las campañas creadas desde TattooVision AI se crean en estado{" "}
              <strong style={{ color: "#e8e0d4" }}>PAUSED</strong> (pausado) de forma automática.
              Debes activarlas manualmente desde el Administrador de Anuncios de Meta o desde
              la plataforma. Esto te da control total antes de incurrir en cualquier gasto.
            </InfoCard>
          </div>

          <ul className="mt-4 space-y-2 list-disc list-inside" style={{ color: "#9a8e82" }}>
            <li>
              <strong style={{ color: "#e8e0d4" }}>Responsabilidad del gasto publicitario:</strong>{" "}
              eres el único y exclusivo responsable de todo el gasto publicitario incurrido
              en tu cuenta de Meta. TattooVision AI no factura, controla ni limita el presupuesto
              de tus campañas. Cualquier cargo de Meta se aplica directamente a tu método
              de pago registrado en Meta.
            </li>
            <li>
              <strong style={{ color: "#e8e0d4" }}>Cumplimiento de políticas de Meta:</strong>{" "}
              eres responsable de que todo el contenido de tus campañas cumpla con las{" "}
              <a
                href="https://www.facebook.com/policies/ads"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#c8a97e" }}
              >
                Políticas de Publicidad de Meta
              </a>
              . TattooVision AI no revisa ni aprueba el contenido de las campañas antes
              de su envío a Meta.
            </li>
            <li>
              <strong style={{ color: "#e8e0d4" }}>Sin responsabilidad por rechazos:</strong>{" "}
              TattooVision AI no se hace responsable de rechazos, restricciones, suspensiones
              o penalizaciones impuestas por Meta sobre tu cuenta publicitaria o de Business
              Manager.
            </li>
            <li>
              <strong style={{ color: "#e8e0d4" }}>Autorización de acceso:</strong>{" "}
              al conectar tu cuenta, autorizas a TattooVision AI a actuar como gestor
              de tu cuenta publicitaria dentro del alcance de los permisos OAuth que
              otorgas. Puedes revocar este acceso en cualquier momento desde
              Configuración → Integraciones o desde Meta Business Settings.
            </li>
          </ul>
          <p className="mt-4 text-sm" style={{ color: "#6a6460" }}>
            TattooVision AI no está afiliado con Meta Platforms, Inc. Los nombres
            Facebook e Instagram son marcas registradas de Meta Platforms, Inc.
          </p>
        </Section>

        <Section title="5. Uso aceptable">
          <p>
            Al usar TattooVision AI te comprometes expresamente a no realizar ninguna
            de las siguientes acciones:
          </p>
          <ul className="mt-3 space-y-2 list-disc list-inside" style={{ color: "#9a8e82" }}>
            <li>Usar la plataforma para actividades ilegales, fraudulentas o dañinas.</li>
            <li>
              Cargar, publicar o distribuir contenido que infrinja derechos de autor,
              marcas registradas u otros derechos de propiedad intelectual de terceros.
            </li>
            <li>
              Intentar acceder de forma no autorizada a sistemas, datos o cuentas de
              otros usuarios de la plataforma.
            </li>
            <li>
              Usar herramientas automatizadas, scrapers o bots para extraer datos o
              sobrecargar la infraestructura del servicio.
            </li>
            <li>
              Compartir, revender o sublicenciar el acceso a la plataforma a terceros
              no autorizados.
            </li>
            <li>
              Usar la generación de IA para crear contenido engañoso, discriminatorio,
              que incite al odio o que viole las políticas de uso de Anthropic Claude
              o de Meta.
            </li>
            <li>
              Almacenar en el CRM datos de personas sin su consentimiento o en
              violación de leyes de protección de datos aplicables.
            </li>
          </ul>
          <p className="mt-3">
            El incumplimiento de estas restricciones puede resultar en la suspensión
            inmediata de tu cuenta sin derecho a reembolso.
          </p>
        </Section>

        <Section title="6. Suscripción y pago">
          <p>TattooVision AI ofrece los siguientes planes de suscripción mensual:</p>
          <div className="mt-4 space-y-3">
            <PlanRow name="Gratuito" price="$0 / mes" desc="50 TV Tokens de prueba. CRM básico, agenda y acceso limitado a funciones de IA." />
            <PlanRow name="Starter" price="$79 USD / mes" desc="200 TV Tokens mensuales, CRM hasta 200 leads, agenda con reservas, 1 artista, campañas Meta y contenido IA con tokens." />
            <PlanRow name="Pro" price="$179 USD / mes" desc="600 TV Tokens mensuales, CRM ilimitado, agenda multi-artista (hasta 5), campañas y contenido IA completo, reportes y analytics." />
            <PlanRow name="Agency" price="$349 USD / mes" desc="2.000 TV Tokens mensuales acumulables, artistas ilimitados, editor de video para reels, reportes avanzados y soporte dedicado." />
          </div>
          <ul className="mt-4 space-y-2 list-disc list-inside" style={{ color: "#9a8e82" }}>
            <li>Las suscripciones se gestionan y activan mediante contacto directo vía WhatsApp.</li>
            <li>Los precios están expresados en dólares estadounidenses (USD) salvo indicación contraria.</li>
            <li>Los precios pueden variar según el país de facturación.</li>
            <li>
              Los TV Tokens no utilizados en un período mensual no se acumulan para el
              siguiente (excepto en el plan Agency, donde se acumulan por hasta 3 meses).
            </li>
            <li>
              Los tokens adicionales pueden adquirirse a los precios indicados en cada plan.
            </li>
            <li>No se realizan reembolsos por períodos parciales, salvo que la ley aplicable lo exija.</li>
          </ul>
        </Section>

        <Section title="7. Propiedad intelectual">
          <p>
            Todo el código fuente, diseño visual, marca, logotipos, textos y documentación
            de TattooVision AI son propiedad de sus creadores y están protegidos por las
            leyes de propiedad intelectual aplicables. Queda expresamente prohibido:
          </p>
          <ul className="mt-3 space-y-2 list-disc list-inside" style={{ color: "#9a8e82" }}>
            <li>Copiar, modificar o distribuir cualquier parte de la plataforma sin autorización escrita.</li>
            <li>Realizar ingeniería inversa del software o intentar extraer el código fuente.</li>
            <li>Usar el nombre, logotipo o marca de TattooVision AI sin autorización previa.</li>
          </ul>
          <p className="mt-3">
            El contenido generado por IA a través de la plataforma (copies, sugerencias,
            estrategias) te pertenece a ti, sujeto a las condiciones de uso de los
            modelos subyacentes (Anthropic Claude). Eres responsable del uso que hagas
            de dicho contenido.
          </p>
          <p className="mt-3">
            Los datos que ingresas en la plataforma (clientes, citas, información del
            negocio) son de tu propiedad. TattooVision AI no adquiere derechos sobre
            ellos más allá de los necesarios para operar el servicio.
          </p>
        </Section>

        <Section title="8. Exclusión de garantías">
          <p>
            TattooVision AI se proporciona &quot;tal cual&quot; y &quot;según disponibilidad&quot;,
            sin garantías de ningún tipo, expresas o implícitas, incluyendo pero no
            limitado a:
          </p>
          <ul className="mt-3 space-y-2 list-disc list-inside" style={{ color: "#9a8e82" }}>
            <li>Garantías de comerciabilidad, adecuación para un propósito particular o no infracción.</li>
            <li>Garantías de que el servicio estará disponible de forma ininterrumpida o libre de errores.</li>
            <li>Garantías sobre la exactitud, completitud o utilidad del contenido generado por IA.</li>
            <li>Garantías de resultados específicos derivados del uso de las campañas publicitarias.</li>
          </ul>
          <p className="mt-3">
            El uso de TattooVision AI y de las integraciones con Meta es bajo tu propio
            riesgo. TattooVision AI no garantiza que las campañas generadas mediante IA
            sean aprobadas por Meta o que obtengan los resultados esperados.
          </p>
        </Section>

        <Section title="9. Limitación de responsabilidad">
          <p>
            En la máxima medida permitida por la ley aplicable, TattooVision AI, sus
            directores, empleados y proveedores no serán responsables de:
          </p>
          <ul className="mt-3 space-y-2 list-disc list-inside" style={{ color: "#9a8e82" }}>
            <li>Daños indirectos, incidentales, especiales, punitivos o consecuentes de cualquier tipo.</li>
            <li>Pérdida de ingresos, clientes, datos o reputación comercial.</li>
            <li>
              Gasto publicitario incurrido en Meta como consecuencia del uso de la
              integración, incluyendo errores en la configuración de campañas.
            </li>
            <li>Interrupciones del servicio causadas por terceros (Meta, Supabase, Vercel, Clerk, Anthropic).</li>
            <li>Errores o inexactitudes en el contenido generado por IA.</li>
            <li>Acceso no autorizado a tu cuenta por causa imputable a ti.</li>
          </ul>
          <p className="mt-3">
            La responsabilidad total máxima de TattooVision AI ante ti, en cualquier
            circunstancia, no superará el monto que hayas pagado por el servicio en los
            últimos <strong style={{ color: "#e8e0d4" }}>3 meses</strong> anteriores al
            evento que originó la reclamación.
          </p>
        </Section>

        <Section title="10. Terminación">
          <p>
            Puedes cancelar tu cuenta en cualquier momento contactándonos a{" "}
            <a href="mailto:support@tattovision-ai.com" style={{ color: "#c8a97e" }}>
              support@tattovision-ai.com
            </a>
            . Al cancelar:
          </p>
          <ul className="mt-3 space-y-2 list-disc list-inside" style={{ color: "#9a8e82" }}>
            <li>Mantendrás acceso al servicio hasta el final del período de facturación vigente.</li>
            <li>No se emiten reembolsos por tiempo no utilizado.</li>
            <li>Tus datos serán eliminados en un plazo de 30 días tras la cancelación efectiva.</li>
          </ul>
          <p className="mt-3">
            TattooVision AI puede suspender o terminar tu cuenta de forma inmediata,
            con o sin previo aviso, si:
          </p>
          <ul className="mt-3 space-y-2 list-disc list-inside" style={{ color: "#9a8e82" }}>
            <li>Incumples estos Términos de Servicio.</li>
            <li>Tu uso representa un riesgo de seguridad o legal para la plataforma u otros usuarios.</li>
            <li>Tu pago es rechazado y no se regulariza en un plazo de 7 días.</li>
          </ul>
        </Section>

        <Section title="11. Cambios a estos términos">
          <p>
            Podemos modificar estos Términos de Servicio en cualquier momento. Los
            cambios entrarán en vigor 30 días después de su publicación en esta página,
            salvo que la ley aplicable exija un período mayor. Te notificaremos:
          </p>
          <ul className="mt-3 space-y-2 list-disc list-inside" style={{ color: "#9a8e82" }}>
            <li>Por correo electrónico a la dirección registrada en tu cuenta.</li>
            <li>Mediante un aviso destacado dentro de la plataforma.</li>
          </ul>
          <p className="mt-3">
            El uso continuado del servicio tras el período de notificación implica
            aceptación de los términos actualizados. Si no estás de acuerdo con los
            cambios, puedes cancelar tu cuenta antes de que entren en vigor.
          </p>
        </Section>

        <Section title="12. Ley aplicable y contacto">
          <p>
            Estos Términos de Servicio se rigen por las leyes de la República de Chile.
            Cualquier disputa será sometida a mediación en primera instancia y, de no
            resolverse, a la jurisdicción de los tribunales ordinarios de justicia de
            Santiago de Chile.
          </p>
          <p className="mt-3">
            Para consultas sobre estos Términos o cualquier aspecto legal de TattooVision AI:
          </p>
          <div
            className="mt-4 p-5 rounded-xl"
            style={{ background: "#111111", border: "1px solid #2a2a2a" }}
          >
            <p className="font-semibold" style={{ color: "#e8e0d4" }}>TattooVision AI</p>
            <p className="mt-2 text-sm" style={{ color: "#9a8e82" }}>
              Soporte:{" "}
              <a href="mailto:support@tattovision-ai.com" style={{ color: "#c8a97e" }}>
                support@tattovision-ai.com
              </a>
            </p>
            <p className="mt-1 text-sm" style={{ color: "#9a8e82" }}>
              Privacidad:{" "}
              <a href="mailto:privacy@tattovision-ai.com" style={{ color: "#c8a97e" }}>
                privacy@tattovision-ai.com
              </a>
            </p>
          </div>
        </Section>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #1e1e1e", background: "#0d0d0d", marginTop: "2rem" }}>
        <div className="max-w-3xl mx-auto px-5 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm" style={{ color: "#6a6460" }}>
            © {new Date().getFullYear()} TattooVision AI. Todos los derechos reservados.
          </p>
          <div className="flex gap-6 text-sm">
            <Link href="/privacy" className="transition-colors" style={{ color: "#9a8e82" }}>
              Política de Privacidad
            </Link>
            <Link href="/terms" style={{ color: "#c8a97e" }}>
              Términos
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2
        className="text-xl font-semibold mb-4 pb-2"
        style={{ color: "#c8a97e", borderBottom: "1px solid #1e1e1e" }}
      >
        {title}
      </h2>
      <div className="leading-relaxed text-sm" style={{ color: "#b8b0a8" }}>
        {children}
      </div>
    </section>
  );
}

function InfoCard({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <div
      className="p-4 rounded-lg text-sm leading-relaxed"
      style={{
        background: accent ? "rgba(200,169,126,0.06)" : "#111111",
        border: `1px solid ${accent ? "rgba(200,169,126,0.25)" : "#2a2a2a"}`,
        color: "#9a8e82",
      }}
    >
      {children}
    </div>
  );
}

function PlanRow({ name, price, desc }: { name: string; price: string; desc: string }) {
  return (
    <div
      className="p-4 rounded-lg flex flex-col sm:flex-row sm:items-start gap-2"
      style={{ background: "#111111", border: "1px solid #2a2a2a" }}
    >
      <div className="flex items-center gap-3 shrink-0 sm:w-48">
        <span className="font-medium text-sm" style={{ color: "#e8e0d4" }}>{name}</span>
        <span className="text-sm font-mono" style={{ color: "#c8a97e" }}>{price}</span>
      </div>
      <p className="text-sm" style={{ color: "#9a8e82" }}>{desc}</p>
    </div>
  );
}
