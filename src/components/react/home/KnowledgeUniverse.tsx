import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Line, Stars } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Group, Mesh } from "three";

interface UniverseSection {
  id: string;
  name: string;
  label: string;
  href: string;
  summary: string;
}

interface UniverseChannel {
  slug: string;
  name: string;
  label: string;
  description: string;
  count: number;
  orbit: number;
}

interface UniversePost {
  id: string;
  title: string;
  summary: string;
  channel: string;
  tags: string[];
  href: string;
}

interface UniverseData {
  sections: UniverseSection[];
  channels: UniverseChannel[];
  tags: { name: string; count: number }[];
  featuredPosts: UniversePost[];
  latestPosts: UniversePost[];
}

interface Props {
  data: UniverseData;
}

function getChannelMoonPosition(index: number, total: number): [number, number, number] {
  const angle = (index / total) * Math.PI * 2 + Math.PI / 5;
  const radius = 0.78;
  return [Math.cos(angle) * radius, Math.sin(index * 1.2) * 0.08, Math.sin(angle) * radius];
}

function getArticleMoonPosition(index: number, total: number): [number, number, number] {
  const angle = (index / total) * Math.PI * 2 + Math.PI / 7;
  const radius = 0.82 + (index % 2) * 0.12;
  return [Math.cos(angle) * radius, Math.sin(index * 1.35) * 0.1, Math.sin(angle) * radius];
}

function OrbitConnector({ position, visible, highlighted, color = "#50e7ff" }: { position: [number, number, number]; visible: boolean; highlighted: boolean; color?: string }) {
  if (!visible && !highlighted) return null;

  return (
    <Line
      points={[[0, 0, 0], position]}
      color={highlighted ? "#ffd36a" : color}
      lineWidth={highlighted ? 1.55 : 0.72}
      transparent
      opacity={highlighted ? 0.72 : 0.24}
      depthWrite={false}
    />
  );
}
function KnowledgeCore() {
  const mesh = useRef<Mesh>(null);
  const aura = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (mesh.current) {
      mesh.current.rotation.y = clock.elapsedTime * 0.18;
      mesh.current.rotation.x = Math.sin(clock.elapsedTime * 0.28) * 0.06;
    }
    if (aura.current) {
      const pulse = 1 + Math.sin(clock.elapsedTime * 1.2) * 0.035;
      aura.current.scale.setScalar(pulse);
    }
  });

  return (
    <group>
      <mesh ref={aura} scale={1.45}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshBasicMaterial color="#50e7ff" transparent opacity={0.08} depthWrite={false} />
      </mesh>
      <mesh ref={mesh}>
        <icosahedronGeometry args={[0.92, 3]} />
        <meshStandardMaterial color="#dff8ff" emissive="#1aa7c4" emissiveIntensity={1.4} roughness={0.22} metalness={0.58} wireframe />
      </mesh>
    </group>
  );
}

