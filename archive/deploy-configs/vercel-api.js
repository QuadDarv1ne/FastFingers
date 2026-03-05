# Vercel функции (опционально)
# Пример API endpoint для обработки запросов

export default async function handler(req, res) {
  // Обработка POST запросов
  if (req.method === 'POST') {
    const body = req.body
    
    // Здесь можно добавить логику обработки
    // Например, отправку email или сохранение в БД
    
    res.status(200).json({ 
      message: 'Request processed successfully!',
      data: body 
    })
    return
  }

  res.status(405).json({ message: 'Method not allowed' })
}
