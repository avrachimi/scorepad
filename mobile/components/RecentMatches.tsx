import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { useDatabase } from "~/hooks/useDatabase";
import { Colors, globalStyles } from "~/lib/theme";
import { getDayWithSuffix } from "~/util/format";

function RecentMatches() {
    const router = useRouter();
    const { recentMatchesQuery } = useDatabase();

    useFocusEffect(
        useCallback(() => {
            recentMatchesQuery.refetch();
        }, [recentMatchesQuery.refetch])
    );

    return (
        <View style={styles.container}>
            <Text style={[globalStyles.subHeading, { paddingLeft: 21 }]}>
                Recent Matches
            </Text>
            <FlatList
                showsHorizontalScrollIndicator={false}
                horizontal={true}
                scrollEnabled={true}
                data={recentMatchesQuery.data}
                keyExtractor={(item) => item.id}
                style={{ maxHeight: 120 }}
                contentContainerStyle={{
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    marginLeft: 10,
                    paddingRight: 31,
                    padding: 5,
                    gap: 5,
                }}
                renderItem={({ item }) => {
                    const day = dayjs(item.match_date).date();
                    const suffix = getDayWithSuffix(day);
                    const players = [
                        item.team1_player1,
                        item.team1_player2,
                        item.team2_player1,
                        item.team2_player2,
                    ].filter(
                        (item): item is NonNullable<typeof item> => item != null
                    );

                    return (
                        <TouchableOpacity
                            style={styles.matchCard}
                            onPress={() =>
                                router.push(`/(authenticated)/match/${item.id}`)
                            }
                        >
                            <Svg
                                height="100%"
                                width="100%"
                                style={{
                                    position: "absolute",
                                    width: "100%",
                                    height: "100%",
                                }}
                            >
                                <Defs>
                                    <LinearGradient
                                        id="grad"
                                        x1="50%"
                                        y1="0"
                                        x2="50%"
                                        y2="100%"
                                    >
                                        <Stop
                                            offset="0%"
                                            stopColor={Colors.primary}
                                            stopOpacity="1"
                                        />
                                        <Stop
                                            offset="100%"
                                            stopColor={Colors.secondary}
                                            stopOpacity="1"
                                        />
                                    </LinearGradient>
                                </Defs>
                                <Rect
                                    width="100%"
                                    height="100%"
                                    rx={10}
                                    ry={10}
                                    fill="url(#grad)"
                                />
                            </Svg>
                            <View style={styles.matchCardTop}>
                                <View style={styles.dateContainer}>
                                    <Text style={styles.textDate}>
                                        {dayjs(item.match_date).format(
                                            "ddd, MMM "
                                        )}
                                        {day}
                                        <Text style={styles.superscript}>
                                            {suffix}
                                        </Text>
                                    </Text>
                                </View>
                                <View
                                    style={{
                                        flexDirection: "row",
                                        width: "100%",
                                        justifyContent: "center",
                                        gap: 8,
                                    }}
                                >
                                    <Text style={styles.textScore}>
                                        {item.team1_score}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.textScore,
                                            { opacity: 0.8 },
                                        ]}
                                    >
                                        ·
                                    </Text>
                                    <Text style={styles.textScore}>
                                        {item.team2_score}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.matchCardBottom}>
                                <View
                                    style={{
                                        gap: 15,
                                    }}
                                >
                                    <FlatList
                                        scrollEnabled={false}
                                        data={players.reverse()}
                                        keyExtractor={(item) => item.id}
                                        contentContainerStyle={{
                                            flexDirection: "row",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            left:
                                                ((players.length - 1) * 10) / 2,
                                        }}
                                        renderItem={({
                                            item: player,
                                            index,
                                        }) => {
                                            const leftPos =
                                                index === 0
                                                    ? index
                                                    : -10 * index;

                                            return (
                                                <>
                                                    {player.image_url ? (
                                                        <View
                                                            style={{
                                                                padding: 0.5,
                                                                backgroundColor:
                                                                    Colors.card_bg,
                                                                borderRadius: 10,
                                                                zIndex:
                                                                    5 - index,
                                                                left: leftPos,
                                                            }}
                                                        >
                                                            <Image
                                                                style={{
                                                                    width: 20,
                                                                    height: 20,
                                                                    borderRadius: 100,
                                                                }}
                                                                src={
                                                                    player.image_url
                                                                }
                                                            />
                                                        </View>
                                                    ) : (
                                                        <View
                                                            style={{
                                                                padding: 0.5,
                                                                backgroundColor:
                                                                    Colors.card_bg,
                                                                borderRadius: 10,
                                                                zIndex:
                                                                    5 - index,
                                                                left: leftPos,
                                                            }}
                                                        >
                                                            <Ionicons
                                                                name="person-circle"
                                                                size={20}
                                                                color={
                                                                    Colors.accent
                                                                }
                                                            />
                                                        </View>
                                                    )}
                                                </>
                                            );
                                        }}
                                    />
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                }}
            />
        </View>
    );
}

export default RecentMatches;

const styles = StyleSheet.create({
    container: {
        width: "100%",
        justifyContent: "center",
        alignItems: "flex-start",
    },
    matchCard: {
        position: "relative",
        width: 120,
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        borderRadius: 10,
        margin: 5,
    },
    matchCardTop: {
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 15,
        paddingVertical: 5,
        width: "100%",
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        gap: 5,
    },
    matchCardBottom: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        padding: 7,
        paddingHorizontal: 15,
        width: "100%",
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        gap: 10,
    },
    textScore: {
        color: "white",
        fontSize: 24,
        fontWeight: "bold",
    },
    textDate: {
        color: "white",
        fontSize: 10,
        fontWeight: "500",
    },
    dateContainer: {
        flexDirection: "row",
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
        fontSize: 10,
    },
});
