import { useSession } from '@/context/auth-context';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import React, { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

const RootNavigator = () => {
  const { isLoading } = useSession();

  const [loaded, error] = useFonts({
    'MartianGrotesk-NrBl': require('../assets/fonts/MartianGrotesk-NrBl.ttf'),
    'MartianGrotesk-StdBl': require('../assets/fonts/MartianGrotesk-StdBl.ttf'),
    'MartianGrotesk-StdRg': require('../assets/fonts/MartianGrotesk-StdRg.ttf'),
    'MartianGrotesk-StdMd': require('../assets/fonts/MartianGrotesk-StdMd.ttf'),
    'MartianGrotesk-StdxBd': require('../assets/fonts/MartianGrotesk-StdxBd.ttf'),
    'MartianGrotesk-sWdBl': require('../assets/fonts/MartianGrotesk-sWdBl.ttf'),
    Fontello: require('../assets/fontello/fontello.ttf'),
    Icomoon: require('../assets/icomoon/icomoon.ttf'),
  });

  useEffect(() => {
    if (loaded || error || isLoading) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error, isLoading]);

  if (!loaded && !error) {
    return null;
  }

  const { session } = useSession();
  const isAuthenticated = session !== null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Logged in
                when guard = false, pages are not accessible
                when guard = true, pages are accessible
            */}
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen
          name="/(locked)/(tabs)"
          options={{ animation: 'none' }}
        ></Stack.Screen>
      </Stack.Protected>

      {/* Logged out */}
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="index"></Stack.Screen>
      </Stack.Protected>
    </Stack>
  );
};

export default RootNavigator;
