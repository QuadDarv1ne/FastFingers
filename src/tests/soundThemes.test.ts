import { describe, it, expect } from 'vitest'
import { SOUND_THEMES } from '@utils/soundThemes'

describe('Sound Themes', () => {
  it('should have at least one sound theme', () => {
    expect(SOUND_THEMES.length).toBeGreaterThan(0)
  })

  it('should have valid theme structure', () => {
    SOUND_THEMES.forEach(theme => {
      expect(theme).toHaveProperty('id')
      expect(theme).toHaveProperty('name')
      expect(theme).toHaveProperty('description')
      expect(theme).toHaveProperty('icon')
      expect(theme).toHaveProperty('sounds')
      expect(theme.sounds).toHaveProperty('keyPress')
      expect(theme.sounds).toHaveProperty('error')
      expect(theme.sounds).toHaveProperty('complete')
    })
  })

  it('should have unique theme IDs', () => {
    const ids = SOUND_THEMES.map(theme => theme.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  it('should include retro theme', () => {
    const retroTheme = SOUND_THEMES.find(theme => theme.id === 'retro')
    expect(retroTheme).toBeDefined()
    expect(retroTheme?.name).toBe('Ретро')
  })

  it('should have non-empty names and descriptions', () => {
    SOUND_THEMES.forEach(theme => {
      expect(theme.name.length).toBeGreaterThan(0)
      expect(theme.description.length).toBeGreaterThan(0)
      expect(theme.icon.length).toBeGreaterThan(0)
    })
  })
})
