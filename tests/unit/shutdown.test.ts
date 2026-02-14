import { describe, it, expect, vi } from 'vitest';
import { ShutdownManager } from '../../src/shutdown.js';

describe('ShutdownManager', () => {
  it('calls handlers in reverse order', async () => {
    const order: string[] = [];
    const manager = new ShutdownManager();

    manager.register('first', async () => {
      order.push('first');
    });
    manager.register('second', async () => {
      order.push('second');
    });

    await manager.shutdown();
    expect(order).toEqual(['second', 'first']);
  });

  it('calls all handlers even if one fails', async () => {
    const order: string[] = [];
    const manager = new ShutdownManager();

    manager.register('a', async () => {
      order.push('a');
    });
    manager.register('b', async () => {
      throw new Error('oops');
    });
    manager.register('c', async () => {
      order.push('c');
    });

    await manager.shutdown();
    expect(order).toEqual(['c', 'a']);
  });

  it('only shuts down once', async () => {
    const fn = vi.fn();
    const manager = new ShutdownManager();
    manager.register('once', fn);

    await manager.shutdown();
    await manager.shutdown();
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
