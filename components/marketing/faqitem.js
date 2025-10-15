import { motion } from "framer-motion";

export default function FaqItem({ q, children }) {
  return (
    <details className="group px-4 py-3 [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex cursor-pointer items-center justify-between py-2 text-left">
        <span className="font-medium">{q}</span>
        <span className="ml-4 inline-flex h-6 w-6 items-center justify-center rounded-md bg-white/70 dark:bg-white/10 transition-transform duration-200 group-open:rotate-45 group-open:bg-green-200 dark:group-open:bg-green-700">
        </span>
      </summary>
      <div className="pb-3 text-sm opacity-90">{children}</div>
    </details>
  );
}