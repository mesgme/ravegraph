export class ShutdownManager {
  private handlers: { name: string; fn: () => Promise<void> }[] = [];
  private shuttingDown = false;

  register(name: string, fn: () => Promise<void>): void {
    this.handlers.push({ name, fn });
  }

  async shutdown(): Promise<void> {
    if (this.shuttingDown) return;
    this.shuttingDown = true;

    const reversed = [...this.handlers].reverse();
    for (const { name, fn } of reversed) {
      try {
        await fn();
      } catch (error) {
        console.error(`Shutdown handler "${name}" failed:`, error);
      }
    }
  }

  installSignalHandlers(): void {
    const handler = async () => {
      await this.shutdown();
      process.exit(0);
    };
    process.on('SIGINT', handler);
    process.on('SIGTERM', handler);
  }
}
