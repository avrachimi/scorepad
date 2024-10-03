import { Ionicons } from "@expo/vector-icons";
import { useHeaderHeight } from "@react-navigation/elements";
import dayjs from "dayjs";
import { useState } from "react";
import {
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useDatabase } from "~/hooks/useDatabase";
import { Colors, globalStyles } from "~/lib/theme";
import { formatDuration, formatName, getDayWithSuffix } from "~/util/format";

function Page() {
    const headerHeight = useHeaderHeight();
    const { allMatchesQuery, invalidateQueries } = useDatabase();
    const [refreshing, setRefreshing] = useState(false);

    return (
        <View
            style={{
                paddingTop: headerHeight + 50,
                width: "100%",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
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
                <Text style={styles.heading}>All Matches</Text>
                <TouchableOpacity>
                    <Ionicons name="add" size={30} color={Colors.primary} />
                </TouchableOpacity>
            </View>
            <FlatList
                scrollEnabled={true}
                horizontal={false}
                showsVerticalScrollIndicator={false}
                data={allMatchesQuery.data}
                keyExtractor={(item) => item.id}
                style={{ padding: 21 }}
                contentContainerStyle={{
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    width: "100%",
                    height: "100%",
                    gap: 25,
                }}
                renderItem={({ item }) => {
                    const day = dayjs(item.match_date).date();
                    const suffix = getDayWithSuffix(day);

                    return (
                        <View style={styles.matchCard}>
                            <View style={styles.matchCardTop}>
                                <View style={styles.dateRow}>
                                    <Text style={styles.textDate}>
                                        {dayjs(item.match_date).format(
                                            "dddd, MMMM "
                                        )}
                                        {day}
                                        <Text style={styles.superscript}>
                                            {suffix}
                                        </Text>
                                    </Text>
                                    <View style={styles.tagContainer}>
                                        <View style={styles.tag}>
                                            <Text style={styles.tagText}>
                                                {dayjs(item.match_date).format(
                                                    "h:mm A"
                                                )}
                                            </Text>
                                        </View>
                                        <View style={styles.tag}>
                                            <Text style={styles.tagText}>
                                                {formatDuration(
                                                    item.duration_minutes
                                                )}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                <View
                                    style={{
                                        flexDirection: "row",
                                        width: "100%",
                                        justifyContent: "space-around",
                                    }}
                                >
                                    <Text style={styles.textScore}>
                                        {item.team1_score}
                                    </Text>
                                    <Text style={styles.textScore}>
                                        {item.team2_score}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.matchCardBottom}>
                                <View style={styles.playerTextContainer}>
                                    <Text style={styles.textPlayer}>
                                        {formatName(item.team1_player1.name)}
                                    </Text>
                                    <Text style={styles.textPlayer}>
                                        {formatName(
                                            item.team1_player2?.name ?? "-"
                                        )}
                                    </Text>
                                </View>
                                <View
                                    style={{
                                        height: "80%",
                                        borderLeftWidth: 1,
                                        borderLeftColor: Colors.primary,
                                    }}
                                />
                                <View style={styles.playerTextContainer}>
                                    <Text style={styles.textPlayer}>
                                        {formatName(
                                            item.team2_player2?.name ?? "-"
                                        )}
                                    </Text>
                                    <Text style={styles.textPlayer}>
                                        {formatName(
                                            item.team2_player2?.name ?? "-"
                                        )}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    );
                }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={async () =>
                            await invalidateQueries(["allMatches"]).catch(
                                console.error
                            )
                        }
                    />
                }
            />
        </View>
    );
}

export default Page;

const styles = StyleSheet.create({
    heading: {
        fontSize: 24,
        fontWeight: "bold",
    },
    matchCard: {
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: Colors.card_bg,
        borderRadius: 10,
        gap: 2,
        ...globalStyles.shadow,
    },
    matchCardTop: {
        flexDirection: "column",
        alignItems: "center",
        padding: 5,
        width: "100%",
        gap: 10,
    },
    matchCardBottom: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 10,
        paddingHorizontal: 20,
        width: "100%",
        gap: 10,
    },
    textScore: {
        color: Colors.primary,
        fontSize: 38,
        fontWeight: "bold",
    },
    dateRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        paddingHorizontal: 5,
        paddingTop: 2,
    },
    textDate: {
        color: Colors.accent,
        fontSize: 13,
        fontWeight: "600",
    },
    tagContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 5,
    },
    tag: {
        backgroundColor: Colors.primary,
        color: "white",
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: 6,
    },
    tagText: {
        color: "white",
        fontSize: 11,
        fontWeight: "500",
    },
    superscript: {
        fontSize: 10,
        lineHeight: 16,
        verticalAlign: "top",
    },
    playerTextContainer: {
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
        width: "45%",
    },
    textPlayer: {
        color: Colors.primary,
        fontSize: 12,
        fontWeight: "600",
    },
});
