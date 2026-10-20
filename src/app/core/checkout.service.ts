import { DOCUMENT } from "@angular/common";
import { Inject, Injectable } from "@angular/core";
export interface CheckoutOrder {
  orderId: string;
  amount: number;
  currency: string;
  paymentId: string;
}
export interface PaymentReceipt {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}
interface CheckoutOptions {
  key: string;
  order_id: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  handler: (receipt: PaymentReceipt) => void;
  modal: { ondismiss: () => void };
}
interface CheckoutInstance {
  open(): void;
  close(): void;
  on(event: string, callback: () => void): void;
}
type CheckoutConstructor = new (options: CheckoutOptions) => CheckoutInstance;
@Injectable({ providedIn: "root" })
export class CheckoutService {
  private loading?: Promise<void>;
  constructor(@Inject(DOCUMENT) private document: Document) {}
  get keyId() {
    return (
      this.document
        .querySelector<HTMLMetaElement>('meta[name="razorpay-key-id"]')
        ?.content.trim() ?? ""
    );
  }
  get configured() {
    return /^rzp_(test|live)_\w+$/.test(this.keyId);
  }
  private get checkout(): CheckoutConstructor | undefined {
    return (
      this.document.defaultView as
        (Window & { Razorpay?: CheckoutConstructor }) | null
    )?.Razorpay;
  }
  private load(): Promise<void> {
    if (this.checkout) return Promise.resolve();
    if (this.loading) return this.loading;
    this.loading = new Promise<void>((resolve, reject) => {
      const script = this.document.createElement("script");
      const timeout = setTimeout(() => fail(), 15000);
      const fail = () => {
        clearTimeout(timeout);
        script.remove();
        this.loading = undefined;
        reject(new Error("Checkout could not load. Please try again."));
      };
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => {
        clearTimeout(timeout);
        this.checkout ? resolve() : fail();
      };
      script.onerror = fail;
      this.document.head.appendChild(script);
    });
    return this.loading;
  }
  async open(order: CheckoutOrder, planName: string): Promise<PaymentReceipt> {
    if (!this.configured)
      throw new Error("Online purchases are temporarily unavailable.");
    await this.load();
    const Checkout = this.checkout;
    if (!Checkout) throw new Error("Checkout is unavailable.");
    return new Promise((resolve, reject) => {
      const modal = new Checkout({
        key: this.keyId,
        order_id: order.orderId,
        amount: Math.round(order.amount * 100),
        currency: order.currency,
        name: "Fearless Communication Club",
        description: planName,
        handler: (receipt) => {
          if (receipt.razorpay_order_id !== order.orderId) {
            reject(new Error("Payment confirmation did not match the order."));
            return;
          }
          resolve(receipt);
        },
        modal: {
          ondismiss: () =>
            reject(
              new Error(
                "Checkout closed. Your membership has not been changed.",
              ),
            ),
        },
      });
      modal.on("payment.failed", () => {
        modal.close();
        reject(new Error("Payment was unsuccessful. Please try again."));
      });
      modal.open();
    });
  }
}
