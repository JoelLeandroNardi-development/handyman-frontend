import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { type AvailabilitySlot } from '@smart/api';
import { useTheme } from '../../theme';
import { Card, EmptyState } from '../../ui/primitives';

export interface SlotGroup {
  dateKey: string;
  dateLabel: string;
  slots: { slot: AvailabilitySlot; originalIndex: number }[];
}

export function SlotList({
  loading,
  slotGroups,
  totalCount,
  emptyText,
  onRemove,
}: {
  loading: boolean;
  slotGroups: SlotGroup[];
  totalCount: number;
  emptyText: string;
  onRemove: (originalIndex: number) => void;
}) {
  const { colors, tokens } = useTheme();

  return (
    <>
      <View style={{ gap: 4, marginTop: 4 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text }}>
            Slots
          </Text>
          <Text style={{ color: colors.textFaint, fontSize: tokens.typography.labelSmall.size }}>
            {totalCount} total
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={{ paddingVertical: 32, alignItems: 'center' }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : slotGroups.length === 0 ? (
        <EmptyState text={emptyText} />
      ) : (
        slotGroups.map(group => (
          <Card key={group.dateKey} style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontWeight: '800', fontSize: tokens.typography.subtitle.size, color: colors.text }}>
                {group.dateLabel}
              </Text>
              <Text style={{ color: colors.textFaint, fontSize: tokens.typography.labelSmall.size }}>
                {group.slots.length} slot{group.slots.length === 1 ? '' : 's'}
              </Text>
            </View>

            {group.slots.map(({ slot, originalIndex }) => {
              const start = new Date(slot.start);
              const end = new Date(slot.end);
              const timeStr = `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

              return (
                <View
                  key={`${slot.start}-${slot.end}`}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderRadius: tokens.nativeRadius.sm,
                    backgroundColor: colors.surfaceMuted,
                    paddingLeft: 14,
                    paddingRight: 6,
                    paddingVertical: 10,
                    gap: 8,
                  }}>
                  <Text style={{ flex: 1, color: colors.textSoft, fontSize: tokens.typography.body.size, fontWeight: '600' }}>
                    {timeStr}
                  </Text>
                  <Pressable
                    onPress={() => onRemove(originalIndex)}
                    hitSlop={12}
                    accessibilityLabel="Remove slot"
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: tokens.nativeRadius.sm,
                      backgroundColor: colors.dangerSoft,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Text style={{ color: colors.danger, fontWeight: '800', fontSize: 12 }}>
                      ✕
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </Card>
        ))
      )}
    </>
  );
}
