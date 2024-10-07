import { useHeaderHeight } from "@react-navigation/elements";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { RefreshControl } from "react-native-gesture-handler";
import Leaderboard from "~/components/Leaderboard";
import MatchHistoryBarChart from "~/components/MatchHistoryBarChart";
import MatchesPlayed from "~/components/MatchesPlayed";
import { useDatabase } from "~/hooks/useDatabase";

function Page() {
    const headerHeight = useHeaderHeight();
    const [refreshing, setRefreshing] = useState(false);
    const { invalidateQueries } = useDatabase();

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
                <MatchesPlayed />
                <MatchHistoryBarChart />
                <Leaderboard />
            </ScrollView>
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
