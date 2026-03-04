"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { CreditPack } from "@/types";
import { Copy, Check, Loader2, X, Bitcoin } from "lucide-react";

interface CryptoPaymentModalProps {
  pack: CreditPack;
  onClose: () => void;
  onSuccess: () => void;
}

type Step = "select" | "paying" | "success" | "error";

const POPULAR_CURRENCIES = [
  "btc", "eth", "usdt", "usdc", "sol", "ltc", "doge", "bnb", "matic", "trx",
];

export default function CryptoPaymentModal({
  pack,
  onClose,
  onSuccess,
}: CryptoPaymentModalProps) {
  const [step, setStep] = useState<Step>("select");
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [paymentData, setPaymentData] = useState<{
    payment_id: string;
    pay_address: string;
    pay_amount: number;
    pay_currency: string;
  } | null>(null);
  const [paymentStatus, setPaymentStatus] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch available currencies
  useEffect(() => {
    fetch("/api/crypto-checkout/currencies")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCurrencies(data.data.currencies);
          setSelectedCurrency(data.data.currencies[0] || "btc");
        }
      })
      .catch(() => setCurrencies(POPULAR_CURRENCIES));
  }, []);

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const handleSuccess = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    setStep("success");
    setTimeout(() => {
      onSuccess();
      onClose();
    }, 2000);
  }, [onSuccess, onClose]);

  const pollStatus = useCallback(
    (paymentId: string) => {
      pollRef.current = setInterval(async () => {
        try {
          const res = await fetch(
            `/api/crypto-checkout/status?payment_id=${paymentId}`
          );
          const data = await res.json();
          if (data.success) {
            setPaymentStatus(data.data.payment_status);
            if (
              data.data.payment_status === "finished" ||
              data.data.payment_status === "confirmed"
            ) {
              handleSuccess();
            } else if (
              data.data.payment_status === "failed" ||
              data.data.payment_status === "expired"
            ) {
              if (pollRef.current) clearInterval(pollRef.current);
              setStep("error");
              setError(`Payment ${data.data.payment_status}`);
            }
          }
        } catch {
          // Silently continue polling
        }
      }, 15000);
    },
    [handleSuccess]
  );

  const createPayment = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/crypto-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packId: pack.id,
          payCurrency: selectedCurrency,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create payment");
      }

      setPaymentData(data.data);
      setStep("paying");
      pollStatus(data.data.payment_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStep("error");
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = () => {
    if (paymentData?.pay_address) {
      navigator.clipboard.writeText(paymentData.pay_address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyAmount = () => {
    if (paymentData?.pay_amount) {
      navigator.clipboard.writeText(String(paymentData.pay_amount));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const statusLabel = (s: string) => {
    const labels: Record<string, string> = {
      waiting: "Waiting for payment...",
      confirming: "Confirming transaction...",
      confirmed: "Payment confirmed!",
      sending: "Sending to merchant...",
      partially_paid: "Partially paid",
      finished: "Payment complete!",
      failed: "Payment failed",
      expired: "Payment expired",
    };
    return labels[s] || s;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Bitcoin className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Pay with Crypto</h3>
              <p className="text-sm text-muted-foreground">
                {pack.name} &mdash; {pack.credits} credits &mdash; ${pack.price_usd}
              </p>
            </div>
          </div>

          {/* Step: Select currency */}
          {step === "select" && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Select cryptocurrency
                </label>
                <select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {currencies.map((c) => (
                    <option key={c} value={c}>
                      {c.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                variant="gradient"
                className="w-full"
                onClick={createPayment}
                disabled={loading || !selectedCurrency}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating payment...
                  </>
                ) : (
                  "Generate Payment"
                )}
              </Button>
            </div>
          )}

          {/* Step: Paying */}
          {step === "paying" && paymentData && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border p-4 space-y-3">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Send exactly
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold font-mono">
                      {paymentData.pay_amount} {paymentData.pay_currency.toUpperCase()}
                    </span>
                    <button
                      onClick={copyAmount}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    To address
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-muted px-2 py-1 rounded break-all flex-1">
                      {paymentData.pay_address}
                    </code>
                    <button
                      onClick={copyAddress}
                      className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                {paymentStatus ? statusLabel(paymentStatus) : "Waiting for payment..."}
              </div>

              <p className="text-xs text-muted-foreground">
                Send the exact amount to the address above. The payment will be
                detected automatically. This page polls every 15 seconds.
              </p>
            </div>
          )}

          {/* Step: Success */}
          {step === "success" && (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6 text-green-500" />
              </div>
              <p className="font-semibold text-lg">Payment Complete!</p>
              <p className="text-sm text-muted-foreground mt-1">
                {pack.credits} credits have been added to your account.
              </p>
            </div>
          )}

          {/* Step: Error */}
          {step === "error" && (
            <div className="text-center py-4 space-y-4">
              <p className="text-destructive font-medium">
                {error || "Payment failed"}
              </p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
                <Button
                  variant="gradient"
                  onClick={() => {
                    setStep("select");
                    setError("");
                    setPaymentData(null);
                    setPaymentStatus("");
                  }}
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
