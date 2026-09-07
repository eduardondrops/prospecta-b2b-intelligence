import type { CSSProperties } from "react";

const brazilPath = "M322.5 588.4 L319.0 581.2 L324.6 575.2 L317.3 566.5 L307.3 559.5 L294.2 551.3 L289.4 551.7 L276.7 541.8 L268.4 543.2 L285.4 525.8 L299.8 513.5 L308.3 508.3 L319.0 501.3 L319.3 491.1 L312.9 483.7 L306.6 486.2 L309.1 478.8 L310.8 471.3 L310.8 464.3 L306.3 462.0 L301.5 464.0 L296.7 463.5 L295.2 458.6 L294.1 446.9 L291.7 443.1 L283.1 439.7 L277.9 442.1 L264.4 439.7 L265.3 422.4 L261.5 415.3 L265.5 412.7 L264.3 405.4 L267.7 399.9 L270.0 389.8 L267.0 381.9 L260.0 378.3 L258.7 373.3 L260.5 366.0 L236.1 365.4 L231.2 350.6 L234.9 350.4 L234.8 344.9 L232.3 341.2 L231.7 333.8 L224.3 330.0 L216.3 330.2 L211.1 326.5 L202.4 323.9 L197.4 319.2 L183.2 317.1 L169.3 305.7 L170.4 297.1 L168.8 292.2 L170.2 282.7 L153.5 284.8 L146.8 289.6 L135.6 294.8 L132.8 298.6 L126.2 298.9 L116.8 297.8 L109.6 300.0 L103.8 298.6 L104.6 279.2 L94.2 286.7 L83.0 286.4 L78.1 279.6 L69.7 278.9 L72.4 273.4 L65.3 265.7 L60.0 254.2 L63.4 251.9 L63.3 246.5 L71.0 242.8 L69.8 235.9 L73.0 231.5 L74.0 225.5 L88.5 216.9 L99.0 214.4 L100.7 212.5 L112.1 213.1 L117.9 178.2 L118.2 172.7 L116.2 165.4 L110.5 160.7 L110.6 151.5 L117.8 149.4 L120.3 150.7 L120.7 145.8 L113.3 144.5 L113.1 136.5 L137.9 136.8 L142.1 132.4 L145.7 136.4 L148.2 144.0 L150.6 142.4 L157.6 149.1 L167.5 148.3 L169.9 144.4 L179.4 141.4 L184.7 139.3 L186.1 133.9 L195.2 130.3 L194.6 127.6 L183.8 126.5 L182.0 118.5 L182.5 110.0 L176.8 106.7 L179.2 105.5 L188.6 107.1 L198.8 110.3 L202.4 107.3 L211.6 105.3 L225.8 100.6 L230.5 95.7 L228.8 92.1 L235.4 91.6 L238.4 94.5 L236.7 100.1 L241.1 102.0 L244.0 107.9 L240.5 112.4 L238.5 123.3 L241.7 129.7 L242.7 135.6 L250.5 141.6 L256.7 142.2 L258.2 139.7 L262.2 139.2 L267.9 136.9 L272.1 133.5 L279.1 134.6 L282.2 134.2 L289.1 135.2 L290.3 132.6 L288.2 130.1 L289.4 126.4 L294.6 127.5 L300.6 126.2 L307.9 128.9 L313.4 131.5 L317.4 128.1 L320.2 128.6 L322.0 132.2 L328.1 131.3 L333.0 126.5 L336.9 117.1 L344.4 105.4 L348.7 104.8 L351.9 111.9 L359.0 134.1 L365.8 136.2 L366.2 145.0 L356.6 155.5 L360.6 159.4 L383.1 161.4 L383.5 174.1 L393.2 165.8 L409.2 170.3 L430.4 178.1 L436.6 185.6 L434.5 192.6 L449.3 188.7 L474.1 195.4 L493.2 194.9 L512.0 205.5 L528.2 219.8 L538.1 223.4 L548.9 223.9 L553.6 228.0 L557.9 244.2 L560.0 251.9 L554.9 272.9 L548.4 281.3 L530.5 299.0 L522.4 313.4 L513.0 324.4 L509.8 324.7 L506.2 334.0 L507.1 357.9 L503.6 377.5 L502.2 385.9 L498.2 391.0 L495.9 408.0 L483.0 424.6 L480.8 437.8 L470.5 443.3 L467.6 450.9 L453.7 450.9 L433.7 455.8 L424.7 461.4 L410.4 465.2 L395.5 475.3 L384.7 487.9 L382.8 497.4 L384.9 504.5 L382.6 517.3 L379.7 523.6 L370.8 530.6 L356.6 553.0 L345.4 563.1 L336.8 569.0 L331.0 581.2 L322.5 588.4 Z";


