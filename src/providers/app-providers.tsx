import { QueryClientProvider } from '@tanstack/react-query';
import { DefaultTheme, ThemeProvider } from 'expo-router';
import type { PropsWithChildren } from 'react';

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { queryClient } from '@/lib/query-client';

// App mặc định dùng theme sáng, không theo system color scheme.
export function AppProviders({ children }: PropsWithChildren) {
  return (
    <GluestackUIProvider mode="light">
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={DefaultTheme}>{children}</ThemeProvider>
      </QueryClientProvider>
    </GluestackUIProvider>
  );
}
