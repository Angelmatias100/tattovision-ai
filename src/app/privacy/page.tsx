import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidad — TattooVision AI",
  description:
    "Conoce cómo TattooVision AI recopila, usa y protege tu información personal y los datos de tu integración con Meta.",
};

export default function PrivacyPage() {
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
        <h1
          className="text-4xl font-bold mb-2"
          style={{ color: "#e8e0d4" }}
        >
          Política de Privacidad
        </h1>
        <p className="text-sm mb-12" style={{ color: "#9a8e82" }}>
          Última actualización: junio de 2026
        </p>

        <Section title="1. Introducción">
          <p>
            TattooVision AI (&quot;nosotros&quot;, &quot;nuestro&quot; o &quot;la plataforma&quot;)
            es un servicio de gestión de negocios orientado a estudios de tatuajes en
            Latinoamérica. Nos comprometemos a proteger la privacidad de nuestros usuarios
            y a ser transparentes sobre cómo tratamos la información personal.
          </p>
          <p className="mt-3">
            Esta Política de Privacidad explica qué datos recopilamos, por qué los
            recopilamos, cómo los usamos y cuáles son tus derechos. Al crear una cuenta
            y usar TattooVision AI aceptas los términos de este documento.
          </p>
        </Section>

        <Section title="2. Información que recopilamos">
          <p>Recopilamos los siguientes tipos de información:</p>

          <SubHeading>Datos de cuenta</SubHeading>
          <ul className="mt-2 space-y-2 list-disc list-inside" style={{ color: "#9a8e82" }}>
            <li>Nombre completo y dirección de correo electrónico.</li>
            <li>Contraseña (almacenada de forma segura y encriptada por Clerk; nosotros nunca tenemos acceso a tu contraseña en texto plano).</li>
          </ul>

          <SubHeading>Datos del negocio</SubHeading>
          <ul className="mt-2 space-y-2 list-disc list-inside" style={{ color: "#9a8e82" }}>
            <li>Nombre del estudio, ciudad, país e Instagram.</li>
            <li>Información de precios, objetivos financieros y estilos de tatuaje.</li>
          </ul>

          <SubHeading>Datos de clientes (CRM)</SubHeading>
          <ul className="mt-2 space-y-2 list-disc list-inside" style={{ color: "#9a8e82" }}>
            <li>Nombre, teléfono, email e historial de citas de los clientes que tú ingresas.</li>
            <li>Eres responsable de obtener el consentimiento de tus propios clientes para almacenar su información.</li>
          </ul>

          <SubHeading>Datos de integración con Meta</SubHeading>
          <ul className="mt-2 space-y-2 list-disc list-inside" style={{ color: "#9a8e82" }}>
            <li>
              <strong style={{ color: "#e8e0d4" }}>Tokens de acceso OAuth:</strong> cuando conectas tu cuenta de
              Meta Business a través del flujo OAuth, almacenamos el token de acceso
              de larga duración necesario para gestionar campañas en tu nombre.
            </li>
            <li>
              <strong style={{ color: "#e8e0d4" }}>IDs de cuentas publicitarias:</strong> almacenamos el ID y
              nombre de la cuenta publicitaria de Meta que seleccionas como activa.
            </li>
            <li>
              <strong style={{ color: "#e8e0d4" }}>Información del usuario de Meta:</strong> nombre de usuario de
              la cuenta de Meta Business asociada a la integración.
            </li>
          </ul>

          <SubHeading>Datos de uso</SubHeading>
          <ul className="mt-2 space-y-2 list-disc list-inside" style={{ color: "#9a8e82" }}>
            <li>Registros de actividad, eventos de sesión e interacciones con la plataforma.</li>
            <li>Uso de TV Tokens (saldo, consumo y fecha de renovación).</li>
          </ul>
        </Section>

        <Section title="3. Cómo usamos tu información">
          <p>Usamos los datos recopilados exclusivamente para:</p>
          <ul className="mt-3 space-y-2 list-disc list-inside" style={{ color: "#9a8e82" }}>
            <li>Proveer, operar y mantener las funcionalidades de la plataforma.</li>
            <li>Autenticar tu identidad y gestionar el acceso a tu cuenta de forma segura.</li>
            <li>Ejecutar campañas de publicidad en Meta cuando tú lo solicitas explícitamente.</li>
            <li>Generar contenido mediante inteligencia artificial (Anthropic Claude) en respuesta a tus solicitudes.</li>
            <li>Enviar notificaciones operacionales del sistema (recordatorios, alertas de cuenta).</li>
            <li>Mejorar la plataforma a través del análisis de patrones de uso en forma agregada y anonimizada.</li>
            <li>Cumplir obligaciones legales y responder a requerimientos de autoridades competentes.</li>
          </ul>
          <p className="mt-3">
            No vendemos, alquilamos ni compartimos tu información personal con terceros
            con fines de marketing o publicidad propia.
          </p>
        </Section>

        <Section title="4. Datos de la plataforma Meta">
          <p>
            La integración con Meta requiere que almacenemos credenciales de acceso a tu
            cuenta. A continuación detallamos cómo las manejamos:
          </p>
          <div className="mt-4 space-y-3">
            <InfoCard>
              <strong style={{ color: "#c8a97e" }}>Almacenamiento seguro:</strong> los tokens de acceso de Meta se
              guardan encriptados en nuestra base de datos en Supabase. Utilizamos
              variables de entorno de servidor para las claves de encriptación y nunca
              exponemos estos tokens al cliente.
            </InfoCard>
            <InfoCard>
              <strong style={{ color: "#c8a97e" }}>Uso limitado:</strong> los tokens de Meta solo se utilizan para
              las operaciones que tú inicias desde la plataforma: consultar cuentas
              publicitarias, crear campañas y obtener métricas. Nunca accedemos a tu
              cuenta de Meta fuera de estas operaciones.
            </InfoCard>
            <InfoCard>
              <strong style={{ color: "#c8a97e" }}>Desconexión:</strong> puedes desconectar tu cuenta de Meta en
              cualquier momento desde <strong style={{ color: "#e8e0d4" }}>Configuración → Integraciones → Desconectar</strong>.
              Al desconectar, eliminamos el token de acceso y los datos de cuentas
              publicitarias de nuestra base de datos de forma inmediata.
            </InfoCard>
            <InfoCard>
              <strong style={{ color: "#c8a97e" }}>Eliminación de datos:</strong> si eliminas tu cuenta de
              TattooVision AI, todos los datos de integración con Meta (tokens, IDs
              de cuentas) se eliminan permanentemente en un plazo máximo de 30 días.
            </InfoCard>
          </div>
          <p className="mt-4" style={{ color: "#9a8e82" }}>
            TattooVision AI no está afiliado con Meta Platforms, Inc. Nuestra integración
            utiliza la API oficial de Meta y cumple con sus{" "}
            <a
              href="https://developers.facebook.com/policy/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#c8a97e" }}
            >
              Políticas para desarrolladores
            </a>
            .
          </p>
        </Section>

        <Section title="5. Almacenamiento y seguridad de datos">
          <p>
            Todos los datos de TattooVision AI se almacenan en servidores seguros
            ubicados en la nube. Implementamos las siguientes medidas de seguridad:
          </p>
          <ul className="mt-3 space-y-2 list-disc list-inside" style={{ color: "#9a8e82" }}>
            <li>Transmisión de datos cifrada mediante TLS/HTTPS en todas las comunicaciones.</li>
            <li>Tokens de acceso de Meta almacenados con encriptación en reposo.</li>
            <li>Autenticación de dos factores disponible para todas las cuentas (gestionada por Clerk).</li>
            <li>Acceso a la base de datos restringido mediante Row Level Security (RLS) en Supabase.</li>
            <li>Revisiones periódicas de seguridad y acceso con privilegios mínimos.</li>
          </ul>
          <p className="mt-3">
            A pesar de estas medidas, ningún sistema es completamente invulnerable. Te
            recomendamos usar contraseñas seguras y únicas, y notificarnos inmediatamente
            ante cualquier actividad sospechosa en tu cuenta.
          </p>
          <p className="mt-3">
            Conservamos tus datos mientras tengas una cuenta activa. Al cancelar la
            cuenta, tus datos son eliminados en un plazo de 30 días, a excepción de la
            información que estemos legalmente obligados a conservar.
          </p>
        </Section>

        <Section title="6. Compartición de datos">
          <p>
            Compartimos datos únicamente con los siguientes proveedores de servicios
            que son esenciales para el funcionamiento de la plataforma:
          </p>
          <div className="mt-4 space-y-3">
            <ThirdParty
              name="Meta Platforms, Inc."
              purpose="Recibe datos cuando gestionas campañas publicitarias: creativos, presupuestos y configuraciones de campaña. Solo se envían datos cuando tú inicias una operación."
              url="https://www.facebook.com/privacy/policy"
            />
            <ThirdParty
              name="Anthropic (Claude AI)"
              purpose="Procesa tus solicitudes de generación de contenido. Los prompts enviados pueden incluir información de contexto de tu negocio. Anthropic no retiene datos de entrada para entrenar modelos sin consentimiento explícito."
              url="https://www.anthropic.com/privacy"
            />
            <ThirdParty
              name="Vercel"
              purpose="Hosting y distribución de la aplicación. Procesa peticiones HTTP y puede registrar metadatos de acceso (IP, user-agent) por razones de seguridad."
              url="https://vercel.com/legal/privacy-policy"
            />
            <ThirdParty
              name="Supabase"
              purpose="Base de datos principal. Almacena todos los datos de la plataforma incluyendo leads, citas, configuración del negocio y tokens de integración cifrados."
              url="https://supabase.com/privacy"
            />
            <ThirdParty
              name="Clerk"
              purpose="Autenticación y gestión de sesiones. Almacena credenciales de usuario, historial de inicio de sesión y datos de autenticación multifactor."
              url="https://clerk.com/privacy"
            />
          </div>
          <p className="mt-4" style={{ color: "#9a8e82" }}>
            No transferimos datos a ningún otro tercero, salvo que sea requerido por
            ley o por orden de autoridad competente.
          </p>
        </Section>

        <Section title="7. Tus derechos">
          <p>
            Dependiendo de tu jurisdicción, puedes tener los siguientes derechos sobre
            tus datos personales:
          </p>
          <ul className="mt-3 space-y-3 list-disc list-inside" style={{ color: "#9a8e82" }}>
            <li>
              <strong style={{ color: "#e8e0d4" }}>Acceso:</strong> solicitar una copia
              de los datos personales que tenemos sobre ti.
            </li>
            <li>
              <strong style={{ color: "#e8e0d4" }}>Rectificación:</strong> corregir
              información inexacta o incompleta en tu perfil.
            </li>
            <li>
              <strong style={{ color: "#e8e0d4" }}>Eliminación:</strong> solicitar la
              eliminación de tu cuenta y todos los datos asociados.
            </li>
            <li>
              <strong style={{ color: "#e8e0d4" }}>Portabilidad:</strong> recibir tus
              datos en un formato estructurado y legible por máquina (JSON/CSV).
            </li>
            <li>
              <strong style={{ color: "#e8e0d4" }}>Oposición:</strong> oponerte al
              tratamiento de tus datos en determinadas circunstancias.
            </li>
            <li>
              <strong style={{ color: "#e8e0d4" }}>Desconexión de Meta:</strong> revocar
              en cualquier momento el acceso de TattooVision AI a tu cuenta de Meta
              desde Configuración → Integraciones.
            </li>
          </ul>
          <p className="mt-4">
            Para ejercer cualquiera de estos derechos, escríbenos a{" "}
            <a
              href="mailto:privacy@tattovision.com"
              style={{ color: "#c8a97e" }}
            >
              privacy@tattovision.com
            </a>
            . Responderemos en un plazo máximo de 30 días hábiles.
          </p>
        </Section>

        <Section title="8. Cookies y tecnologías de rastreo">
          <p>
            TattooVision AI utiliza cookies y almacenamiento local del navegador para:
          </p>
          <ul className="mt-3 space-y-2 list-disc list-inside" style={{ color: "#9a8e82" }}>
            <li>
              <strong style={{ color: "#e8e0d4" }}>Cookies de sesión (Clerk):</strong> necesarias
              para mantener tu sesión autenticada. Sin estas cookies, no puedes iniciar
              sesión. No pueden desactivarse si deseas usar la plataforma.
            </li>
            <li>
              <strong style={{ color: "#e8e0d4" }}>Cookies de preferencias:</strong> recuerdan
              configuraciones de la interfaz (tab activa, preferencias de vista).
            </li>
          </ul>
          <p className="mt-3">
            No utilizamos cookies de seguimiento de terceros ni publicidad comportamental.
            Puedes gestionar o eliminar cookies desde la configuración de tu navegador,
            aunque esto puede afectar el funcionamiento de la plataforma.
          </p>
        </Section>

        <Section title="9. Privacidad de menores">
          <p>
            TattooVision AI está diseñado exclusivamente para uso de profesionales y
            negocios. No recopilamos intencionalmente información de personas menores de
            18 años. Si tienes conocimiento de que un menor ha proporcionado información
            personal en nuestra plataforma, contáctanos inmediatamente a{" "}
            <a
              href="mailto:privacy@tattovision.com"
              style={{ color: "#c8a97e" }}
            >
              privacy@tattovision.com
            </a>{" "}
            y procederemos a eliminar esa información.
          </p>
        </Section>

        <Section title="10. Cambios a esta política">
          <p>
            Podemos actualizar esta Política de Privacidad periódicamente para reflejar
            cambios en el servicio, la legislación aplicable o nuestras prácticas de
            manejo de datos. Cuando realicemos cambios significativos:
          </p>
          <ul className="mt-3 space-y-2 list-disc list-inside" style={{ color: "#9a8e82" }}>
            <li>Actualizaremos la fecha de &quot;última actualización&quot; al inicio de este documento.</li>
            <li>Te notificaremos por correo electrónico si los cambios son materiales.</li>
            <li>Mostraremos un aviso destacado dentro de la plataforma.</li>
          </ul>
          <p className="mt-3">
            El uso continuado del servicio después de la publicación de cambios
            constituye aceptación de la política actualizada.
          </p>
        </Section>

        <Section title="11. Contacto">
          <p>
            Si tienes preguntas, comentarios o solicitudes relacionadas con esta
            Política de Privacidad o el tratamiento de tus datos personales, puedes
            contactarnos en:
          </p>
          <div
            className="mt-4 p-5 rounded-xl"
            style={{ background: "#111111", border: "1px solid #2a2a2a" }}
          >
            <p className="font-semibold" style={{ color: "#e8e0d4" }}>TattooVision AI</p>
            <p className="mt-2 text-sm" style={{ color: "#9a8e82" }}>
              Privacidad y protección de datos:{" "}
              <a
                href="mailto:privacy@tattovision.com"
                style={{ color: "#c8a97e" }}
              >
                privacy@tattovision.com
              </a>
            </p>
            <p className="mt-1 text-sm" style={{ color: "#9a8e82" }}>
              Soporte general:{" "}
              <a
                href="mailto:support@tattovision.com"
                style={{ color: "#c8a97e" }}
              >
                support@tattovision.com
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
            <Link href="/privacy" style={{ color: "#c8a97e" }}>
              Privacidad
            </Link>
            <Link
              href="/terms"
              className="transition-colors"
              style={{ color: "#9a8e82" }}
            >
              Términos de Servicio
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

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-4 mb-1 text-sm font-semibold" style={{ color: "#e8e0d4" }}>
      {children}
    </p>
  );
}

function InfoCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="p-4 rounded-lg text-sm leading-relaxed"
      style={{ background: "#111111", border: "1px solid #2a2a2a", color: "#9a8e82" }}
    >
      {children}
    </div>
  );
}

function ThirdParty({ name, purpose, url }: { name: string; purpose: string; url: string }) {
  return (
    <div
      className="p-4 rounded-lg"
      style={{ background: "#111111", border: "1px solid #2a2a2a" }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-medium text-sm" style={{ color: "#e8e0d4" }}>{name}</p>
          <p className="text-sm mt-1 leading-relaxed" style={{ color: "#9a8e82" }}>{purpose}</p>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs whitespace-nowrap shrink-0 transition-colors"
          style={{ color: "#c8a97e" }}
        >
          Política →
        </a>
      </div>
    </div>
  );
}
