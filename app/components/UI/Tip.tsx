import type { ReactNode } from 'react';
import styles from './Tip.module.scss';

/**
 * Hover / keyboard-focus tooltip rendered as a real DOM element (not the native `title`).
 * The wrapped control keeps its own aria-label; the bubble is visual only.
 */
export default function Tip({
  label,
  keys,
  side = 'top',
  align = 'center',
  children,
}: {
  label: string;
  keys?: string;
  side?: 'top' | 'bottom';
  align?: 'center' | 'end';
  children: ReactNode;
}) {
  return (
    <span className={styles.wrap}>
      {children}
      <span className={styles.tip} data-side={side} data-align={align} aria-hidden>
        {label}
        {keys && <kbd>{keys}</kbd>}
      </span>
    </span>
  );
}