function StellarHover({ active }: { active: boolean }) {
  const corona = useRef<Group>(null);
  const stellarDust = useMemo(
    () => Array.from({ length: 24 }, (_, sparkIndex) => {
      const sparkAngle = (sparkIndex / 24) * Math.PI * 2;
      const sparkRadius = 0.34 + (sparkIndex % 6) * 0.045;
      return {
        position: [Math.cos(sparkAngle) * sparkRadius, Math.sin(sparkIndex * 1.37) * 0.16, Math.sin(sparkAngle) * sparkRadius] as [number, number, number],
        size: 0.011 + (sparkIndex % 4) * 0.004,
        color: sparkIndex % 4 === 0 ? "#fff4b8" : sparkIndex % 3 === 0 ? "#ffd36a" : "#ffad2f"
      };
    }),
    []
  );

  useFrame(({ clock }) => {
    if (!corona.current) return;
    corona.current.rotation.y = clock.elapsedTime * 0.55;
    corona.current.rotation.z = Math.sin(clock.elapsedTime * 0.45) * 0.08;
  });

  if (!active) return null;

  return (
    <group ref={corona}>
      <pointLight color="#ffd36a" intensity={4.6} distance={4.8} />
      <mesh scale={1.9}>
        <sphereGeometry args={[0.23, 48, 48]} />
        <meshBasicMaterial color="#ffd36a" transparent opacity={0.2} depthWrite={false} />
      </mesh>
      <mesh scale={3.05}>
        <sphereGeometry args={[0.23, 48, 48]} />
        <meshBasicMaterial color="#ff9f2e" transparent opacity={0.085} depthWrite={false} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.42, 0.006, 8, 96]} />
        <meshBasicMaterial color="#fff1a8" transparent opacity={0.58} depthWrite={false} />
      </mesh>
      <mesh rotation={[Math.PI / 2.35, 0.6, 0.35]}>
        <torusGeometry args={[0.52, 0.004, 8, 96]} />
        <meshBasicMaterial color="#ffbf3f" transparent opacity={0.3} depthWrite={false} />
      </mesh>
      {stellarDust.map((spark, sparkIndex) => (
        <mesh key={sparkIndex} position={spark.position}>
          <sphereGeometry args={[spark.size, 10, 10]} />
          <meshBasicMaterial color={spark.color} transparent opacity={0.86} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

function SectionPlanet({
  section,
  index,
  total,
  activeId,
  localPosition
}: {
  section: UniverseSection;
  index: number;
  total: number;
  activeId?: string;
  localPosition?: [number, number, number];
}) {
  const [hovered, setHovered] = useState(false);
  const mesh = useRef<Mesh>(null);
  const angle = (index / total) * Math.PI * 2 - Math.PI / 6;
  const radius = 3.45;
  const position: [number, number, number] = localPosition ?? [Math.cos(angle) * radius, Math.sin(angle * 1.2) * 0.34, Math.sin(angle) * radius];
  const active = hovered || activeId === section.id;
  const dimmed = Boolean(activeId && activeId !== "origin" && activeId !== section.id && !hovered);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    mesh.current.rotation.y = clock.elapsedTime * 0.36;
    mesh.current.position.y = position[1] + Math.sin(clock.elapsedTime + index) * 0.07 + (active ? 0.08 : 0);
  });

  return (
    <group position={position}>
      <StellarHover active={active} />
      <mesh
        ref={mesh}
        scale={active ? 1.18 : 1}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onClick={() => {
          window.location.href = section.href;
        }}
      >
        <icosahedronGeometry args={[0.22, 3]} />
        <meshStandardMaterial
          color={active ? "#fff1a8" : dimmed ? "#2f7188" : "#7edfff"}
          emissive={active ? "#ffb52e" : dimmed ? "#071b24" : "#124f68"}
          emissiveIntensity={active ? 1.75 : dimmed ? 0.24 : 0.72}
          roughness={0.22}
          metalness={0.58}
          wireframe
          transparent
          opacity={active ? 0.92 : dimmed ? 0.24 : 0.58}
        />
      </mesh>
      <mesh
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onClick={() => {
          window.location.href = section.href;
        }}
      >
        <sphereGeometry args={[0.78, 32, 32]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <Html center distanceFactor={8} className="pointer-events-none select-none">
        <div className={`px-1 py-0.5 text-xs font-medium transition [text-shadow:0_0_14px_rgba(80,231,255,0.45)] ${active ? "text-amber-100 [text-shadow:0_0_18px_rgba(255,211,106,0.9)]" : dimmed ? "text-text/45" : "text-text/90"}`}>
          {section.name}
        </div>
      </Html>
    </group>
  );
}
function SpaceStation({ section, index, total, activeId }: { section: UniverseSection; index: number; total: number; activeId?: string }) {
  const [hovered, setHovered] = useState(false);
  const station = useRef<Group>(null);
  const moduleZ = useMemo(() => [-0.38, -0.18, 0.08, 0.31], []);
  const wingSegments = useMemo(() => [-0.98, -0.71, -0.44, 0.44, 0.71, 0.98], []);
  const sideLights = useMemo(() => [-0.22, 0, 0.22], []);
  const angle = (index / total) * Math.PI * 2 - Math.PI / 6;
  const radius = 3.45;
  const position: [number, number, number] = [Math.cos(angle) * radius, Math.sin(angle * 1.2) * 0.34, Math.sin(angle) * radius];
  const active = hovered || activeId === section.id;
  const dimmed = Boolean(activeId && activeId !== "origin" && activeId !== section.id && !hovered);

  useFrame(({ clock }) => {
    if (!station.current) return;
    station.current.rotation.y = clock.elapsedTime * 0.28;
    station.current.position.y = position[1] + Math.sin(clock.elapsedTime + index) * 0.055 + (active ? 0.06 : 0);
    station.current.position.z = active ? 0.2 : dimmed ? -0.18 : 0;
  });

  return (
    <group position={position}>
      {active && <pointLight color="#50e7ff" intensity={2.6} distance={4.2} />}
      <group
        ref={station}
        rotation={[0.22, 0, -0.14]}
        scale={active ? 1.16 : dimmed ? 0.9 : 1}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onClick={() => {
          window.location.href = section.href;
        }}
      >
        <mesh position={[0, 0, -0.02]}>
          <boxGeometry args={[1.58, 0.025, 0.035]} />
          <meshStandardMaterial color="#a9bfce" emissive={active ? "#2f7893" : "#092334"} emissiveIntensity={active ? 0.42 : 0.12} roughness={0.28} metalness={0.76} />
        </mesh>
        <mesh position={[0, 0, -0.04]} rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[0.54, 0.018, 0.026]} />
          <meshStandardMaterial color="#8199aa" emissive={active ? "#285a72" : "#081a25"} emissiveIntensity={active ? 0.3 : 0.08} roughness={0.32} metalness={0.68} />
        </mesh>

        {moduleZ.map((z, moduleIndex) => (
          <mesh key={z} position={[0, 0, z]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[moduleIndex === 1 ? 0.13 : 0.095, moduleIndex === 1 ? 0.13 : 0.095, moduleIndex === 1 ? 0.22 : 0.18, 28]} />
            <meshStandardMaterial color={moduleIndex === 1 ? "#d8e8f3" : "#aebfcb"} emissive={active ? "#50e7ff" : "#102e3e"} emissiveIntensity={active ? 0.42 : 0.12} roughness={0.2} metalness={0.7} />
          </mesh>
        ))}
        <mesh>
          <sphereGeometry args={[0.145, 36, 36]} />
          <meshStandardMaterial color={active ? "#f6fdff" : "#c4d2dc"} emissive={active ? "#50e7ff" : "#12384a"} emissiveIntensity={active ? 0.9 : 0.24} roughness={0.18} metalness={0.62} />
        </mesh>

        {[-0.55, 0.53].map((z) => (
          <group key={z} position={[0, 0, z]}>
            <mesh>
              <torusGeometry args={[0.18, 0.014, 12, 72]} />
              <meshStandardMaterial color={active ? "#e8fbff" : "#879ead"} emissive={active ? "#50e7ff" : "#0d3345"} emissiveIntensity={active ? 0.78 : 0.2} roughness={0.2} metalness={0.72} />
            </mesh>
            <mesh>
              <torusGeometry args={[0.105, 0.008, 10, 60]} />
              <meshStandardMaterial color={active ? "#f6fdff" : "#6d8798"} emissive={active ? "#50e7ff" : "#10384a"} emissiveIntensity={active ? 0.9 : 0.22} roughness={0.22} metalness={0.68} />
            </mesh>
          </group>
        ))}

        {wingSegments.map((x) => (
          <group key={x} position={[x, 0, 0.02]}>
            <mesh>
              <boxGeometry args={[0.22, 0.12, 0.012]} />
              <meshStandardMaterial color="#1b5279" emissive={active ? "#50e7ff" : "#0b3047"} emissiveIntensity={active ? 0.62 : 0.2} roughness={0.34} metalness={0.42} />
            </mesh>
            <mesh position={[0, 0, 0.009]}>
              <boxGeometry args={[0.236, 0.006, 0.01]} />
              <meshBasicMaterial color={active ? "#dff8ff" : "#50e7ff"} transparent opacity={active ? 0.72 : 0.32} />
            </mesh>
          </group>
        ))}
        {[-0.31, 0.31].map((x) => (
          <mesh key={x} position={[x, 0, 0.01]} rotation={[0, 0, x > 0 ? -0.18 : 0.18]}>
            <boxGeometry args={[0.34, 0.018, 0.022]} />
            <meshStandardMaterial color="#c4d5df" emissive={active ? "#50e7ff" : "#0f2f40"} emissiveIntensity={active ? 0.38 : 0.12} roughness={0.24} metalness={0.72} />
          </mesh>
        ))}

        {[-1, 1].map((side) => (
          <group key={side} position={[side * 0.23, 0, 0]} rotation={[0, 0, side * 0.72]}>
            <mesh position={[0.16 * side, 0.12, 0.18]} rotation={[0.42, 0, 0]}>
              <boxGeometry args={[0.42, 0.012, 0.012]} />
              <meshStandardMaterial color="#93aabc" emissive={active ? "#1e5269" : "#071b26"} emissiveIntensity={active ? 0.28 : 0.08} roughness={0.3} metalness={0.66} />
            </mesh>
            <mesh position={[0.16 * side, -0.12, -0.18]} rotation={[-0.42, 0, 0]}>
              <boxGeometry args={[0.42, 0.012, 0.012]} />
              <meshStandardMaterial color="#93aabc" emissive={active ? "#1e5269" : "#071b26"} emissiveIntensity={active ? 0.28 : 0.08} roughness={0.3} metalness={0.66} />
            </mesh>
          </group>
        ))}

        <mesh position={[0, 0.26, -0.12]}>
          <boxGeometry args={[0.018, 0.36, 0.018]} />
          <meshStandardMaterial color="#d6e8f4" emissive={active ? "#ffd36a" : "#172f3b"} emissiveIntensity={active ? 0.55 : 0.1} roughness={0.24} metalness={0.58} />
        </mesh>
        <mesh position={[0, 0.47, -0.12]}>
          <sphereGeometry args={[0.026, 12, 12]} />
          <meshBasicMaterial color={active ? "#ffd36a" : "#50e7ff"} transparent opacity={active ? 1 : 0.58} />
        </mesh>
        <mesh position={[0.2, -0.18, 0.32]} rotation={[0.12, 0.4, -0.36]}>
          <boxGeometry args={[0.28, 0.012, 0.012]} />
          <meshBasicMaterial color={active ? "#ffd36a" : "#50e7ff"} transparent opacity={active ? 0.9 : 0.36} />
        </mesh>
        {sideLights.map((x) => (
          <mesh key={x} position={[x, 0.063, 0.16]}>
            <sphereGeometry args={[0.014, 10, 10]} />
            <meshBasicMaterial color={active ? "#ffd36a" : "#50e7ff"} transparent opacity={active ? 0.96 : 0.48} />
          </mesh>
        ))}
      </group>
      <mesh
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onClick={() => {
          window.location.href = section.href;
        }}
      >
        <sphereGeometry args={[0.9, 24, 24]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <Html center distanceFactor={8} className="pointer-events-none select-none">
        <div className={`px-1 py-0.5 text-xs font-medium transition [text-shadow:0_0_14px_rgba(80,231,255,0.45)] ${active ? "text-cyan [text-shadow:0_0_18px_rgba(80,231,255,0.9)]" : "text-text/90"}`}>
          {section.name}
        </div>
      </Html>
    </group>
  );
}
function ChannelMoon({
  channel,
  index,
  parentActive,
  position,
  onHoverChange
}: {
  channel: UniverseChannel;
  index: number;
  parentActive: boolean;
  position: [number, number, number];
  onHoverChange: (index: number | null) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const mesh = useRef<Mesh>(null);
  const active = hovered || parentActive;

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    mesh.current.rotation.y = clock.elapsedTime * 0.7;
    mesh.current.position.y = Math.sin(clock.elapsedTime * 1.2 + index) * 0.025;
  });

  const setHover = (nextHovered: boolean) => {
    setHovered(nextHovered);
    onHoverChange(nextHovered ? index : null);
  };

  return (
    <group position={position} scale={parentActive ? 1 : 0.82}>
      <mesh
        ref={mesh}
        scale={hovered ? 1.28 : 1}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
        onClick={() => {
          window.location.href = `/channels/${channel.slug}/`;
        }}
      >
        <icosahedronGeometry args={[0.092, 2]} />
        <meshStandardMaterial color={active ? "#fff1a8" : "#50e7ff"} emissive={active ? "#ffb52e" : "#0f6c8c"} emissiveIntensity={active ? 1.2 : 0.44} roughness={0.24} metalness={0.52} wireframe transparent opacity={active ? 0.84 : 0.56} />
      </mesh>
      <mesh
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
        onClick={() => {
          window.location.href = `/channels/${channel.slug}/`;
        }}
      >
        <sphereGeometry args={[0.26, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {(parentActive || hovered) && (
        <Html center distanceFactor={7.5} className="pointer-events-none w-44 select-none">
          <div className={`scan-preview ${hovered ? "scan-preview-active" : ""}`}>
            <div className="font-medium text-text">{channel.name}</div>
            <div className="mt-1 line-clamp-2 text-[10px] leading-4 text-muted">{channel.description}</div>
            <div className="mt-2 font-mono text-[9px] uppercase tracking-[0.12em] text-cyan">{channel.count} logs</div>
          </div>
        </Html>
      )}
    </group>
  );
}
function ChannelCluster({ section, channels, activeId }: { section: UniverseSection; channels: UniverseChannel[]; activeId?: string }) {
  const [hovered, setHovered] = useState(false);
  const [hoveredMoon, setHoveredMoon] = useState<number | null>(null);
  const group = useRef<Group>(null);
  const angle = -Math.PI / 6;
  const radius = 3.45;
  const position: [number, number, number] = [Math.cos(angle) * radius, Math.sin(angle * 1.2) * 0.34, Math.sin(angle) * radius];
  const active = hovered || activeId === section.id;
  const dimmed = Boolean(activeId && activeId !== "origin" && activeId !== section.id && !hovered);

  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.rotation.y = clock.elapsedTime * 0.18;
    group.current.position.z = active ? 0.18 : dimmed ? -0.2 : 0;
    group.current.scale.setScalar(active ? 1.08 : dimmed ? 0.88 : 1);
  });

  return (
    <group position={position} onPointerEnter={() => setHovered(true)} onPointerLeave={() => setHovered(false)}>
      <SectionPlanet section={section} index={0} total={4} activeId={activeId} localPosition={[0, 0, 0]} />
      <group ref={group}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.78, 0.0035, 8, 96]} />
          <meshBasicMaterial color="#50e7ff" transparent opacity={active ? 0.42 : dimmed ? 0.045 : 0.12} depthWrite={false} />
        </mesh>
        {channels.map((channel, index) => {
          const moonPosition = getChannelMoonPosition(index, channels.length);
          return (
            <group key={channel.slug}>
              <OrbitConnector position={moonPosition} visible={active} highlighted={hoveredMoon === index} />
              <ChannelMoon channel={channel} index={index} parentActive={active} position={moonPosition} onHoverChange={setHoveredMoon} />
            </group>
          );
        })}
      </group>
    </group>
  );
}

