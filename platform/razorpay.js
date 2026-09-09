import { createHmac, timingSafeEqual } from "node:crypto";
export function verifyPaymentSignature(orderId, paymentId, signature, secret) {
  if (!/^[a-f0-9]{64}$/i.test(signature || "")) return false;
  const expected = createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest();
  return timingSafeEqual(expected, Buffer.from(signature, "hex"));
}
export function razorpayClient(config, fetcher = fetch) {
  if (!config.razorpayKeyId?.startsWith("rzp_test_") || !config.razorpaySecret)
    throw new Error("Razorpay test credentials are required.");
  return async function request(path, body) {
    const response = await fetcher(`https://api.razorpay.com/v1${path}`, {
      method: body ? "POST" : "GET",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(
            `${config.razorpayKeyId}:${config.razorpaySecret}`,
          ).toString("base64"),
        "Content-Type": "application/json",
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(15000),
    });
    const result = await response.json();
    if (!response.ok) {
      const error = new Error(
        `Payment provider: ${result.error?.description || "Please try again."}`,
      );
      error.status = 502;
      error.providerStatus = response.status;
      throw error;
    }
    return result;
  };
}
