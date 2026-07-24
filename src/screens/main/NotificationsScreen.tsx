import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '../../components/AppButton';
import { DreamyBackdrop } from '../../components/DreamyBackdrop';
import { ScreenIntro } from '../../components/ScreenIntro';
import { StateView } from '../../components/StateView';
import { useLanguage } from '../../context/LanguageContext';
import { useAppTheme } from '../../context/ThemeContext';
import { getErrorMessage } from '../../services/apiClient';
import { notificationService } from '../../services/notificationService';
import { radius, spacing, stickerPalette, typography, type ThemeColors } from '../../theme/tokens';
import { useThemedStyles } from '../../theme/useThemedStyles';
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

const typeColors: Record<string, string> = {
  GROUP_INVITATION_CREATED: stickerPalette.orange,
  GROUP_MEMBER_ADDED: stickerPalette.green,
  GROUP_MEMBER_REMOVED: stickerPalette.coral,
  PLAN_CREATED: stickerPalette.blue,
  PLAN_UPDATED: stickerPalette.yellow,
  PLAN_DELETED: stickerPalette.coral,
  USER_REGISTERED: stickerPalette.violet,
};

export function NotificationsScreen() {
  const { colors } = useAppTheme();
  const { locale, t } = useLanguage();
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<Notification[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paginationError, setPaginationError] = useState<string | null>(null);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const [announcement, setAnnouncement] = useState<string | null>(null);
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
    setPaginationError(null);
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

  async function loadMore(forceRetry = false) {
    if (!hasMore || baseLoadingRef.current || loadingMoreRef.current || loading || refreshing || markingAllRead || markingId !== null || (paginationError && !forceRetry)) return;
    const generation = requestGeneration.current;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    setPaginationError(null);
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
      setPaginationError(getErrorMessage(loadError));
    } finally {
      if (generation === requestGeneration.current) {
        loadingMoreRef.current = false;
        setLoadingMore(false);
      }
    }
  }

  async function markRead(notification: Notification) {
    if (notification.status === 'READ' || markingId !== null || markingAllRead || refreshing || loadingMore) return;
    setMarkingId(notification.id);
    setError(null);
    setItems((current) => current.map((item) => item.id === notification.id ? { ...item, status: 'READ' } : item));
    try {
      const updated = await notificationService.markRead(notification.id);
      setItems((current) => current.map((item) => item.id === updated.id ? updated : item));
      setAnnouncement(t('notifications.markedRead', { title: notification.title }));
    } catch (markError) {
      setItems((current) => current.map((item) => item.id === notification.id ? notification : item));
      setError(getErrorMessage(markError));
    } finally {
      setMarkingId(null);
    }
  }

  async function markAllRead() {
    if (markingAllRead || markingId !== null || refreshing || loadingMore || !items.some((item) => item.status === 'UNREAD')) return;
    const previous = items;
    setMarkingAllRead(true);
    setError(null);
    setItems((current) => current.map((item) => ({ ...item, status: 'READ' })));
    try {
      await notificationService.markAllRead();
      setAnnouncement(t('notifications.allMarkedRead'));
    } catch (markError) {
      setItems(previous);
      setError(getErrorMessage(markError));
    } finally {
      setMarkingAllRead(false);
    }
  }

  if (loading) return <StateView loading presentation="screen" scene="invitation" title={t('notifications.loading')} />;
  if (error && !items.length) {
    return (
      <StateView
        actionLabel={t('common.tryAgain')}
        icon="cloud-offline-outline"
        kind="offline"
        message={error}
        onAction={() => void load()}
        presentation="screen"
        scene="invitation"
        title={t('notifications.loadError')}
      />
    );
  }

  const unreadCount = items.filter((item) => item.status === 'UNREAD').length;

  return (
    <View style={[styles.page, { paddingTop: Math.max(insets.top, spacing.lg) }]}>
      <DreamyBackdrop />
      <View style={styles.header}>
        <ScreenIntro
          scene="invitation"
          subtitle={t('notifications.subtitle')}
          title={t('notifications.title')}
        />
        <View style={styles.unreadSummary}>
          <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.unreadSignal} />
          <View style={styles.unreadCopy}>
            <Text style={styles.unreadCount}>{unreadCount}</Text>
            <Text style={styles.unreadLabel}>{t(unreadCount === 1 ? 'notifications.unread' : 'notifications.unreads')}</Text>
          </View>
          {unreadCount ? (
            <AppButton
              compact
              disabled={markingId !== null || refreshing || loadingMore}
              label={t('notifications.readAll')}
              loading={markingAllRead}
              onPress={() => void markAllRead()}
              variant="secondary"
            />
          ) : (
            <View style={styles.caughtUp}>
              <Ionicons color={colors.success} name="checkmark-circle" size={18} />
              <Text style={styles.caughtUpText}>{t('notifications.caughtUp')}</Text>
            </View>
          )}
        </View>
      </View>
      {announcement ? <Text accessibilityLiveRegion="polite" style={styles.srAnnouncement}>{announcement}</Text> : null}
      {error ? (
        <View accessibilityLiveRegion="polite" style={styles.errorBanner}>
          <Ionicons color={colors.danger} name="alert-circle-outline" size={20} />
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : null}
      <FlatList
        contentContainerStyle={[styles.list, { paddingBottom: Math.max(insets.bottom, spacing.xl) }]}
        data={items}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <StateView icon="notifications-outline" message={t('notifications.emptyMessage')} title={t('notifications.emptyTitle')} />
        }
        ListFooterComponent={loadingMore ? (
          <ActivityIndicator accessibilityLabel={t('notifications.loadingMore')} color={colors.primary} style={styles.footerLoader} />
        ) : paginationError ? (
          <View accessibilityLiveRegion="polite" style={styles.paginationError}>
            <Text style={styles.paginationErrorText}>{t('notifications.moreError', { message: paginationError })}</Text>
            <AppButton compact label={t('common.tryAgain')} onPress={() => void loadMore(true)} variant="ghost" />
          </View>
        ) : null}
        onEndReached={() => void loadMore()}
        onEndReachedThreshold={0.4}
        onRefresh={markingAllRead || markingId !== null ? undefined : () => void load(true)}
        refreshing={refreshing}
        renderItem={({ item }) => (
          <Pressable
            accessibilityLabel={`${item.title}. ${t(item.status === 'UNREAD' ? 'notifications.unreadStatus' : 'notifications.read')}. ${item.message}`}
            accessibilityRole="button"
            accessibilityState={{ busy: markingId === item.id, disabled: item.status === 'READ' || markingAllRead || markingId !== null }}
            disabled={item.status === 'READ' || markingAllRead || markingId !== null}
            onPress={() => void markRead(item)}
            style={({ pressed }) => [
              styles.item,
              { borderLeftColor: typeColors[item.type] ?? stickerPalette.orange },
              item.status === 'UNREAD' && styles.itemUnread,
              pressed && styles.pressed,
            ]}
          >
            <View style={[styles.itemIcon, { backgroundColor: typeColors[item.type] ?? stickerPalette.orange }]}>
              <Ionicons color={colors.onSticker} name={typeIcons[item.type] ?? 'notifications-outline'} size={22} />
            </View>
            <View style={styles.itemCopy}>
              <View style={styles.itemHeading}>
                <Text numberOfLines={1} style={styles.itemTitle}>{item.title}</Text>
                {item.status === 'UNREAD' ? (
                  <View style={styles.newBadge}>
                    <View style={styles.unreadDot} />
                    <Text style={styles.newBadgeText}>{t('notifications.new')}</Text>
                  </View>
                ) : null}
              </View>
              <Text numberOfLines={3} style={styles.message}>{item.message}</Text>
              <Text style={styles.time}>{relativeTime(item.createdAt, locale)}</Text>
            </View>
          </Pressable>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  caughtUp: { alignItems: 'center', flexDirection: 'row', gap: spacing.xs },
  caughtUpText: { color: colors.successText, fontSize: typography.caption, fontWeight: '900' },
  error: { color: colors.dangerText, flex: 1, fontSize: typography.small, lineHeight: 20 },
  errorBanner: { alignItems: 'center', backgroundColor: colors.dangerSoft, borderRadius: radius.md, flexDirection: 'row', gap: spacing.sm, marginHorizontal: spacing.lg, marginTop: spacing.md, padding: spacing.md },
  footerLoader: { padding: spacing.xl },
  header: { gap: spacing.lg, paddingHorizontal: spacing.lg },
  item: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, borderWidth: 1, borderLeftWidth: 6, flexDirection: 'row', gap: spacing.md, padding: spacing.lg },
  itemCopy: { flex: 1, gap: spacing.xs },
  itemHeading: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  itemIcon: { alignItems: 'center', borderRadius: radius.md, height: 44, justifyContent: 'center', width: 44 },
  itemTitle: { color: colors.text, flex: 1, fontSize: typography.body, fontWeight: '800' },
  itemUnread: { backgroundColor: colors.surfaceWarm, borderColor: colors.primaryBorder },
  list: { flexGrow: 1, gap: spacing.md, paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  message: { color: colors.textMuted, fontSize: typography.small, lineHeight: 20 },
  newBadge: { alignItems: 'center', backgroundColor: colors.accentSoft, borderRadius: radius.pill, flexDirection: 'row', gap: spacing.xs, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  newBadgeText: { color: colors.accentText, fontSize: typography.caption, fontWeight: '900', letterSpacing: 0.5 },
  page: { backgroundColor: colors.background, flex: 1 },
  paginationError: { alignItems: 'center', gap: spacing.md, padding: spacing.xl },
  paginationErrorText: { color: colors.warningText, fontSize: typography.small, lineHeight: 20, textAlign: 'center' },
  pressed: { opacity: 0.75 },
  srAnnouncement: { height: 1, opacity: 0, position: 'absolute', width: 1 },
  time: { color: colors.textMuted, fontSize: typography.caption, fontWeight: '600', marginTop: spacing.xs },
  unreadDot: { backgroundColor: colors.accent, borderRadius: 4, height: 8, width: 8 },
  unreadCopy: { flex: 1, gap: 2 },
  unreadCount: { color: colors.primaryText, fontSize: typography.heading, fontWeight: '900' },
  unreadLabel: { color: colors.textMuted, fontSize: typography.caption, fontWeight: '700' },
  unreadSignal: { backgroundColor: colors.accent, borderColor: colors.surface, borderRadius: radius.pill, borderWidth: 1, height: 18, width: 18 },
  unreadSummary: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, borderWidth: 1, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, padding: spacing.md },
  });
}
