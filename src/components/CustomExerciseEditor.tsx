import { useState } from 'react'
import { useLocalStorageState } from '@hooks/useLocalStorageState'
import { useToast } from '@hooks/useToast'

export interface CustomExercise {
  id: string
  title: string
  text: string
  category: 'custom' | 'imported'
  difficulty: 1 | 2 | 3 | 4 | 5
  createdAt: string
  tags: string[]
}

interface CustomExerciseEditorProps {
  onClose: () => void
  onUseExercise?: (exercise: CustomExercise) => void
}

export function CustomExerciseEditor({ onClose, onUseExercise }: CustomExerciseEditorProps) {
  const [exercises, setExercises] = useLocalStorageState<CustomExercise[]>(
    'fastfingers_custom_exercises',
    []
  )
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const { showToast } = useToast()

  const [formData, setFormData] = useState({
    title: '',
    text: '',
    difficulty: 3 as 1 | 2 | 3 | 4 | 5,
    tags: '',
  })

  const handleCreate = () => {
    if (!formData.title.trim() || !formData.text.trim()) {
      showToast('Заполните название и текст', 'error')
      return
    }

    const newExercise: CustomExercise = {
      id: `custom-${Date.now()}`,
      title: formData.title.trim(),
      text: formData.text.trim(),
      category: 'custom',
      difficulty: formData.difficulty,
      createdAt: new Date().toISOString(),
      tags: formData.tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0),
    }

    setExercises([...exercises, newExercise])
    showToast('Упражнение создано', 'success')
    resetForm()
  }

  const handleUpdate = () => {
    if (!editingId) return

    const updated = exercises.map(ex =>
      ex.id === editingId
        ? {
            ...ex,
            title: formData.title.trim(),
            text: formData.text.trim(),
            difficulty: formData.difficulty,
            tags: formData.tags
              .split(',')
              .map(t => t.trim())
              .filter(t => t.length > 0),
          }
        : ex
    )

    setExercises(updated)
    showToast('Упражнение обновлено', 'success')
    resetForm()
  }

  const handleDelete = (id: string) => {
    if (confirm('Удалить это упражнение?')) {
      setExercises(exercises.filter(ex => ex.id !== id))
      showToast('Упражнение удалено', 'success')
    }
  }

  const handleEdit = (exercise: CustomExercise) => {
    setFormData({
      title: exercise.title,
      text: exercise.text,
      difficulty: exercise.difficulty,
      tags: exercise.tags.join(', '),
    })
    setEditingId(exercise.id)
    setIsCreating(true)
  }

  const resetForm = () => {
    setFormData({ title: '', text: '', difficulty: 3, tags: '' })
    setIsCreating(false)
    setEditingId(null)
  }

  const wordCount = formData.text.trim().split(/\s+/).filter(w => w.length > 0).length

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-dark-900/95 backdrop-blur-sm border-b border-dark-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <span>✏️</span>
                Кастомные упражнения
              </h2>
              <p className="text-dark-400 text-sm mt-1">
                Создавайте собственные тексты для практики
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
        </div>

        <div className="p-6">
          {!isCreating ? (
            /* List view */
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold">Мои упражнения</h3>
                  <p className="text-sm text-dark-400">{exercises.length} упражнений</p>
                </div>
                <button
                  onClick={() => setIsCreating(true)}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-500 rounded-xl font-semibold transition-all flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Создать
                </button>
              </div>

              {exercises.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-semibold mb-2">Нет упражнений</h3>
                  <p className="text-dark-400 mb-6">
                    Создайте своё первое упражнение
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {exercises.map(exercise => (
                    <ExerciseCard
                      key={exercise.id}
                      exercise={exercise}
                      onEdit={() => handleEdit(exercise)}
                      onDelete={() => handleDelete(exercise.id)}
                      onUse={() => onUseExercise?.(exercise)}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            /* Create/Edit form */
            <div>
              <button
                onClick={resetForm}
                className="mb-4 text-sm text-dark-400 hover:text-white transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Назад
              </button>

              <h3 className="text-lg font-semibold mb-6">
                {editingId ? 'Редактировать упражнение' : 'Новое упражнение'}
              </h3>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Название
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Например: Программирование на Python"
                    className="w-full px-4 py-3 bg-dark-800 rounded-xl border border-dark-700 focus:border-primary-500 focus:outline-none transition-colors"
                  />
                </div>

                {/* Text */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Текст упражнения
                  </label>
                  <textarea
                    value={formData.text}
                    onChange={e => setFormData({ ...formData, text: e.target.value })}
                    placeholder="Введите текст для практики..."
                    rows={8}
                    className="w-full px-4 py-3 bg-dark-800 rounded-xl border border-dark-700 focus:border-primary-500 focus:outline-none transition-colors resize-none"
                  />
                  <p className="text-xs text-dark-400 mt-2">
                    Слов: {wordCount}
                  </p>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Сложность
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(level => (
                      <button
                        key={level}
                        onClick={() => setFormData({ ...formData, difficulty: level as 1 | 2 | 3 | 4 | 5 })}
                        className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
                          formData.difficulty === level
                            ? 'bg-primary-600 text-white'
                            : 'bg-dark-800 text-dark-400 hover:bg-dark-700'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Теги (через запятую)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={e => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="python, программирование, код"
                    className="w-full px-4 py-3 bg-dark-800 rounded-xl border border-dark-700 focus:border-primary-500 focus:outline-none transition-colors"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={editingId ? handleUpdate : handleCreate}
                    className="flex-1 px-6 py-3 bg-primary-600 hover:bg-primary-500 rounded-xl font-semibold transition-all"
                  >
                    {editingId ? 'Сохранить' : 'Создать'}
                  </button>
                  <button
                    onClick={resetForm}
                    className="px-6 py-3 bg-dark-800 hover:bg-dark-700 rounded-xl font-semibold transition-all"
                  >
                    Отмена
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

function ExerciseCard({
  exercise,
  onEdit,
  onDelete,
  onUse,
}: {
  exercise: CustomExercise
  onEdit: () => void
  onDelete: () => void
  onUse: () => void
}) {
  const wordCount = exercise.text.split(/\s+/).filter(w => w.length > 0).length

  return (
    <div className="card p-4">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <h4 className="font-semibold mb-1">{exercise.title}</h4>
          <p className="text-sm text-dark-400 line-clamp-2 mb-2">
            {exercise.text}
          </p>
          <div className="flex items-center gap-3 text-xs text-dark-500">
            <span>{wordCount} слов</span>
            <span>•</span>
            <span>Сложность: {exercise.difficulty}/5</span>
            {exercise.tags.length > 0 && (
              <>
                <span>•</span>
                <div className="flex gap-1">
                  {exercise.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-dark-800 rounded">
                      {tag}
                    </span>
                  ))}
                  {exercise.tags.length > 2 && (
                    <span className="px-2 py-0.5 bg-dark-800 rounded">
                      +{exercise.tags.length - 2}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {onUse && (
            <button
              onClick={onUse}
              className="px-3 py-2 bg-primary-600 hover:bg-primary-500 rounded-lg text-sm font-semibold transition-all"
            >
              Использовать
            </button>
          )}
          <button
            onClick={onEdit}
            className="w-9 h-9 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors flex items-center justify-center"
            title="Редактировать"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="w-9 h-9 rounded-lg bg-red-600/20 hover:bg-red-600/30 transition-colors flex items-center justify-center text-red-400"
            title="Удалить"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
