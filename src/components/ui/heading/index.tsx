import { tva } from '@gluestack-ui/nativewind-utils/tva';
import React from 'react';
import { Text, type TextProps } from 'react-native';

import { AppFonts } from '@/constants/theme';

const headingStyle = tva({
  base: 'text-history-text font-bold tracking-tight',
  variants: {
    size: {
      xs:   'text-xs leading-4',
      sm:   'text-sm leading-5',
      md:   'text-base leading-6',
      lg:   'text-lg leading-7',
      xl:   'text-xl leading-8',
      '2xl': 'text-2xl leading-9',
      '3xl': 'text-3xl leading-10',
      '4xl': 'text-[32px] leading-10',
      '5xl': 'text-5xl',
    },
  },
  defaultVariants: { size: 'lg' },
});

type HeadingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';

type HeadingProps = TextProps & {
  className?: string;
  size?: HeadingSize;
};

const Heading = React.forwardRef<React.ElementRef<typeof Text>, HeadingProps>(
  ({ className, size = 'lg', style, ...props }, ref) => (
    <Text
      ref={ref}
      className={headingStyle({ size, class: className })}
      style={[{ fontFamily: AppFonts.bodyExtraBold }, style]}
      {...props}
    />
  )
);
Heading.displayName = 'Heading';

export { Heading };
