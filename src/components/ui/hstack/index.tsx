import React from 'react';
import { View, type ViewProps } from 'react-native';

const SPACE: Record<string, string> = {
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-3',
  lg: 'gap-4',
  xl: 'gap-6',
};

type HStackProps = ViewProps & {
  className?: string;
  space?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  reversed?: boolean;
};

const HStack = React.forwardRef<React.ElementRef<typeof View>, HStackProps>(
  ({ className, space, reversed, ...props }, ref) => (
    <View
      ref={ref}
      className={[
        'flex-row items-center',
        space ? SPACE[space] : '',
        reversed ? 'flex-row-reverse' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  )
);
HStack.displayName = 'HStack';

export { HStack };
