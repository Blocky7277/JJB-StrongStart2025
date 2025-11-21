/**
 * Centralized logging utility
 * Replaces console.log with proper log levels and production filtering
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  data?: any
  timestamp: number
}

class Logger {
  private isDevelopment = typeof process !== 'undefined' && process.env?.NODE_ENV === 'development'
  private logs: LogEntry[] = []
  private maxLogs = 100

  private shouldLog(level: LogLevel): boolean {
    if (this.isDevelopment) return true
    
    // In production, only log warnings and errors
    return level === 'warn' || level === 'error'
  }

  private log(level: LogLevel, message: string, data?: any): void {
    if (!this.shouldLog(level)) return

    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: Date.now(),
    }

    this.logs.push(entry)
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }

    // Output to console with appropriate method
    const consoleMethod = level === 'error' ? console.error 
                        : level === 'warn' ? console.warn
                        : level === 'info' ? console.info
                        : console.log

    if (data) {
      consoleMethod(`[${level.toUpperCase()}] ${message}`, data)
    } else {
      consoleMethod(`[${level.toUpperCase()}] ${message}`)
    }
  }

  debug(message: string, data?: any): void {
    this.log('debug', message, data)
  }

  info(message: string, data?: any): void {
    this.log('info', message, data)
  }

  warn(message: string, data?: any): void {
    this.log('warn', message, data)
  }

  error(message: string, error?: Error | any): void {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorData = error instanceof Error ? { 
      message: error.message, 
      stack: error.stack,
      name: error.name 
    } : error
    
    this.log('error', message || errorMessage, errorData)
  }

  getLogs(): LogEntry[] {
    return [...this.logs]
  }

  clearLogs(): void {
    this.logs = []
  }
}

export const logger = new Logger()





