import { Shortcut } from './KeyboardShortcuts'
import { useAppTranslation } from '../i18n/config'

interface KeyboardShortcutsHelpProps {
  onClose: () => void
}

export function KeyboardShortcutsHelp({ onClose }: KeyboardShortcutsHelpProps) {
  const { t } = useAppTranslation()

  const shortcuts: Omit<Shortcut, 'action'>[] = [
    // Navigation
    {
      key: 'Escape',
      description: t('shortcuts.close'),
      category: 'navigation',
    },
    {
      key: 'N',
      ctrl: true,
      description: t('shortcuts.newExercise'),
      category: 'navigation',
    },
    {
      key: 'R',
      ctrl: true,
      description: t('shortcuts.restartExercise'),
      category: 'navigation',
    },
    {
      key: 'S',
      ctrl: true,
      description: t('shortcuts.showStats'),
      category: 'navigation',
    },
    {
      key: 'L',
      ctrl: true,
      description: t('shortcuts.toggleLearning'),
      category: 'navigation',
    },

    // Typing
    {
      key: 'Space',
      ctrl: true,
      description: t('shortcuts.pauseResume'),
      category: 'typing',
    },
    {
      key: 'Enter',
      ctrl: true,
      description: t('shortcuts.stopExercise'),
      category: 'typing',
    },

    // Settings
    {
      key: ',',
      ctrl: true,
      description: t('shortcuts.openSettings'),
      category: 'settings',
    },
    {
      key: 'T',
      ctrl: true,
      description: t('shortcuts.themeSwitch'),
      category: 'settings',
    },
    {
      key: 'M',
      ctrl: true,
      description: t('shortcuts.toggleSound'),
      category: 'settings',
    },

    // General
    {
      key: '?',
      shift: true,
      description: t('shortcuts.showHotkeys'),
      category: 'general',
    },
    {
      key: 'K',
      ctrl: true,
      description: t('shortcuts.commandPalette'),
      category: 'general',
    },
  ]

  const categories = {
    navigation: { title: t('shortcuts.category.navigation'), icon: '🧭' },
    typing: { title: t('shortcuts.category.typing'), icon: '⌨️' },
    settings: { title: t('shortcuts.category.settings'), icon: '⚙️' },
    general: { title: t('shortcuts.category.general'), icon: '✨' },
  }

  const groupedShortcuts = Object.entries(categories).map(([key, meta]) => ({
    ...meta,
    shortcuts: shortcuts.filter(s => s.category === key),
  }))

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-dark-900/95 backdrop-blur-sm border-b border-dark-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <span>⌨️</span>
                {t('shortcuts.modalTitle')}
              </h2>
              <p className="text-dark-400 text-sm mt-1">
                {t('shortcuts.fastAccess')}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-dark-800 hover:bg-dark-700 transition-colors flex items-center justify-center"
              aria-label={t('action.close')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {groupedShortcuts.map(group => (
            <div key={group.title}>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span>{group.icon}</span>
                {group.title}
              </h3>
              <div className="space-y-2">
                {group.shortcuts.map((shortcut, index) => (
                  <div
                    key={`${group.title}-${index}`}
                    className="flex items-center justify-between p-3 bg-dark-800/30 rounded-lg"
                  >
                    <span className="text-sm text-dark-300">
                      {shortcut.description}
                    </span>
                    <div className="flex items-center gap-1">
                      {shortcut.ctrl && <Kbd>Ctrl</Kbd>}
                      {shortcut.shift && <Kbd>Shift</Kbd>}
                      {shortcut.alt && <Kbd>Alt</Kbd>}
                      <Kbd>{shortcut.key}</Kbd>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Tips */}
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <span>💡</span>
              {t('shortcuts.tipTitle')}
            </h4>
            <p className="text-xs text-dark-400">
              {t('shortcuts.tip')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="px-2 py-1 text-xs font-semibold bg-dark-700 border border-dark-600 rounded shadow-sm">
      {children}
    </kbd>
  )
}
