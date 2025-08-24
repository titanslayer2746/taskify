import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
}

const FAQAccordion: React.FC<FAQAccordionProps> = ({ items }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/30 backdrop-blur-sm overflow-hidden"
        >
          <button
            onClick={() => toggleAccordion(index)}
            className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-700/20 transition-colors duration-200"
          >
            <h3 className="text-lg font-semibold text-white pr-4">
              {item.question}
            </h3>
            <motion.div
              animate={{ rotate: openIndex === index ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {openIndex === index ? (
                <ChevronUp size={20} className="text-purple-400" />
              ) : (
                <ChevronDown size={20} className="text-gray-400" />
              )}
            </motion.div>
          </button>
          
          <AnimatePresence>
            {openIndex === index && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-4">
                  <p className="text-gray-300 leading-relaxed">{item.answer}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
};

export default FAQAccordion;
