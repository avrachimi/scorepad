import { useHeaderHeight } from "@react-navigation/elements";
import { Link } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import MatchesPlayed from "~/components/MatchesPlayed";
import RecentMatches from "~/components/RecentMatches";
import { useAuth } from "~/hooks/useAuth";

function Page() {
    const headerHeight = useHeaderHeight();
    const { signOut } = useAuth();

    return (
        <View
            style={{
                paddingTop: headerHeight + 50,
                padding: 21,
                flex: 1,
                justifyContent: "flex-start",
                alignItems: "center",
                gap: 20,
            }}
        >
            <MatchesPlayed />
            <RecentMatches />
            <Link href={"/"}>Index</Link>
            <TouchableOpacity onPress={signOut}>
                <Text>Sign Out</Text>
            </TouchableOpacity>
        </View>
    );
}

export default Page;
