import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle } from "lucide-react";

export default function SuccessMessage({ message = "Erfolgreich gespeichert!", onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [message, onClose]);

  return (
    <AnimatePresence>
      {isVisible && message && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="fixed top-10 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 border border-green-500 rounded-2xl shadow-xl p-4 flex items-center space-x-3 z-50"
        >
          <CheckCircle className="text-green-500 w-6 h-6 shrink-0" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {message}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
