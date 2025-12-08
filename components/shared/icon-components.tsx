// Icon components needed
export function BookOpen(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeWidth={2} />
      <path
        d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
        strokeWidth={2}
      />
    </svg>
  );
}

export function Settings(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <circle cx={12} cy={12} r={3} strokeWidth={2} />
      <path
        d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m2.12 2.12l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m2.12-2.12l4.24-4.24M19.78 19.78l-4.24-4.24m-2.12-2.12l-4.24-4.24"
        strokeWidth={2}
      />
    </svg>
  );
}

export function Repeat2(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path d="M17 2l4 4-4 4" strokeWidth={2} strokeLinecap="round" />
      <path
        d="M3 12a9 9 0 0 1 15-6.7V2m-4 18l-4-4 4-4"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <path
        d="M21 12a9 9 0 0 1-15 6.7v3.3"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function FileText(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
        strokeWidth={2}
      />
      <polyline points="14 2 14 8 20 8" strokeWidth={2} />
      <line x1={12} y1={13} x2={8} y2={13} strokeWidth={2} />
      <line x1={12} y1={17} x2={8} y2={17} strokeWidth={2} />
    </svg>
  );
}

export function User(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth={2} />
      <circle cx={12} cy={7} r={4} strokeWidth={2} />
    </svg>
  );
}
