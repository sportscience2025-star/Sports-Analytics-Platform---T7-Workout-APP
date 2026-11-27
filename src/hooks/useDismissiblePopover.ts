/**
 * src/hooks/useDismissiblePopover.ts
 * Hook riutilizzabile per la gestione di popover chiudibili tramite click esterno o tasto Escape,
 * con ripristino automatico del focus sul pulsante trigger alla chiusura da tastiera (WCAG 2.1).
 * Conforme a Regola 02 (costanti in MAIUSCOLO, commenti JSDoc completi, zero codice duplicato).
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';

export const POPOVER_DISMISS_KEY = 'Escape';
export const EVENT_OUTSIDE_POINTER = 'mousedown';
export const EVENT_DISMISS_KEYDOWN = 'keydown';
export const FOCUS_VISIBLE_SELECTOR = ':focus-visible';

export interface UseDismissiblePopoverOptions {
  /** Stato iniziale di apertura del popover (default: false). */
  initialOpen?: boolean;
  /** Callback opzionale invocata alla chiusura del popover. */
  onClose?: () => void;
}

export interface UseDismissiblePopoverReturn {
  /** Indica se il popover e attualmente aperto. */
  isOpen: boolean;
  /** Setter diretto dello stato di apertura. */
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  /** Alterna lo stato di apertura/chiusura del popover. */
  toggle: () => void;
  /** Chiude il popover ed opzionalmente ripristina il focus sul trigger. */
  close: (restoreFocus?: boolean) => void;
  /** Ref del contenitore radice (trigger + popover) per intercettare click esterni. */
  containerRef: React.RefObject<HTMLDivElement>;
  /** Ref del pulsante trigger per il ripristino del focus alla chiusura con Escape. */
  triggerRef: React.RefObject<HTMLButtonElement>;
}

/**
 * Verifica in modo puro se la pressione di un tasto debba chiudere il popover.
 * @param key Identificativo del tasto premuto (`KeyboardEvent.key`)
 * @returns true se il tasto corrisponde a Escape
 */
export function shouldDismissOnKey(key: string): boolean {
  return key === POPOVER_DISMISS_KEY;
}

/**
 * Verifica in modo sicuro per SSR e DOM se un target pointer e esterno al contenitore del popover.
 * @param container Nodo radice del popover
 * @param target Target dell'evento pointer/mouse
 * @returns true se il target e un nodo DOM esterno al contenitore
 */
export function shouldDismissOnOutsidePointer(
  container: Node | null,
  target: EventTarget | null
): boolean {
  if (!container || typeof Node === 'undefined' || !(target instanceof Node)) {
    return false;
  }
  return !container.contains(target);
}

/**
 * Determina se l'elemento che ha ricevuto il focus dovrebbe mostrare l'anello `:focus-visible`.
 * @param target Elemento destinatario dell'evento focus
 * @returns true se il focus e visibile da tastiera (o in fallback se `:focus-visible` non e supportato)
 */
export function isKeyboardFocusTarget(target: EventTarget | null): boolean {
  if (typeof Element === 'undefined' || !(target instanceof Element)) {
    return false;
  }
  try {
    return target.matches(FOCUS_VISIBLE_SELECTOR);
  } catch {
    return true;
  }
}

/**
 * Hook condiviso per popover accessibili con chiusura su click esterno, Escape e focus restoration.
 * @param options Opzioni di configurazione iniziale e callback di chiusura
 * @returns Stato, azioni (`toggle`, `close`) e ref (`containerRef`, `triggerRef`)
 */
export function useDismissiblePopover(
  options: UseDismissiblePopoverOptions = {}
): UseDismissiblePopoverReturn {
  const { initialOpen = false, onClose } = options;

  const [isOpen, setIsOpen] = useState<boolean>(initialOpen);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef<(() => void) | undefined>(onClose);

  onCloseRef.current = onClose;

  /**
   * Chiude il popover, notifica `onClose` e ripristina il focus sul trigger se richiesto.
   * @param restoreFocus Se true, sposta il focus sul pulsante trigger
   */
  const close = useCallback((restoreFocus = false): void => {
    setIsOpen(false);
    onCloseRef.current?.();
    if (restoreFocus) {
      triggerRef.current?.focus();
    }
  }, []);

  /**
   * Alterna l'apertura del popover garantendo l'invocazione di `onClose` in chiusura.
   */
  const toggle = useCallback((): void => {
    if (isOpen) {
      close(false);
    } else {
      setIsOpen(true);
    }
  }, [isOpen, close]);

  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') {
      return;
    }

    /**
     * Chiude il popover quando il click `mousedown` avviene fuori dal contenitore.
     * @param event Evento mouse nativo del documento
     */
    const handlePointerDownOutside = (event: MouseEvent): void => {
      if (shouldDismissOnOutsidePointer(containerRef.current, event.target)) {
        close(false);
      }
    };

    /**
     * Chiude il popover alla pressione di Escape e riporta il focus sul trigger.
     * @param event Evento tastiera nativo del documento
     */
    const handleEscapeKeyDown = (event: KeyboardEvent): void => {
      if (shouldDismissOnKey(event.key)) {
        event.preventDefault();
        close(true);
      }
    };

    document.addEventListener(EVENT_OUTSIDE_POINTER, handlePointerDownOutside);
    document.addEventListener(EVENT_DISMISS_KEYDOWN, handleEscapeKeyDown);

    return () => {
      document.removeEventListener(EVENT_OUTSIDE_POINTER, handlePointerDownOutside);
      document.removeEventListener(EVENT_DISMISS_KEYDOWN, handleEscapeKeyDown);
    };
  }, [isOpen, close]);

  return {
    isOpen,
    setIsOpen,
    toggle,
    close,
    containerRef,
    triggerRef
  };
}

export default useDismissiblePopover;
