import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const { email, secret } = await req.json();

    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!adminDb) {
      return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
    }

    // Find user by email
    const usersSnapshot = await adminDb.collection('users')
      .where('email', '==', email)
      .limit(1)
      .get();
      
    if (usersSnapshot.empty) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const userDoc = usersSnapshot.docs[0];
    
    await userDoc.ref.update({
      role: 'admin',
      isAdmin: true,
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true, message: `Successfully made ${email} an admin.` });

  } catch (error: any) {
    console.error('Admin bootstrap error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
