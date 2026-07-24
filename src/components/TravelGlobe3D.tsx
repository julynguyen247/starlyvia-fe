import { Ionicons } from '@expo/vector-icons';
import { Canvas, useFrame } from '@react-three/fiber/native';
import { Component, type ReactNode, useEffect, useMemo, useRef } from 'react';
import { PanResponder, StyleSheet, View } from 'react-native';
import type { Group, MeshBasicMaterial, TextureLoader } from 'three';

import { useLanguage } from '../context/LanguageContext';
import { useAppTheme } from '../context/ThemeContext';
import { useReducedMotion } from '../hooks/useReducedMotion';
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

type RotationControl = {
  dragStart: number;
  dragging: boolean;
  target: number;
};

type RotationControlRef = {
  current: RotationControl;
};

const earthTextureAsset = require('../../assets/3d/earth-blue-marble.jpg') as number;

class SceneBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { failed: false };

  static getDerivedStateFromError(): BoundaryState {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function TexturedEarth() {
  const loader = useRef<TextureLoader>(null);
  const material = useRef<MeshBasicMaterial>(null);

  useEffect(() => {
    const loadedTexture = loader.current?.load(
      earthTextureAsset as unknown as string,
      (nextTexture) => {
        nextTexture.anisotropy = 4;
        nextTexture.colorSpace = 'srgb';
        nextTexture.needsUpdate = true;
        if (material.current) {
          material.current.map = nextTexture;
          material.current.needsUpdate = true;
        }
      },
    );

    return () => loadedTexture?.dispose();
  }, []);

  return (
    <group>
      <textureLoader attach="userData-earthTextureLoader" ref={loader} />
      <mesh>
        <sphereGeometry args={[1, 64, 48]} />
        <meshBasicMaterial ref={material} color="#ffffff" />
      </mesh>
    </group>
  );
}

function GlobeModel({
  active,
  allowMotion,
  rotationControl,
}: {
  active: boolean;
  allowMotion: boolean;
  rotationControl: RotationControlRef;
}) {
  const globe = useRef<Group>(null);
  const phase = useRef(0);

  useFrame((_, delta) => {
    const model = globe.current;
    if (!model) return;

    if (active && allowMotion && !rotationControl.current.dragging) {
      phase.current += delta * 0.42;
    }

    const idleSway = active && allowMotion && !rotationControl.current.dragging
      ? Math.sin(phase.current) * 0.12
      : 0;
    const target = rotationControl.current.target + idleSway;
    const easing = 1 - Math.exp(-delta * 14);
    model.rotation.y += (target - model.rotation.y) * easing;
  });

  return (
    <group
      ref={globe}
      rotation={[0, 0.35, 0]}
    >
      <TexturedEarth />
    </group>
  );
}

export function TravelGlobe3D({ active, size = 164 }: Props) {
  const { colors } = useAppTheme();
  const { t } = useLanguage();
  const reducedMotion = useReducedMotion();
  const allowMotion = reducedMotion === false;
  const rotationControl = useRef<RotationControl>({
    dragStart: 0.35,
    dragging: false,
    target: 0.35,
  });
  const panResponder = useMemo(
    () => PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => (
        active
        && Math.abs(gesture.dx) > 8
        && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.2
      ),
      onPanResponderGrant: () => {
        rotationControl.current.dragStart = rotationControl.current.target;
        rotationControl.current.dragging = true;
      },
      onPanResponderMove: (_, gesture) => {
        rotationControl.current.target = rotationControl.current.dragStart + gesture.dx * 0.012;
      },
      onPanResponderRelease: (_, gesture) => {
        rotationControl.current.target += gesture.vx * 0.35;
        rotationControl.current.dragging = false;
      },
      onPanResponderTerminate: () => {
        rotationControl.current.dragging = false;
      },
      onStartShouldSetPanResponder: () => false,
    }),
    [active],
  );
  const fallback = <TravelScene animated={false} scene="crew" size={size} />;

  return (
    <View
      accessibilityActions={[{ name: 'decrement' }, { name: 'increment' }]}
      accessibilityHint={t('globe.hint')}
      accessibilityLabel={t('globe.label')}
      accessibilityRole="adjustable"
      accessible
      onAccessibilityAction={({ nativeEvent }) => {
        const direction = nativeEvent.actionName === 'increment' ? 1 : -1;
        rotationControl.current.target += direction * (Math.PI / 3);
      }}
      style={[styles.container, { height: size, width: size }]}
      {...panResponder.panHandlers}
    >
      <SceneBoundary fallback={fallback}>
        <Canvas
          camera={{ far: 20, fov: 36, near: 0.1, position: [0, 0, 3.5] }}
          flat
          frameloop={active ? 'always' : 'demand'}
          gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
          onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
          pointerEvents="none"
          style={styles.canvas}
        >
          <GlobeModel
            active={active}
            allowMotion={allowMotion}
            rotationControl={rotationControl}
          />
        </Canvas>
      </SceneBoundary>
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        pointerEvents="none"
        style={[
          styles.dragHint,
          { backgroundColor: colors.primarySoft, borderColor: colors.primary },
        ]}
      >
        <Ionicons color={colors.primary} name="move-outline" size={15} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: { height: '100%', width: '100%' },
  container: { alignItems: 'center', justifyContent: 'center' },
  dragHint: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    bottom: 3,
    height: 24,
    justifyContent: 'center',
    position: 'absolute',
    right: 3,
    width: 30,
  },
});
