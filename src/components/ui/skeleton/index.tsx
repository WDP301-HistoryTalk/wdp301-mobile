import React, { useEffect, useRef } from 'react';
import { Animated, type ViewStyle } from 'react-native';

type SkeletonProps = {
  style?: ViewStyle;
  radius?: number;
};

const Skeleton = ({ radius = 12, style }: SkeletonProps) => {
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 750, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.45, duration: 750, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[{ backgroundColor: '#27272a', borderRadius: radius, opacity }, style]}
    />
  );
};
Skeleton.displayName = 'Skeleton';

export { Skeleton };
