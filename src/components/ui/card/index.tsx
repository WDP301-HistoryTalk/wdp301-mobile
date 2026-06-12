import { tva } from '@gluestack-ui/nativewind-utils/tva';
import React from 'react';
import { View, type ViewProps } from 'react-native';

const cardStyle = tva({
  base: 'bg-zinc-900 rounded-2xl border border-zinc-800',
  variants: {
    size: {
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-5',
    },
    variant: {
      elevated: 'shadow',
      outline:  'bg-transparent',
      ghost:    'bg-transparent border-transparent',
      filled:   'bg-zinc-900',
    },
  },
  defaultVariants: { size: 'md', variant: 'filled' },
});

type CardProps = ViewProps & {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'elevated' | 'outline' | 'ghost' | 'filled';
};

const Card = React.forwardRef<React.ElementRef<typeof View>, CardProps>(
  ({ className, size = 'md', variant = 'filled', ...props }, ref) => (
    <View
      ref={ref}
      className={cardStyle({ size, variant, class: className })}
      {...props}
    />
  )
);
Card.displayName = 'Card';

export { Card };
