import { useHeaderHeight } from "@react-navigation/elements";
import { Link } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { useAPI } from "~/hooks/useAPI";
import { useAuth } from "~/hooks/useAuth";

function Page() {
    const { getUsers } = useAPI();
    const headerHeight = useHeaderHeight();
    const { signOut } = useAuth();

    return (
        <View
            style={{
                paddingTop: headerHeight + 30,
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                gap: 20,
            }}
        >
            <Text>Home Page</Text>
            <Link href={"/"}>Index</Link>
            <TouchableOpacity onPress={signOut}>
                <Text>Sign Out</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={getUsers}>
                <Text>Get users</Text>
            </TouchableOpacity>
        </View>
    );
}

export default Page;
