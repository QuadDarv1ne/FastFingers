import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { lessons, isLessonUnlocked, isLessonCompleted, Lesson } from '../utils/lessons'

interface LearningModeProps {
  onBack: () => void
}

export function LearningMode({ onBack }: LearningModeProps) {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [completedLessons, setCompletedLessons] = useState<number[]>(() => {
    const stored = localStorage.getItem('fastfingers_completed_lessons')
    return stored ? JSON.parse(stored) : []
  })
  const [currentText, setCurrentText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [results, setResults] = useState<{ isCorrect: boolean; char: string }[]>([])

  useEffect(() => {
    if (selectedLesson) {
      setCurrentText(selectedLesson.text)
      setCurrentIndex(0)
      setStartTime(null)
      setIsComplete(false)
      setResults([])
    }
  }, [selectedLesson])

  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value
    if (isComplete) return

    if (!startTime) setStartTime(Date.now())

    const newChar = value[value.length - 1]
    if (newChar && currentIndex < currentText.length) {
      const expectedChar = currentText[currentIndex]
      const isCorrect = newChar === expectedChar
      
      setResults(prev => [...prev, { isCorrect, char: newChar }])
      setCurrentIndex(prev => prev + 1)

      if (currentIndex >= currentText.length - 1) {
        handleLessonComplete()
      }
    }
    e.currentTarget.value = ''
  }

  const handleLessonComplete = () => {
    setIsComplete(true)
    const correct = results.filter(r => r.isCorrect).length
    const timeElapsed = startTime ? (Date.now() - startTime) / 1000 : 0
    const wpm = timeElapsed > 0 ? Math.round(correct / 5 / (timeElapsed / 60)) : 0
    const accuracy = results.length > 0 ? Math.round((correct / results.length) * 100) : 0

    if (selectedLesson && isLessonCompleted(wpm, accuracy, selectedLesson)) {
      if (!completedLessons.includes(selectedLesson.id)) {
        const newCompleted = [...completedLessons, selectedLesson.id]
        setCompletedLessons(newCompleted)
        localStorage.setItem('fastfingers_completed_lessons', JSON.stringify(newCompleted))
      }
    }
  }

  const nextLesson = () => {
    if (!selectedLesson) return
    const nextId = selectedLesson.id + 1
    const next = lessons.find(l => l.id === nextId)
    if (next && isLessonUnlocked(nextId, completedLessons)) {
      setSelectedLesson(next)
    } else {
      setSelectedLesson(null)
    }
  }

  return (
    <div className="min-h-screen bg-dark-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Заголовок */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gradient">📚 Обучение</h1>
            <p className="text-dark-400 mt-1">Поурочная программа слепой печати</p>
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-dark-800 hover:bg-dark-700 rounded-lg transition-colors"
          >
            ← Назад
          </button>
        </div>

        {!selectedLesson ? (
          /* Список уроков */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lessons.map((lesson) => {
              const unlocked = isLessonUnlocked(lesson.id, completedLessons)
              const completed = completedLessons.includes(lesson.id)

              return (
                <motion.button
                  key={lesson.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => unlocked && setSelectedLesson(lesson)}
                  disabled={!unlocked}
                  className={`p-6 rounded-xl border text-left transition-all ${
                    completed
                      ? 'bg-success/20 border-success/50'
                      : unlocked
                      ? 'glass hover:border-primary-500/50 cursor-pointer'
                      : 'bg-dark-800/30 border-dark-700 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        completed ? 'bg-success/20 text-success' : 'bg-primary-600/20 text-primary-400'
                      }`}>
                        {completed ? '✓' : lesson.id}
                      </div>
                      <div>
                        <h3 className="font-semibold">{lesson.title}</h3>
                        <p className="text-sm text-dark-400">{lesson.description}</p>
                      </div>
                    </div>
                    {!unlocked && <span className="text-2xl">🔒</span>}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-dark-500">
                    <span>Цель: {lesson.minWpm} WPM</span>
                    <span>Точность: {lesson.minAccuracy}%</span>
                    <span>Сложность: {'⭐'.repeat(lesson.difficulty)}</span>
                  </div>
                </motion.button>
              )
            })}
          </div>
        ) : (
          /* Режим урока */
          <div className="space-y-6">
            {/* Инфо урока */}
            <div className="glass rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold">{selectedLesson.title}</h2>
                  <p className="text-dark-400">{selectedLesson.description}</p>
                </div>
                <button
                  onClick={() => setSelectedLesson(null)}
                  className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-dark-800 rounded-lg p-3 text-center">
                  <p className="text-xs text-dark-400">Цель WPM</p>
                  <p className="text-xl font-bold text-primary-400">{selectedLesson.minWpm}</p>
                </div>
                <div className="bg-dark-800 rounded-lg p-3 text-center">
                  <p className="text-xs text-dark-400">Точность</p>
                  <p className="text-xl font-bold text-success">{selectedLesson.minAccuracy}%</p>
                </div>
                <div className="bg-dark-800 rounded-lg p-3 text-center">
                  <p className="text-xs text-dark-400">Сложность</p>
                  <p className="text-xl font-bold text-yellow-400">{'⭐'.repeat(selectedLesson.difficulty)}</p>
                </div>
              </div>
            </div>

            {/* Область ввода */}
            <div className="glass rounded-xl p-8 relative">
              <input
                type="text"
                className="opacity-0 absolute"
                onInput={handleInput}
                autoFocus
                disabled={isComplete}
              />

              <div className="font-mono text-xl leading-relaxed break-words mb-6" onClick={() => document.querySelector('input')?.focus()}>
                {currentText.split('').map((char, index) => {
                  let status: 'correct' | 'incorrect' | 'current' | 'pending' = 'pending'
                  if (index < currentIndex) {
                    status = results[index]?.isCorrect ? 'correct' : 'incorrect'
                  } else if (index === currentIndex && !isComplete) {
                    status = 'current'
                  }

                  return (
                    <span
                      key={index}
                      className={`inline-flex items-center justify-center min-w-[0.6em] h-[1.2em] rounded transition-all ${
                        status === 'correct' ? 'bg-green-500/20 text-green-500' :
                        status === 'incorrect' ? 'bg-red-500/20 text-red-500' :
                        status === 'current' ? 'bg-violet-500/30 text-violet-500 border-2 border-violet-500 animate-pulse' :
                        'text-dark-500'
                      }`}
                    >
                      {char}
                    </span>
                  )
                })}
              </div>

              {/* Прогресс */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 h-2 bg-dark-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-600 to-primary-400"
                    style={{ width: `${(currentIndex / currentText.length) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-dark-400">{currentIndex} / {currentText.length}</span>
              </div>

              {/* Результаты */}
              {isComplete && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-dark-800 rounded-xl p-6"
                >
                  <h3 className="text-xl font-bold mb-4">Результаты урока</h3>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {(() => {
                      const correct = results.filter(r => r.isCorrect).length
                      const timeElapsed = startTime ? (Date.now() - startTime) / 1000 : 0
                      const wpm = timeElapsed > 0 ? Math.round(correct / 5 / (timeElapsed / 60)) : 0
                      const accuracy = results.length > 0 ? Math.round((correct / results.length) * 100) : 0
                      const passed = wpm >= selectedLesson.minWpm && accuracy >= selectedLesson.minAccuracy

                      return (
                        <>
                          <div className="bg-dark-900 rounded-lg p-4 text-center">
                            <p className="text-sm text-dark-400">WPM</p>
                            <p className={`text-3xl font-bold ${wpm >= selectedLesson.minWpm ? 'text-success' : 'text-error'}`}>
                              {wpm}
                            </p>
                            <p className="text-xs text-dark-500">цель: {selectedLesson.minWpm}</p>
                          </div>
                          <div className="bg-dark-900 rounded-lg p-4 text-center">
                            <p className="text-sm text-dark-400">Точность</p>
                            <p className={`text-3xl font-bold ${accuracy >= selectedLesson.minAccuracy ? 'text-success' : 'text-error'}`}>
                              {accuracy}%
                            </p>
                            <p className="text-xs text-dark-500">цель: {selectedLesson.minAccuracy}%</p>
                          </div>
                          <div className="bg-dark-900 rounded-lg p-4 text-center">
                            <p className="text-sm text-dark-400">Статус</p>
                            <p className={`text-2xl font-bold ${passed ? 'text-success' : 'text-error'}`}>
                              {passed ? '✓ Пройден' : '✗ Не пройден'}
                            </p>
                          </div>
                        </>
                      )
                    })()}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={nextLesson}
                      className="flex-1 py-3 bg-primary-600 hover:bg-primary-500 rounded-lg font-medium transition-colors"
                    >
                      Следующий урок →
                    </button>
                    <button
                      onClick={() => {
                        setCurrentIndex(0)
                        setResults([])
                        setStartTime(null)
                        setIsComplete(false)
                      }}
                      className="flex-1 py-3 bg-dark-800 hover:bg-dark-700 rounded-lg font-medium transition-colors"
                    >
                      Повторить
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Подсказка */}
            <div className="text-center text-dark-500 text-sm">
              Нажмите на текст для фокуса и начните печатать
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
