const PAYSTACK_INLINE_SCRIPT_ID = "paystack-inline-v2";
const PAYSTACK_INLINE_SCRIPT_SRC = "https://js.paystack.co/v2/inline.js";

type PaystackTransactionCallback = {
  id?: number | string;
  reference?: string;
  message?: string;
  accessCode?: string;
};

type PaystackCallbacks = {
  onLoad?: (response: PaystackTransactionCallback) => void;
  onSuccess?: (transaction: PaystackTransactionCallback) => void;
  onCancel?: () => void;
  onError?: (error: { message?: string }) => void;
};

type PaystackPopupTransaction = {
  getStatus?: () => unknown;
};

type PaystackInlineInstance = {
  resumeTransaction: (
    accessCode: string,
    callbacks?: PaystackCallbacks,
  ) => PaystackPopupTransaction;
};

type PaystackInlineConstructor = new () => PaystackInlineInstance;

declare global {
  interface Window {
    Paystack?: PaystackInlineConstructor;
    PaystackPop?: PaystackInlineConstructor;
    __studybondPaystackInline?: Promise<PaystackInlineConstructor>;
  }
}

function getPaystackConstructor(): PaystackInlineConstructor | null {
  return window.PaystackPop ?? window.Paystack ?? null;
}

export function loadPaystackInline(): Promise<PaystackInlineConstructor> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Paystack checkout can only run in the browser."));
  }

  const existingConstructor = getPaystackConstructor();
  if (existingConstructor) {
    return Promise.resolve(existingConstructor);
  }

  if (window.__studybondPaystackInline) {
    return window.__studybondPaystackInline;
  }

  window.__studybondPaystackInline = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(PAYSTACK_INLINE_SCRIPT_ID);
    const script = existingScript instanceof HTMLScriptElement
      ? existingScript
      : document.createElement("script");

    const handleLoad = () => {
      const paystackConstructor = getPaystackConstructor();
      if (paystackConstructor) {
        resolve(paystackConstructor);
        return;
      }

      reject(new Error("Paystack checkout loaded without exposing the popup API."));
    };

    const handleError = () => {
      reject(new Error("Could not load Paystack checkout."));
    };

    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });

    if (!existingScript) {
      script.id = PAYSTACK_INLINE_SCRIPT_ID;
      script.src = PAYSTACK_INLINE_SCRIPT_SRC;
      script.async = true;
      document.head.appendChild(script);
    }
  });

  return window.__studybondPaystackInline;
}

export async function resumePaystackTransaction(
  accessCode: string,
  callbacks: PaystackCallbacks,
) {
  const PaystackInline = await loadPaystackInline();
  const popup = new PaystackInline();
  return popup.resumeTransaction(accessCode, callbacks);
}
