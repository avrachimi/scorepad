import { useHeaderHeight } from "@react-navigation/elements";
import { Link } from "expo-router";
import { Text, View } from "react-native";

function Page() {
    const headerHeight = useHeaderHeight();

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
        </View>
    );
}

export default Page;
