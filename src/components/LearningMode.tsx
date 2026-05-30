/**
 * LearningMode — Unified lesson browser with layout selector (JCUKEN/QWERTY/Dvorak)
 * Uses lessons from src/utils/lessons.ts as the single source of truth
 * @author Dupley Maxim Igorevich
 * @copyright 2025-2026 Dupley Maxim Igorevich
 */

import { useState, useMemo } from 'react'
import { useLocalStorageState } from '@hooks/useLocalStorageState'
import { lessons, isLessonUnlocked, type Lesson, type LessonLayout } from '@utils/lessons'

const LAYOUT_META: Record<LessonLayout, { label: string; flag: string; desc: string }> = {
  jcuken: { label: 'JCUKEN', flag: '🇷🇺', desc: 'Русская раскладка' },
  qwerty: { label: 'QWERTY', flag: '🇺🇸', desc: 'English layout' },
  dvorak: { label: 'Dvorak', flag: '🇺🇸', desc: 'Dvorak layout' },
}

interface LearningModeProps {
  onClose: () => void
  onBack: () => void
  onStartLesson: (lesson: Lesson, exercise: string) => void
}

export function LearningMode({ onClose, onBack: _onBack, onStartLesson }: LearningModeProps) {
  const [progress, setProgress] = useLocalStorageState<Record<string, boolean>>(
    'fastfingers_learning_progress',
    {}
  )
  const [layout, setLayout] = useState<LessonLayout>('jcuken')
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)

  const layoutLessons = useMemo(
    () => lessons.filter(l => l.layout === layout),
    [layout]
  )

  const completedLessons = useMemo(
    () => Object.entries(progress).filter(([, v]) => v).map(([k]) => parseInt(k, 10)),
    [progress]
  )

  const enrichedLessons = useMemo(() => {
    return layoutLessons.map(lesson => {
      const unlocked = isLessonUnlocked(lesson.id, completedLessons)
      const completed = progress[String(lesson.id)] || false
      return { ...lesson, unlocked, completed }
    })
  }, [layoutLessons, completedLessons, progress])

  const completedCount = enrichedLessons.filter(l => l.completed).length
  const progressPercent = enrichedLessons.length > 0 ? (completedCount / enrichedLessons.length) * 100 : 0

  const handleCompleteLesson = (lessonId: number) => {
    setProgress({ ...progress, [String(lessonId)]: true })
  }

  const handleStartExercise = (lesson: Lesson, exercise: string) => {
    handleCompleteLesson(lesson.id)
    onStartLesson(lesson, exercise)
  }

  const handleLayoutChange = (newLayout: LessonLayout) => {
    setLayout(newLayout)
    setSelectedLesson(null)
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-dark-900/95 backdrop-blur-sm border-b border-dark-700 p-6 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <span>📚</span>
                Режим обучения
              </h2>
              <p className="text-dark-400 text-sm mt-1">
                Пошаговое обучение слепой печати
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-dark-800 hover:bg-dark-700 transition-colors flex items-center justify-center"
              aria-label="Закрыть"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Layout Selector */}
          <div className="flex gap-2 mt-4">
            {(Object.keys(LAYOUT_META) as LessonLayout[]).map(key => {
              const meta = LAYOUT_META[key]
              const count = lessons.filter(l => l.layout === key).length
              const done = lessons.filter(l => l.layout === key && progress[String(l.id)]).length
              return (
                <button
                  key={key}
                  onClick={() => handleLayoutChange(key)}
                  className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    layout === key
                      ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                      : 'bg-dark-800/50 text-dark-400 hover:text-white border border-dark-700/30 hover:border-dark-700/50'
                  }`}
                >
                  <span>{meta.flag}</span>
                  <span>{meta.label}</span>
                  <span className="text-xs opacity-70">({done}/{count})</span>
                </button>
              )
            })}
          </div>

          {/* Progress */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-dark-400">{LAYOUT_META[layout].desc} — прогресс</span>
              <span className="font-semibold">
                {completedCount} / {enrichedLessons.length} уроков
              </span>
            </div>
            <div className="w-full h-2 bg-dark-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-600 to-emerald-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="p-6">
          {!selectedLesson ? (
            /* Lessons list */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {enrichedLessons.map((lesson) => {
                const isLocked = !lesson.unlocked
                return (
                  <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    isLocked={isLocked}
                    onSelect={() => !isLocked && setSelectedLesson(lesson)}
                  />
                )
              })}
            </div>
          ) : (
            /* Lesson details */
            <div>
              <button
                onClick={() => setSelectedLesson(null)}
                className="mb-4 text-sm text-dark-400 hover:text-white transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Назад к урокам
              </button>

              <div className="card p-6 mb-6">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{getLessonIcon(selectedLesson)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold">{selectedLesson.title}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-dark-800 text-dark-400">
                        Сложность {selectedLesson.difficulty}/10
                      </span>
                    </div>
                    <p className="text-dark-400 mb-4">{selectedLesson.description}</p>

                    {/* Requirements */}
                    <div className="flex gap-4 text-xs text-dark-500 mb-4">
                      <span>Мин. WPM: <strong className="text-dark-300">{selectedLesson.minWpm}</strong></span>
                      <span>Мин. точность: <strong className="text-dark-300">{selectedLesson.minAccuracy}%</strong></span>
                    </div>

                    {selectedLesson.focusKeys.length > 0 && (
                      <div>
                        <p className="text-sm text-dark-400 mb-2">Клавиши для изучения:</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedLesson.focusKeys.map(key => (
                            <div
                              key={key}
                              className="w-10 h-10 rounded-lg bg-dark-800 flex items-center justify-center font-mono font-bold text-lg border border-dark-700/50"
                            >
                              {key}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <h4 className="text-lg font-semibold mb-4">Упражнение</h4>
              <div className="card p-4 border border-dark-700/30">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-dark-400 mb-1">Текст для печати</p>
                    <p className="font-mono text-lg">{selectedLesson.text}</p>
                  </div>
                  <button
                    onClick={() => handleStartExercise(selectedLesson, selectedLesson.text)}
                    className="ml-4 px-6 py-3 bg-primary-600 hover:bg-primary-500 rounded-xl font-semibold transition-all flex-shrink-0"
                  >
                    Начать
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function getLessonIcon(lesson: Lesson): string {
  if (lesson.difficulty <= 2) return '🎯'
  if (lesson.difficulty <= 4) return '⬆️'
  if (lesson.difficulty <= 6) return '⌨️'
  if (lesson.difficulty <= 8) return '📝'
  return '✍️'
}

function LessonCard({
  lesson,
  isLocked,
  onSelect,
}: {
  lesson: Lesson & { unlocked: boolean; completed: boolean }
  isLocked: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      disabled={isLocked}
      className={`card p-5 text-left transition-all ${
        isLocked
          ? 'opacity-40 cursor-not-allowed'
          : 'hover:bg-dark-800/50 cursor-pointer hover:scale-[1.01]'
      } ${lesson.completed ? 'border border-green-500/30 bg-green-500/5' : 'border border-dark-700/30'}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-dark-800 flex items-center justify-center text-lg">
          {isLocked ? '🔒' : getLessonIcon(lesson)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h3 className="font-semibold text-sm">{lesson.title}</h3>
              <p className="text-xs text-dark-500">Сложность {lesson.difficulty}/10</p>
            </div>
            {lesson.completed && (
              <span className="text-green-400 text-sm flex-shrink-0 ml-2">✓</span>
            )}
          </div>
          <p className="text-xs text-dark-400 mb-2 line-clamp-2">{lesson.description}</p>
          <div className="flex items-center gap-3 text-xs text-dark-500">
            <span>WPM ≥ {lesson.minWpm}</span>
            <span>•</span>
            <span>Точность ≥ {lesson.minAccuracy}%</span>
            {lesson.focusKeys.length > 0 && (
              <>
                <span>•</span>
                <span>{lesson.focusKeys.length} клавиш</span>
              </>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}
