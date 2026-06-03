"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, PlusCircle } from "lucide-react";

type CC = "CL" | "AR" | "MX" | "CO" | "PE" | "ES" | "BR" | "DEFAULT";

interface Tier {
  currency: string;
  symbol: string;
  starter: number;
  pro: number;
  agency: number;
}

const PRICING: Record<CC, Tier> = {
  CL:      { currency: "CLP", symbol: "CLP", starter: 74900,  pro: 169900,  agency: 329900  },
  AR:      { currency: "ARS", symbol: "ARS", starter: 79000,  pro: 179000,  agency: 349000  },
  MX:      { currency: "MXN", symbol: "MX$", starter: 1490,   pro: 3390,    agency: 6590    },
  CO:      { currency: "COP", symbol: "COP", starter: 320000, pro: 720000,  agency: 1390000 },
  PE:      { currency: "PEN", symbol: "S/",  starter: 299,    pro: 679,     agency: 1299    },
  ES:      { currency: "EUR", symbol: "€",   starter: 75,     pro: 169,     agency: 329     },
  BR:      { currency: "BRL", symbol: "R$",  starter: 399,    pro: 899,     agency: 1749    },
  DEFAULT: { currency: "USD", symbol: "$",   starter: 79,     pro: 179,     agency: 349     },
};

const TZ_MAP: Record<string, CC> = {
  "America/Santiago":               "CL",
  "America/Argentina/Buenos_Aires": "AR",
  "America/Argentina/Cordoba":      "AR",
  "America/Argentina/Mendoza":      "AR",
  "America/Argentina/Tucuman":      "AR",
  "America/Argentina/Salta":        "AR",
  "America/Mexico_City":            "MX",
  "America/Monterrey":              "MX",
  "America/Cancun":                 "MX",
  "America/Merida":                 "MX",
  "America/Bogota":                 "CO",
  "America/Lima":                   "PE",
  "Europe/Madrid":                  "ES",
  "America/Sao_Paulo":              "BR",
  "America/Manaus":                 "BR",
  "America/Belem":                  "BR",
  "America/Fortaleza":              "BR",
  "America/Recife":                 "BR",
};

function detect(): CC {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return TZ_MAP[tz] ?? "DEFAULT";
  } catch {
    return "DEFAULT";
  }
}

function fmtLocal(n: number, currency: string): string {
  if (["USD", "EUR", "BRL", "PEN"].includes(currency)) return n.toLocaleString("en-US");
  return n.toLocaleString("es-CL"); // dots as thousands sep for CLP, ARS, MXN, COP
}

