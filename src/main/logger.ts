// Advanced logging system for Draftly plugin
export interface LogEntry {
  timestamp: string;
  type: 'info' | 'warn' | 'error' | 'success';
  message: string;
  data?: any;
  importType?: string;
  filesCount?: number;
  sessionId: string;
}

export class Logger {
  private sessionId: string;
  private logs: LogEntry[] = [];

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}-${now.getSeconds().toString().padStart(2, '0')}`;
  }

  public log(message: string, type: LogEntry['type'] = 'info', data?: any, importType?: string, filesCount?: number) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      type,
      message,
      data,
      importType,
      filesCount,
      sessionId: this.sessionId
    };

    this.logs.push(entry);
    
    // Console output with emojis
    const emoji = this.getLogEmoji(type);
    console.log(`${emoji} [${entry.timestamp}] ${message}`);
    if (data) console.log('📊 Data:', data);
  }

  private getLogEmoji(type: LogEntry['type']): string {
    switch (type) {
      case 'info': return '📝';
      case 'warn': return '⚠️';
      case 'error': return '❌';
      case 'success': return '✅';
      default: return '📝';
    }
  }


  public getAllLogs(): LogEntry[] {
    return [...this.logs];
  }

  public getLogsForExport(): string {
    return JSON.stringify({
      session: this.sessionId,
      generated: new Date().toISOString(),
      totalLogs: this.logs.length,
      logs: this.logs
    }, null, 2);
  }

  public clearLogs() {
    this.logs = [];
    this.log('Log history cleared', 'info');
  }
}

// Global logger instance
export const logger = new Logger();

// Convenience functions for backwards compatibility
export function log(message: string, type: LogEntry['type'] = 'info', data?: any, importType?: string, filesCount?: number) {
  logger.log(message, type, data, importType, filesCount);
}