function ArticleMoon({
  post,
  index,
  parentActive,
  position,
  onHoverChange
}: {
  post: UniversePost;
  index: number;
  parentActive: boolean;
  position: [number, number, number];
  onHoverChange: (index: number | null) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const mesh = useRef<Mesh>(null);
  const active = hovered || parentActive;

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    mesh.current.rotation.y = clock.elapsedTime * 0.82;
    mesh.current.position.y = Math.sin(clock.elapsedTime * 1.15 + index) * 0.03;
  });

  const setHover = (nextHovered: boolean) => {
    setHovered(nextHovered);
    onHoverChange(nextHovered ? index : null);
  };

  return (
    <group position={position} scale={parentActive ? 1 : 0.84}>
      <mesh
        ref={mesh}
        scale={hovered ? 1.35 : 1}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
        onClick={() => {
          window.location.href = post.href;
        }}
      >
        <icosahedronGeometry args={[0.08, 2]} />
        <meshStandardMaterial color={active ? "#fff1a8" : "#50e7ff"} emissive={active ? "#ffb52e" : "#0f6c8c"} emissiveIntensity={active ? 1.2 : 0.44} roughness={0.24} metalness={0.52} wireframe transparent opacity={active ? 0.84 : 0.56} />
      </mesh>
      <mesh
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
        onClick={() => {
          window.location.href = post.href;
        }}
      >
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {(parentActive || hovered) && (
        <Html center distanceFactor={7.5} className="pointer-events-none w-56 select-none">
          <div className={`scan-preview ${hovered ? "scan-preview-active" : ""}`}>
            <div className="font-medium leading-4 text-text">{post.title}</div>
            <div className="mt-1 line-clamp-2 text-[10px] leading-4 text-muted">{post.summary}</div>
            <div className="mt-2 flex flex-wrap gap-1 font-mono text-[9px] uppercase tracking-[0.08em] text-cyan">
              <span>{post.channel}</span>
              {post.tags.slice(0, 2).map((tag) => <span key={tag}>/{tag}</span>)}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
function ArticleCluster({ section, posts, activeId, sectionIndex }: { section: UniverseSection; posts: UniversePost[]; activeId?: string; sectionIndex: number }) {
  const [hovered, setHovered] = useState(false);
  const [hoveredMoon, setHoveredMoon] = useState<number | null>(null);
  const group = useRef<Group>(null);
  const angle = (sectionIndex / 4) * Math.PI * 2 - Math.PI / 6;
  const radius = 3.45;
  const position: [number, number, number] = [Math.cos(angle) * radius, Math.sin(angle * 1.2) * 0.34, Math.sin(angle) * radius];
  const active = hovered || activeId === section.id;
  const dimmed = Boolean(activeId && activeId !== "origin" && activeId !== section.id && !hovered);

  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.rotation.y = clock.elapsedTime * 0.16;
    group.current.position.z = active ? 0.18 : dimmed ? -0.2 : 0;
    group.current.scale.setScalar(active ? 1.08 : dimmed ? 0.88 : 1);
  });

  return (
    <group position={position} onPointerEnter={() => setHovered(true)} onPointerLeave={() => setHovered(false)}>
      <SectionPlanet section={section} index={sectionIndex} total={4} activeId={activeId} localPosition={[0, 0, 0]} />
      <group ref={group}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.86, 0.0035, 8, 96]} />
          <meshBasicMaterial color="#ffd36a" transparent opacity={active ? 0.4 : dimmed ? 0.04 : 0.11} depthWrite={false} />
        </mesh>
        {posts.slice(0, 6).map((post, index) => {
          const totalPosts = Math.min(posts.length, 6);
          const moonPosition = getArticleMoonPosition(index, totalPosts);
          return (
            <group key={post.id}>
              <OrbitConnector position={moonPosition} visible={active} highlighted={hoveredMoon === index} color="#ffd36a" />
              <ArticleMoon post={post} index={index} parentActive={active} position={moonPosition} onHoverChange={setHoveredMoon} />
            </group>
          );
        })}
      </group>
    </group>
  );
}

