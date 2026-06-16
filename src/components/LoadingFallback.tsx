import { memo } from 'react'
import { motion } from 'framer-motion'

interface LoadingFallbackProps {
  message?: string
}

function LoadingFallback({ message }: LoadingFallbackProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[40vh] flex items-center justify-center"
    >
      <div className="text-center space-y-4">
        <div className="relative w-16 h-16 mx-auto">
          <motion.div
            className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-500/30 to-primary-700/30 border border-primary-500/20"
            animate={{ scale: [1, 1.05, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-8 h-8 text-primary-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
          </div>
        </div>
        <div className="space-y-2">
          <div className="w-32 h-3 mx-auto rounded-full bg-dark-700/50 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary-500/40 via-primary-400/60 to-primary-500/40"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
          <div className="w-24 h-2 mx-auto rounded-full bg-dark-800/50" />
        </div>
        {message && (
          <p className="text-sm text-dark-400 font-medium mt-2">{message}</p>
        )}
      </div>
    </motion.div>
  )
}

export default memo(LoadingFallback)
