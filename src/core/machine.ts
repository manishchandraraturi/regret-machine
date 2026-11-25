import type { ScenesConfig, ScreenId } from './types';

export interface MachineOptions {
  skipFairFight?: boolean;
  onNavigate?: (screen: ScreenId) => void;
}

export interface Machine {
  flow(): ScreenId[];
  current(): ScreenId;
  go(to: ScreenId): ScreenId;
  next(): ScreenId;
  jumpToResult(): ScreenId;
  reset(): ScreenId;
}

export function buildFlow(config: ScenesConfig): ScreenId[] {
  const [s1, s2, s3, s4] = config.order;
  return [
    'attract',
    'shelf',
    'flip1',
    s1,
    'flip2',
    s2,
    s3,
    'flip3',
    s4,
    'receipt',
    'fairfight',
    'result',
    'staff',
  ];
}

export function createMachine(config: ScenesConfig, options: MachineOptions = {}): Machine {
  const sequence = buildFlow(config);
  const skipFairFight = options.skipFairFight ?? true;
  let index = 0;

  const notify = (): ScreenId => {
    const id = sequence[index];
    options.onNavigate?.(id);
    return id;
  };

  return {
    flow(): ScreenId[] {
      return [...sequence];
    },
    current(): ScreenId {
      return sequence[index];
    },
    go(to: ScreenId): ScreenId {
      const targetIdx = sequence.indexOf(to);
      if (targetIdx < 0) {
        throw new Error(`Unknown screen: ${to}`);
      }
      index = targetIdx;
      return notify();
    },
    next(): ScreenId {
      let nextIdx = (index + 1) % sequence.length;
      if (skipFairFight && sequence[nextIdx] === 'fairfight') {
        nextIdx = (nextIdx + 1) % sequence.length;
      }
      index = nextIdx;
      return notify();
    },
    jumpToResult(): ScreenId {
      return this.go('result');
    },
    reset(): ScreenId {
      index = 0;
      return notify();
    },
  };
}
