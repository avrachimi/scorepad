import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useHeaderHeight } from "@react-navigation/elements";
import { StatusBar } from "expo-status-bar";
import { useRef, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { RefreshControl, TouchableOpacity } from "react-native-gesture-handler";
import Leaderboard from "~/components/Leaderboard";
import MatchesPlayed from "~/components/MatchesPlayed";
import NewMatchModal from "~/components/modals/NewMatchModal";
import RecentMatches from "~/components/RecentMatches";
import { useDatabase } from "~/hooks/useDatabase";
import { Colors } from "~/lib/theme";

function Page() {
    const headerHeight = useHeaderHeight();
    const [refreshing] = useState(false);
    const { invalidateQueries } = useDatabase();
    const bottomSheetRef = useRef<BottomSheetModal>(null);

    const showBottomSheet = () => {
        bottomSheetRef.current?.present();
    };

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
                <MatchesPlayed />
                <RecentMatches />
                <Leaderboard />
                <NewMatchModal bottomSheetRef={bottomSheetRef} />
            </ScrollView>
        </View>
    );
}

export default Page;
