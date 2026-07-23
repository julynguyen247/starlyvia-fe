import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  type ImageSourcePropType,
  type StyleProp,
  StyleSheet,
  type ViewStyle,
  View,
} from 'react-native';

import { useReducedMotion } from '../hooks/useReducedMotion';
import { useAppTheme } from '../context/ThemeContext';
import { radius, type ThemeColors } from '../theme/tokens';
import { useThemedStyles } from '../theme/useThemedStyles';

export type TravelSceneName =
  | 'welcome'
  | 'crew'
  | 'invitation'
  | 'itinerary'
  | 'place'
  | 'success'
  | 'launch'
  | 'world';

const sources: Record<TravelSceneName, ImageSourcePropType> = {
  welcome: require('../../assets/illustrations/welcome-adventure.png'),
  crew: require('../../assets/illustrations/travel-crew.png'),
  invitation: require('../../assets/illustrations/invitation-ticket.png'),
  itinerary: require('../../assets/illustrations/itinerary-route.png'),
  place: require('../../assets/illustrations/friendly-place.png'),
  success: require('../../assets/illustrations/travel-success.png'),
  launch: require('../../assets/illustrations/launch-mark.png'),
  world: require('../../assets/illustrations/travel-world-3d.png'),
};

type Props = {
  scene: TravelSceneName;
  size?: number;
  animated?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

export function TravelScene({
  scene,
  size = 148,
  animated = false,
  accessibilityLabel,
  style,
}: Props) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const reducedMotion = useReducedMotion();
  const reveal = useRef(new Animated.Value(1)).current;
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [scene]);

  useEffect(() => {
    if (!animated || reducedMotion !== false) {
      reveal.setValue(1);
      return;
    }

    reveal.setValue(0);
    const animation = Animated.timing(reveal, {
      duration: 280,
      toValue: 1,
      useNativeDriver: true,
    });
    animation.start();

    return () => animation.stop();
  }, [animated, reducedMotion, reveal, scene]);

  const accessibilityProps = accessibilityLabel
    ? { accessibilityLabel, accessible: true }
    : {
        accessibilityElementsHidden: true,
        accessible: false,
        importantForAccessibility: 'no-hide-descendants' as const,
      };

  return (
    <View
      {...accessibilityProps}
      style={[styles.container, { height: size, width: size }, style]}
    >
      {failed ? (
        <View style={styles.fallback}>
          <Ionicons color={colors.primary} name="sparkles" size={Math.max(26, size * 0.28)} />
        </View>
      ) : (
        <Animated.Image
          onError={() => setFailed(true)}
          resizeMode="contain"
          source={sources[scene]}
          style={[
            styles.image,
            {
              opacity: reveal,
              transform: [
                {
                  scale: reveal.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.88, 1],
                  }),
                },
              ],
            },
          ]}
        />
      )}
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  fallback: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderColor: colors.stickerOutline,
    borderRadius: radius.xl,
    borderWidth: 1,
    height: '72%',
    justifyContent: 'center',
    width: '72%',
  },
  image: { height: '100%', width: '100%' },
  });
}
