import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      className={cn("size-6 text-brand-green", className)}
      fill="none"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M24 4L4 14V34L24 44L44 34V14L24 4ZM24 10.5L38 17.5V30.5L24 37.5L10 30.5V17.5L24 10.5Z"
        fill="currentColor"
      />
    </svg>
  );
}
