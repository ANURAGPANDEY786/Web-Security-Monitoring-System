
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function Shield() {
    const group = useRef<THREE.Group>(null);

    const shieldShape = useMemo(() => {
        const shape = new THREE.Shape();
        shape.moveTo(0, 1.35);
        shape.lineTo(0.95, 0.95);
        shape.lineTo(0.82, -0.25);
        shape.quadraticCurveTo(0.65, -1.05, 0, -1.45);
        shape.quadraticCurveTo(-0.65, -1.05, -0.82, -0.25);
        shape.lineTo(-0.95, 0.95);
        shape.closePath();
        return shape;
    }, []);

    useFrame((state, delta) => {
        if (group.current) {
            group.current.rotation.y += delta * 0.25;
            group.current.rotation.x =
                Math.sin(state.clock.elapsedTime * 0.5) * 0.08;
        }
    });

    return (
        <group ref={group}>
            <mesh>
                <extrudeGeometry
                    args={[
                        shieldShape,
                        { depth: 0.18, bevelEnabled: true, bevelSegments: 3,
                          steps: 1, bevelSize: 0.06, bevelThickness: 0.05 },
                    ]}
                />
                <meshStandardMaterial
                    color="#082c43"
                    metalness={0.8}
                    roughness={0.22}
                    emissive="#087caa"
                    emissiveIntensity={0.45}
                />
            </mesh>

            <mesh position={[0, 0, 0.16]}>
                <shapeGeometry args={[shieldShape]} />
                <meshBasicMaterial
                    color="#0b263c"
                    transparent
                    opacity={0.72}
                />
            </mesh>

            {/* Shield check mark */}
            <mesh position={[0, 0.05, 0.23]} rotation={[0, 0, -0.45]}>
                <boxGeometry args={[0.12, 0.55, 0.06]} />
                <meshBasicMaterial color="#22d3ee" />
            </mesh>
            <mesh position={[0.18, -0.12, 0.23]} rotation={[0, 0, 0.75]}>
                <boxGeometry args={[0.12, 0.35, 0.06]} />
                <meshBasicMaterial color="#22d3ee" />
            </mesh>
        </group>
    );
}

function OrbitRings() {
    const group = useRef<THREE.Group>(null);

    useFrame((_, delta) => {
        if (group.current) {
            group.current.rotation.z += delta * 0.15;
            group.current.rotation.x += delta * 0.08;
        }
    });

    return (
        <group ref={group}>
            {[1.65, 1.9, 2.15].map((radius, index) => (
                <mesh key={radius} rotation={[1.1 + index * 0.25, 0.2, 0]}>
                    <torusGeometry args={[radius, 0.008, 8, 120]} />
                    <meshBasicMaterial
                        color={index === 1 ? "#22d3ee" : "#087caa"}
                        transparent
                        opacity={0.55}
                    />
                </mesh>
            ))}
        </group>
    );
}

function NetworkNodes() {
    const nodes = useMemo(
        () =>
            Array.from({ length: 28 }, (_, i) => {
                const angle = (i / 28) * Math.PI * 2;
                const radius = 2.4 + Math.sin(i * 2) * 0.25;

                return new THREE.Vector3(
                    Math.cos(angle) * radius,
                    Math.sin(angle) * radius,
                    Math.sin(i) * 0.6
                );
            }),
        []
    );

    return (
        <group>
            {nodes.map((position, index) => (
                <Float key={index} speed={1 + (index % 3) * 0.3}
                    floatIntensity={0.12}>
                    <mesh position={position}>
                        <sphereGeometry args={[0.035, 12, 12]} />
                        <meshBasicMaterial color="#22d3ee" />
                    </mesh>
                </Float>
            ))}
        </group>
    );
}

function DataParticles() {
    const particles = useMemo(
        () =>
            Array.from({ length: 180 }, () => ({
                position: [
                    (Math.random() - 0.5) * 9,
                    (Math.random() - 0.5) * 7,
                    (Math.random() - 0.5) * 4,
                ] as [number, number, number],
                size: Math.random() * 0.025 + 0.008,
            })),
        []
    );

    return (
        <group>
            {particles.map((particle, index) => (
                <mesh key={index} position={particle.position}>
                    <sphereGeometry args={[particle.size, 8, 8]} />
                    <meshBasicMaterial
                        color="#38bdf8"
                        transparent
                        opacity={0.65}
                    />
                </mesh>
            ))}
        </group>
    );
}

export default function AuthSecurityScene() {
    return (
        <div style={{ width: "100%", height: "100%", minHeight: 420 }}>
            <Canvas
                camera={{ position: [0, 0, 7], fov: 45 }}
                dpr={[1, 1.5]}
                gl={{ alpha: true, antialias: true }}
            >
                <ambientLight intensity={1.2} />
                <pointLight position={[3, 3, 4]} intensity={35} color="#22d3ee" />
                <pointLight position={[-3, -2, 3]} intensity={20} color="#087caa" />

                <Stars radius={35} depth={30} count={350} factor={2}
                    saturation={0} fade speed={0.5} />

                <Shield />
                <OrbitRings />
                <NetworkNodes />
                <DataParticles />
            </Canvas>
        </div>
    );
}
