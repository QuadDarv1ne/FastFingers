/**
 * CloudSyncCleanup — Deprecated: cleanup is handled by the singleton lifecycle
 * Kept as a no-op to avoid breaking imports until fully removed
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import { memo } from 'react'

function CloudSyncCleanup() {
  return null
}

export default memo(CloudSyncCleanup)
