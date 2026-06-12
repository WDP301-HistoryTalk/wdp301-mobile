import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { Image } from 'expo-image';
import React from 'react';
import { Text, View } from 'react-native';

const avatarStyle = tva({
  base: 'items-center justify-center rounded-full overflow-hidden bg-zinc-800',
  variants: {
    size: {
      xs:   'w-6 h-6',
      sm:   'w-8 h-8',
      md:   'w-10 h-10',
      lg:   'w-14 h-14',
      xl:   'w-20 h-20',
      '2xl': 'w-28 h-28',
    },
  },
  defaultVariants: { size: 'md' },
});

const avatarFallbackTextStyle = tva({
  base: 'text-zinc-100 font-bold text-center',
  variants: {
    size: {
      xs:   'text-[8px]',
      sm:   'text-xs',
      md:   'text-sm',
      lg:   'text-lg',
      xl:   'text-2xl',
      '2xl': 'text-3xl',
    },
  },
  defaultVariants: { size: 'md' },
});

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

type AvatarProps = React.ComponentProps<typeof View> & {
  className?: string;
  size?: AvatarSize;
};

type AvatarFallbackTextProps = React.ComponentProps<typeof Text> & {
  className?: string;
  size?: AvatarSize;
};

type AvatarImageProps = {
  src?: string | { uri: string } | null;
  alt?: string;
};

const Avatar = React.forwardRef<React.ElementRef<typeof View>, AvatarProps>(
  ({ className, size = 'md', ...props }, ref) => (
    <View
      ref={ref}
      className={avatarStyle({ size, class: className })}
      {...props}
    />
  )
);

const AvatarFallbackText = React.forwardRef<React.ElementRef<typeof Text>, AvatarFallbackTextProps>(
  ({ className, size = 'md', ...props }, ref) => (
    <Text
      ref={ref}
      className={avatarFallbackTextStyle({ size, class: className })}
      {...props}
    />
  )
);

const AvatarImage = ({ src, alt }: AvatarImageProps) => {
  if (!src) return null;
  return (
    <Image
      source={typeof src === 'string' ? { uri: src } : src}
      alt={alt}
      style={{ position: 'absolute', width: '100%', height: '100%' }}
      contentFit="cover"
    />
  );
};

Avatar.displayName             = 'Avatar';
AvatarFallbackText.displayName = 'AvatarFallbackText';
AvatarImage.displayName        = 'AvatarImage';

export { Avatar, AvatarFallbackText, AvatarImage };
