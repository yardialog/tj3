import fs from 'fs';
import path from 'path';

// Log levels
type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

// Log categories for different workflows
type LogCategory = 
  | 'VACANCY_CREATE' 
  | 'VACANCY_MODERATION' 
  | 'EMPLOYER_VERIFY'
  | 'AUTH'
  | 'APPLICATION'
  | 'GENERAL';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  data?: Record<string, unknown>;
  error?: string;
  stack?: string;
}

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');

function ensureLogsDir() {
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
}

// Get log file path based on date
function getLogFilePath(): string {
  const date = new Date().toISOString().split('T')[0];
  return path.join(logsDir, `app-${date}.log`);
}

// Format log entry
function formatLogEntry(entry: LogEntry): string {
  let logLine = `[${entry.timestamp}] [${entry.level}] [${entry.category}] ${entry.message}`;
  
  if (entry.data) {
    logLine += `\n  Data: ${JSON.stringify(entry.data, null, 2)}`;
  }
  
  if (entry.error) {
    logLine += `\n  Error: ${entry.error}`;
  }
  
  if (entry.stack) {
    logLine += `\n  Stack: ${entry.stack}`;
  }
  
  return logLine + '\n';
}

// Main logging function
function log(
  level: LogLevel,
  category: LogCategory,
  message: string,
  data?: Record<string, unknown>,
  error?: Error
) {
  ensureLogsDir();
  
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    category,
    message,
    data,
    error: error?.message,
    stack: error?.stack,
  };
  
  const logLine = formatLogEntry(entry);
  
  // Write to file
  const logFile = getLogFilePath();
  fs.appendFileSync(logFile, logLine, 'utf-8');
  
  // Also log to console in development
  if (process.env.NODE_ENV !== 'test') {
    const consoleMethod = level === 'ERROR' ? 'error' : level === 'WARN' ? 'warn' : 'log';
    console[consoleMethod](logLine.trim());
  }
}

// Convenience methods
export const logger = {
  debug: (category: LogCategory, message: string, data?: Record<string, unknown>) => 
    log('DEBUG', category, message, data),
    
  info: (category: LogCategory, message: string, data?: Record<string, unknown>) => 
    log('INFO', category, message, data),
    
  warn: (category: LogCategory, message: string, data?: Record<string, unknown>) => 
    log('WARN', category, message, data),
    
  error: (category: LogCategory, message: string, error?: Error, data?: Record<string, unknown>) => 
    log('ERROR', category, message, data, error),
};

// Export log file reader for viewing logs
export function getLogs(date?: string): string {
  ensureLogsDir();
  const logFile = date 
    ? path.join(logsDir, `app-${date}.log`)
    : getLogFilePath();
    
  if (!fs.existsSync(logFile)) {
    return 'Лог-файл не найден';
  }
  
  return fs.readFileSync(logFile, 'utf-8');
}

export function getRecentLogs(lines: number = 100): string {
  ensureLogsDir();
  const logFile = getLogFilePath();
  
  if (!fs.existsSync(logFile)) {
    return 'Лог-файл не найден';
  }
  
  const content = fs.readFileSync(logFile, 'utf-8');
  const allLines = content.split('\n').filter(Boolean);
  const recentLines = allLines.slice(-lines);
  
  return recentLines.join('\n');
}

// Get list of available log files
export function getLogFiles(): string[] {
  ensureLogsDir();
  return fs.readdirSync(logsDir)
    .filter(f => f.startsWith('app-') && f.endsWith('.log'))
    .sort()
    .reverse();
}
