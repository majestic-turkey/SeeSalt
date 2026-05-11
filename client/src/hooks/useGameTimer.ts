import { useEffect, useRef, useState } from "react";

export default function useGameTimer(onComplete?: () => void) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function startTimer(seconds: number) {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setTimeLeft(seconds)
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(intervalRef.current!)
          intervalRef.current = null
          onComplete?.()
          return null
        }
        return prev - 1
      })
    }, 1000)
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  return { timeLeft, startTimer }
}