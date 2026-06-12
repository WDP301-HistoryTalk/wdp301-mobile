import { tva } from '@gluestack-ui/nativewind-utils/tva';
import React from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';

const buttonStyle = tva({
  base: 'flex-row items-center justify-center rounded-2xl gap-2',
  variants: {
    variant: {
      solid:   '',
      outline: 'bg-transparent border',
      link:    'bg-transparent rounded-none',
    },
    action: {
      primary:   'bg-primary-500',
      secondary: 'bg-zinc-800',
      positive:  'bg-green-700',
      negative:  'bg-red-700',
      default:   'bg-zinc-700',
    },
    size: {
      xs: 'px-3 h-8',
      sm: 'px-4 h-10',
      md: 'px-5 h-12',
      lg: 'px-6 h-14',
      xl: 'px-8 h-16',
    },
    isDisabled: {
      true: 'opacity-50',
    },
  },
  compoundVariants: [
    { variant: 'outline', action: 'primary',   class: 'border-primary-500' },
    { variant: 'outline', action: 'secondary', class: 'border-zinc-600' },
    { variant: 'outline', action: 'positive',  class: 'border-green-600' },
    { variant: 'outline', action: 'negative',  class: 'border-red-600' },
    { variant: 'outline', action: 'default',   class: 'border-zinc-600' },
  ],
  defaultVariants: { variant: 'solid', action: 'primary', size: 'md' },
});

const buttonTextStyle = tva({
  base: 'font-semibold',
  variants: {
    variant: {
      solid:   'text-white',
      outline: '',
      link:    '',
    },
    action: {
      primary:   'text-white',
      secondary: 'text-zinc-100',
      positive:  'text-white',
      negative:  'text-white',
      default:   'text-white',
    },
    size: {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-base',
      xl: 'text-lg',
    },
  },
  compoundVariants: [
    { variant: 'outline', action: 'primary',   class: 'text-primary-500' },
    { variant: 'outline', action: 'secondary', class: 'text-zinc-300' },
    { variant: 'outline', action: 'positive',  class: 'text-green-400' },
    { variant: 'outline', action: 'negative',  class: 'text-red-400' },
    { variant: 'link',    action: 'primary',   class: 'text-primary-500' },
  ],
  defaultVariants: { variant: 'solid', action: 'primary', size: 'md' },
});

type ButtonVariant = 'solid' | 'outline' | 'link';
type ButtonAction  = 'primary' | 'secondary' | 'positive' | 'negative' | 'default';
type ButtonSize    = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

type ButtonProps = React.ComponentProps<typeof Pressable> & {
  className?: string;
  variant?: ButtonVariant;
  action?: ButtonAction;
  size?: ButtonSize;
  isDisabled?: boolean;
};

type ButtonTextProps = React.ComponentProps<typeof Text> & {
  className?: string;
  variant?: ButtonVariant;
  action?: ButtonAction;
  size?: ButtonSize;
};

type ButtonIconProps = {
  as: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  size?: number;
  color?: string;
};

const Button = React.forwardRef<React.ElementRef<typeof Pressable>, ButtonProps>(
  ({ className, variant = 'solid', action = 'primary', size = 'md', isDisabled, ...props }, ref) => (
    <Pressable
      ref={ref}
      disabled={isDisabled}
      className={buttonStyle({ variant, action, size, isDisabled, class: className })}
      {...props}
    />
  )
);

const ButtonText = React.forwardRef<React.ElementRef<typeof Text>, ButtonTextProps>(
  ({ className, variant = 'solid', action = 'primary', size = 'md', ...props }, ref) => (
    <Text
      ref={ref}
      className={buttonTextStyle({ variant, action, size, class: className })}
      {...props}
    />
  )
);

const ButtonIcon = ({ as: Icon, size = 18, color = '#ffffff' }: ButtonIconProps) => (
  <Icon size={size} color={color} />
);

const ButtonSpinner = ({ color = '#ffffff' }: { color?: string }) => (
  <ActivityIndicator size="small" color={color} />
);

Button.displayName       = 'Button';
ButtonText.displayName   = 'ButtonText';
ButtonIcon.displayName   = 'ButtonIcon';
ButtonSpinner.displayName = 'ButtonSpinner';

export { Button, ButtonIcon, ButtonSpinner, ButtonText };
