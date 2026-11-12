import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Stars,
  Line,
} from "@react-three/drei";
import * as THREE from "three";

const CYAN = "#22d3ee";
const BLUE = "#3b82f6";
const RED = "#fb7185";


function FloatingParticles() {
  const particlesRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const count = 220;
    const points = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const radius = 1.8 + Math.random() * 1.7;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      points[i * 3] =
        radius * Math.sin(phi) * Math.cos(theta);

      points[i * 3 + 1] =
        radius * Math.sin(phi) * Math.sin(theta);

      points[i * 3 + 2] =
        radius * Math.cos(phi);
    }

    return points;
  }, []);

  useFrame((_, delta) => {
    if (!particlesRef.current) return;

    particlesRef.current.rotation.y += delta * 0.025;
    particlesRef.current.rotation.x += delta * 0.008;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>

      <pointsMaterial
        color="#22d3ee"
        size={0.025}
        transparent
        opacity={0.65}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}


function Globe() {
  const globeRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += delta * 0.12;
    }
  });

  return (
    <group ref={globeRef}>
      {/* Main globe */}
      <mesh>
        <sphereGeometry args={[1.35, 48, 48]} />
        <meshStandardMaterial
          color="#0b2940"
          emissive="#06334a"
          emissiveIntensity={0.8}
          roughness={0.75}
          metalness={0.25}
          wireframe
        />
      </mesh>

      {/* Inner transparent globe */}
      <mesh>
        <sphereGeometry args={[1.32, 32, 32]} />
        <meshBasicMaterial
          color="#0e7490"
          transparent
          opacity={0.08}
        />
      </mesh>

      {/* Equator ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.38, 0.006, 8, 100]} />
        <meshBasicMaterial
          color={CYAN}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Latitude-like rings */}
      {[0.45, 0.85, 1.1].map((radius, index) => (
        <mesh
          key={index}
          rotation={[Math.PI / 2, index * 0.35, 0]}
        >
          <torusGeometry args={[radius, 0.003, 6, 80]} />
          <meshBasicMaterial
            color={BLUE}
            transparent
            opacity={0.45}
          />
        </mesh>
      ))}

      {/* Network nodes */}
      <NetworkNodes />
      
    </group>
  );
}


type DataPacketProps = {
  path: [number, number, number][];
  color: string;
  speed: number;
  offset: number;
};

function DataPacket({
  path,
  color,
  speed,
  offset,
}: DataPacketProps) {
  const packetRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!packetRef.current) return;

    const progress =
      (state.clock.elapsedTime * speed + offset) % 1;

    const segmentProgress = progress * (path.length - 1);
    const segmentIndex = Math.min(
      Math.floor(segmentProgress),
      path.length - 2
    );

    const localProgress = segmentProgress - segmentIndex;

    const start = new THREE.Vector3(...path[segmentIndex]);
    const end = new THREE.Vector3(...path[segmentIndex + 1]);

    packetRef.current.position.lerpVectors(
      start,
      end,
      localProgress
    );
  });

  return (
    <mesh ref={packetRef}>
      <sphereGeometry args={[0.055, 16, 16]} />
      <meshBasicMaterial
        color={color}
        toneMapped={false}
      />
    </mesh>
  );
}


