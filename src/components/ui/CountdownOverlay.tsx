import { motion, AnimatePresence } from 'framer-motion'

interface CountdownOverlayProps {
  countdown: number | null
  colorClass?: string
}

export function CountdownOverlay({ countdown, colorClass = 'text-primary-400' }: CountdownOverlayProps) {
  return (
    <AnimatePresence>
      {countdown !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-dark-900/90 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            key={countdown}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`text-9xl font-bold ${colorClass}`}
          >
            {countdown || 'GO'}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
