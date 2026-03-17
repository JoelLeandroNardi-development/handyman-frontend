import React from "react";
import { Pressable, Text, View } from "react-native";
import { Label } from "../ui/primitives";
import { useTheme } from "../theme";

export default function RegisterRolePicker({
  onSelectUser,
  onSelectHandyman,
}: {
  onSelectUser: () => void;
  onSelectHandyman: () => void;
}) {
  const { colors } = useTheme();

  function RoleOption({
    title,
    description,
    onPress,
  }: {
    title: string;
    description: string;
    onPress: () => void;
  }) {
    return (
      <Pressable
        onPress={onPress}
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 18,
          padding: 14,
          backgroundColor: colors.surfaceMuted,
          gap: 6,
        }}
      >
        <Text style={{ color: colors.text, fontSize: 16, fontWeight: "800" }}>{title}</Text>
        <Text style={{ color: colors.textSoft, fontSize: 14, lineHeight: 20 }}>{description}</Text>
      </Pressable>
    );
  }

  return (
    <View style={{ gap: 10 }}>
      <Label>Choose account type</Label>
      <RoleOption
        title="I need a handyman"
        description="Book trusted professionals for home services."
        onPress={onSelectUser}
      />
      <RoleOption
        title="I am a handyman"
        description="Offer your services, set availability, and receive jobs."
        onPress={onSelectHandyman}
      />
    </View>
  );
}
