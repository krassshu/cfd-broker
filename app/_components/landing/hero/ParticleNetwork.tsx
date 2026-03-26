"use client";

import { useEffect, useId, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { ISourceOptions } from "@tsparticles/engine";

type Preset = "hero" | "triangle" | "wave" | "scatter" | "nebula";

interface ParticleNetworkProps {
  preset: Preset;
  color?: string;
  className?: string;
}

// Per-preset overrides — only the values that differ from the base config
const PRESETS: Record<Preset, {
  count: number;
  linkDist: number;
  linkOpacity: number;
  linkWidth: number;
  speed: number;
  direction?: string;
  outMode?: string;
  straight?: boolean;
  opacity: [number, number];
  size: [number, number];
}> = {
  hero:     { count: 180, linkDist: 200, linkOpacity: 0.4,  linkWidth: 1.2, speed: 0.2,  opacity: [0.4, 0.8],  size: [1, 2.5] },
  triangle: { count: 120, linkDist: 200, linkOpacity: 0.5,  linkWidth: 1.4, speed: 0.4,  opacity: [0.5, 0.9],  size: [1.5, 3.5] },
  wave:     { count: 110, linkDist: 220, linkOpacity: 0.4,  linkWidth: 1.0, speed: 0.5,  opacity: [0.4, 0.85], size: [1, 3], direction: "right", outMode: "out", straight: false },
  scatter:  { count: 100, linkDist: 180, linkOpacity: 0.3,  linkWidth: 1.0, speed: 0.6,  opacity: [0.3, 0.8],  size: [1, 4] },
  nebula:   { count: 130, linkDist: 150, linkOpacity: 0.25, linkWidth: 0.8, speed: 0.15, opacity: [0.3, 0.7],  size: [0.5, 2] },
};

function buildOptions(preset: Preset, color: string): ISourceOptions {
  const p = PRESETS[preset];

  return {
    fullScreen: false,
    fpsLimit: 60,
    detectRetina: true,
    background: { color: "transparent" },
    particles: {
      shape:{type:"square"},
      color: { value: color },
      links: {
        enable: true,
        color,
        opacity: p.linkOpacity,
        distance: p.linkDist,
        width: p.linkWidth,
      },
      move: {
        enable: true,
        speed: p.speed,
        direction: (p.direction ?? "none") as "none" | "right",
        outModes: { default: (p.outMode ?? "bounce") as "bounce" | "out" },
        straight: p.straight,
      },
      opacity: { value: { min: p.opacity[0], max: p.opacity[1] } },
      size: { value: { min: p.size[0], max: p.size[1] } },
      number: { value: p.count, density: { enable: true } },
    },
    interactivity: {
      events: { onHover: { enable: false }, onClick: { enable: false } },
    },
  };
}

export default function ParticleNetwork({
  preset,
  color = "#3b82f6",
  className = "",
}: ParticleNetworkProps) {
  const [ready, setReady] = useState(false);
  const reactId = useId();
  const particleId = `tsparticles-${preset}-${reactId.replace(/:/g, "")}`;

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setReady(true));
  }, []);

  const options = useMemo(() => buildOptions(preset, color), [preset, color]);

  if (!ready) return null;

  return (
    <Particles
      id={particleId}
      className={className}
      options={options}
    />
  );
}
