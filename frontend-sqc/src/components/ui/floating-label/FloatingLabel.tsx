import React from 'react';
import styles from './FloatingLabel.module.css';

interface FloatingLabelProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string;
  size?: 'small' | 'medium' | 'large';
}

export function FloatingLabel({ label, size = 'medium', ...props }: FloatingLabelProps) {
  const id = props.id || `floating_outlined_${Math.random().toString(36).slice(2, 8)}`;
  return (
    <div className={`${styles.container} ${styles[size]}`}>
      <input
        type="text"
        id={id}
        className={styles.input}
        placeholder=" "
        {...props}
      />
      <label
        htmlFor={id}
        className={styles.label}
      >
        {label}
      </label>
    </div>
  );
} 