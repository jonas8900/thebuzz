import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XCircle } from "lucide-react"; // Verwenden des roten X-Icons für Fehlermeldungen

export default function ErrorMessage({ message = "Etwas ist schiefgelaufen!" }) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, 5000); 

        return () => clearTimeout(timer); 
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="fixed top-10 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 border border-red-500 rounded-2xl shadow-xl p-4 flex items-center space-x-3 z-50"
                >
                    <XCircle className="text-red-500 w-6 h-6" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{message}</span>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
