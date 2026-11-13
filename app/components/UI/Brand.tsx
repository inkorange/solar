import Image from 'next/image';
import styles from './Brand.module.scss';

/** The Delta-V circle + delta mark (icon-only usages: rail, phone top bar). */
export function DeltaVMark({ size = 24 }: { size?: number }) {
  return (
    <Image src="/brand/delta-v-mark.png" alt="" width={size} height={size} className={styles.mark} aria-hidden />
  );
}

/** Full Delta-V lockup (mark + wordmark). Aspect ≈ 3.16 : 1. */
export function DeltaVLogo({ height = 32, alt = 'Delta-V' }: { height?: number; alt?: string }) {
  return (
    <Image
      src="/brand/delta-v-logo.png"
      alt={alt}
      width={Math.round(height * 3.164)}
      height={height}
      className={styles.logo}
      priority
    />
  );
}

/** "A project by inkOrange Studios" credit link. */
export function InkOrangeCredit({ compact = false }: { compact?: boolean }) {
  return (
    <a className={styles.credit} href="https://www.inkorangestudios.com" target="_blank" rel="noreferrer">
      {!compact && <span className={styles.creditLabel}>A project by</span>}
      <Image
        src="/brand/inkorange-logo.png"
        alt="inkOrange Studios"
        width={compact ? 66 : 82}
        height={compact ? 24 : 30}
        className={styles.ink}
      />
    </a>
  );
}
