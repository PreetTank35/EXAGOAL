'use client';

import { useEffect, useCallback } from 'react';

interface LockdownOptions {
  blockCamera?: boolean;
  blockClipboard?: boolean;
  blockContextMenu?: boolean;
  blockKeyboardShortcuts?: boolean;
  enforceFullscreen?: boolean;
  detectTabSwitch?: boolean;
}

const DEFAULT_OPTIONS: LockdownOptions = {
  blockCamera: true,
  blockClipboard: true,
  blockContextMenu: true,
  blockKeyboardShortcuts: true,
  enforceFullscreen: true,
  detectTabSwitch: true,
};

/**
 * Anti-cheat lockdown hook for exam sessions.
 * Blocks camera, clipboard, context menu, keyboard shortcuts,
 * enforces fullscreen, and detects tab switches.
 */
export function useExamLockdown(
  sessionId: string,
  enabled: boolean = true,
  options: LockdownOptions = DEFAULT_OPTIONS
) {
  const logEvent = useCallback(
    async (eventType: string, details: Record<string, unknown> = {}) => {
      try {
        await fetch(`/api/sessions/${sessionId}/events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event_type: eventType,
            event_data: { ...details, timestamp: Date.now() },
          }),
        });
      } catch {
        // Silent fail — don't disrupt exam
      }
    },
    [sessionId]
  );

  useEffect(() => {
    if (!enabled) return;

    const cleanupFns: (() => void)[] = [];

    // L2: Override getUserMedia to block camera
    if (options.blockCamera && navigator.mediaDevices) {
      const originalGetUserMedia =
        navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);

      navigator.mediaDevices.getUserMedia = async (constraints) => {
        if (constraints && (constraints as MediaStreamConstraints).video) {
          logEvent('camera_block', { message: 'Camera access blocked' });
          throw new DOMException(
            'Camera access is disabled during examinations.',
            'NotAllowedError'
          );
        }
        return originalGetUserMedia(constraints);
      };

      cleanupFns.push(() => {
        if (navigator.mediaDevices) {
          navigator.mediaDevices.getUserMedia = originalGetUserMedia;
        }
      });
    }

    // Block right-click context menu
    if (options.blockContextMenu) {
      const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        logEvent('right_click');
      };
      document.addEventListener('contextmenu', handleContextMenu);
      cleanupFns.push(() =>
        document.removeEventListener('contextmenu', handleContextMenu)
      );
    }

    // Block clipboard operations
    if (options.blockClipboard) {
      const handleClipboard = (e: ClipboardEvent) => {
        e.preventDefault();
        logEvent('copy_attempt', { type: e.type });
      };
      document.addEventListener('copy', handleClipboard);
      document.addEventListener('cut', handleClipboard);
      document.addEventListener('paste', handleClipboard);
      cleanupFns.push(() => {
        document.removeEventListener('copy', handleClipboard);
        document.removeEventListener('cut', handleClipboard);
        document.removeEventListener('paste', handleClipboard);
      });
    }

    // Block keyboard shortcuts
    if (options.blockKeyboardShortcuts) {
      const handleKeydown = (e: KeyboardEvent) => {
        if (
          (e.ctrlKey &&
            ['c', 'v', 'x', 'a', 'p', 's'].includes(e.key.toLowerCase())) ||
          e.key === 'PrintScreen' ||
          (e.altKey && e.key === 'Tab')
        ) {
          e.preventDefault();
          logEvent('copy_attempt', { key: e.key });
        }
      };
      document.addEventListener('keydown', handleKeydown);
      cleanupFns.push(() =>
        document.removeEventListener('keydown', handleKeydown)
      );
    }

    // Detect tab switches
    if (options.detectTabSwitch) {
      const handleVisibility = () => {
        if (document.hidden) {
          logEvent('tab_switch');
        }
      };
      document.addEventListener('visibilitychange', handleVisibility);
      cleanupFns.push(() =>
        document.removeEventListener('visibilitychange', handleVisibility)
      );
    }

    // Enforce fullscreen
    if (options.enforceFullscreen) {
      const handleFullscreenExit = () => {
        if (!document.fullscreenElement) {
          logEvent('fullscreen_exit');
        }
      };
      document.addEventListener('fullscreenchange', handleFullscreenExit);
      cleanupFns.push(() => {
        document.removeEventListener('fullscreenchange', handleFullscreenExit);
      });

      // Enter fullscreen
      document.documentElement.requestFullscreen().catch(() => {});
      cleanupFns.push(() => {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
      });
    }

    return () => {
      cleanupFns.forEach((fn) => fn());
    };
  }, [enabled, options, logEvent]);

  const requestFullscreen = useCallback(() => {
    document.documentElement.requestFullscreen().catch(() => {});
  }, []);

  return { requestFullscreen };
}
