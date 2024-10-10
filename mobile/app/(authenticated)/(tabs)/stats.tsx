import { useHeaderHeight } from "@react-navigation/elements";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { RefreshControl } from "react-native-gesture-handler";
import Leaderboard from "~/components/Leaderboard";
import MatchHistoryBarChart from "~/components/MatchHistoryBarChart";
import MatchesPlayed from "~/components/MatchesPlayed";
import { useAuth } from "~/hooks/useAuth";
import { useDatabase } from "~/hooks/useDatabase";
import { Colors } from "~/lib/theme";
import { Stats } from "~/lib/types";

function Page() {
    const headerHeight = useHeaderHeight();
    const [refreshing] = useState(false);
    const { invalidateQueries, statsMatchesQuery } = useDatabase();
    const { accessToken } = useAuth();

    const {
        data: matchHistory,
        isLoading: loadingMatchHistory,
        refetch: refetchMatchHistory,
    } = useQuery({
        queryKey: ["statsMatchHistory"],
        queryFn: async () => {
            const res = await axios.get<Stats>(
                process.env.EXPO_PUBLIC_API_ENDPOINT + "/v1/stats",
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    params: {
                        type: "matches",
                    },
                }
            );
            return res.data.matches_by_month;
        },
    });

    useFocusEffect(
        useCallback(() => {
            statsMatchesQuery.refetch();
            refetchMatchHistory();
        }, [statsMatchesQuery.refetch, refetchMatchHistory])
    );

    return (
        <View
            style={{
                paddingTop: headerHeight + 50,
                width: "100%",
                justifyContent: "flex-start",
                alignItems: "center",
            }}
        >
            <Text style={styles.heading}>Stats</Text>
            {statsMatchesQuery.isLoading || loadingMatchHistory ? (
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
                    style={{
                        width: "100%",
                        height: "100%",
                        paddingVertical: 20,
                    }}
                    contentContainerStyle={{
                        justifyContent: "flex-start",
                        alignItems: "center",
                        gap: 20,
                    }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={async () =>
                                await invalidateQueries([
                                    "statsLeaderboard",
                                    "statsMatches",
                                ]).catch(console.error)
                            }
                        />
                    }
                >
                    <MatchesPlayed
                        matches={statsMatchesQuery.data?.total_matches}
                    />
                    <MatchHistoryBarChart matchHistory={matchHistory} />
                    <Leaderboard />
                </ScrollView>
            )}
        </View>
    );
}

export default Page;

const styles = StyleSheet.create({
    heading: {
        paddingHorizontal: 21,
        marginTop: 20,
        fontSize: 24,
        fontWeight: "bold",
        alignSelf: "flex-start",
    },
});
