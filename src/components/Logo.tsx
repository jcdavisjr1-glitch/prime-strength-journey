export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 md:gap-3 ${className}`}>
      <svg
        viewBox="0 0 40 48"
        className="h-9 md:h-11 w-auto"
        aria-hidden="true"
      >
        <path
          d="M20 2 L36 10 V24 C36 36 20 46 20 46 C20 46 4 36 4 24 V10 L20 2Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
          className="text-primary"
        />
        <path
          d="M23 15 L14 27 H20 L18 37 L29 23 H23 L23 15Z"
          fill="currentColor"
          className="text-primary"
        />
      </svg>
      <div className="flex flex-col leading-[0.85] font-display uppercase tracking-tight">
        <span className="text-foreground text-[1.65rem] md:text-[2.15rem]">FORTY</span>
        <span className="text-primary text-[1.65rem] md:text-[2.15rem]">STRONG</span>
      </div>
    </div>
  );
}
