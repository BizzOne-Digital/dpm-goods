// Brand + payment marks as inline SVG (Lucide no longer ships brand icons).
type IconProps = { className?: string; title?: string };

export function InstagramIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FacebookIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.5V4.4c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.4H8v3h2.6V21h2.9z" />
    </svg>
  );
}

export function TikTokIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M16.6 3c.3 2.1 1.6 3.6 3.6 3.8v2.6c-1.3.1-2.5-.3-3.6-1v5.9c0 3.6-3.2 6.2-6.7 5.4-2.3-.5-4-2.5-4.1-4.9-.2-3.2 2.6-5.8 5.8-5.4v2.8c-1.6-.4-3.1.8-3 2.4.1 1.2 1.1 2.2 2.3 2.2 1.4.1 2.5-1 2.5-2.4V3h3.2z" />
    </svg>
  );
}

export function YouTubeIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15V9l5.2 3L10 15z" />
    </svg>
  );
}

export function LinkedInIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4V21H3zM9.5 9.5h3.8v1.6h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5.2c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V21h-4z" />
    </svg>
  );
}

function PaymentBadge({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className="inline-flex h-7 w-11 items-center justify-center rounded-[5px] bg-white shadow-sm ring-1 ring-black/5"
    >
      {children}
    </span>
  );
}

export function PaymentMethods({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <PaymentBadge label="Visa">
        <svg viewBox="0 0 48 16" className="h-3.5 w-9" aria-hidden="true">
          <text x="24" y="13" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="900" fontStyle="italic" fontSize="15" fill="#1a1f71">VISA</text>
        </svg>
      </PaymentBadge>
      <PaymentBadge label="Mastercard">
        <svg viewBox="0 0 32 20" className="h-4 w-7" aria-hidden="true">
          <circle cx="12" cy="10" r="7" fill="#eb001b" />
          <circle cx="20" cy="10" r="7" fill="#f79e1b" />
          <path d="M16 4.3a7 7 0 0 1 0 11.4 7 7 0 0 1 0-11.4z" fill="#ff5f00" />
        </svg>
      </PaymentBadge>
      <PaymentBadge label="American Express">
        <svg viewBox="0 0 40 22" className="h-5 w-9" aria-hidden="true">
          <rect width="40" height="22" rx="3" fill="#2e77bc" />
          <text x="20" y="14.5" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="8" fill="#fff">AMEX</text>
        </svg>
      </PaymentBadge>
      <PaymentBadge label="PayPal">
        <svg viewBox="0 0 48 16" className="h-3.5 w-10" aria-hidden="true">
          <text x="2" y="12.5" fontFamily="Arial, sans-serif" fontWeight="900" fontStyle="italic" fontSize="12" fill="#003087">Pay</text>
          <text x="23" y="12.5" fontFamily="Arial, sans-serif" fontWeight="900" fontStyle="italic" fontSize="12" fill="#009cde">Pal</text>
        </svg>
      </PaymentBadge>
      <PaymentBadge label="Apple Pay">
        <svg viewBox="0 0 44 18" className="h-4 w-9" aria-hidden="true">
          <path d="M8.3 4.4c.5-.6.9-1.5.8-2.4-.8 0-1.7.5-2.3 1.1-.5.6-.9 1.5-.8 2.3.9.1 1.7-.4 2.3-1zm.8 1.3c-1.3-.1-2.3.7-2.9.7s-1.5-.7-2.5-.7C2.4 5.8 1.2 6.5.6 7.7c-1.4 2.4-.4 5.9 1 7.8.6.9 1.4 2 2.4 1.9 1-.1 1.3-.6 2.5-.6s1.5.6 2.5.6 1.7-1 2.3-1.9c.7-1 1-2 1-2.1 0 0-2-.8-2-3 0-1.9 1.5-2.7 1.6-2.8-.9-1.3-2.2-1.4-2.8-1.4z" fill="#000" />
          <text x="15" y="14" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="11" fill="#000">Pay</text>
        </svg>
      </PaymentBadge>
    </div>
  );
}
