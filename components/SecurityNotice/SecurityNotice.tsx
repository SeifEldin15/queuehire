'use client';

import { Shield, Lock, Eye, Database } from 'lucide-react';
import styles from './SecurityNotice.module.css';

export default function SecurityNotice() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Shield className={styles.icon} />
        <h3>Your Security is Our Priority</h3>
      </div>
      
      <div className={styles.features}>
        <div className={styles.feature}>
          <Lock size={16} />
          <span>End-to-end encryption</span>
        </div>
        <div className={styles.feature}>
          <Database size={16} />
          <span>Secure data isolation</span>
        </div>
        <div className={styles.feature}>
          <Eye size={16} />
          <span>Privacy by design</span>
        </div>
      </div>
      
      <p className={styles.description}>
        We use industry-standard security measures including password hashing, 
        secure sessions, and database-level access controls to protect your data.
      </p>
    </div>
  );
}
