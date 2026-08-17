"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BackButton from "@/components/BackButton";
import BottomBar from "@/components/BottomBar";
import { PrimaryButton } from "@/components/Buttons";
import { useBooking } from "@/context/BookingContext";
import { cn } from "@/lib/utils/cn";

interface FormValues {
  name: string;
  phone: string;
  email: string;
}

type FieldKey = keyof FormValues;
type Errors = Partial<Record<FieldKey, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(values: FormValues): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) {
    errors.name = "Please enter your full name.";
  }
  const phone = values.phone.replace(/[\s-]/g, "");
  if (!phone) {
    errors.phone = "Please enter your phone number.";
  } else if (!/^(\+?62|0)[0-9]{8,13}$/.test(phone)) {
    errors.phone = "Enter a valid phone number, e.g. 0812 3456 7890.";
  }
  if (!values.email.trim()) {
    errors.email = "Please enter your email address.";
  } else if (!EMAIL_RE.test(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  return errors;
}

export default function UserDetailsPage() {
  const router = useRouter();
  const { state, dispatch } = useBooking();

  const [values, setValues] = useState<FormValues>({
    name: state.user?.name ?? "",
    phone: state.user?.phone ?? "",
    email: state.user?.email ?? "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);

  const [loading, setLoading] = useState(false);
  const [sessionCustomer, setSessionCustomer] = useState<{name: string; phone: string; email: string} | null>(null);
  const [isSessionChecking, setIsSessionChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("customer_token");
    if (!token) {
      setIsSessionChecking(false);
      return;
    }

    fetch("http://localhost:8080/api/auth/customer/me", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          setSessionCustomer(data.data);
        } else {
          localStorage.removeItem("customer_token");
        }
      })
      .catch(() => {})
      .finally(() => setIsSessionChecking(false));
  }, []);

  const setField = (field: FieldKey, value: string) => {
    const next = { ...values, [field]: value };
    setValues(next);
    if (submitted) setErrors(validate(next));
  };

  const handleContinueAs = () => {
    if (!sessionCustomer) return;
    dispatch({
      type: "SET_USER",
      payload: {
        name: sessionCustomer.name,
        phone: sessionCustomer.phone,
        email: sessionCustomer.email,
      },
    });
    router.push("/book/confirm");
  };

  const handleSwitchAccount = () => {
    localStorage.removeItem("customer_token");
    setSessionCustomer(null);
  };

  const handleContinue = async () => {
    setSubmitted(true);
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/auth/customer/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email.trim() }),
      });
      
      const data = await res.json();
      if (!res.ok) {
        setErrors({ email: data.error || "Failed to send OTP" });
        setLoading(false);
        return;
      }
      
      dispatch({
        type: "SET_USER",
        payload: {
          name: values.name.trim(),
          phone: values.phone.trim(),
          email: values.email.trim(),
        },
      });
      router.push("/book/otp");
    } catch (err) {
      setErrors({ email: "Network error" });
      setLoading(false);
    }
  };

  const fields: {
    key: FieldKey;
    label: string;
    type: string;
    inputMode?: "text" | "tel" | "email";
    autoComplete: string;
    placeholder: string;
  }[] = [
    {
      key: "name",
      label: "Name",
      type: "text",
      inputMode: "text",
      autoComplete: "name",
      placeholder: "Your full name",
    },
    {
      key: "phone",
      label: "Phone Number",
      type: "tel",
      inputMode: "tel",
      autoComplete: "tel",
      placeholder: "0812 3456 7890",
    },
    {
      key: "email",
      label: "Email Address",
      type: "email",
      inputMode: "email",
      autoComplete: "email",
      placeholder: "you@example.com",
    },
  ];

  if (isSessionChecking) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-[13px] text-graphite">Memuat data...</p>
      </div>
    );
  }

  if (sessionCustomer) {
    return (
      <div>
        <div className="flex items-center gap-4">
          <BackButton href="/book/schedule" />
          <div>
            <h1 className="text-[22px] font-bold text-ink">Welcome Back!</h1>
            <p className="text-[13px] text-graphite">
              Ready for your next cut, {sessionCustomer.name}?
            </p>
          </div>
        </div>

        <div className="mt-7 flex flex-col gap-4">
          <div className="rounded-2xl border border-line bg-paper p-5">
            <div className="text-[15px] font-bold text-ink">{sessionCustomer.name}</div>
            <div className="mt-1 text-[13px] text-graphite">{sessionCustomer.phone}</div>
            <div className="text-[13px] text-graphite">{sessionCustomer.email}</div>
          </div>
          
          <button 
            onClick={handleSwitchAccount}
            className="text-left text-[13px] font-semibold text-ink underline"
          >
            Booking sebagai customer lain
          </button>
        </div>

        <BottomBar>
          <PrimaryButton onClick={handleContinueAs}>
            Lanjutkan sebagai {sessionCustomer.name.split(' ')[0]}
          </PrimaryButton>
        </BottomBar>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4">
        <BackButton href="/book/schedule" />
        <div>
          <h1 className="text-[22px] font-bold text-ink">Your Details</h1>
          <p className="text-[13px] text-graphite">
            How can we reach you about your booking?
          </p>
        </div>
      </div>

      <div className="mt-7 flex flex-col gap-5">
        {fields.map((field) => {
          const hasError = Boolean(errors[field.key]);
          return (
            <div key={field.key}>
              <label
                htmlFor={field.key}
                className="text-[13px] font-semibold text-ink"
              >
                {field.label}
              </label>
              <input
                id={field.key}
                type={field.type}
                inputMode={field.inputMode}
                autoComplete={field.autoComplete}
                placeholder={field.placeholder}
                value={values[field.key]}
                onChange={(event) => setField(field.key, event.target.value)}
                className={cn(
                  "mt-1.5 h-13 w-full rounded-xl border bg-paper px-4 text-[14.5px] text-ink outline-none placeholder:text-smoke transition focus:border-ink",
                  hasError ? "border-ink" : "border-line",
                )}
              />
              {hasError ? (
                <p className="mt-1.5 text-[12px] text-graphite italic">
                  {errors[field.key]}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-[11.5px] leading-relaxed text-graphite">
        We&apos;ll only use these details to confirm your booking and send your
        payment receipt. Your information stays private.
      </p>

      <BottomBar>
        <PrimaryButton onClick={handleContinue} disabled={loading}>
          {loading ? "Sending OTP..." : "Continue"}
        </PrimaryButton>
      </BottomBar>
    </div>
  );
}
