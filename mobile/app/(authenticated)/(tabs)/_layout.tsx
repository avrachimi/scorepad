import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Image } from "react-native";
import { useAuth } from "~/hooks/useAuth";
import { Colors } from "~/lib/theme";

export default function TabLayout() {
    const { user } = useAuth();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarIconStyle: {
                    color: Colors.error,
                },
                tabBarActiveTintColor: Colors.primary,
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: "Home",
                    tabBarIcon: ({ size, color }) => (
                        <Ionicons name="home" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="matches"
                options={{
                    title: "Matches",
                    tabBarIcon: ({ size, color }) => (
                        <Ionicons name="tennisball" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="stats"
                options={{
                    title: "Stats",
                    tabBarIcon: ({ size, color }) => (
                        <Ionicons name="bar-chart" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ size, color }) => {
                        if (user?.image_url) {
                            return (
                                <Image
                                    source={{ uri: user.image_url }}
                                    style={{
                                        width: size,
                                        height: size,
                                        borderRadius: size / 2,
                                        borderColor: color,
                                        borderWidth: 1,
                                    }}
                                />
                            );
                        }
                        return (
                            <Ionicons
                                name="person-circle"
                                size={size}
                                color={color}
                            />
                        );
                    },
                }}
            />
        </Tabs>
    );
}
