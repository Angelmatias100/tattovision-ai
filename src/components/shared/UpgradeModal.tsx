"use client";

import { X, Zap } from "lucide-react";
import Link from "next/link";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
}

export default function UpgradeModal({ open, onClose }: UpgradeModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-primary/30 p-8 flex flex-col items-center text-center"
        style={{ background: "rgba(26,0,37,0.97)", boxShadow: "0 0 60px rgba(139,0,255,0.2)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mb-5"
          style={{ background: "rgba(139,0,255,0.15)", border: "1px solid rgba(139,0,255,0.35)" }}
        >
          <Zap className="w-7 h-7 text-primary" />
        </div>

        <h2 className="font-playfair text-2xl font-bold text-foreground mb-3">
          Función de pago ⚡
        </h2>

        <p className="text-muted-foreground text-sm leading-relaxed mb-8">
          Esta función requiere un plan de pago. Actualiza para acceder a campañas con IA,
          generador de contenido y automatizaciones.
        </p>

        <div className="flex flex-col w-full gap-3">
          <Link
            href="/configuracion#plan"
            className="w-full py-3 rounded-xl font-bold text-sm text-center transition-all"
            style={{
              background: "linear-gradient(135deg, #8B00FF 0%, #6200B3 100%)",
              boxShadow: "0 0 20px rgba(139,0,255,0.4)",
              color: "#fff",
            }}
            onClick={onClose}
          >
            Ver planes
          </Link>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl font-bold text-sm text-muted-foreground border border-border hover:border-primary/30 hover:text-foreground transition-all"
          >
            Ahora no
          </button>
        </div>
      </div>
    </div>
  );
}
