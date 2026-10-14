export interface PricingPlan {
  id: string;
  name: string;
  interval: 'monthly' | 'yearly';
  currency: string;
  amount: number;
  formattedPrice: string;
}

export const REGIONAL_PRICING: Record<string, PricingPlan[]> = {
  US: [
    { id: 'plus_us_monthly', name: 'Spark Plus Monthly', interval: 'monthly', currency: 'USD', amount: 399, formattedPrice: '$3.99' },
    { id: 'plus_us_yearly', name: 'Spark Plus Yearly', interval: 'yearly', currency: 'USD', amount: 2999, formattedPrice: '$29.99' },
  ],
  IN: [
    { id: 'plus_in_monthly', name: 'Spark Plus Monthly', interval: 'monthly', currency: 'INR', amount: 19900, formattedPrice: '₹199' },
    { id: 'plus_in_yearly', name: 'Spark Plus Yearly', interval: 'yearly', currency: 'INR', amount: 149900, formattedPrice: '₹1,499' },
  ],
  EU: [
    { id: 'plus_eu_monthly', name: 'Spark Plus Monthly', interval: 'monthly', currency: 'EUR', amount: 399, formattedPrice: '€3.99' },
    { id: 'plus_eu_yearly', name: 'Spark Plus Yearly', interval: 'yearly', currency: 'EUR', amount: 2999, formattedPrice: '€29.99' },
  ],
};

export class PaymentService {
  private processedWebhooks = new Set<string>();

  public getPricingForRegion(regionCode = 'US'): PricingPlan[] {
    return REGIONAL_PRICING[regionCode] || REGIONAL_PRICING.US;
  }

  public verifyAndProcessWebhook(eventId: string, eventType: string, payload: Record<string, unknown>): { success: boolean; error?: string } {
    if (this.processedWebhooks.has(eventId)) {
      return { success: true }; // Idempotent return
    }

    if (!eventId || !eventType) {
      return { success: false, error: 'INVALID_WEBHOOK_PAYLOAD' };
    }

    this.processedWebhooks.add(eventId);
    return { success: true };
  }
}

export const paymentService = new PaymentService();
