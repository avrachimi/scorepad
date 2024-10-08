import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import { forwardRef, useMemo } from "react";
import { Text, TextInput, View } from "react-native";

const AddFriendsModal = forwardRef<BottomSheetModal, {}>((props, ref) => {
    const snapPoints = useMemo(() => ["35%", "92%"], []);

    const renderBackdrop = (props: any) => {
        return (
            <BottomSheetBackdrop
                appearsOnIndex={0}
                disappearsOnIndex={-1}
                {...props}
            />
        );
    };

    return (
        <BottomSheetModal
            ref={ref}
            snapPoints={snapPoints}
            backdropComponent={renderBackdrop}
        >
            <View
                style={{
                    width: "100%",
                    justifyContent: "flex-start",
                    alignItems: "flex-start",
                    gap: 20,
                }}
            >
                <View
                    style={{
                        width: "100%",
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                        paddingHorizontal: 21,
                    }}
                >
                    <Text
                        style={{
                            fontSize: 17,
                            fontWeight: "600",
                        }}
                    >
                        Add Friends
                    </Text>
                </View>
                <View
                    style={{
                        width: "100%",
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                        paddingHorizontal: 16,
                    }}
                >
                    <TextInput
                        style={{
                            width: "100%",
                            height: 36,
                            borderRadius: 10,
                            backgroundColor: "#F4F4F4",
                            paddingHorizontal: 10,
                        }}
                        placeholder="Search"
                    />
                </View>
                <Text>Add Friends Modal</Text>
            </View>
        </BottomSheetModal>
    );
});

export default AddFriendsModal;
