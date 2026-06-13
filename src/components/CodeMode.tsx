/**
 * CodeMode — Режим печати кода
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import { useState, useCallback, useMemo, useEffect, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TypingStats } from '../types'
import { useHotkey } from '../hooks/useHotkeys'
import { useToast } from '@contexts/ToastContext'
import { useAppTranslation } from '../i18n/config'
import { practiceTexts } from '../data/practiceTexts'
import { useCountdown } from '@hooks/useCountdown'
import { useTypingGame } from '@hooks/useTypingGame'
import { simulateInput } from '../utils/inputEvent'

interface CodeModeProps {
  onExit: () => void
  onComplete: (stats: TypingStats) => void
}

type CodeLanguage = 'all' | 'javascript' | 'typescript' | 'python' | 'java' | 'rust' | 'go' | 'sql' | 'css'

const LANGUAGE_FILTERS: Record<CodeLanguage, string[]> = {
  all: ['code'],
  javascript: ['code-1', 'code-2', 'code-4', 'code-5', 'code-6'],
  typescript: ['code-3'],
  python: ['code-7', 'code-8', 'code-9'],
  java: ['code-10', 'code-11'],
  rust: ['code-12', 'code-13'],
  go: ['code-14'],
  sql: ['code-15', 'code-16'],
  css: ['code-17', 'code-18'],
}

const LANGUAGE_LABELS: Record<CodeLanguage, string> = {
  all: 'Все языки',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  java: 'Java',
  rust: 'Rust',
  go: 'Go',
  sql: 'SQL',
  css: 'CSS',
}

const LANGUAGE_ICONS: Record<CodeLanguage, string> = {
  all: '🌐',
  javascript: '📜',
  typescript: '📘',
  python: '🐍',
  java: '☕',
  rust: '🦀',
  go: '🐹',
  sql: '🗄️',
  css: '🎨',
}

export const CodeMode = memo(function CodeMode({ onExit, onComplete }: CodeModeProps) {
  const { t } = useAppTranslation()
  const { showToast } = useToast()
  const [language, setLanguage] = useState<CodeLanguage>('all')
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null)

  const codeTexts = useMemo(() => {
    const allowedIds = LANGUAGE_FILTERS[language]
    if (language === 'all') {
      return practiceTexts.filter(text => text.category === 'code')
    }
    return practiceTexts.filter(text => allowedIds.includes(text.id))
  }, [language])

  const selectedText = useMemo(() => {
    if (selectedTextId) {
      return codeTexts.find(ct => ct.id === selectedTextId)
    }
    return null
  }, [selectedTextId, codeTexts])

  const textToType = selectedText?.text || ''

  const handleComplete = useCallback((stats: TypingStats) => {
    showToast(t('code.completed', { wpm: stats.wpm, accuracy: stats.accuracy }), 'success', 4000)
    onComplete(stats)
  }, [onComplete, showToast, t])

  const {
    currentIndex,
    inputResults,
    isActive,
    wpm,
    accuracy,
    inputRef,
    handleInput,
    handleStart: hookHandleStart,
    reset,
  } = useTypingGame({
    mode: 'practice',
    customText: textToType,
    onComplete: handleComplete,
  })

  const { countdown, start: startCountdown } = useCountdown({
    onComplete: hookHandleStart,
  })

  const handleStart = useCallback(() => {
    if (selectedTextId && textToType) {
      reset()
      startCountdown(3)
    }
  }, [selectedTextId, textToType, reset, startCountdown])

  useHotkey('escape', () => {
    if (countdown === null) {
      onExit()
    }
  }, { enabled: true })

  useHotkey('r', () => {
    if (countdown === null && !isActive && selectedTextId) {
      handleStart()
    }
  }, { enabled: true })

  useEffect(() => {
    reset()
  }, [selectedTextId, reset])

  const handleSkip = useCallback(() => {
    reset()
    setSelectedTextId(null)
    inputRef.current?.focus({ preventScroll: true })
  }, [reset, inputRef])

  // Handle key down instead of input to avoid controlled input loop
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return
    if (e.key.length > 1 && e.key !== 'Enter') return
    e.preventDefault()
    const input = e.currentTarget
    input.value = e.key === 'Enter' ? '\n' : e.key
    handleInput(simulateInput(input))
  }, [handleInput])

  const handleSelectRandomText = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * codeTexts.length)
    setSelectedTextId(codeTexts[randomIndex]?.id || null)
  }, [codeTexts])

  return (
    <div className="glass rounded-xl p-8 relative overflow-hidden">
      <AnimatePresence>
        {countdown !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-dark-900/90 z-50 flex items-center justify-center"
          >
            <motion.div
              key={countdown}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-9xl font-bold text-primary-400"
            >
              {countdown || 'GO'}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gradient flex items-center gap-2">
            {t('code.title')}
          </h2>
          <p className="text-sm text-dark-400">{t('code.subtitle')}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSelectRandomText}
            className="px-3 py-2 bg-dark-800 hover:bg-dark-700 rounded-lg text-sm font-medium transition-all"
            title={t('code.randomText')}
            aria-label={t('code.randomText')}
          >
            🎲
          </button>
          {!isActive && countdown === null && (
            <button
              onClick={handleStart}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-500 rounded-lg text-sm font-semibold transition-all"
              aria-label={t('action.start')}
            >
              {t('action.start')} (R)
            </button>
          )}
          <button
            onClick={onExit}
            className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
            title={`${t('action.exit')} (Escape)`}
            aria-label={t('action.exit')}
          >
            <svg className="w-5 h-5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mb-6">
        <label htmlFor="language-select" className="block text-sm text-dark-400 mb-2">
          Язык программирования
        </label>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(LANGUAGE_LABELS) as CodeLanguage[]).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                language === lang
                  ? 'bg-primary-600 text-white'
                  : 'bg-dark-800 text-dark-400 hover:text-white hover:bg-dark-700'
              }`}
            >
              <span>{LANGUAGE_ICONS[lang]}</span>
              <span className="hidden sm:inline">{LANGUAGE_LABELS[lang]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 max-h-40 overflow-y-auto">
        <p className="text-sm text-dark-400 mb-2">
          Доступно упражнений: <span className="text-white font-medium">{codeTexts.length}</span>
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {codeTexts.map((code) => (
            <button
              key={code.id}
              onClick={() => setSelectedTextId(code.id)}
              className={`p-2 rounded-lg text-xs text-left transition-all ${
                selectedTextId === code.id
                  ? 'bg-primary-600/20 border border-primary-500'
                  : 'bg-dark-800 hover:bg-dark-700'
              }`}
            >
              <p className="font-medium text-dark-300 truncate">{code.title}</p>
              <p className="text-dark-500">Сложность: {code.difficulty}/10</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6" role="region" aria-label={t('stats.title')}>
        <div className="bg-dark-800 rounded-lg p-4 text-center">
          <p className="text-sm text-dark-400">{t('common.wpm')}</p>
          <p className="text-3xl font-bold text-primary-400" aria-live="polite">{wpm}</p>
        </div>
        <div className="bg-dark-800 rounded-lg p-4 text-center">
          <p className="text-sm text-dark-400">{t('common.accuracy')}</p>
          <p className={`text-3xl font-bold ${accuracy >= 95 ? 'text-success' : accuracy >= 80 ? 'text-yellow-400' : 'text-error'}`} aria-live="polite">
            {accuracy}%
          </p>
        </div>
        <div className="bg-dark-800 rounded-lg p-4 text-center">
          <p className="text-sm text-dark-400">{t('common.chars')}</p>
          <p className="text-3xl font-bold text-dark-300" aria-live="polite">{currentIndex}</p>
        </div>
      </div>

      <div className="bg-dark-800/50 rounded-xl p-6 min-h-[120px] relative mb-4 font-mono">
        <input
          ref={inputRef}
          type="text"
          className="sr-only"
          aria-hidden="true"
          onKeyDown={handleKeyDown}
          disabled={!isActive || !selectedTextId}
          aria-label={t('exercise.custom')}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />

        <div className="font-mono text-base leading-relaxed break-all whitespace-pre-wrap">
          {textToType.split('').map((char, index) => {
            let status: 'correct' | 'incorrect' | 'current' | 'pending' = 'pending'

            if (index < currentIndex) {
              status = inputResults[index]?.isCorrect ? 'correct' : 'incorrect'
            } else if (index === currentIndex && isActive) {
              status = 'current'
            }

            return (
              <span
                key={index}
                className={`inline-flex items-center justify-center min-w-[0.6em] h-[1.2em] rounded ${
                  status === 'correct' ? 'bg-green-500/20 text-green-400' :
                  status === 'incorrect' ? 'bg-red-500/20 text-red-400' :
                  status === 'current' ? 'bg-violet-500/30 text-violet-400 border-2 border-violet-500 animate-pulse' :
                  'text-dark-500'
                }`}
                aria-hidden="true"
              >
                {char}
              </span>
            )
          })}
        </div>

        {!selectedTextId && (
          <div className="absolute inset-0 bg-dark-900/80 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <svg className="w-16 h-16 text-primary-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <p className="text-lg text-dark-300 mb-4">{t('code.selectExercise')}</p>
              <button
                onClick={handleSelectRandomText}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-500 rounded-lg font-medium transition-colors"
                aria-label={t('code.randomText')}
              >
                🎲 {t('code.randomText')}
              </button>
            </div>
          </div>
        )}

        {selectedTextId && !isActive && countdown === null && (
          <div className="absolute inset-0 bg-dark-900/80 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <svg className="w-16 h-16 text-primary-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <p className="text-lg text-dark-300 mb-4">{t('code.readyPrompt')}</p>
              <button
                onClick={handleStart}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-500 rounded-lg font-medium transition-colors"
                aria-label={t('action.start')}
              >
                {t('action.start')}
              </button>
            </div>
          </div>
        )}
      </div>

      {isActive && (
        <div className="flex justify-center">
          <button
            onClick={handleSkip}
            className="px-4 py-2 text-dark-400 hover:text-white transition-colors text-sm"
            aria-label={t('action.skip')}
          >
            {t('action.skip')}
          </button>
        </div>
      )}

      <div className="mt-4 text-center text-xs text-dark-500">
        <p>{t('code.tip')}</p>
      </div>
    </div>
  )
})
