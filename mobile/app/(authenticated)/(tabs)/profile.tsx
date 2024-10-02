import { Image, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "~/hooks/useAuth";
import { globalStyles } from "~/lib/theme";

function Page() {
    const { signOut, user } = useAuth();

    return (
        <View
            style={{
                flex: 1,
                justifyContent: "space-between",
                alignItems: "center",
                padding: 20,
            }}
        >
            <View
                style={{
                    flex: 1,
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    marginTop: 200,
                    gap: 20,
                }}
            >
                <Image
                    style={{
                        width: 150,
                        height: 150,
                        borderRadius: 100,
                    }}
                    src={user?.image_url}
                    resizeMode="cover"
                />
                <View
                    style={{
                        flexDirection: "column",
                        gap: 10,
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <Text
                        style={{
                            fontSize: 32,
                            fontWeight: "bold",
                        }}
                    >
                        {user?.name}
                    </Text>
                    <Text
                        style={{
                            fontSize: 20,
                        }}
                    >
                        {user?.total_friends} friends
                    </Text>
                </View>
            </View>
            <TouchableOpacity style={globalStyles.btnPrimary} onPress={signOut}>
                <Text style={globalStyles.btnPrimaryText}>Sign Out</Text>
            </TouchableOpacity>
        </View>
    );
}

export default Page;
