"use client";

import dynamic from "next/dynamic";
import { useRef, useState, useEffect } from "react";
import { surgena } from "@/app/fonts";
import useScrollProgress from "./useScrollProgress";

const OceanCanvas = dynamic(() => import("./OceanCanvas"), { ssr: false });
const MobileFallback = dynamic(() => import("./MobileFallback"), { ssr: false });

export type Milestone = {
  key: string;
  time: string;
  title: string;
  description: string;
  region?: string;
};

const milestones: Milestone[] = [
  {
    key: "military",
    time: "JUN 2016",
    region: "Marabá-PA",
    title: "Onde tudo começou",
    description:
      "Como Oficial do Exército Brasileiro, liderei uma equipe responsável por licitações e contratos. Foi aqui que aprendi que disciplina, estratégia e responsabilidade não são opcionais.",
  },
  {
    key: "law_school",
    time: "DEZ 2022",
    region: "Marabá-PA",
    title: "O desvio que me direcionou",
    description:
      "Concluí minha graduação em Direito e, naquele momento de reflexão, ficou claro que o universo jurídico não era o meu lugar. Pesquisei, descobri a tecnologia e me apaixonei. Não havia mais volta.",
  },
  {
    key: "transition",
    time: "JUN 2023",
    region: "Recife-PE",
    title: "Mergulho no desconhecido",
    description:
      "Encerrei minha carreira militar e mergulhei de cabeça no que ainda não dominava. Com foco total e muita curiosidade, dediquei-me inteiramente a construir uma nova base na área de tecnologia.",
  },
  {
    key: "software_college",
    time: "JAN 2024",
    region: "Recife-PE",
    title: "A graduação certa",
    description:
      "Iniciei Engenharia de Software — desta vez, sem dúvidas. Cada disciplina confirmava o que eu já sentia: tecnologia não era só uma escolha, era uma identificação.",
  },
  {
    key: "freelancer",
    time: "FEV 2024",
    region: "Remoto",
    title: "Primeiras ondas",
    description:
      "Dei os primeiros passos como desenvolvedor autônomo, construindo presença digital para pequenos negócios. Cada site entregue era a prova de que eu estava evoluindo.",
  },
  {
    key: "siberia",
    time: "MAIO 2024",
    region: "Remoto",
    title: "Primeira correnteza",
    description:
      "Na Siberia Digital, minha primeira experiência profissional na área e ela veio com profundidade. Além do desenvolvimento, mergulhei no universo do Marketing Digital, atuando em toda a infraestrutura de ofertas, funis e automações.",
  },
  {
    key: "voluntary",
    time: "JUL 2024",
    region: "Remoto",
    title: "Construindo com propósito",
    description:
      "Na comunidade Código Certo Coders, liderei uma equipe de desenvolvimento voluntário. Aprendi que código colaborativo tem um peso diferente — ele carrega a energia de quem acredita no que está construindo.",
  },
  {
    key: "machlev",
    time: "SET 2025",
    region: "Remoto",
    title: "Refinando a superfície",
    description:
      "Na Machlev, foquei no que o usuário vê e sente. Atuei na evolução da interface da plataforma com foco em usabilidade, responsividade e consistência visual.",
  },
  {
    key: "freelancer_two",
    time: "ABR 2026",
    region: "Remoto",
    title: "Águas abertas",
    description:
      "De volta ao trabalho Freelancer, expandi meu leque para soluções mais complexas — quizzes, microsserviços com FastAPI, automações com n8n e integrações em múltiplas plataformas. Cada projeto, um novo desafio para navegar.",
  },
];

export default function OceanPath() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const progressRef = useScrollProgress(scrollContainerRef);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <section id="ocean-path">
      {/* Section heading */}
      <div className="px-4 pt-24 text-center">
        <p
          className="text-xs tracking-widest uppercase mb-4"
          style={{ color: "rgba(96,239,255,0.6)" }}
        >
          CADA MARCO, UMA MARÉ
        </p>
        <h2
          className={`${surgena.className} text-5xl md:text-7xl mb-4`}
          style={{
            background: "linear-gradient(to right, #0061FF, #60EFFF)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          MINHA JORNADA
        </h2>
        <p
          className="mx-auto max-w-md text-sm mb-2"
          style={{ color: "rgba(148,163,184,0.7)" }}
        >
          Da liderança militar ao código — cada escolha foi uma corrente que me trouxe até aqui.
        </p>
        <p
          className="mx-auto max-w-xs text-xs"
          style={{ color: "rgba(96,239,255,0.4)", letterSpacing: "0.05em" }}
        >
          ↓ scroll to dive deeper
        </p>
      </div>

      {prefersReducedMotion ? (
        <MobileFallback milestones={milestones} />
      ) : (
        <div
          ref={scrollContainerRef}
          className="relative"
          style={{ height: "500vh" }}
        >
          <div className="sticky top-0 h-screen w-full">
            <OceanCanvas milestones={milestones} progressRef={progressRef} />

            {/* Scroll pulse indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none">
              <div
                className="h-12 w-px animate-pulse"
                style={{
                  background: "linear-gradient(to bottom, rgba(96,239,255,0.4), transparent)",
                }}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