export function PricingCards() {
  const [tier, setTier] = useState<Tier>(PRICING.DEFAULT);
  const [showLocal, setShowLocal] = useState(false);

  useEffect(() => {
    const cc = detect();
    if (cc !== "DEFAULT") {
      setTier(PRICING[cc]);
      setShowLocal(true);
    }
  }, []);

  function localRef(plan: keyof Pick<Tier, "starter" | "pro" | "agency">) {
    if (!showLocal) return null;
    return `Facturado en USD · ~${tier.symbol} ${fmtLocal(tier[plan], tier.currency)} /mes`;
  }

  const priceMb = showLocal ? "mb-1" : "mb-6";

  return (
    <div className="grid md:grid-cols-3 gap-6 items-stretch mb-20">

      {/* ── Starter ── */}
      <div className="p-8 bg-card border border-border rounded-xl flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-playfair text-xl font-bold text-foreground">STARTER</h3>
            <p className="font-sans text-sm text-muted-foreground mt-1">Para artistas independientes</p>
          </div>
          <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border border-primary/30">
            ⚡ 200 tokens/mes
          </span>
        </div>
        <div className={`font-mono text-4xl font-semibold text-primary ${priceMb}`}>
          $79<span className="text-sm font-normal text-muted-foreground">/mes</span>
        </div>
        {localRef("starter") && (
          <p className="text-[11px] text-muted-foreground mb-5">{localRef("starter")}</p>
        )}
        <ul className="text-left mb-8 space-y-4 flex-grow text-sm">
          {["200 TV Tokens","CRM 200 leads","Agenda online","Campañas/Contenido/Auto con tokens"].map(f => (
            <li key={f} className="flex items-center gap-2 text-foreground">
              <CheckCircle2 size={14} className="text-primary shrink-0" />{f}
            </li>
          ))}
          <li className="flex items-center gap-2 text-muted-foreground italic">
            <PlusCircle size={14} className="text-primary/50 shrink-0" />Extra $9 c/100
          </li>
        </ul>
        <a
          href="https://wa.me/56936119298?text=Hola!%20Me%20interesa%20el%20plan%20Starter%20de%20TattooVision%20AI"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 bg-primary/10 border border-border text-foreground rounded-lg hover:bg-primary/20 transition-colors font-sans font-bold text-sm text-center block"
        >
          Empezar con Starter
        </a>
      </div>

      {/* ── PRO (highlighted) ── */}
      <div className="relative p-8 bg-[#15001A] border-2 border-primary rounded-xl flex flex-col md:scale-105 z-10 shadow-glow-sm">
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider whitespace-nowrap">
          RECOMENDADO
        </div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-playfair text-xl font-bold text-foreground">PRO</h3>
            <p className="font-sans text-sm text-muted-foreground mt-1">Para estudios en crecimiento</p>
          </div>
          <span className="bg-primary text-white px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
            600 tokens/mes
          </span>
        </div>
        <div className={`font-mono text-4xl font-semibold text-primary ${priceMb}`}>
          $179<span className="text-sm font-normal text-muted-foreground">/mes</span>
        </div>
        {localRef("pro") && (
          <p className="text-[11px] text-muted-foreground mb-5">{localRef("pro")}</p>
        )}
        <ul className="text-left mb-8 space-y-4 flex-grow text-sm">
          {["600 TV Tokens","CRM ilimitado","Agenda multi-artista (5)","Campañas tokens","Contenido IA completo","Automatizaciones avanzadas","Reportes y Soporte prioritario"].map(f => (
            <li key={f} className="flex items-center gap-2 text-foreground">
              <CheckCircle2 size={14} className="text-primary shrink-0" />{f}
            </li>
          ))}
          <li className="flex items-center gap-2 text-muted-foreground italic">
            <PlusCircle size={14} className="text-primary/50 shrink-0" />Extra $7 c/100
          </li>
        </ul>
        <a
          href="https://wa.me/56936119298?text=Hola!%20Me%20interesa%20el%20plan%20Pro%20de%20TattooVision%20AI"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-4 bg-primary text-white rounded-lg hover:shadow-glow transition-shadow font-sans font-bold text-sm text-center block"
        >
          Empezar con Pro
        </a>
      </div>

      {/* ── Agency ── */}
      <div className="p-8 bg-card border border-border rounded-xl flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-playfair text-xl font-bold text-foreground">AGENCY</h3>
            <p className="font-sans text-sm text-muted-foreground mt-1">Para estudios grandes y agencias</p>
          </div>
          <span className="bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent text-[10px] font-mono font-bold uppercase tracking-wider border border-yellow-500/40 px-3 py-1 rounded-full">
            2000 tokens/mes
          </span>
        </div>
        <div className={`font-mono text-4xl font-semibold text-primary ${priceMb}`}>
          $349<span className="text-sm font-normal text-muted-foreground">/mes</span>
        </div>
        {localRef("agency") && (
          <p className="text-[11px] text-muted-foreground mb-5">{localRef("agency")}</p>
        )}
        <ul className="text-left mb-8 space-y-4 flex-grow text-sm">
          {["2000 TV Tokens","Artistas ilimitados","Tokens acumulables (3 meses)","Editor video reels","Reportes avanzados","Soporte dedicado & White label"].map(f => (
            <li key={f} className="flex items-center gap-2 text-foreground">
              <CheckCircle2 size={14} className="text-primary shrink-0" />{f}
            </li>
          ))}
          <li className="flex items-center gap-2 text-muted-foreground italic">
            <PlusCircle size={14} className="text-primary/50 shrink-0" />Extra $5 c/100
          </li>
        </ul>
        <a
          href="https://wa.me/56936119298?text=Hola!%20Me%20interesa%20el%20plan%20Agency%20de%20TattooVision%20AI"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 border border-border text-foreground rounded-lg hover:border-primary transition-colors font-sans font-bold text-sm text-center block"
        >
          Contactar ventas
        </a>
      </div>

    </div>
  );
}
