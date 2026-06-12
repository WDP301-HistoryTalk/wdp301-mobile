import { tva } from '@gluestack-ui/nativewind-utils/tva';
import React from 'react';
import { Text, View } from 'react-native';

const badgeStyle = tva({
  base: 'flex-row items-center self-start rounded-full border',
  variants: {
    action: {
      error:   'bg-red-900/30 border-red-800/40',
      warning: 'bg-yellow-900/30 border-yellow-800/40',
      success: 'bg-green-900/30 border-green-800/40',
      info:    'bg-blue-900/30 border-blue-800/40',
      muted:   'bg-zinc-800 border-zinc-700/50',
    },
    size: {
      sm: 'px-2 py-0.5',
      md: 'px-3 py-1',
      lg: 'px-4 py-1.5',
    },
  },
  defaultVariants: { action: 'muted', size: 'sm' },
});

const badgeTextStyle = tva({
  base: 'font-semibold tracking-wide',
  variants: {
    action: {
      error:   'text-red-400',
      warning: 'text-yellow-400',
      success: 'text-green-400',
      info:    'text-blue-400',
      muted:   'text-zinc-300',
    },
    size: {
      sm: 'text-[9px]',
      md: 'text-xs',
      lg: 'text-sm',
    },
  },
  defaultVariants: { action: 'muted', size: 'sm' },
});

type BadgeAction = 'error' | 'warning' | 'success' | 'info' | 'muted';
type BadgeSize   = 'sm' | 'md' | 'lg';

type BadgeProps = React.ComponentProps<typeof View> & {
  className?: string;
  action?: BadgeAction;
  size?: BadgeSize;
};

type BadgeTextProps = React.ComponentProps<typeof Text> & {
  className?: string;
  action?: BadgeAction;
  size?: BadgeSize;
};

const Badge = React.forwardRef<React.ElementRef<typeof View>, BadgeProps>(
  ({ className, action = 'muted', size = 'sm', ...props }, ref) => (
    <View
      ref={ref}
      className={badgeStyle({ action, size, class: className })}
      {...props}
    />
  )
);

const BadgeText = React.forwardRef<React.ElementRef<typeof Text>, BadgeTextProps>(
  ({ className, action = 'muted', size = 'sm', ...props }, ref) => (
    <Text
      ref={ref}
      className={badgeTextStyle({ action, size, class: className })}
      {...props}
    />
  )
);

Badge.displayName   = 'Badge';
BadgeText.displayName = 'BadgeText';

export { Badge, BadgeText };
