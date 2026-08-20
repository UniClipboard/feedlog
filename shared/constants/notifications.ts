// Notification system — the notification type keys. Recipients are resolved in
// server/utils/notifications.ts: the first two from post_subscription, the last
// two from the org's owners/managers.

export const NOTIFICATION_TYPE_KEYS = [
  'post.status_changed',
  'post.admin_replied',
  'post.created',
  'post.user_commented',
] as const
export type NotificationTypeKey = (typeof NOTIFICATION_TYPE_KEYS)[number]
