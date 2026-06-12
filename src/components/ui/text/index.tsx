import { tva } from '@gluestack-ui/nativewind-utils/tva';
import React from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

const textStyle = tva({
  base: 'text-zinc-50',
  variants: {
    size: {
      '2xs': 'text-[10px] leading-[14px]',
      xs:    'text-xs leading-4',
      sm:    'text-sm leading-5',
      md:    'text-base leading-6',
      lg:    'text-lg leading-7',
      xl:    'text-xl leading-8',
      '2xl': 'text-2xl leading-9',
    },
    bold: {
      true: 'font-bold',
    },
    italic: {
      true: 'italic',
    },
    muted: {
      true: 'text-zinc-400',
    },
  },
  defaultVariants: { size: 'md' },
});

type TextSize = '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

type TextProps = RNTextProps & {
  className?: string;
  size?: TextSize;
  bold?: true;
  italic?: true;
  muted?: true;
};

const Text = React.forwardRef<React.ElementRef<typeof RNText>, TextProps>(
  ({ className, size = 'md', bold, italic, muted, ...props }, ref) => (
    <RNText
      ref={ref}
      className={textStyle({ size, bold, italic, muted, class: className })}
      {...props}
    />
  )
);
Text.displayName = 'Text';

export { Text };
