import { SignUp } from "@clerk/nextjs";

// Auth pages are always dynamic — they require user session context at request time
export const dynamic = "force-dynamic";

export const metadata = { title: "Crear cuenta" };

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 mb-8 text-center">
        <span className="font-playfair text-2xl font-bold text-foreground uppercase tracking-wide">
          TattooVision AI
        </span>
        <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mt-1">
          Empieza gratis hoy
        </p>
      </div>

      <div className="relative z-10">
        <SignUp
          path="/sign-up"
          routing="path"
          signInUrl="/sign-in"
          forceRedirectUrl="/onboarding"
        />
        <p className="mt-4 text-center text-xs text-muted-foreground max-w-sm mx-auto">
          Usa una contraseña segura: mínimo 8 caracteres, combinando letras, números y símbolos.
        </p>
      </div>
    </main>
  );
}
