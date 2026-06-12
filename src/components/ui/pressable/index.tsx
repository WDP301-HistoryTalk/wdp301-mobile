import React from 'react';
import { Pressable as RNPressable } from 'react-native';

type PressableProps = React.ComponentProps<typeof RNPressable> & { className?: string };

const Pressable = React.forwardRef<React.ElementRef<typeof RNPressable>, PressableProps>(
  ({ className, ...props }, ref) => (
    <RNPressable ref={ref} className={className} {...props} />
  )
);
Pressable.displayName = 'Pressable';

export { Pressable };
