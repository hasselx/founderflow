"use client"

import { motion } from "motion/react"

interface AnimatedWelcomeProps {
  userName: string
  speed?: number
}

export function AnimatedWelcome({ userName, speed = 1.2 }: AnimatedWelcomeProps) {
  const text = `Welcome back, ${userName}!`
  const letters = text.split("")

  return (
    <motion.div className="mb-6 sm:mb-8">
      {/* Animated text */}
      <motion.h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight">
        {letters.map((letter, index) => (
          <motion.span
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: index * 0.03,
              ease: "easeOut",
            }}
            className="inline-block"
          >
            {letter === " " ? "\u00A0" : letter}
          </motion.span>
        ))}
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="text-xs sm:text-sm md:text-base text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.5,
          delay: text.length * 0.03 + 0.2,
        }}
      >
        Here's what's happening with your startup journey today.
      </motion.p>
    </motion.div>
  )
}
