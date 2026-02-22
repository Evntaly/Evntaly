export class paddleWebhookDTO {
  alert_name:
    | 'subscription_created'
    | 'subscription_updated'
    | 'subscription_cancelled'
    | 'subscription_payment_succeeded'
    | 'subscription_payment_failed'
    | 'payment_refunded';

  subscription_id?: string;
  user_id?: string;
  subscription_plan_id?: string;

  amount?: string;
  currency?: string;

  next_bill_date?: string;
  order_id?: string;

  // always present from Paddle
  p_signature?: string;

  // Extra data from Paddle
  passthrough?: string;

  // URLs
  cancel_url?: string;
  update_url?: string;
  receipt_url?: string;

  [key: string]: any;
}
