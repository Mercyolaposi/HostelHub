'use client';

import { usePaystackPayment } from 'react-paystack';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { updateBookingPaymentStatus } from '@/services/bookingService';
import { Booking } from '@/types';

interface PaystackButtonProps {
  booking: Booking;
  user: any;
  onSuccess: () => void;
}

export default function PaystackButton({ booking, user, onSuccess }: PaystackButtonProps) {
  const config = {
    reference: (new Date()).getTime().toString(),
    email: user.email,
    amount: booking.amount * 100, // Paystack expects amount in pesewas
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
    currency: 'GHS',
  };

  const initializePayment = usePaystackPayment(config);

  const handleSuccess = async (reference: any) => {
    try {
      await updateBookingPaymentStatus(booking.id!, 'paid', 'confirmed');
      
      // Send notification
      try {
        const token = await user.getIdToken();
        await fetch('/api/notify', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            type: 'payment_success',
            to: {
              email: user.email,
            },
            data: {
              userName: user.displayName || user.email,
              hostelName: (booking as any).hostel?.name || 'the hostel',
              amount: booking.amount
            }
          })
        });
      } catch (notifyError) {
        console.error('Failed to send notification:', notifyError);
      }

      toast.success('Payment successful!');
      onSuccess();
    } catch (error) {
      toast.error('Payment successful, but failed to update booking status.');
    }
  };

  const handleClose = () => {
    toast.info('Payment cancelled.');
  };

  return (
    <Button 
      className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 mt-4"
      onClick={() => {
        if (!config.publicKey) {
          toast.error('Payment gateway is not configured.');
          return;
        }
        initializePayment({ onSuccess: handleSuccess, onClose: handleClose });
      }}
    >
      Pay Now
    </Button>
  );
}
