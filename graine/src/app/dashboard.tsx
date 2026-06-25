import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppFonts, Palette } from '@/constants/theme';

export default function DashboardScreen() {
  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.center} edges={['top']}>
        <MaterialCommunityIcons name="card-outline" size={48} color={Palette.textMuted} />
        <Text style={styles.title}>Tableau de bord</Text>
        <Text style={styles.subtitle}>À venir</Text>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Palette.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  title: { fontFamily: AppFonts.display, fontSize: 24, color: Palette.textDark },
  subtitle: { fontFamily: AppFonts.regular, fontSize: 14, color: Palette.textMuted },
});
