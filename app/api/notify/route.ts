import { NextResponse } from 'next/server';
import { sendEmailNotification } from '@/lib/notifications';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';
import { adminAuth } from '@/lib/firebase-admin';

const notifySchema = z.object({
  type: z.enum(['booking_confirmation', 'payment_success', 'booking_cancellation', 'account_verification', 'alert']),
  to: z.object({
    email: z.string().email(),
  }),
  data: z.record(z.string(), z.any()),
});

export async function POST(req: Request) {
  try {
    // Rate limiting (10 requests per minute per IP)
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const { success, limit, remaining, reset } = rateLimit(ip, 10, 60 * 1000);
    
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        }
      });
    }

    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    if (adminAuth) {
      try {
        await adminAuth.verifyIdToken(token);
      } catch (error) {
        console.error('Token verification failed:', error);
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
    } else {
      // Fallback if adminAuth is not initialized (e.g., missing credentials in dev)
      console.warn('Skipping token verification because adminAuth is not initialized.');
    }

    // Input validation
    const body = await req.json();
    const result = notifySchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid request data', details: result.error.format() }, { status: 400 });
    }

    const { type, to, data } = result.data;

    let subject = '';
    let html = '';

    switch (type) {
      case 'booking_confirmation':
        subject = 'Booking Confirmed - HostelHub';
        html = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">Booking Confirmed!</h1>
            <p>Hello ${data.userName},</p>
            <p>Your booking for <strong>${data.roomType}</strong> at <strong>${data.hostelName}</strong> is confirmed.</p>
            <p>Please pay <strong>GH₵${data.amount}</strong> within 48h to secure your spot.</p>
            <p>Thank you for choosing HostelHub!</p>
          </div>
        `;
        break;

      case 'payment_success':
        subject = 'Payment Successful - HostelHub';
        html = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #16a34a;">Payment Successful!</h1>
            <p>Hello ${data.userName},</p>
            <p>Your payment of <strong>GH₵${data.amount}</strong> for <strong>${data.hostelName}</strong> was successful.</p>
            <p>Your booking is now fully confirmed. We look forward to seeing you!</p>
          </div>
        `;
        break;

      case 'booking_cancellation':
        subject = 'Booking Cancelled - HostelHub';
        html = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #dc2626;">Booking Cancelled</h1>
            <p>Hello ${data.userName},</p>
            <p>Your booking for <strong>${data.roomType}</strong> at <strong>${data.hostelName}</strong> has been cancelled.</p>
            <p>If you have any questions, please contact support.</p>
          </div>
        `;
        break;

      case 'account_verification':
        subject = 'Verify Your Account - HostelHub';
        html = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">Verify Your Account</h1>
            <p>Hello ${data.userName},</p>
            <p>Please use the following code to verify your account:</p>
            <h2 style="background: #f1f5f9; padding: 12px; text-align: center; letter-spacing: 4px;">${data.code}</h2>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
        `;
        break;

      case 'alert':
        subject = 'Important Update - HostelHub';
        html = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #ea580c;">Important Update</h1>
            <p>${data.message}</p>
          </div>
        `;
        break;
    }

    // Send Email Notification
    await sendEmailNotification({
      to: to.email,
      subject,
      html
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Notification API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
