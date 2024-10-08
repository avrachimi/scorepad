import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { QueryClient } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { AuthProvider, useAuth } from "~/hooks/useAuth";
import { DatabaseProvider } from "~/hooks/useDatabase";
import { Colors } from "~/lib/theme";

export default function RootLayout() {
    const queryClient = new QueryClient();

    return (
        <AuthProvider>
            <DatabaseProvider client={queryClient}>
                <StatusBar style="dark" />
                <GestureHandlerRootView style={{ flex: 1 }}>
                    <BottomSheetModalProvider>
                        <InitialLayout />
                    </BottomSheetModalProvider>
                </GestureHandlerRootView>
            </DatabaseProvider>
        </AuthProvider>
    );
}

function InitialLayout() {
    const router = useRouter();
    const { isLoaded, isSignedIn } = useAuth();
    const segments = useSegments();

    useEffect(() => {
        if (!isLoaded) return;

        const inAuthGroup = segments[0] === "(authenticated)";

        if (isSignedIn && !inAuthGroup) {
            router.replace("/(authenticated)/(tabs)/home");
        } else if (!isSignedIn) {
            router.replace("/");
        }
    }, [isSignedIn, isLoaded]);

    if (!isLoaded) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen
                name="index"
                options={{ headerShown: false, animation: "none" }}
            />
            <Stack.Screen
                name="(authenticated)"
                options={{ headerShown: false }}
            />
        </Stack>
    );
}
