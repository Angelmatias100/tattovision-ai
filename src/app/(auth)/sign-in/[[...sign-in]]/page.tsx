import { SignIn } from "@clerk/nextjs";

export const dynamic = "force-dynamic";

export const metadata = { title: "Iniciar sesión" };

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 mb-8 text-center">
        <span className="font-playfair text-2xl font-bold text-foreground uppercase tracking-wide">
          TattooVision AI
        </span>
        <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mt-1">
          Bienvenido de vuelta
        </p>
      </div>

      <div className="relative z-10">
        <SignIn
          path="/sign-in"
          routing="path"
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/dashboard"
        />
      </div>
    </main>
  );
}
