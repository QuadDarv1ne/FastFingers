/**
 * CloudSyncCleanup — Ensures cloud sync service event listeners are cleaned up on unmount
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import { useCloudSyncCleanup } from './services/cloudSyncService'

export function CloudSyncCleanup() {
  useCloudSyncCleanup()
  return null
}
