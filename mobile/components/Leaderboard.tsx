import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useQuery } from "@tanstack/react-query";
import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useAuth } from "~/hooks/useAuth";
import { useDatabase } from "~/hooks/useDatabase";
import { Colors, globalStyles } from "~/lib/theme";
import UserProfileModal from "./modals/UserProfileModal";

function Leaderboard() {
    const { user } = useAuth();

    const { statsLeaderboardQuery } = useDatabase();
    const { data: stats, refetch: refetchLeaderboard } = useQuery({
        queryKey: ["statsLeaderboard"],
        queryFn: statsLeaderboardQuery,
        refetchOnWindowFocus: "always",
    });

    useFocusEffect(
        useCallback(() => {
            refetchLeaderboard();
        }, [refetchLeaderboard])
    );

    const [selectedUserId, setSelectedUserId] = useState<string>();
    const userProfileModalRef = useRef<BottomSheetModal>(null);

    if (!stats || !stats.leaderboard || stats?.leaderboard.length === 0) {
        return null;
    }

    const openProfile = (userId: string) => {
        setSelectedUserId(userId);
        if (userId) userProfileModalRef.current?.present();
    };

    return (
        <View style={styles.container}>
            <Text
                style={[globalStyles.subHeading, { alignSelf: "flex-start" }]}
            >
                Leaderboard
            </Text>
            <View style={styles.table}>
                <View style={styles.tableRow}>
                    <View
                        style={[
                            styles.cell,
                            {
                                flex: 1,
                                opacity: 0.75,
                            },
                        ]}
                    >
                        <Text style={styles.leaderboardRank}>#</Text>
                    </View>
                    <View style={[styles.cell, { flex: 3, opacity: 0.75 }]}>
                        <Text style={styles.leaderboardName}>Name</Text>
                    </View>
                    <View style={styles.cell}>
                        <Text
                            style={[
                                styles.leaderboardMatches,
                                { opacity: 0.75 },
                            ]}
                        >
                            Matches Won
                        </Text>
                    </View>
                    <View style={styles.cell}>
                        <Text
                            style={[
                                styles.leaderboardWinRate,
                                { opacity: 0.9 },
                            ]}
                        >
                            Win Rate
                        </Text>
                    </View>
                </View>
                <FlatList
                    scrollEnabled={false}
                    data={stats.leaderboard}
                    keyExtractor={(item) => item.id}
                    style={{ width: "100%", padding: 5 }}
                    renderItem={({ item, index }) => {
                        return (
                            <View style={styles.tableRow}>
                                <View style={[styles.cell, { flex: 1 }]}>
                                    <Text style={styles.leaderboardRank}>
                                        {index + 1}
                                    </Text>
                                </View>
                                <View style={[styles.cell, { flex: 3 }]}>
                                    <View
                                        style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            gap: 5,
                                        }}
                                    >
                                        {item.image_url ? (
                                            <Image
                                                style={{
                                                    width: 20,
                                                    height: 20,
                                                    borderRadius: 100,
                                                    borderWidth: 1,
                                                    borderColor: Colors.primary,
                                                }}
                                                src={item.image_url}
                                            />
                                        ) : (
                                            <Ionicons
                                                name="person-circle"
                                                size={20}
                                                color={Colors.primary}
                                            />
                                        )}
                                        <TouchableOpacity
                                            disabled={item.id === user?.id}
                                            onPress={() => openProfile(item.id)}
                                        >
                                            <Text
                                                style={styles.leaderboardName}
                                            >
                                                {item.name}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View
                                    style={[
                                        styles.cell,
                                        { alignSelf: "center" },
                                    ]}
                                >
                                    <Text style={styles.leaderboardMatches}>
                                        {item.wins}
                                    </Text>
                                </View>
                                <View style={styles.cell}>
                                    <Text style={styles.leaderboardWinRate}>
                                        {(
                                            item.win_percentage * 100
                                        ).toLocaleString("en-US", {
                                            maximumFractionDigits: 1,
                                        })}
                                        %
                                    </Text>
                                </View>
                            </View>
                        );
                    }}
                />
            </View>
            <UserProfileModal
                ref={userProfileModalRef}
                userId={selectedUserId}
            />
        </View>
    );
}

export default Leaderboard;

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 21,
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        gap: 10,
    },
    tableRow: {
        flexDirection: "row",
        padding: 10,
    },
    leaderboardRank: {
        textAlign: "left",
        fontSize: 12,
        fontWeight: "semibold",
        opacity: 0.45,
    },
    leaderboardName: {
        textAlign: "left",
        fontSize: 12,
        fontWeight: "semibold",
    },
    leaderboardMatches: {
        width: "100%",
        alignSelf: "center",
        textAlign: "center",
        flex: 1,
        fontSize: 12,
        opacity: 0.6,
    },
    leaderboardWinRate: {
        alignSelf: "flex-end",
        textAlign: "right",
        fontSize: 12,
        fontWeight: "bold",
        color: Colors.primary,
    },
    cell: {
        flex: 2,
        justifyContent: "center",
        alignItems: "flex-start",
    },
    table: {
        width: "100%",
        padding: 5,
        backgroundColor: Colors.card_bg,
        borderRadius: 10,
        ...globalStyles.shadow,
    },
});
