import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { ActivityLog } from '../types';

const ACTIVITY_LOGS_COLLECTION = 'activityLogs';

export const activityLogService = {
  async log(params: Omit<ActivityLog, 'id' | 'timestamp'>): Promise<void> {
    try {
      const id = `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const logEntry: ActivityLog = {
        ...params,
        id,
        timestamp: new Date().toISOString(),
      };
      await setDoc(doc(db, ACTIVITY_LOGS_COLLECTION, id), logEntry);
    } catch (err) {
      console.warn('Activity log not stored:', err);
    }
  }
};
