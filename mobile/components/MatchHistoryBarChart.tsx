import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Bar, CartesianChart } from "victory-native";
import { useAuth } from "~/hooks/useAuth";
import { Colors, globalStyles } from "~/lib/theme";
import { Stats } from "~/lib/types";

function MatchHistoryBarChart() {
    const { accessToken } = useAuth();

    const { data: matchHistory, isLoading: loadingMatchHistory } = useQuery({
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
            console.log("matchHistory", res);
            return res.data.matches_by_month;
        },
    });

    if (loadingMatchHistory) {
        return (
            <View style={{ width: "100%", height: 150 }}>
                <ActivityIndicator />
            </View>
        );
    }

    if (!matchHistory) {
        return null;
    }

    return (
        <View style={styles.container}>
            <Text
                style={[globalStyles.subHeading, { alignSelf: "flex-start" }]}
            >
                Matches Played
            </Text>
            <View
                style={{
                    width: "100%",
                    height: 150,
                    backgroundColor: Colors.card_bg,
                    borderRadius: 10,
                    ...globalStyles.shadow,
                }}
            >
                <CartesianChart
                    data={matchHistory}
                    xKey="month"
                    yKeys={["matches"]}
                    padding={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    {({ points, chartBounds }) => (
                        <Bar
                            points={points.matches}
                            chartBounds={chartBounds}
                            color={Colors.secondary}
                            barCount={12}
                            roundedCorners={{ topLeft: 2, topRight: 2 }}
                        ></Bar>
                    )}
                </CartesianChart>
            </View>
        </View>
    );
}

export default MatchHistoryBarChart;

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 21,
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        gap: 10,
    },
});
