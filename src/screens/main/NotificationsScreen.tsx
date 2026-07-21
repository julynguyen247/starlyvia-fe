import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StateView } from '../../components/StateView';
import { getErrorMessage } from '../../services/apiClient';
import { notificationService } from '../../services/notificationService';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import type { Notification } from '../../types/api';
import { relativeTime } from '../../utils/format';

const typeIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  GROUP_INVITATION_CREATED: 'mail-outline',
  GROUP_MEMBER_ADDED: 'person-add-outline',
  GROUP_MEMBER_REMOVED: 'person-remove-outline',
  PLAN_CREATED: 'map-outline',
  PLAN_UPDATED: 'refresh-outline',
  PLAN_DELETED: 'trash-outline',
  USER_REGISTERED: 'sparkles-outline',
};

export function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<Notification[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestGeneration = useRef<number>(0);
  const baseLoadingRef = useRef<boolean>(false);
  const loadingMoreRef = useRef<boolean>(false);

  const load = useCallback(async (asRefresh = false) => {
    const generation = ++requestGeneration.current;
    baseLoadingRef.current = true;
    loadingMoreRef.current = false;
    setLoadingMore(false);
    asRefresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      const result = await notificationService.list(0);
      if (generation !== requestGeneration.current) return;
      setItems(result.content);
      setPage(0);
      setHasMore(!result.last);
    } catch (loadError) {
      if (generation !== requestGeneration.current) return;
      setError(getErrorMessage(loadError));
    } finally {
      if (generation === requestGeneration.current) {
        baseLoadingRef.current = false;
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useFocusEffect(useCallback(() => {
    void load();
    return () => {
      requestGeneration.current += 1;
      baseLoadingRef.current = false;
      loadingMoreRef.current = false;
    };
  }, [load]));

  async function loadMore() {
    if (!hasMore || baseLoadingRef.current || loadingMoreRef.current || loading || refreshing) return;
    const generation = requestGeneration.current;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const result = await notificationService.list(nextPage);
      if (generation !== requestGeneration.current) return;
      setItems((current) => {
        const existingIds = new Set(current.map((item) => item.id));
        return [...current, ...result.content.filter((item) => !existingIds.has(item.id))];
      });
      setPage(nextPage);
      setHasMore(!result.last);
    } catch (loadError) {
      if (generation !== requestGeneration.current) return;
      setError(getErrorMessage(loadError));
    } finally {
      if (generation === requestGeneration.current) {
        loadingMoreRef.current = false;
        setLoadingMore(false);
      }
    }
  }

  async function markRead(notification: Notification) {
    if (notification.status === 'READ') return;
    setItems((current) => current.map((item) => item.id === notification.id ? { ...item, status: 'READ' } : item));
    try {
      const updated = await notificationService.markRead(notification.id);
      setItems((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (markError) {
      setItems((current) => current.map((item) => item.id === notification.id ? notification : item));
      setError(getErrorMessage(markError));
    }
  }

  async function markAllRead() {
    const previous = items;
    setItems((current) => current.map((item) => ({ ...item, status: 'READ' })));
    try {
      await notificationService.markAllRead();
    } catch (markError) {
      setItems(previous);
      setError(getErrorMessage(markError));
    }
  }

  if (loading) return <StateView loading title="Checking for updates…" />;
  if (error && !items.length) {
    return (
      <StateView
        actionLabel="Try again"
        icon="cloud-offline-outline"
        message={error}
        onAction={() => void load()}
        title="Could not load updates"
      />
    );
  }

  return (
    <View style={[styles.page, { paddingTop: Math.max(insets.top, spacing.lg) }]}>
      <View style={styles.header}>
        <View style={styles.headingCopy}>
          <Text accessibilityRole="header" style={styles.title}>Updates</Text>
          <Text style={styles.subtitle}>Everything your travel circles are doing.</Text>
        </View>
        {items.some((item) => item.status === 'UNREAD') ? (
          <Pressable accessibilityLabel="Mark all notifications as read" accessibilityRole="button" onPress={() => void markAllRead()} style={styles.markAllButton}>
            <Text style={styles.markAll}>Read all</Text>
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList
        contentContainerStyle={[styles.list, { paddingBottom: Math.max(insets.bottom, spacing.xl) }]}
        data={items}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <StateView icon="notifications-outline" message="New group and itinerary activity will appear here." title="You're all caught up" />
        }
        ListFooterComponent={loadingMore ? <ActivityIndicator color={colors.primary} style={styles.footerLoader} /> : null}
        onEndReached={() => void loadMore()}
        onEndReachedThreshold={0.4}
        onRefresh={() => void load(true)}
        refreshing={refreshing}
        renderItem={({ item }) => (
          <Pressable
            accessibilityLabel={`${item.title}. ${item.status === 'UNREAD' ? 'Unread' : 'Read'}. ${item.message}`}
            accessibilityRole="button"
            accessibilityState={{ disabled: item.status === 'READ' }}
            disabled={item.status === 'READ'}
            onPress={() => void markRead(item)}
            style={({ pressed }) => [styles.item, item.status === 'UNREAD' && styles.itemUnread, pressed && styles.pressed]}
          >
            <View style={[styles.itemIcon, item.status === 'UNREAD' && styles.itemIconUnread]}>
              <Ionicons color={colors.primary} name={typeIcons[item.type] ?? 'notifications-outline'} size={22} />
            </View>
            <View style={styles.itemCopy}>
              <View style={styles.itemHeading}>
                <Text numberOfLines={1} style={styles.itemTitle}>{item.title}</Text>
                {item.status === 'UNREAD' ? <View style={styles.unreadDot} /> : null}
              </View>
              <Text numberOfLines={3} style={styles.message}>{item.message}</Text>
              <Text style={styles.time}>{relativeTime(item.createdAt)}</Text>
            </View>
          </Pressable>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  error: { color: colors.danger, fontSize: typography.small, paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  footerLoader: { padding: spacing.xl },
  header: { alignItems: 'center', flexDirection: 'row', gap: spacing.md, justifyContent: 'space-between', paddingHorizontal: spacing.lg },
  headingCopy: { flex: 1, gap: spacing.xs },
  item: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, borderWidth: 1, flexDirection: 'row', gap: spacing.md, padding: spacing.lg },
  itemCopy: { flex: 1, gap: spacing.xs },
  itemHeading: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  itemIcon: { alignItems: 'center', backgroundColor: colors.surfaceMuted, borderRadius: radius.md, height: 44, justifyContent: 'center', width: 44 },
  itemIconUnread: { backgroundColor: colors.primarySoft },
  itemTitle: { color: colors.text, flex: 1, fontSize: typography.body, fontWeight: '800' },
  itemUnread: { borderColor: colors.primaryBorder },
  list: { flexGrow: 1, gap: spacing.md, paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  markAll: { color: colors.primary, fontSize: typography.small, fontWeight: '800' },
  markAllButton: { alignItems: 'center', justifyContent: 'center', minHeight: 44, paddingHorizontal: spacing.sm },
  message: { color: colors.textMuted, fontSize: typography.small, lineHeight: 20 },
  page: { backgroundColor: colors.background, flex: 1 },
  pressed: { opacity: 0.75 },
  subtitle: { color: colors.textMuted, fontSize: typography.small, lineHeight: 20 },
  time: { color: colors.textMuted, fontSize: typography.caption, fontWeight: '600', marginTop: spacing.xs },
  title: { color: colors.text, fontSize: typography.title, fontWeight: '900', letterSpacing: -0.6 },
  unreadDot: { backgroundColor: colors.accent, borderRadius: 4, height: 8, width: 8 },
});
