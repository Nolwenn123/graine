import { Ionicons } from '@expo/vector-icons';
import type { RefObject } from 'react';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BlurDropdown } from '@/components/blur-dropdown';
import { AppFonts, Palette, Spacing } from '@/constants/theme';

export type Period = { key: string; label: string };

const PRESETS: Period[] = [
  { key: 'today', label: 'Aujourd’hui' },
  { key: 'week', label: 'Cette semaine' },
  { key: 'month', label: 'Ce mois ci' },
  { key: 'year', label: 'Cette année' },
];

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];
const MONTHS_SHORT = [
  'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
  'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.',
];
const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const YEARS = [2023, 2024, 2025, 2026, 2027];

type Props = {
  visible: boolean;
  onClose: () => void;
  blurTarget: RefObject<View | null>;
  /** Clé de la période active (coche). */
  value: string;
  onChange: (period: Period) => void;
};

/** Construit la grille du mois (semaine commençant le lundi). `null` = case vide. */
function buildGrid(year: number, month: number): (number | null)[] {
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // lundi = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array.from({ length: firstWeekday }, () => null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(day);
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  return cells;
}

export function PeriodSelector({ visible, onClose, blurTarget, value, onChange }: Props) {
  const insets = useSafeAreaInsets();
  const today = new Date();

  const [showCustom, setShowCustom] = useState(false);
  const [picker, setPicker] = useState<null | 'month' | 'year'>(null);
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [start, setStart] = useState<number | null>(null);
  const [end, setEnd] = useState<number | null>(null);

  const selectPreset = (preset: Period) => {
    onChange(preset);
    onClose();
  };

  const selectDay = (day: number) => {
    // Premier tap ou nouvelle sélection : on (re)commence une plage.
    if (start === null || end !== null) {
      setStart(day);
      setEnd(null);
      return;
    }
    // Deuxième tap : on borne la plage (en ordre croissant).
    const lo = Math.min(start, day);
    const hi = Math.max(start, day);
    setStart(lo);
    setEnd(hi);
    onChange({
      key: 'custom',
      label: `${lo}–${hi} ${MONTHS_SHORT[month]} ${year}`,
    });
  };

  const inRange = (day: number) =>
    start !== null && end !== null && day >= start && day <= end;
  const isEndpoint = (day: number) => day === start || day === end;

  return (
    <BlurDropdown
      visible={visible}
      onClose={onClose}
      blurTarget={blurTarget}
      contentStyle={{ top: insets.top + Spacing.six, left: Spacing.three, right: Spacing.five }}>
      <View style={styles.menu}>
        {PRESETS.map((preset) => (
          <Pressable
            key={preset.key}
            style={styles.optionRow}
            onPress={() => selectPreset(preset)}>
            <Text style={[styles.option, value === preset.key && styles.optionSelected]}>
              {preset.label}
            </Text>
            {value === preset.key && (
              <Ionicons name="checkmark" size={22} color={Palette.textDark} />
            )}
          </Pressable>
        ))}

        <Pressable
          style={styles.optionRow}
          onPress={() => {
            setShowCustom((v) => !v);
            setPicker(null);
          }}>
          <Text style={[styles.option, value === 'custom' && styles.optionSelected]}>
            Choisir une période
          </Text>
          <View style={styles.calendarIcon}>
            <Ionicons name="calendar-outline" size={20} color={Palette.textDark} />
          </View>
        </Pressable>

        {showCustom && (
          <View style={styles.calendar}>
            <View style={styles.chipsRow}>
              <Chip
                label={MONTHS[month]}
                open={picker === 'month'}
                onPress={() => setPicker((p) => (p === 'month' ? null : 'month'))}
              />
              <Chip
                label={String(year)}
                open={picker === 'year'}
                onPress={() => setPicker((p) => (p === 'year' ? null : 'year'))}
              />
            </View>

            {picker === 'month' && (
              <PickerGrid
                items={MONTHS.map((m, i) => ({ label: m, value: i }))}
                selected={month}
                columns={3}
                onPick={(v) => {
                  setMonth(v);
                  setStart(null);
                  setEnd(null);
                  setPicker(null);
                }}
              />
            )}
            {picker === 'year' && (
              <PickerGrid
                items={YEARS.map((y) => ({ label: String(y), value: y }))}
                selected={year}
                columns={3}
                onPick={(v) => {
                  setYear(v);
                  setStart(null);
                  setEnd(null);
                  setPicker(null);
                }}
              />
            )}

            {picker === null && (
              <>
                <View style={styles.weekRow}>
                  {WEEKDAYS.map((d, i) => (
                    <Text key={i} style={styles.weekday}>
                      {d}
                    </Text>
                  ))}
                </View>

                <View style={styles.grid}>
                  {buildGrid(year, month).map((day, i) => (
                    <View key={i} style={styles.dayCell}>
                      {day !== null && (
                        <Pressable
                          onPress={() => selectDay(day)}
                          style={[
                            styles.day,
                            inRange(day) && styles.dayInRange,
                            isEndpoint(day) && styles.dayEndpoint,
                          ]}>
                          <Text
                            style={[styles.dayText, isEndpoint(day) && styles.dayTextEndpoint]}>
                            {day}
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>
        )}
      </View>
    </BlurDropdown>
  );
}

function Chip({ label, open, onPress }: { label: string; open: boolean; onPress: () => void }) {
  return (
    <Pressable style={styles.chip} onPress={onPress}>
      <Text style={styles.chipText}>{label}</Text>
      <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={Palette.textDark} />
    </Pressable>
  );
}

function PickerGrid<T extends number>({
  items,
  selected,
  columns,
  onPick,
}: {
  items: { label: string; value: T }[];
  selected: T;
  columns: number;
  onPick: (value: T) => void;
}) {
  return (
    <View style={styles.pickerGrid}>
      {items.map((item) => (
        <Pressable
          key={item.value}
          style={[styles.pickerItem, { width: `${100 / columns}%` }]}
          onPress={() => onPick(item.value)}>
          <Text
            style={[styles.pickerText, item.value === selected && styles.pickerTextSelected]}>
            {item.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  menu: {
    backgroundColor: Palette.menu,
    borderRadius: 28,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
  },
  option: {
    fontFamily: AppFonts.regular,
    fontSize: 19,
    color: Palette.textDark,
  },
  optionSelected: {
    fontFamily: AppFonts.semibold,
  },
  calendarIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendar: {
    marginTop: Spacing.two,
    gap: Spacing.three,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.06)',
    minWidth: 130,
  },
  chipText: {
    fontFamily: AppFonts.medium,
    fontSize: 16,
    color: Palette.textDark,
  },
  weekRow: {
    flexDirection: 'row',
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontFamily: AppFonts.regular,
    fontSize: 13,
    color: Palette.textMuted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    alignItems: 'center',
    paddingVertical: 3,
  },
  day: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayInRange: {
    backgroundColor: Palette.calendarRange,
    borderRadius: 0,
  },
  dayEndpoint: {
    backgroundColor: Palette.calendarSelected,
    borderRadius: 17,
  },
  dayText: {
    fontFamily: AppFonts.regular,
    fontSize: 15,
    color: Palette.textDark,
  },
  dayTextEndpoint: {
    color: '#FFFFFF',
    fontFamily: AppFonts.semibold,
  },
  pickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  pickerItem: {
    paddingVertical: Spacing.two,
    alignItems: 'center',
  },
  pickerText: {
    fontFamily: AppFonts.regular,
    fontSize: 15,
    color: Palette.textDark,
  },
  pickerTextSelected: {
    fontFamily: AppFonts.semibold,
    color: Palette.timelineLine,
  },
});
