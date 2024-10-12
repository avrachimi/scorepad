import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useHeaderHeight } from "@react-navigation/elements";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Tabs, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useRef, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { RefreshControl, TouchableOpacity } from "react-native-gesture-handler";
import Leaderboard from "~/components/Leaderboard";
import MatchesPlayed from "~/components/MatchesPlayed";
import NewMatchModal from "~/components/modals/NewMatchModal";
import RecentMatches from "~/components/RecentMatches";
import { useAuth } from "~/hooks/useAuth";
import { useDatabase } from "~/hooks/useDatabase";
import { Colors, globalStyles } from "~/lib/theme";

function Page() {
    const headerHeight = useHeaderHeight();
    const [refreshing] = useState(false);

    const { signOut } = useAuth();

    const queryClient = useQueryClient();
    const { invalidateQueries, recentMatchesQuery, statsMatchesQuery } =
        useDatabase();
    const { data: recentMatches, isLoading: loadingRecentMatches } = useQuery({
        queryKey: ["recentMatches"],
        queryFn: recentMatchesQuery,
        refetchOnWindowFocus: "always",
    });
    const { data: matchStats } = useQuery({
        queryKey: ["statsMatches"],
        queryFn: statsMatchesQuery,
        refetchOnWindowFocus: "always",
    });

    const bottomSheetRef = useRef<BottomSheetModal>(null);

    const showBottomSheet = () => {
        bottomSheetRef.current?.present();
    };

    useFocusEffect(
        useCallback(() => {
            queryClient.refetchQueries({
                queryKey: ["recentMatches"],
            });
            queryClient.refetchQueries({
                queryKey: ["statsMatches"],
            });
        }, [queryClient])
    );

    return (
        <View
            style={{
                paddingTop: headerHeight + 50,
                width: "100%",
                height: "100%",
                justifyContent: "flex-start",
                alignItems: "center",
                gap: 20,
            }}
        >
            <StatusBar style="dark" />
            <View
                style={{
                    marginTop: 20,
                    paddingHorizontal: 21,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                }}
            >
                <Text
                    style={{
                        fontSize: 24,
                        fontWeight: "bold",
                    }}
                >
                    Home
                </Text>
                <TouchableOpacity onPress={showBottomSheet}>
                    <Ionicons name="add" size={30} color={Colors.primary} />
                </TouchableOpacity>
            </View>
            {!loadingRecentMatches &&
            (!recentMatches || recentMatches.length === 0) ? (
                <View
                    style={{
                        justifyContent: "space-between",
                        alignItems: "center",
                        width: "100%",
                        gap: 25,
                    }}
                >
                    <Tabs.Screen
                        options={{
                            tabBarStyle: {
                                display: "none",
                            },
                        }}
                    />
                    <View
                        style={{
                            justifyContent: "center",
                            alignItems: "center",
                            height: "75%",
                            width: "100%",
                            gap: 25,
                        }}
                    >
                        <View
                            style={{
                                justifyContent: "center",
                                alignItems: "center",
                                gap: 5,
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 18,
                                    textAlign: "center",
                                }}
                            >
                                No matches found.
                            </Text>
                            <Text>Create new match to get started.</Text>
                        </View>
                        <TouchableOpacity
                            style={globalStyles.btnPrimary}
                            onPress={showBottomSheet}
                        >
                            <Text style={globalStyles.btnPrimaryText}>
                                Create match
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        style={globalStyles.btnSecondary}
                        onPress={signOut}
                    >
                        <Text style={globalStyles.btnSecondaryText}>
                            Sign Out
                        </Text>
                    </TouchableOpacity>
                </View>
            ) : loadingRecentMatches ? (
                <View
                    style={{
                        justifyContent: "center",
                        alignItems: "center",
                        height: "70%",
                        width: "100%",
                    }}
                >
                    <ActivityIndicator size={"large"} color={Colors.primary} />
                </View>
            ) : (
                <ScrollView
                    scrollEnabled={true}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        width: "100%",
                        justifyContent: "flex-start",
                        alignItems: "center",
                        gap: 20,
                        paddingBottom: 50,
                    }}
                    style={{
                        width: "100%",
                    }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={async () =>
                                await invalidateQueries([
                                    "recentMatches",
                                    "statsLeaderboard",
                                    "statsMatches",
                                ]).catch(console.error)
                            }
                        />
                    }
                >
                    <Tabs.Screen
                        options={{
                            tabBarStyle: {
                                display: "flex",
                            },
                        }}
                    />
                    <MatchesPlayed matches={matchStats?.total_matches} />
                    <RecentMatches matches={recentMatches} />
                    <Leaderboard />
                </ScrollView>
            )}
            <NewMatchModal bottomSheetRef={bottomSheetRef} />
        </View>
    );
}

export default Page;
