
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars } from "@react-three/drei";
import * as THREE from "three";

function PortalRings() {
    const group = useRef<THREE.Group>(null);

    useFrame((_, delta) => {
        if (group.current) {
            group.current.rotation.z += delta * 0.12;
            group.current.rotation.x = Math.sin(Date.now() * 0.0003) * 0.12;
        }
    });

    return (
        <group ref={group}>
            {[1.5, 1.75, 2, 2.25].map((radius, i) => (
                <mesh key={i} rotation={[0.15 * i, 0.2 * i, 0]}>
                    <torusGeometry args={[radius, i % 2 ? 0.012 : 0.025, 12, 120]} />
                    <meshBasicMaterial
                        color={i % 2 ? "#3b82f6" : "#22d3ee"}
                        transparent
                        opacity={0.75 - i * 0.1}
                    />
                </mesh>
            ))}
        </group>
    );
}

function PortalCore() {
    const core = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (core.current) {
            const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.06;
            core.current.scale.setScalar(pulse);
        }
    });

    return (
        <group>
            <mesh ref={core}>
                <circleGeometry args={[1.25, 64]} />
                <meshBasicMaterial
                    color="#075985"
                    transparent
                    opacity={0.16}
                    side={THREE.DoubleSide}
                />
            </mesh>

            <mesh>
                <ringGeometry args={[0.85, 0.92, 80]} />
                <meshBasicMaterial
                    color="#22d3ee"
                    transparent
                    opacity={0.8}
                    side={THREE.DoubleSide}
                />
            </mesh>

            <mesh position={[0, 0, 0.02]}>
                <ringGeometry args={[0.55, 0.57, 80]} />
                <meshBasicMaterial color="#60a5fa" />
            </mesh>

            <mesh position={[0, 0, 0.04]}>
                <circleGeometry args={[0.12, 32]} />
                <meshBasicMaterial color="#a5f3fc" />
            </mesh>
        </group>
    );
}

function EnergyParticles() {
    const points = useRef<THREE.Points>(null);

    const positions = useMemo(() => {
        const data = new Float32Array(450 * 3);

        for (let i = 0; i < 450; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 2.4 + Math.random() * 1.5;

            data[i * 3] = Math.cos(angle) * radius;
            data[i * 3 + 1] = Math.sin(angle) * radius;
            data[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
        }

        return data;
    }, []);

    useFrame((_, delta) => {
        if (points.current) {
            points.current.rotation.z += delta * 0.035;
        }
    });

    return (
        <points ref={points}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[positions, 3]}
                />
            </bufferGeometry>
            <pointsMaterial
                color="#67e8f9"
                size={0.025}
                transparent
                opacity={0.8}
                sizeAttenuation
            />
        </points>
    );
}

function EnergyArcs() {
    const arcs = useMemo(() => {
        return Array.from({ length: 8 }, (_, i) => ({
            rotation: (i / 8) * Math.PI * 2,
        }));
    }, []);

    return (
        <group>
            {arcs.map((arc, i) => (
                <Float key={i} speed={1 + i * 0.15} floatIntensity={0.15}>
                    <mesh
                        position={[
                            Math.cos(arc.rotation) * 2.55,
                            Math.sin(arc.rotation) * 2.55,
                            0,
                        ]}
                    >
                        <sphereGeometry args={[0.045, 16, 16]} />
                        <meshBasicMaterial
                            color={i % 2 ? "#3b82f6" : "#22d3ee"}
                        />
                    </mesh>
                </Float>
            ))}
        </group>
    );
}

export default function RegisterSecurityScene() {
    return (
        <Canvas
            camera={{ position: [0, 0, 8], fov: 45 }}
            gl={{ alpha: true, antialias: true }}
        >
            <ambientLight intensity={0.8} />
            <pointLight position={[3, 3, 4]} intensity={2} color="#22d3ee" />
            <pointLight position={[-3, -2, 3]} intensity={1.5} color="#2563eb" />

            <Stars
                radius={45}
                depth={35}
                count={500}
                factor={2}
                fade
                speed={0.4}
            />

            <group position={[0, 0, 0]}>
                <PortalRings />
                <PortalCore />
                <EnergyParticles />
                <EnergyArcs />
            </group>
        </Canvas>
    );
}