function PulsingNode({
  position,
  color,
  offset,
}: {
  position: [number, number, number];
  color: string;
  offset: number;
}) {
  const glowRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame((state) => {
    if (!glowRef.current || !materialRef.current) return;

    const pulse =
      (Math.sin(state.clock.elapsedTime * 2.5 + offset) + 1) / 2;

    const scale = 0.8 + pulse * 0.7;

    glowRef.current.scale.setScalar(scale);
    materialRef.current.opacity = 0.10 + pulse * 0.22;
  });

  return (
    <group position={position}>
      {/* Main node */}
      <mesh>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>

      {/* Animated glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshBasicMaterial
          ref={materialRef}
          color={color}
          transparent
          opacity={0.2}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function NetworkNodes() {
  const nodes = [
    {
      position: [1.0, 0.45, 0.65] as [number, number, number],
      color: RED,
    },
    {
      position: [-0.85, 0.75, 0.7] as [number, number, number],
      color: CYAN,
    },
    {
      position: [0.25, -1.0, 0.7] as [number, number, number],
      color: RED,
    },
    {
      position: [-0.75, -0.45, -0.85] as [number, number, number],
      color: CYAN,
    },
    {
      position: [0.85, -0.35, -0.85] as [number, number, number],
      color: RED,
    },
    {
      position: [-0.2, 1.1, -0.45] as [number, number, number],
      color: CYAN,
    },
  ];

  return (
    
      <group>
    {nodes.map((node, index) => (
      <PulsingNode
        key={index}
        position={node.position}
        color={node.color}
        offset={index * 0.8}
      />
    ))}

    
   

      {/* Network connections */}
      <Line
        points={[
          nodes[0].position,
          nodes[1].position,
          nodes[5].position,
        ]}
        color={CYAN}
        lineWidth={1}
        transparent
        opacity={0.65}
      />

      <Line
        points={[
          nodes[2].position,
          nodes[0].position,
          nodes[4].position,
        ]}
        color={RED}
        lineWidth={1}
        transparent
        opacity={0.7}
      />

      <Line
        points={[
          nodes[3].position,
          nodes[2].position,
          nodes[5].position,
        ]}
        color={BLUE}
        lineWidth={1}
        transparent
        opacity={0.6}
      />
      
      {/* Animated data packets */}
      <DataPacket
        path={[
          nodes[0].position,
          nodes[1].position,
          nodes[5].position,
        ]}
        color={CYAN}
        speed={0.28}
        offset={0}
      />

      <DataPacket
        path={[
          nodes[2].position,
          nodes[0].position,
          nodes[4].position,
        ]}
        color={RED}
        speed={0.22}
        offset={0.5}
      />

      <DataPacket
        path={[
          nodes[3].position,
          nodes[2].position,
          nodes[5].position,
        ]}
        color={BLUE}
        speed={0.32}
        offset={0.25}
      />

    </group>
  );
}

export default function CyberThreatGlobe() {
  return (
    <div
    style={{
    position: "relative",
    width: "100%",
    height: "100%",
    minHeight: 0,
    overflow: "hidden",
    borderRadius: "12px",
    background: "#080f1c",
    isolation: "isolate",
}}
    >
      {/* Header */}
      <div className="pointer-events-none absolute left-4 top-4 z-10">
        <p className="text-xs font-semibold tracking-[0.2em] text-cyan-400">
          GLOBAL NETWORK
        </p>

        {/* <p className="mt-1 text-[10px] text-slate-500">
          Interactive 3D visualization
        </p> */}
      </div>

      {/* 3D Canvas */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      >
        <Canvas
    style={{
    position: "absolute",
    inset: "35px 0 30px 0",
    width: "100%",
    height: "calc(100% - 65px)",
}}
          camera={{
            position: [0, 0, 3.6],
            fov: 45,
          }}
          dpr={[1, 1.5]}
        >
          <ambientLight intensity={1.2} />

          <pointLight
            position={[5, 5, 5]}
            intensity={2}
            color={CYAN}
          />

          <pointLight
            position={[-5, -3, -5]}
            intensity={1}
            color={BLUE}
          />

          <Stars
            radius={40}
            depth={25}
            count={250}
            factor={1.5}
            saturation={0}
            fade
          />

          <Globe />
          <FloatingParticles />

          <OrbitControls
            target={[0, -0.08, 0]}
            enablePan={false}
            enableZoom
            minDistance={3.6}
            maxDistance={5.5}
            autoRotate
            autoRotateSpeed={0.4}
          />
        </Canvas>
      </div>

      {/* Legend */}
      {/* <div className="pointer-events-none absolute bottom-3 left-4 z-10 flex flex-wrap gap-4 text-[10px]">
        <span className="flex items-center gap-1 text-slate-400">
          <span className="h-2 w-2 rounded-full bg-cyan-400" />
          Network node
        </span>

        <span className="flex items-center gap-1 text-slate-400">
          <span className="h-2 w-2 rounded-full bg-rose-400" />
          Illustrative threat
        </span>
      </div> */}
    </div>
  );
}
