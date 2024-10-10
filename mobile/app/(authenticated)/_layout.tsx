import { useQueryClient } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useEffect } from "react";
import "react-native-reanimated";
import { useAuth } from "~/hooks/useAuth";

export default function Layout() {
    const queryClient = useQueryClient();
    const { loadAuth } = useAuth();

    useEffect(() => {
        loadAuth(queryClient);
    }, []);

    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        />
    );
}
