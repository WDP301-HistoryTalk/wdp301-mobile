import React from 'react';
import { ActivityIndicator, type ActivityIndicatorProps } from 'react-native';

type SpinnerProps = ActivityIndicatorProps & {
  size?: 'small' | 'large';
  color?: string;
};

const Spinner = ({ size = 'small', color = '#EA580C', ...props }: SpinnerProps) => (
  <ActivityIndicator size={size} color={color} {...props} />
);
Spinner.displayName = 'Spinner';

export { Spinner };
