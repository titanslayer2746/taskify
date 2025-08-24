import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";

interface StatisticsCardProps {
  icon: React.ReactNode;
  value: number;
  suffix?: string;
  label: string;
  color: string;
  index: number;
}

const StatisticsCard: React.FC<StatisticsCardProps> = ({
  icon,
  value,
  suffix = "",
  label,
  color,
  index,
}) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const duration = 2000; // 2 seconds
      const steps = 60;
      const increment = value / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className="text-center group"
    >
      <motion.div
        className={`w-20 h-20 ${color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-white">{icon}</div>
      </motion.div>
      
      <motion.div
        className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent"
        initial={{ scale: 0.5 }}
        whileInView={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        viewport={{ once: true }}
      >
        {count.toLocaleString()}
        {suffix}
      </motion.div>
      
      <h3 className="text-lg font-semibold text-white mb-2">{label}</h3>
    </motion.div>
  );
};

export default StatisticsCard;
