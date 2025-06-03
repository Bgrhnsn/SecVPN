import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SettingsProvider } from './src/services/SettingsService';
import { ServerProvider } from './src/services/ServerService';
import { VpnProvider } from './src/services/VpnService.tsx';
import AppNavigator from './src/navigation/AppNavigator';

export default function App(): JSX.Element {
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <ServerProvider>
          <VpnProvider>
            <AppNavigator />
          </VpnProvider>
        </ServerProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
