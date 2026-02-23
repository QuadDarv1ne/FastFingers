import { motion } from 'framer-motion'

interface LoadingFallbackProps {
  message?: string
}

export function LoadingFallback({ message = 'Загрузка...' }: LoadingFallbackProps) {
  return (
    <div className="min-h-[400px] card flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-6">
          {/* Внешнее кольцо */}
          <motion.div
            className="absolute inset-0 border-4 border-primary-500/30 border-t-primary-500 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          {/* Внутреннее кольцо */}
          <motion.div
            className="absolute inset-2 border-4 border-primary-400/20 border-b-primary-400 rounded-full"
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          {/* Центральная точка */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <div className="w-2 h-2 bg-primary-500 rounded-full" />
          </motion.div>
        </div>
        <motion.p 
          className="text-dark-300 font-medium"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {message}
        </motion.p>
        <motion.div
          className="flex justify-center gap-1 mt-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-primary-500 rounded-full"
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  )
}
