'use client';

import { DARK_DOTS, CONTINENT_PATHS, CYAN_MARKERS } from './world-map-data';

export default function WorldMap() {
    return (
        <div className="w-full max-w-4xl mx-auto" aria-hidden="true">
            <svg
                viewBox="0 0 747 378"
                className="w-full h-auto"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <style>{`
                        @keyframes map-pulse {
                            0%, 100% { opacity: 1; transform: scale(1); }
                            50% { opacity: 0.6; transform: scale(1.4); }
                        }
                        .marker-pulse {
                            animation: map-pulse 2.5s ease-in-out infinite;
                        }
                    `}</style>
                </defs>

                {/* Ocean dot-matrix */}
                <g opacity="0.18">
                    {DARK_DOTS.map((dot, i) => (
                        <circle key={`d-${i}`} cx={dot.cx} cy={dot.cy} r="1.5" fill="var(--muted)" />
                    ))}
                </g>

                {/* Continents */}
                <g opacity="0.85">
                    {CONTINENT_PATHS.map((pathData, i) => (
                        <path key={`c-${i}`} d={pathData} fill="var(--foreground)" opacity="0.15" />
                    ))}
                </g>

                {/* Location markers with pulse */}
                {CYAN_MARKERS.map((marker, i) => (
                    <g key={`m-${i}`}>
                        <circle
                            cx={marker.cx} cy={marker.cy} r="6"
                            fill="#00C4F4" opacity="0.15"
                            className="marker-pulse"
                            style={{
                                animationDelay: `${marker.delay}s`,
                                transformOrigin: `${marker.cx}px ${marker.cy}px`,
                            }}
                        />
                        <circle cx={marker.cx} cy={marker.cy} r="2.5" fill="#00C4F4" opacity="0.9" />
                    </g>
                ))}
            </svg>
        </div>
    );
}
