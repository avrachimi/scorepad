import { useHeaderHeight } from "@react-navigation/elements";
import { Link } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "~/hooks/useAuth";
import { useDatabase } from "~/hooks/useDatabase";

function Page() {
    const { getUsersQuery } = useDatabase();

    console.log(getUsersQuery.data);

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
        </View>
    );
}

export default Page;
