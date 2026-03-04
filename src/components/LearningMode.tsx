import { useState } from 'react'
import { useLocalStorageState } from '@hooks/useLocalStorageState'

interface Lesson {
  id: string
  title: string
  description: string
  level: number
  keys: string[]
  exercises: string[]
  completed: boolean
  icon: string
}

const LESSONS: Omit<Lesson, 'completed'>[] = [
  {
    id: 'lesson-1',
    title: 'Основной ряд',
    description: 'Изучите клавиши ФЫВА ОЛДЖ (ASDF JKL;)',
    level: 1,
    keys: ['ф', 'ы', 'в', 'а', 'о', 'л', 'д', 'ж'],
    exercises: [
      'фыва олдж',
      'фыва фыва олдж олдж',
      'ффф ввв ааа ооо ллл джж',
      'фывафыва олджолдж',
    ],
    icon: '🎯',
  },
  {
    id: 'lesson-2',
    title: 'Верхний ряд',
    description: 'Добавьте клавиши ЙЦУК ЕНГШ',
    level: 2,
    keys: ['й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш'],
    exercises: [
      'йцук енгш',
      'фыва йцук олдж енгш',
      'куй шен гук цен',
      'йцукен фывапролдж',
    ],
    icon: '⬆️',
  },
  {
    id: 'lesson-3',
    title: 'Нижний ряд',
    description: 'Добавьте клавиши ЯЧСМ ИТЬБ',
    level: 3,
    keys: ['я', 'ч', 'с', 'м', 'и', 'т', 'ь', 'б'],
    exercises: [
      'ячсм итьб',
      'час мяч сыт бит',
      'ячсмитьб фывапролдж',
      'часы мячи сыты биты',
    ],
    icon: '⬇️',
  },
  {
    id: 'lesson-4',
    title: 'Цифры',
    description: 'Научитесь печатать цифры',
    level: 4,
    keys: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    exercises: [
      '123 456 789 0',
      '1234567890',
      '111 222 333 444 555',
      '12 34 56 78 90',
    ],
    icon: '🔢',
  },
  {
    id: 'lesson-5',
    title: 'Знаки препинания',
    description: 'Освойте знаки препинания',
    level: 5,
    keys: ['.', ',', '!', '?', '-', ':', ';'],
    exercises: [
      'Привет, мир!',
      'Как дела? Отлично!',
      'Один, два, три.',
      'Вопрос: что это?',
    ],
    icon: '❓',
  },
  {
    id: 'lesson-6',
    title: 'Слова',
    description: 'Практикуйте простые слова',
    level: 6,
    keys: [],
    exercises: [
      'дом кот сад лес',
      'мама папа дети семья',
      'день ночь утро вечер',
      'вода огонь земля воздух',
    ],
    icon: '📝',
  },
  {
    id: 'lesson-7',
    title: 'Предложения',
    description: 'Печатайте целые предложения',
    level: 7,
    keys: [],
    exercises: [
      'Я учусь печатать быстро.',
      'Практика делает совершенным.',
      'Каждый день я становлюсь лучше.',
      'Слепая печать это полезный навык.',
    ],
    icon: '✍️',
  },
]

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
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)

  const lessons: Lesson[] = LESSONS.map(lesson => ({
    ...lesson,
    completed: progress[lesson.id] || false,
  }))

  const completedCount = lessons.filter(l => l.completed).length
  const progressPercent = (completedCount / lessons.length) * 100

  const handleCompleteLesson = (lessonId: string) => {
    setProgress({ ...progress, [lessonId]: true })
  }

  const handleStartExercise = (lesson: Lesson, exercise: string) => {
    onStartLesson(lesson, exercise)
    handleCompleteLesson(lesson.id)
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-dark-900/95 backdrop-blur-sm border-b border-dark-700 p-6">
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

          {/* Progress */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-dark-400">Общий прогресс</span>
              <span className="font-semibold">
                {completedCount} / {lessons.length} уроков
              </span>
            </div>
            <div className="w-full h-3 bg-dark-800 rounded-full overflow-hidden">
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
              {lessons.map((lesson, index) => {
                const isLocked = index > 0 && !lessons[index - 1]?.completed
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
                  <div className="text-4xl">{selectedLesson.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{selectedLesson.title}</h3>
                    <p className="text-dark-400 mb-4">{selectedLesson.description}</p>
                    
                    {selectedLesson.keys.length > 0 && (
                      <div>
                        <p className="text-sm text-dark-400 mb-2">Клавиши для изучения:</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedLesson.keys.map(key => (
                            <div
                              key={key}
                              className="w-10 h-10 rounded-lg bg-dark-800 flex items-center justify-center font-mono font-bold text-lg"
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

              <h4 className="text-lg font-semibold mb-4">Упражнения</h4>
              <div className="space-y-3">
                {selectedLesson.exercises.map((exercise, index) => (
                  <div key={index} className="card p-4 hover:bg-dark-800/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-dark-400 mb-1">Упражнение {index + 1}</p>
                        <p className="font-mono text-lg">{exercise}</p>
                      </div>
                      <button
                        onClick={() => handleStartExercise(selectedLesson, exercise)}
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-500 rounded-lg font-semibold transition-all"
                      >
                        Начать
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function LessonCard({
  lesson,
  isLocked,
  onSelect,
}: {
  lesson: Lesson
  isLocked: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      disabled={isLocked}
      className={`card p-6 text-left transition-all ${
        isLocked
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:bg-dark-800/50 cursor-pointer'
      } ${lesson.completed ? 'border border-green-500/30 bg-green-500/5' : ''}`}
    >
      <div className="flex items-start gap-4">
        <div className="text-4xl">{isLocked ? '🔒' : lesson.icon}</div>
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-lg">{lesson.title}</h3>
              <p className="text-xs text-dark-400">Уровень {lesson.level}</p>
            </div>
            {lesson.completed && (
              <span className="text-green-400 text-xl">✓</span>
            )}
          </div>
          <p className="text-sm text-dark-400 mb-3">{lesson.description}</p>
          <div className="flex items-center gap-2 text-xs text-dark-500">
            <span>{lesson.exercises.length} упражнений</span>
            {lesson.keys.length > 0 && (
              <>
                <span>•</span>
                <span>{lesson.keys.length} клавиш</span>
              </>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}
