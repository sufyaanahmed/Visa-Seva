let loading;
export function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve(window.Razorpay);
  if (!loading)
    loading = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(window.Razorpay);
      script.onerror = () => {
        loading = null;
        script.remove();
        reject(new Error("Could not load secure checkout. Please try again."));
      };
      document.head.appendChild(script);
    });
  return loading;
}
