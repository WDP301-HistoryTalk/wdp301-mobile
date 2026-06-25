import React, { useEffect, useState } from 'react';
import { Animated, type ViewStyle } from 'react-native';

import { BORDER } from '@/constants/palette';

type SkeletonProps = {
  style?: ViewStyle;
  radius?: number;
};

const Skeleton = ({ radius = 12, style }: SkeletonProps) => {
  const [opacity] = useState(() => new Animated.Value(0.45));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 750, useNativeDriver: false }),
        Animated.timing(opacity, { toValue: 0.45, duration: 750, useNativeDriver: false }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[{ backgroundColor: BORDER, borderRadius: radius, opacity }, style]}
    />
  );
};
Skeleton.displayName = 'Skeleton';

export { Skeleton };
