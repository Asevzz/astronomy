import admin from 'firebase-admin';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

const serviceAccount = await import('../../astronomiya-bbe10-firebase-adminsdk-fbsvc-e12eabc72a.json', {
  with: { type: 'json' }
}).then(m => m.default);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
});

export const db: Firestore = getFirestore();
export const auth: ReturnType<typeof admin.auth> = admin.auth();