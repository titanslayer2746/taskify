import React from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

interface TestimonialCardProps {
  name: string;
  role: string;
  company: string;
  avatar: string;
  rating: number;
  testimonial: string;
  metric: string;
  metricValue: string;
  index: number;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  name,
  role,
  company,
  avatar,
  rating,
  testimonial,
  metric,
  metricValue,
  index,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className="relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/30 backdrop-blur-sm"
    >
      {/* Quote Icon */}
      <div className="absolute top-4 right-4 text-purple-500/20">
        <Quote size={24} />
      </div>

      {/* Rating */}
      <div className="flex items-center gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={16}
            className={`${
              i < rating ? "text-yellow-400 fill-current" : "text-gray-600"
            }`}
          />
        ))}
      </div>

      {/* Testimonial Text */}
      <p className="text-gray-300 leading-relaxed mb-6 text-sm">
        "{testimonial}"
      </p>

      {/* Success Metric */}
      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg p-3 mb-4 border border-purple-500/20">
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-400 mb-1">
            {metricValue}
          </div>
          <div className="text-xs text-gray-400">{metric}</div>
        </div>
      </div>

      {/* User Info */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold text-lg">
          {avatar}
        </div>
        <div>
          <div className="font-semibold text-white">{name}</div>
          <div className="text-sm text-gray-400">
            {role} at {company}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TestimonialCard;