type Point = { x: number; y: number };
// Natural Earth public-domain outline. The network is an illustrative composition.
const outline = [...brazilPath.matchAll(/[ML]([\d.]+) ([\d.]+)/g)].map((match) => ({ x: Number(match[1]), y: Number(match[2]) }));
function inside({ x, y }: Point) {
  let result = false;
  for (let i = 0, j = outline.length - 1; i < outline.length; j = i++) {
    const a = outline[i], b = outline[j];
    if ((a.y > y) !== (b.y > y) && x < (b.x - a.x) * (y - a.y) / (b.y - a.y) + a.x) result = !result;
  }
  return result;
}
const points = Array.from({ length: 650 }, (_, index) => ({
  x: 70 + (index % 25) * 20 + Math.sin(index * 7.3) * 6,
  y: 100 + Math.floor(index / 25) * 19 + Math.cos(index * 3.7) * 6,
})).filter(inside);
const links = points.flatMap((point, index) => points.slice(index + 1).filter((other) => Math.hypot(point.x - other.x, point.y - other.y) < 31).map((other) => ({ from: point, to: other })));
const project = (longitude: number, latitude: number): Point => ({ x: 60 + (longitude + 73.987235) * 12.7365035, y: 91.55626 + (5.244486 - latitude) * 12.7365035 });
const cities = [
  { name: "Manaus", ...project(-60.02, -3.10), dx: -14, dy: -16 },
  { name: "Belém", ...project(-48.50, -1.45), dx: -16, dy: -18 },
  { name: "Fortaleza", ...project(-38.54, -3.72), dx: 10, dy: -16 },
  { name: "Recife", ...project(-34.88, -8.05), dx: 12, dy: 6 },
  { name: "Salvador", ...project(-38.50, -12.97), dx: 12, dy: 5 },
  { name: "Brasília", ...project(-47.88, -15.79), dx: -17, dy: -18 },
  { name: "São Paulo", ...project(-46.63, -23.55), dx: 17, dy: -2 },
  { name: "Porto Alegre", ...project(-51.23, -30.03), dx: 12, dy: 20 },
];
const routes = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [0, 5], [1, 5], [4, 6]];
const phrase = "+20M de empresas cadastradas";

