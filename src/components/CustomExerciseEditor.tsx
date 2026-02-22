import { useState } from 'react'
import { Exercise } from '../types'

interface CustomExerciseEditorProps {
  onSave: (exercise: Exercise) => void
  onCancel: () => void
}

export function CustomExerciseEditor({ onSave, onCancel }: CustomExerciseEditorProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [text, setText] = useState('')
  const [difficulty, setDifficulty] = useState(5)
  const [category, setCategory] = useState('custom')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      setError('Введите название упражнения')
      return
    }
    
    if (!text.trim()) {
      setError('Введите текст для печати')
      return
    }
    
    if (text.trim().length < 10) {
      setError('Текст должен быть не менее 10 символов')
      return
    }

    const exercise: Exercise = {
      id: `custom-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || 'Пользовательское упражнение',
      text: text.trim(),
      difficulty,
      category,
      focusKeys: [],
    }

    onSave(exercise)
  }

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">Создать упражнение</h2>
          <p className="text-sm text-dark-400">Добавьте свой текст для тренировки</p>
        </div>
        
        <button
          onClick={onCancel}
          className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Название */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Название *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Например: Технические термины"
            className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Описание */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Описание
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Краткое описание упражнения"
            className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Текст для печати */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Текст для печати *
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Введите текст, который будете печатать..."
            rows={5}
            className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm resize-none"
          />
          <p className="text-xs text-dark-500 mt-1">
            Минимум 10 символов. Сейчас: {text.length}
          </p>
        </div>

        {/* Сложность */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Сложность: {difficulty}/10
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={difficulty}
            onChange={(e) => setDifficulty(Number(e.target.value))}
            className="w-full accent-primary-500"
          />
          <div className="flex justify-between text-xs text-dark-500 mt-1">
            <span>Легко</span>
            <span>Сложно</span>
          </div>
        </div>

        {/* Категория */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Категория
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="custom">Пользовательское</option>
            <option value="words">Слова</option>
            <option value="sentences">Предложения</option>
            <option value="code">Код</option>
          </select>
        </div>

        {/* Ошибка */}
        {error && (
          <div className="p-3 bg-error/20 border border-error/50 rounded-lg text-error text-sm">
            {error}
          </div>
        )}

        {/* Кнопки */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 bg-dark-800 hover:bg-dark-700 rounded-lg font-medium transition-colors"
          >
            Отмена
          </button>
          <button
            type="submit"
            className="flex-1 py-3 bg-primary-600 hover:bg-primary-500 rounded-lg font-medium transition-colors"
          >
            Сохранить
          </button>
        </div>
      </form>
    </div>
  )
}
