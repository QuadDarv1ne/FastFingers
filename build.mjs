/**
 * Build script to avoid Git Bash / npx argument parsing issues on Windows
 * Usage: node build.mjs
 */
import { build } from 'vite'

try {
  await build()
  console.log('✓ Build completed successfully')
} catch (error) {
  console.error('✗ Build failed:', error.message)
  process.exit(1)
}
