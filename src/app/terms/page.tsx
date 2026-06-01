import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Términos de Servicio — TattooVision AI",
  description:
    "Lee los Términos de Servicio de TattooVision AI antes de usar la plataforma.",
};

export default function TermsPage() {
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
          Términos de Servicio
        </h1>
        <p className="text-sm text-muted-foreground mb-12">
          Última actualización: junio de 2026
        </p>

        <Section title="1. Descripción del servicio">
          <p>
            TattooVision AI es una plataforma de gestión de negocios para
            estudios de tatuajes que incluye: CRM de clientes, calendario
            inteligente de citas, herramientas de generación de contenido con IA
            y gestión de campañas publicitarias en Meta (Facebook e Instagram).
          </p>
          <p className="mt-3">
            Al crear una cuenta y usar el servicio, aceptas quedar vinculado por
            estos Términos de Servicio. Si no estás de acuerdo con alguno de
            estos términos, no debes utilizar la plataforma.
          </p>
        </Section>

        <Section title="2. Registro y cuenta">
          <p>
            Para usar TattooVision AI debes registrarte con información veraz y
            completa. Eres responsable de:
          </p>
          <ul className="mt-3 space-y-2 list-disc list-inside text-muted-foreground">
            <li>
              Mantener la confidencialidad de tus credenciales de acceso.
            </li>
            <li>
              Todas las actividades que ocurran bajo tu cuenta.
            </li>
            <li>
              Notificarnos de inmediato ante cualquier uso no autorizado de tu
              cuenta.
            </li>
          </ul>
          <p className="mt-3">
            Nos reservamos el derecho de suspender o cancelar cuentas que
            incumplan estos términos.
          </p>
        </Section>

        <Section title="3. Planes de suscripción y facturación">
          <p>TattooVision AI ofrece los siguientes planes de suscripción:</p>
          <div className="mt-4 space-y-3">
            <PlanRow
              name="Starter"
              price="$79 USD/mes"
              desc="Funcionalidades básicas de CRM, calendario y hasta 500 tokens de IA mensuales."
            />
            <PlanRow
              name="Pro"
              price="$179 USD/mes"
              desc="Todo Starter más integración Meta Ads, generación de contenido avanzada y hasta 2.000 tokens de IA mensuales."
            />
            <PlanRow
              name="Agency"
              price="$349 USD/mes"
              desc="Todo Pro más soporte multi-estudio, acceso prioritario y tokens de IA ilimitados."
            />
          </div>
          <p className="mt-4">
            Los precios están sujetos a cambios con previo aviso de 30 días. Las
            suscripciones se renuevan automáticamente al inicio de cada período.
            Puedes cancelar en cualquier momento desde la configuración de tu
            cuenta; el acceso permanece activo hasta el final del período
            facturado.
          </p>
          <p className="mt-3">
            No se realizan reembolsos por períodos parciales, salvo que la ley
            aplicable lo exija.
          </p>
        </Section>

        <Section title="4. Uso aceptable">
          <p>Al usar TattooVision AI te comprometes a no:</p>
          <ul className="mt-3 space-y-2 list-disc list-inside text-muted-foreground">
            <li>
              Usar la plataforma para actividades ilegales o fraudulentas.
            </li>
            <li>
              Cargar o distribuir contenido que infrinja derechos de autor,
              marcas registradas u otros derechos de propiedad intelectual.
            </li>
            <li>
              Intentar acceder de forma no autorizada a sistemas, datos o cuentas
              de otros usuarios.
            </li>
            <li>
              Usar herramientas automatizadas para sobrecargar, interferir o
              dañar la infraestructura del servicio.
            </li>
            <li>
              Recopilar o almacenar datos personales de terceros sin
              consentimiento.
            </li>
            <li>
              Usar la generación de IA para crear contenido engañoso, ofensivo o
              que viole las políticas de los servicios subyacentes.
            </li>
          </ul>
        </Section>

        <Section title="5. Integración con Meta Ads">
          <p>
            TattooVision AI permite conectar tu cuenta de Meta Business para
            gestionar campañas publicitarias. Al usar esta integración:
          </p>
          <ul className="mt-3 space-y-2 list-disc list-inside text-muted-foreground">
            <li>
              Autorizas a TattooVision AI a actuar como gestor de tu cuenta
              publicitaria según los permisos que otorgues.
            </li>
            <li>
              Eres el único responsable del gasto publicitario incurrido en Meta.
              TattooVision AI no factura ni controla el presupuesto de tus
              campañas.
            </li>
            <li>
              Las campañas creadas desde la plataforma deben cumplir las{" "}
              <a
                href="https://www.facebook.com/policies/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Políticas de Publicidad de Meta
              </a>
              .
            </li>
            <li>
              TattooVision AI no se hace responsable de rechazos, suspensiones o
              penalizaciones impuestas por Meta sobre tu cuenta.
            </li>
          </ul>
          <p className="mt-3 p-3 rounded-lg bg-tv-surface border border-border text-sm">
            <strong className="text-foreground">Aviso:</strong> TattooVision AI
            no está afiliado con Meta Platforms, Inc. El uso de los logotipos y
            nombres de Facebook e Instagram es únicamente para indicar
            compatibilidad.
          </p>
        </Section>

        <Section title="6. Propiedad intelectual">
          <p>
            Todo el contenido, código, diseño y marca de TattooVision AI es
            propiedad de sus creadores y está protegido por leyes de propiedad
            intelectual. No puedes copiar, modificar, distribuir ni crear obras
            derivadas sin autorización escrita.
          </p>
          <p className="mt-3">
            El contenido generado por IA a través de la plataforma te pertenece
            a ti, sujeto a las condiciones de uso de los modelos subyacentes
            (Anthropic Claude).
          </p>
        </Section>

        <Section title="7. Disponibilidad del servicio">
          <p>
            Nos esforzamos por mantener TattooVision AI disponible de forma
            continua, pero no garantizamos disponibilidad ininterrumpida. Podemos
            realizar mantenimientos programados con aviso previo cuando sea
            posible. No somos responsables por interrupciones causadas por
            terceros (proveedores de hosting, servicios de pago, etc.).
          </p>
        </Section>

        <Section title="8. Limitación de responsabilidad">
          <p>
            En la máxima medida permitida por la ley aplicable, TattooVision AI
            no será responsable de:
          </p>
          <ul className="mt-3 space-y-2 list-disc list-inside text-muted-foreground">
            <li>
              Daños indirectos, incidentales, especiales o consecuentes
              derivados del uso o incapacidad de uso de la plataforma.
            </li>
            <li>
              Pérdida de datos, ingresos, clientes o reputación comercial.
            </li>
            <li>
              Errores en el contenido generado por IA utilizado en campañas
              publicitarias o comunicaciones con clientes.
            </li>
            <li>
              Acciones de terceros sobre tu cuenta de Meta o cualquier otra
              plataforma integrada.
            </li>
          </ul>
          <p className="mt-3">
            La responsabilidad total de TattooVision AI ante ti, en cualquier
            circunstancia, no superará el monto que hayas pagado por el servicio
            en los últimos 3 meses.
          </p>
        </Section>

        <Section title="9. Ley aplicable y jurisdicción">
          <p>
            Estos Términos de Servicio se rigen por las leyes de la República de
            Chile. Cualquier disputa derivada de estos términos o del uso de la
            plataforma se someterá a la jurisdicción de los tribunales ordinarios
            de justicia de Chile, renunciando ambas partes a cualquier otro fuero
            o jurisdicción que pudiera corresponderles.
          </p>
        </Section>

        <Section title="10. Modificaciones">
          <p>
            Podemos modificar estos Términos de Servicio en cualquier momento.
            Los cambios entran en vigor 30 días después de su publicación, salvo
            que la ley exija un período mayor. Te notificaremos por correo
            electrónico y con un aviso en la plataforma. El uso continuado del
            servicio después del período de notificación implica aceptación de
            los nuevos términos.
          </p>
        </Section>

        <Section title="11. Contacto">
          <p>
            Para consultas sobre estos Términos de Servicio o cualquier aspecto
            legal relacionado con TattooVision AI:
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
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacidad
            </Link>
            <Link
              href="/terms"
              className="text-primary hover:underline transition-colors"
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

function PlanRow({
  name,
  price,
  desc,
}: {
  name: string;
  price: string;
  desc: string;
}) {
  return (
    <div className="p-4 rounded-lg bg-tv-surface border border-border flex flex-col sm:flex-row sm:items-center gap-2">
      <div className="flex items-center gap-3 shrink-0">
        <span className="font-medium text-foreground w-16">{name}</span>
        <span className="text-primary text-sm font-mono">{price}</span>
      </div>
      <p className="text-sm text-muted-foreground sm:ml-4">{desc}</p>
    </div>
  );
}
