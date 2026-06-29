import { ChevronDown } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { BORDER, CARD, FontSize, FontWeight, MUTED, SURFACE, TEXT } from '@/constants/palette';

export interface FilterOption {
  key: string;
  label: string;
  color?: string;
}

interface Props {
  /** Text shown on the button when the default (first) option is selected */
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
}

export function FilterDropdown({ label, options, value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.key === value) ?? options[0];
  const isDefault = value === options[0].key;

  return (
    <View style={s.wrap}>
      <Pressable
        onPress={() => setOpen((o) => !o)}
        style={[
          s.btn,
          !isDefault && selected.color
            ? { backgroundColor: `${selected.color}18`, borderColor: `${selected.color}55` }
            : undefined,
        ]}
      >
        <Text style={{ fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: !isDefault && selected.color ? selected.color : MUTED }}>
          {isDefault ? label : selected.label}
        </Text>
        <ChevronDown
          size={11}
          strokeWidth={2.5}
          color={!isDefault && selected.color ? selected.color : MUTED}
        />
      </Pressable>

      {open && (
        <View style={s.menu}>
          {options.map(({ key, label: optLabel, color }) => {
            const active = value === key;
            return (
              <Pressable
                key={key}
                onPress={() => { onChange(key); setOpen(false); }}
                style={[s.item, active && color ? { backgroundColor: `${color}12` } : undefined]}
              >
                <Text style={{ fontSize: FontSize.md, fontWeight: active && color ? FontWeight.bold : FontWeight.medium, color: active && color ? color : TEXT }}>
                  {optLabel}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { zIndex: 10 },
  btn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, height: 32,
    borderRadius: 99, borderWidth: 1,
    backgroundColor: SURFACE, borderColor: BORDER,
  },
  menu: {
    position: 'absolute', top: 36, right: 0,
    backgroundColor: CARD, borderRadius: 12,
    borderWidth: 1, borderColor: BORDER,
    minWidth: 130, overflow: 'hidden',
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 8,
  },
  item: { paddingHorizontal: 16, paddingVertical: 11 },
});