function OrbitLines() {
  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      {[2.55, 3.45, 4.35].map((radius) => (
        <mesh key={radius}>
          <torusGeometry args={[radius, 0.003, 8, 160]} />
          <meshBasicMaterial color="#50e7ff" transparent opacity={radius === 3.45 ? 0.22 : 0.1} />
        </mesh>
      ))}
    </group>
  );
}

function Scene({ data }: Props) {
  const group = useRef<Group>(null);
  const stars = useRef<Group>(null);
  const sections = useMemo(() => data.sections, [data.sections]);
  const [activeId, setActiveId] = useState("origin");
  const targetProgress = useRef(0);
  const smoothProgress = useRef(0);
  const autoRotation = useRef(0);

  useFrame(({ pointer, camera, clock }) => {
    const progress = smoothProgress.current + (targetProgress.current - smoothProgress.current) * 0.065;
    smoothProgress.current = progress;
    autoRotation.current += 0.001;

    const centerOffset = progress - sections.length / 2;

    if (stars.current) {
      stars.current.rotation.y = clock.elapsedTime * 0.006 + progress * 0.08;
      stars.current.rotation.x = pointer.y * 0.025;
      stars.current.position.x = centerOffset * -0.08;
    }

    if (group.current) {
      group.current.rotation.y = autoRotation.current + progress * 0.34 + pointer.x * 0.045;
      group.current.rotation.x = pointer.y * 0.08;
      group.current.rotation.z = pointer.x * -0.04;
      group.current.position.x = centerOffset * -0.16;
      group.current.position.z = Math.sin(progress * 0.72) * 0.12;
    }

    camera.position.x += (centerOffset * 0.16 - camera.position.x) * 0.045;
    camera.position.y += (2.3 + pointer.y * 0.08 - camera.position.y) * 0.045;
    camera.lookAt(0, 0, 0);
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const target = document.getElementById("home-horizontal");
    if (!target) return;
    const updateActive = () => {
      const progress = target.scrollLeft / Math.max(target.clientWidth, 1);
      targetProgress.current = Math.min(Math.max(progress, 0), sections.length);
      const index = Math.round(targetProgress.current);
      const ids = ["origin", ...sections.map((section) => section.id)];
      setActiveId(ids[Math.min(Math.max(index, 0), ids.length - 1)] ?? "origin");
    };
    updateActive();
    target.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive, { passive: true });
    return () => {
      target.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
    };
  }, [sections]);

  const sectionById = Object.fromEntries(sections.map((section) => [section.id, section]));
  const indexedSections = Object.fromEntries(sections.map((section, index) => [section.id, { section, index }]));
  const plainSections = sections.filter((section) => !["channels", "featured", "latest", "index"].includes(section.id));

  return (
    <>
      <group ref={stars}>
        <Stars radius={90} depth={40} count={2400} factor={4.8} saturation={0.08} fade speed={0.35} />
      </group>
      <group ref={group}>
        <ambientLight intensity={0.58} />
        <pointLight position={[2, 3, 4]} intensity={2.2} color="#50e7ff" />
        <pointLight position={[-4, -2, -3]} intensity={1.3} color="#9c7bff" />
        <OrbitLines />
        <KnowledgeCore />
        {sectionById.channels && <ChannelCluster section={sectionById.channels} channels={data.channels} activeId={activeId} />}
        {indexedSections.featured && <ArticleCluster section={indexedSections.featured.section} posts={data.featuredPosts} activeId={activeId} sectionIndex={indexedSections.featured.index} />}
        {indexedSections.latest && <ArticleCluster section={indexedSections.latest.section} posts={data.latestPosts} activeId={activeId} sectionIndex={indexedSections.latest.index} />}
        {indexedSections.index && <SpaceStation section={indexedSections.index.section} index={indexedSections.index.index} total={4} activeId={activeId} />}
        {plainSections.map((section) => <SectionPlanet key={section.id} section={section} index={indexedSections[section.id].index} total={4} activeId={activeId} />)}
      </group>
    </>
  );
}
export default function KnowledgeUniverse({ data }: Props) {
  return (
    <div className="h-full min-h-[34rem] w-full opacity-100" aria-hidden="true">
      <Canvas camera={{ position: [0, 2.3, 7.4], fov: 48 }} dpr={[1, 1.7]}>
        <color attach="background" args={["#081224"]} />
        <fog attach="fog" args={["#081224", 9, 20]} />
        <Scene data={data} />
      </Canvas>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_42%,transparent_0,rgba(5,9,18,0.18)_34%,rgba(5,9,18,0.86)_74%)]"></div>
    </div>
  );
}
