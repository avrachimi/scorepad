import dayjs from "dayjs";
import { FlatList, StyleSheet, Text, View } from "react-native";
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

const formatName = (name: string) => {
    const firstName = name.split(" ")[0];
    if (firstName.length > 10) return firstName.slice(0, 10) + "...";

    const lastName = name.split(" ")[1];
    return firstName + (lastName ? ` ${lastName[0]}.` : "");
};

function RecentMatches() {
    const { recentMatchesQuery } = useDatabase();

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
                style={{ marginTop: -15 }}
                contentContainerStyle={{
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    marginLeft: 10,
                    paddingRight: 31,
                    padding: 5,
                    gap: 20,
                }}
                renderItem={({ item }) => {
                    const day = dayjs(item.match_date).date();
                    const suffix = getDayWithSuffix(day);

                    return (
                        <View style={styles.matchCard}>
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
                                        borderLeftColor: "#B0B0B0",
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
            />
        </View>
    );
}

export default RecentMatches;

const styles = StyleSheet.create({
    container: {
        height: 160,
        justifyContent: "center",
        alignItems: "flex-start",
    },
    matchCard: {
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: Colors.card_bg,
        borderRadius: 10,
        margin: 5,
        width: 200,
        ...globalStyles.shadow,
    },
    matchCardTop: {
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 5,
        width: "100%",
        backgroundColor: Colors.primary,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        gap: 5,
    },
    matchCardBottom: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 10,
        paddingHorizontal: 20,
        width: "100%",
        backgroundColor: Colors.card_bg,
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
