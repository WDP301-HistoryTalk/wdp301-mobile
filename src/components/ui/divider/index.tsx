import React from 'react';
import { View, type ViewProps } from 'react-native';

type DividerProps = ViewProps & {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
};

const Divider = React.forwardRef<React.ElementRef<typeof View>, DividerProps>(
  ({ className, orientation = 'horizontal', ...props }, ref) => (
    <View
      ref={ref}
      className={[
        'bg-zinc-800',
        orientation === 'horizontal' ? 'h-px w-full' : 'w-px h-full',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  )
);
Divider.displayName = 'Divider';

export { Divider };
