import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, title, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      className={`bg-white rounded-xl shadow-lg backdrop-blur-lg p-6 ${className}`}
    >
      {title && (
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl font-semibold mb-4 text-[#1D1D1F]"
        >
          {title}
        </motion.h3>
      )}
      {children}
    </motion.div>
  );
};

export default Card;