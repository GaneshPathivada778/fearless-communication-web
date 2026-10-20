import { describe, it, expect, afterEach } from "vitest";
import { CheckoutService, PaymentReceipt } from "./checkout.service";
const receipt: PaymentReceipt = {
  razorpay_order_id: "order-1",
  razorpay_payment_id: "payment-1",
  razorpay_signature: "signature",
};
afterEach(() => {
  document.querySelector('meta[name="razorpay-key-id"]')?.remove();
  delete (window as any).Razorpay;
});
function setup() {
  const meta = document.createElement("meta");
  meta.name = "razorpay-key-id";
  meta.content = "rzp_test_fixture";
  document.head.appendChild(meta);
  let options: any;
  class FakeCheckout {
    constructor(value: unknown) {
      options = value;
    }
    open() {}
    close() {}
    on() {}
  }
  (window as any).Razorpay = FakeCheckout;
  return { service: new CheckoutService(document), options: () => options };
}
describe("Checkout SDK adapter", () => {
  it("converts the API rupee amount to paise and binds the server order", async () => {
    const { service, options } = setup();
    const result = service.open(
      { orderId: "order-1", amount: 999, currency: "INR", paymentId: "local" },
      "Gold",
    );
    await Promise.resolve();
    expect(options().amount).toBe(99900);
    expect(options().order_id).toBe("order-1");
    options().handler(receipt);
    expect(await result).toEqual(receipt);
  });
  it("rejects a receipt for a different server order", async () => {
    const { service, options } = setup();
    const result = service.open(
      { orderId: "order-1", amount: 999, currency: "INR", paymentId: "local" },
      "Gold",
    );
    const rejected = expect(result).rejects.toThrow("did not match");
    await Promise.resolve();
    options().handler({ ...receipt, razorpay_order_id: "wrong" });
    await rejected;
  });
});
