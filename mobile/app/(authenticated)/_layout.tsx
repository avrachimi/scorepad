import { Stack } from "expo-router";
import { useEffect } from "react";
import "react-native-reanimated";
import { useAuth } from "~/hooks/useAuth";

export default function Layout() {
    const { loadAuth } = useAuth();

    useEffect(() => {
        loadAuth();
    }, []);

    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        />
    );
}
