import { useState } from 'react';
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

interface StripePaymentFormProps {
  clientSecret: string;
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

const elementStyle = {
  style: {
    base: {
      fontSize: '16px',
      color: '#e2e8f0',
      fontFamily: '"Inter", sans-serif',
      '::placeholder': {
        color: '#64748b',
      },
      iconColor: '#e2e8f0',
    },
    invalid: {
      color: '#f87171',
      iconColor: '#f87171',
    },
  },
};

export default function StripePaymentForm({
  clientSecret,
  amount,
  onSuccess,
  onError,
  onCancel,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const cardNumber = elements.getElement(CardNumberElement);
    if (!cardNumber) {
      setCardError('Card details not loaded. Please refresh and try again.');
      return;
    }

    setProcessing(true);
    setCardError(null);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardNumber,
          },
        }
      );

      if (error) {
        setCardError(error.message || 'Payment failed. Please try again.');
        onError(error.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent.id);
      } else {
        setCardError('Payment was not completed. Please try again.');
        onError('Payment incomplete');
      }
    } catch (err: any) {
      setCardError(err.message || 'An unexpected error occurred.');
      onError(err.message || 'Unexpected error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-primary border border-foreground/20 rounded-2xl shadow-glass-lg w-full max-w-md p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-foreground">Complete Payment</h3>
          <button
            onClick={onCancel}
            disabled={processing}
            className="text-foreground/50 hover:text-foreground transition-colors disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Amount */}
        <div className="text-center mb-6 p-4 bg-button/10 rounded-xl border border-button/20">
          <div className="text-sm text-foreground/70 mb-1">Amount to Pay</div>
          <div className="text-3xl font-bold text-button">${amount.toFixed(2)}</div>
        </div>

        {/* Card Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Card Number */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Card Number
            </label>
            <div className="px-4 py-3 border border-foreground/20 rounded-lg bg-primary/60 backdrop-blur-sm focus-within:ring-2 focus-within:ring-button/50 focus-within:border-button/50 transition-all">
              <CardNumberElement options={elementStyle} />
            </div>
          </div>

          {/* Expiry & CVC */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Expiry Date
              </label>
              <div className="px-4 py-3 border border-foreground/20 rounded-lg bg-primary/60 backdrop-blur-sm focus-within:ring-2 focus-within:ring-button/50 focus-within:border-button/50 transition-all">
                <CardExpiryElement options={elementStyle} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                CVC
              </label>
              <div className="px-4 py-3 border border-foreground/20 rounded-lg bg-primary/60 backdrop-blur-sm focus-within:ring-2 focus-within:ring-button/50 focus-within:border-button/50 transition-all">
                <CardCvcElement options={elementStyle} />
              </div>
            </div>
          </div>

          {/* Error message */}
          {cardError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {cardError}
            </div>
          )}

          {/* Secure badge */}
          <div className="flex items-center gap-2 text-xs text-foreground/50">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Secured by Stripe. Your card details are encrypted.</span>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={processing}
              className="flex-1 py-3 border border-foreground/20 text-foreground rounded-xl font-semibold hover:bg-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!stripe || processing}
              className="flex-1 py-3 bg-button text-button-text rounded-xl font-semibold hover:bg-button-200 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing...
                </>
              ) : (
                `Pay $${amount.toFixed(2)}`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
