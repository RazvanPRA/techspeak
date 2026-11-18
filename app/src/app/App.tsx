import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { createDependencies } from './dependencies';
import { SyncOnLaunch } from '@/features/sync';
import { FeatureProviders } from './FeatureProviders';
import { RootTabs } from './navigation/RootTabs';
import { createStore } from './store';

export function App() {
  const [store] = useState(createStore);
  const [deps] = useState(createDependencies);
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <FeatureProviders deps={deps}>
          <SyncOnLaunch />
          <NavigationContainer>
            <RootTabs />
          </NavigationContainer>
        </FeatureProviders>
      </SafeAreaProvider>
    </Provider>
  );
}
