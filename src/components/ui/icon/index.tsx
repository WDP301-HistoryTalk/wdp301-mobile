import React from 'react';

type IconProps = {
  as: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number; className?: string }>;
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
};

const Icon = ({ as: IconComponent, size = 16, color, strokeWidth = 1.75, ...props }: IconProps) => (
  <IconComponent size={size} color={color} strokeWidth={strokeWidth} {...props} />
);
Icon.displayName = 'Icon';

export { Icon };
