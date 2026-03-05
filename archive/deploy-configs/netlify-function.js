# Netlify функции (опционально)
# Пример API endpoint для обработки форм

export async function handler(event, context) {
  // Обработка POST запросов
  if (event.httpMethod === 'POST') {
    const body = JSON.parse(event.body)
    
    // Здесь можно добавить логику обработки
    // Например, отправку email или сохранение в БД
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Form submitted successfully!',
        data: body 
      })
    }
  }

  return {
    statusCode: 405,
    body: JSON.stringify({ message: 'Method not allowed' })
  }
}
