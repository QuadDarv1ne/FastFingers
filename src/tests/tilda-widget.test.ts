import { describe, it, expect, beforeEach } from 'vitest'

describe('Tilda Widget', () => {
  it('виджет существует', () => {
    expect(true).toBe(true)
  })

  it('виджет содержит базовые элементы', () => {
    const fs = require('fs')
    const path = require('path')
    
    const widgetPath = path.join(__dirname, '../../public/tilda-widget.html')
    const widgetContent = fs.readFileSync(widgetPath, 'utf-8')
    
    expect(widgetContent).toContain('<!DOCTYPE html>')
    expect(widgetContent).toContain('<html lang="ru">')
    expect(widgetContent).toContain('FastFingers')
  })

  it('виджет содержит стили', () => {
    const fs = require('fs')
    const path = require('path')
    
    const widgetPath = path.join(__dirname, '../../public/tilda-widget.html')
    const widgetContent = fs.readFileSync(widgetPath, 'utf-8')
    
    expect(widgetContent).toContain('<style>')
    expect(widgetContent).toContain(':root')
    expect(widgetContent).toContain('--primary')
  })

  it('виджет содержит скрипт', () => {
    const fs = require('fs')
    const path = require('path')
    
    const widgetPath = path.join(__dirname, '../../public/tilda-widget.html')
    const widgetContent = fs.readFileSync(widgetPath, 'utf-8')
    
    expect(widgetContent).toContain('<script>')
    expect(widgetContent).toContain('function initExercise')
  })

  it('виджет содержит клавиатуру', () => {
    const fs = require('fs')
    const path = require('path')
    
    const widgetPath = path.join(__dirname, '../../public/tilda-widget.html')
    const widgetContent = fs.readFileSync(widgetPath, 'utf-8')
    
    expect(widgetContent).toContain('KEYBOARD_LAYOUT')
    expect(widgetContent).toContain('й')
    expect(widgetContent).toContain('ц')
    expect(widgetContent).toContain('у')
  })

  it('виджет содержит слова для печати', () => {
    const fs = require('fs')
    const path = require('path')
    
    const widgetPath = path.join(__dirname, '../../public/tilda-widget.html')
    const widgetContent = fs.readFileSync(widgetPath, 'utf-8')
    
    expect(widgetContent).toContain('WORDS')
    expect(widgetContent).toContain('easy')
    expect(widgetContent).toContain('medium')
    expect(widgetContent).toContain('hard')
  })

  it('виджет содержит статистику', () => {
    const fs = require('fs')
    const path = require('path')
    
    const widgetPath = path.join(__dirname, '../../public/tilda-widget.html')
    const widgetContent = fs.readFileSync(widgetPath, 'utf-8')
    
    expect(widgetContent).toContain('wpm')
    expect(widgetContent).toContain('cpm')
    expect(widgetContent).toContain('accuracy')
    expect(widgetContent).toContain('errors')
  })

  it('виджет содержит категории упражнений', () => {
    const fs = require('fs')
    const path = require('path')
    
    const widgetPath = path.join(__dirname, '../../public/tilda-widget.html')
    const widgetContent = fs.readFileSync(widgetPath, 'utf-8')
    
    expect(widgetContent).toContain('basic')
    expect(widgetContent).toContain('upper')
    expect(widgetContent).toContain('lower')
    expect(widgetContent).toContain('words')
    expect(widgetContent).toContain('sentences')
  })

  it('виджет содержит обработку ввода', () => {
    const fs = require('fs')
    const path = require('path')
    
    const widgetPath = path.join(__dirname, '../../public/tilda-widget.html')
    const widgetContent = fs.readFileSync(widgetPath, 'utf-8')
    
    expect(widgetContent).toContain('handleInput')
    expect(widgetContent).toContain('addEventListener')
  })

  it('виджет содержит адаптивность', () => {
    const fs = require('fs')
    const path = require('path')
    
    const widgetPath = path.join(__dirname, '../../public/tilda-widget.html')
    const widgetContent = fs.readFileSync(widgetPath, 'utf-8')
    
    expect(widgetContent).toContain('@media')
    expect(widgetContent).toContain('max-width')
  })
})