export function HeroNetworkMap() {
  return (
    <div className="hero-network">
      <div className="hero-map-meta"><span>PROSPECTA / INTELIGÊNCIA EMPRESARIAL</span><small>BRASIL · BR</small></div>
      <div className="hero-map-heading"><span>UM PAÍS INTEIRO</span><p>de possibilidades.</p></div>
      <svg className="brazil-network-map" viewBox="20 65 590 565" role="img" aria-label="Mapa ilustrativo do Brasil com conexões empresariais em todas as regiões">
        <defs>
          <linearGradient id="brazilFill" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#34624c" /><stop offset=".5" stopColor="#143d2e" /><stop offset="1" stopColor="#09271f" /></linearGradient>
          <linearGradient id="brazilEdge"><stop stopColor="#a1cc90" /><stop offset=".5" stopColor="#c8d6a0" /><stop offset="1" stopColor="#8d733c" /></linearGradient>
          <radialGradient id="mapAtmosphere"><stop stopColor="#97b979" stopOpacity=".24" /><stop offset="1" stopColor="#97b979" stopOpacity="0" /></radialGradient>
          <radialGradient id="cityHalo"><stop stopColor="#f7d47d" stopOpacity=".5" /><stop offset="1" stopColor="#f7d47d" stopOpacity="0" /></radialGradient>
          <pattern id="mapDots" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".6" fill="#c0d8a1" opacity=".3" /></pattern>
          <filter id="cityGlow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="2.5" /></filter>
          <clipPath id="brazilClip"><path d={brazilPath} /></clipPath>
        </defs>
        <ellipse cx="320" cy="350" rx="285" ry="270" fill="url(#mapAtmosphere)" />
        <g className="map-coordinate-lines"><ellipse cx="310" cy="340" rx="279" ry="246" /><ellipse cx="310" cy="340" rx="218" ry="286" /><path d="M22 340 H608 M310 70 V622" /></g>
        <path className="brazil-depth" d={brazilPath} transform="translate(0 10)" />
        <path className="brazil-shape" d={brazilPath} />
        <g clipPath="url(#brazilClip)">
          <path d={brazilPath} fill="url(#mapDots)" />
          <g className="network-mesh">{links.map(({ from, to }, index) => <path key={index} d={`M${from.x} ${from.y} L${to.x} ${to.y}`} />)}</g>
          <g>{points.map(({ x, y }, index) => <circle key={index} cx={x} cy={y} r={index % 7 === 0 ? 2.1 : 1} className={`network-spark ${index % 3 === 0 ? "spark-gold" : "spark-green"}`} style={{ "--spark-delay": `-${(index * .37) % 7}s` } as CSSProperties} />)}</g>
        </g>
        <g className="network-routes">{routes.map(([a, b], index) => {
          const from = cities[a], to = cities[b];
          const path = `M${from.x} ${from.y} Q${(from.x + to.x) / 2 - 22} ${(from.y + to.y) / 2 - 20} ${to.x} ${to.y}`;
          return <g key={index}><path d={path} /><path d={path} className="network-route-signal" pathLength="100" style={{ animationDelay: `-${index * .6}s` }} /></g>;
        })}</g>
        {cities.map(({ name, x, y, dx, dy }, index) => <g key={name} className="network-city" transform={`translate(${x} ${y})`} style={{ "--spark-delay": `-${index * .7}s` } as CSSProperties}>
          <circle r="26" fill="url(#cityHalo)" />
          <circle r="7" fill="#f3cf77" opacity=".6" filter="url(#cityGlow)" />
          <circle className="city-ring" r="11" />
          <circle className="city-center" r="3.1" />
          <text x={dx} y={dy} textAnchor={dx < 0 ? "end" : "start"}>{name}</text>
        </g>)}
        <text className="map-ocean-label" x="520" y="491" transform="rotate(-65 520 491)">OCEANO ATLÂNTICO</text>
      </svg>
      <div className="hero-database-line">
        <span className="database-eyebrow">CONECTE-SE À SUA PRÓXIMA OPORTUNIDADE</span>
        <p className="typing-text" aria-label={phrase}>
          <span className="typing-number" aria-hidden="true">{[..."+20M"].map((char, index) => <span className="typing-character" key={index} style={{ "--character-index": index } as CSSProperties}>{char}</span>)}</span>
          <span className="typing-caption" aria-hidden="true">{[..."de empresas cadastradas"].map((char, index) => <span className="typing-character" key={index} style={{ "--character-index": index + 5 } as CSSProperties}>{char}</span>)}<i /></span>
        </p>
        <div className="hero-network-legend"><span><i /> Conexões empresariais</span><span><i /> Oportunidades pelo Brasil</span></div>
      </div>
    </div>
  );
}
