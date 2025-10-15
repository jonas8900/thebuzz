import { motion } from "framer-motion";

export default function Card({ title, children }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="rounded-2xl border border-white/60 dark:border-white/10 bg-white/50 dark:bg-white/5 p-5 shadow-sm"
    >
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <div className="text-sm leading-relaxed opacity-90">{children}</div>
    </motion.div>
  );
}