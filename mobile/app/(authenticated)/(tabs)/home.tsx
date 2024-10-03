import { Ionicons } from "@expo/vector-icons";
import { useHeaderHeight } from "@react-navigation/elements";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import { RefreshControl, TouchableOpacity } from "react-native-gesture-handler";
import Leaderboard from "~/components/Leaderboard";
import MatchesPlayed from "~/components/MatchesPlayed";
import RecentMatches from "~/components/RecentMatches";
import { useDatabase } from "~/hooks/useDatabase";
import { Colors } from "~/lib/theme";

function Page() {
    const headerHeight = useHeaderHeight();
    const [refreshing, setRefreshing] = useState(false);
    const { invalidateQueries } = useDatabase();

    return (
        <ScrollView
            scrollEnabled={true}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
                paddingTop: headerHeight + 50,
                width: "100%",
                justifyContent: "flex-start",
                alignItems: "center",
                gap: 20,
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
            <View
                style={{
                    marginTop: 10,
                    paddingHorizontal: 21,
                    justifyContent: "center",
                    alignItems: "flex-end",
                    width: "100%",
                }}
            >
                <TouchableOpacity>
                    <Ionicons name="add" size={30} color={Colors.primary} />
                </TouchableOpacity>
            </View>
            <MatchesPlayed />
            <RecentMatches />
            <Leaderboard />
        </ScrollView>
    );
}

export default Page;
