import React from "react";
import { X, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger",
}) => {
  const getTypeStyles = () => {
    switch (type) {
      case "danger":
        return {
          icon: <AlertTriangle className="w-6 h-6 text-red-400" />,
          button:
            "bg-gradient-to-r from-red-600 to-pink-600 hover:shadow-red-500/25 focus:ring-red-500/50",
          iconBg: "bg-red-500/20",
        };
      case "warning":
        return {
          icon: <AlertTriangle className="w-6 h-6 text-yellow-400" />,
          button:
            "bg-gradient-to-r from-yellow-600 to-orange-600 hover:shadow-yellow-500/25 focus:ring-yellow-500/50",
          iconBg: "bg-yellow-500/20",
        };
      case "info":
        return {
          icon: <AlertTriangle className="w-6 h-6 text-blue-400" />,
          button:
            "bg-gradient-to-r from-blue-600 to-cyan-600 hover:shadow-blue-500/25 focus:ring-blue-500/50",
          iconBg: "bg-blue-500/20",
        };
      default:
        return {
          icon: <AlertTriangle className="w-6 h-6 text-red-400" />,
          button:
            "bg-gradient-to-r from-red-600 to-pink-600 hover:shadow-red-500/25 focus:ring-red-500/50",
          iconBg: "bg-red-500/20",
        };
    }
  };

  const styles = getTypeStyles();

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 sm:p-8 mx-4 w-full max-w-md shadow-2xl border border-gray-700/50"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 to-pink-900/20 rounded-2xl"></div>

            <div className="relative">
              {/* Header */}
              <div className="flex items-center gap-4 mb-6">
                <div
                  className={`w-12 h-12 ${styles.iconBg} rounded-xl flex items-center justify-center`}
                >
                  {styles.icon}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    {title}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Message */}
              <div className="mb-8">
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                  {message}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-3 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200 font-medium"
                >
                  {cancelText}
                </button>
                <button
                  onClick={handleConfirm}
                  className={`w-full sm:w-auto px-6 py-3 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 ${styles.button}`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationDialog;
