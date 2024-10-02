import { StyleSheet, Text, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { useDatabase } from "~/hooks/useDatabase";
import { Colors, globalStyles } from "~/lib/theme";

function MatchesPlayed() {
    const { statsMatchesQuery } = useDatabase();

    return (
        <View style={styles.container}>
            <Svg
                height="100%"
                width="100%"
                style={{ position: "absolute", width: "100%", height: 150 }}
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
                    height="150"
                    rx={10}
                    ry={10}
                    fill="url(#grad)"
                />
            </Svg>
            <Text style={styles.text}>
                {statsMatchesQuery.data?.total_matches}
            </Text>
            <Text style={styles.text}>matches played</Text>
        </View>
    );
}

export default MatchesPlayed;

const styles = StyleSheet.create({
    container: {
        ...globalStyles.shadow,
        justifyContent: "center",
        position: "relative",
        height: 150,
        width: "100%",
        alignItems: "center",
        borderRadius: 10,
        backgroundColor: Colors.card_bg,
    },
    text: {
        fontSize: 36,
        fontWeight: "bold",
        color: "white",
    },
});
