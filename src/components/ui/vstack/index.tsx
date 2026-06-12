import React from 'react';
import { View, type ViewProps } from 'react-native';

const SPACE: Record<string, string> = {
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-3',
  lg: 'gap-4',
  xl: 'gap-6',
};

type VStackProps = ViewProps & {
  className?: string;
  space?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  reversed?: boolean;
};

const VStack = React.forwardRef<React.ElementRef<typeof View>, VStackProps>(
  ({ className, space, reversed, ...props }, ref) => (
    <View
      ref={ref}
      className={[
        space ? SPACE[space] : '',
        reversed ? 'flex-col-reverse' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  )
);
VStack.displayName = 'VStack';

export { VStack };
