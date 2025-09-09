/**
 * Logging utility functions
 */
import { logger } from '../logger';

/**
 * Wysyła wiadomość do UI w celu jej zalogowania w konsoli deweloperskiej przeglądarki.
 * @param message Wiadomość do zalogowania.
 * @param type Typ logu (log, warn, error).
 */
export function log(message: string, type: 'log' | 'warn' | 'error' = 'log', data?: any, importType?: string, filesCount?: number) {
  // Convert type to match logger interface
  const logType = type === 'log' ? 'info' : type === 'warn' ? 'warn' : 'error';
  logger.log(message, logType, data, importType, filesCount);
}