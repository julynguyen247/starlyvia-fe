import { Canvas, useFrame } from '@react-three/fiber/native';
import { Component, type ReactNode, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import type { Group } from 'three';

import { useAppTheme } from '../context/ThemeContext';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { stickerPalette } from '../theme/tokens';
import { TravelScene } from './TravelScene';

type Props = {
  active: boolean;
  size?: number;
};

type BoundaryProps = {
  children: ReactNode;
  fallback: ReactNode;
};

type BoundaryState = {
  failed: boolean;
};

type GlobePalette = {
  globe: string;
  ink: string;
  land: string;
};

class SceneBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { failed: false };

  static getDerivedStateFromError(): BoundaryState {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function RouteDots({ color }: { color: string }) {
  const positions = useMemo<[number, number, number][]>(
    () => [
      [-0.48, 0.2, 0.88],
      [-0.28, 0.34, 0.91],
      [-0.06, 0.43, 0.93],
      [0.18, 0.47, 0.91],
      [0.4, 0.41, 0.88],
      [0.58, 0.27, 0.84],
    ],
    [],
  );

  return positions.map((position, index) => (
    <mesh key={`${position.join(':')}:${index}`} position={position}>
      <sphereGeometry args={[0.035, 8, 8]} />
      <meshStandardMaterial color={color} roughness={0.68} />
    </mesh>
  ));
}

function LocationPin({ ink }: { ink: string }) {
  return (
    <group position={[-0.62, 0.02, 0.94]} rotation={[0.05, 0, -0.28]}>
      <mesh position={[0, 0.07, 0]}>
        <sphereGeometry args={[0.13, 16, 12]} />
        <meshStandardMaterial color={stickerPalette.green} roughness={0.72} />
      </mesh>
      <mesh position={[0, -0.09, 0]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.085, 0.25, 16]} />
        <meshStandardMaterial color={stickerPalette.green} roughness={0.72} />
      </mesh>
      <mesh position={[0, 0.075, 0.115]}>
        <sphereGeometry args={[0.043, 12, 8]} />
        <meshStandardMaterial color={ink} roughness={0.68} />
      </mesh>
    </group>
  );
}

function PaperPlane() {
  const vertices = useMemo(
    () => new Float32Array([
      0.32, 0, 0,
      -0.24, 0.19, 0,
      -0.08, 0.02, 0.04,
      0.32, 0, 0,
      -0.08, 0.02, 0.04,
      -0.28, -0.13, 0,
    ]),
    [],
  );

  return (
    <mesh position={[0.82, 0.68, 0.54]} rotation={[0.18, -0.22, -0.3]}>
      <bufferGeometry>
        <bufferAttribute args={[vertices, 3]} attach="attributes-position" />
      </bufferGeometry>
      <meshBasicMaterial color={stickerPalette.coral} side={2} />
    </mesh>
  );
}

function Suitcase({ ink, land }: Pick<GlobePalette, 'ink' | 'land'>) {
  return (
    <group position={[0.72, -0.66, 0.83]} rotation={[0.04, -0.18, -0.04]}>
      <mesh>
        <boxGeometry args={[0.52, 0.4, 0.22]} />
        <meshStandardMaterial color={land} roughness={0.76} />
      </mesh>
      <mesh position={[-0.15, 0, 0.13]}>
        <boxGeometry args={[0.055, 0.42, 0.03]} />
        <meshStandardMaterial color={ink} roughness={0.7} />
      </mesh>
      <mesh position={[0.15, 0, 0.13]}>
        <boxGeometry args={[0.055, 0.42, 0.03]} />
        <meshStandardMaterial color={ink} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.25, 0]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.11, 0.025, 8, 18, Math.PI]} />
        <meshStandardMaterial color={ink} roughness={0.7} />
      </mesh>
      <mesh position={[0, -0.02, 0.14]}>
        <cylinderGeometry args={[0.045, 0.045, 0.018, 16]} />
        <meshStandardMaterial color={stickerPalette.yellow} roughness={0.7} />
      </mesh>
    </group>
  );
}

function GlobeModel({
  active,
  allowMotion,
  palette,
}: {
  active: boolean;
  allowMotion: boolean;
  palette: GlobePalette;
}) {
  const globe = useRef<Group>(null);

  useFrame((_, delta) => {
    const model = globe.current;
    if (!model) return;

    if (active && allowMotion) model.rotation.y += delta * 0.22;
  });

  return (
    <group
      ref={globe}
      rotation={[-0.1, 0.35, 0]}
      scale={0.92}
    >
      <mesh>
        <sphereGeometry args={[0.9, 32, 24]} />
        <meshStandardMaterial color={palette.globe} roughness={0.78} />
      </mesh>

      <mesh position={[-0.32, 0.35, 0.84]} rotation={[0.1, 0.1, -0.38]} scale={[1.35, 0.55, 0.35]}>
        <sphereGeometry args={[0.28, 14, 10]} />
        <meshStandardMaterial color={palette.land} roughness={0.82} />
      </mesh>
      <mesh position={[0.42, -0.15, 0.82]} rotation={[-0.08, -0.12, 0.3]} scale={[0.72, 1.25, 0.32]}>
        <sphereGeometry args={[0.25, 14, 10]} />
        <meshStandardMaterial color={palette.land} roughness={0.82} />
      </mesh>
      <mesh position={[0.46, 0.47, 0.73]} rotation={[0.2, 0, -0.3]} scale={[1.05, 0.5, 0.3]}>
        <sphereGeometry args={[0.2, 14, 10]} />
        <meshStandardMaterial color={palette.land} roughness={0.82} />
      </mesh>

      <mesh rotation={[1.08, 0.18, -0.2]}>
        <torusGeometry args={[1.08, 0.022, 8, 56]} />
        <meshStandardMaterial color={palette.ink} roughness={0.7} />
      </mesh>
      <RouteDots color={palette.ink} />
      <LocationPin ink={palette.ink} />
      <PaperPlane />
      <Suitcase ink={palette.ink} land={palette.land} />
    </group>
  );
}

export function TravelGlobe3D({ active, size = 164 }: Props) {
  const { colors } = useAppTheme();
  const reducedMotion = useReducedMotion();
  const allowMotion = reducedMotion === false;
  const fallback = <TravelScene animated={false} scene="crew" size={size} />;
  const palette: GlobePalette = {
    globe: stickerPalette.violet,
    ink: colors.primary,
    land: colors.surface,
  };

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={[styles.container, { height: size, width: size }]}
    >
      <SceneBoundary fallback={fallback}>
        <Canvas
          camera={{ far: 20, fov: 36, near: 0.1, position: [0, 0, 4.2] }}
          flat
          frameloop={active && allowMotion ? 'always' : 'demand'}
          gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
          onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
          style={styles.canvas}
        >
          <ambientLight intensity={1.8} />
          <directionalLight intensity={3.2} position={[3, 4, 5]} />
          <directionalLight color={stickerPalette.violet} intensity={1.1} position={[-3, -1, 2]} />
          <GlobeModel active={active} allowMotion={allowMotion} palette={palette} />
        </Canvas>
      </SceneBoundary>
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: { flex: 1 },
  container: { alignItems: 'center', justifyContent: 'center' },
});
