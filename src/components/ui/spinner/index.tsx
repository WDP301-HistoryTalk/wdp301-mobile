import React from 'react';
import { ActivityIndicator, type ActivityIndicatorProps } from 'react-native';

import { ORANGE } from '@/constants/palette';

type SpinnerProps = ActivityIndicatorProps & {
  size?: 'small' | 'large';
  color?: string;
};

const Spinner = ({ size = 'small', color = ORANGE, ...props }: SpinnerProps) => (
  <ActivityIndicator size={size} color={color} {...props} />
);
Spinner.displayName = 'Spinner';

export { Spinner };
