import { AccessibilityInfo } from 'react-native';
import { useEffect, useState } from 'react';

export function useReducedMotion() {
  const [reducedMotionEnabled, setReducedMotionEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;

    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReducedMotionEnabled(enabled);
    });

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReducedMotionEnabled,
    );

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return reducedMotionEnabled;
}
