import dayjs from "dayjs";
import { FlatList, ScrollView, StyleSheet, Text, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { useDatabase } from "~/hooks/useDatabase";
import { Colors, globalStyles } from "~/lib/theme";

const getDayWithSuffix = (day: number) => {
    if (day > 3 && day < 21) return "th"; // for 11th to 19th
    switch (day % 10) {
        case 1:
            return "st";
        case 2:
            return "nd";
        case 3:
            return "rd";
        default:
            return "th";
    }
};

function RecentMatches() {
    const { recentMatchesQuery } = useDatabase();

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Recent Matches</Text>
            <ScrollView
                style={{ width: "100%" }}
                directionalLockEnabled
                horizontal
            >
                <FlatList
                    data={recentMatchesQuery.data}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => {
                        const day = dayjs(item.match_date).date();
                        const suffix = getDayWithSuffix(day);

                        return (
                            <View style={styles.matchCard}>
                                <View
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        borderRadius: 10,
                                        backgroundColor: Colors.background,
                                        position: "absolute",
                                    }}
                                >
                                    <Svg
                                        height="100%"
                                        width="100%"
                                        style={{
                                            position: "absolute",
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
                                                    offset="60%"
                                                    stopColor={Colors.secondary}
                                                    stopOpacity="1"
                                                />
                                            </LinearGradient>
                                        </Defs>
                                        <Rect
                                            width="99%"
                                            height={"100%"}
                                            rx={10}
                                            ry={10}
                                            fill="url(#grad)"
                                        />
                                    </Svg>
                                </View>
                                <View style={styles.matchCardTop}>
                                    <View style={styles.dateContainer}>
                                        <Text style={styles.textDate}>
                                            {dayjs(item.match_date).format(
                                                "dddd, MMMM "
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
                                            justifyContent: "space-evenly",
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
                                    <View
                                        style={{
                                            flexDirection: "column",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            gap: 5,
                                        }}
                                    >
                                        <Text style={styles.textPlayer}>
                                            {item.team1_player1.name}
                                        </Text>
                                        <Text style={styles.textPlayer}>
                                            {item.team1_player2?.name ?? "-"}
                                        </Text>
                                    </View>
                                    <View
                                        style={{
                                            flexDirection: "column",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            gap: 5,
                                        }}
                                    >
                                        <Text style={styles.textPlayer}>
                                            {item.team2_player2?.name ?? "-"}
                                        </Text>
                                        <Text style={styles.textPlayer}>
                                            {item.team2_player2?.name ??
                                                "Andreas Vrachimi"}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        );
                    }}
                />
            </ScrollView>
        </View>
    );
}

export default RecentMatches;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "flex-start",
        width: "100%",
        gap: 5,
    },
    matchCard: {
        position: "relative",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        height: 120,
        width: "100%",
        backgroundColor: Colors.card_bg,
        borderRadius: 10,
        margin: 5,
        ...globalStyles.shadow,
    },
    matchCardTop: {
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        height: 55,
        padding: 5,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    matchCardBottom: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        height: 65,
        padding: 10,
        backgroundColor: Colors.card_bg,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
    },
    textScore: {
        color: "white",
        fontSize: 24,
        fontWeight: "bold",
    },
    textDate: {
        color: "white",
        fontSize: 10,
        fontWeight: "semibold",
    },
    dateContainer: {
        flexDirection: "row",
    },
    superscript: {
        fontSize: 10,
        lineHeight: 16,
        verticalAlign: "top",
    },
    textPlayer: {
        fontSize: 10,
    },
    heading: {
        fontSize: 16,
        fontWeight: "bold",
        color: Colors.accent,
    },
});
