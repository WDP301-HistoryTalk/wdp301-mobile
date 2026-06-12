import { OverlayProvider } from '@gluestack-ui/overlay';
import { colorScheme as NWColorScheme, vars } from 'nativewind';
import React from 'react';
import { View } from 'react-native';

import { config } from './config';

type Mode = 'light' | 'dark' | 'system';

export function GluestackUIProvider({
  mode = 'light',
  children,
}: {
  mode?: Mode;
  children?: React.ReactNode;
}) {
  const resolved = mode === 'system' ? (NWColorScheme.get() ?? 'light') : mode;

  return (
    <View style={[{ flex: 1 }, vars(resolved === 'dark' ? config.dark : config.light)]}>
      <OverlayProvider>{children}</OverlayProvider>
    </View>
  );
}
