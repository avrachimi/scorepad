import { Ionicons } from "@expo/vector-icons";
import { useHeaderHeight } from "@react-navigation/elements";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import { RefreshControl, TouchableOpacity } from "react-native-gesture-handler";
import Leaderboard from "~/components/Leaderboard";
import MatchesPlayed from "~/components/MatchesPlayed";
import RecentMatches from "~/components/RecentMatches";
import { useDatabase } from "~/hooks/useDatabase";
import { Colors, globalStyles } from "~/lib/theme";

function Page() {
    const headerHeight = useHeaderHeight();
    const [refreshing, setRefreshing] = useState(false);
    const { invalidateHomeScreenQueries } = useDatabase();

    return (
        <ScrollView
            contentContainerStyle={{
                paddingTop: headerHeight + 50,
                padding: 21,
                flex: 1,
                justifyContent: "flex-start",
                alignItems: "center",
                gap: 20,
            }}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={async () =>
                        await invalidateHomeScreenQueries().catch(console.error)
                    }
                />
            }
        >
            <View
                style={{
                    justifyContent: "center",
                    alignItems: "flex-end",
                    width: "100%",
                }}
            >
                <TouchableOpacity
                    style={{
                        backgroundColor: Colors.card_bg,
                        borderRadius: 3,
                        ...globalStyles.shadow,
                    }}
                >
                    <Ionicons name="add" size={28} color={Colors.primary} />
                </TouchableOpacity>
            </View>
            <MatchesPlayed />
            <RecentMatches />
            <Leaderboard />
        </ScrollView>
    );
}

export default Page;
