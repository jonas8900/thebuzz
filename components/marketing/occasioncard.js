import { motion } from "framer-motion";
import Image from "next/image";

export default function OccasionCard({ title, note, href, alt }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="group relative overflow-hidden rounded-2xl border border-white/60 dark:border-white/10 bg-white/60 dark:bg-white/5"
    >
      
      {href ? (
        <Image src={href} width={400} height={400} alt={alt} className="h-32 w-full object-cover"/>
      ) : (
        <div className="h-32 w-full bg-gradient-to-br from-fuchsia-300/60 to-blue-300/60 dark:from-fuchsia-700/30 dark:to-blue-700/30" />
      )}
      
      <div className="p-4">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm opacity-80">{note}</p>
      </div>
    </motion.div>
  );
}