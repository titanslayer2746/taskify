import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const NewsletterSignup: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubscribed(true);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="relative bg-gradient-to-br from-purple-800/30 via-blue-800/30 to-emerald-800/30 rounded-2xl p-8 border border-purple-500/30 backdrop-blur-sm"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-emerald-500/5 rounded-2xl" />
      
      <div className="relative z-10">
        <div className="text-center mb-8">
          <motion.div
            className="w-16 h-16 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-emerald-500/20 rounded-xl flex items-center justify-center mx-auto mb-6"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.2 }}
          >
            <Mail className="w-8 h-8 text-purple-400" />
          </motion.div>
          
          <h3 className="text-3xl font-bold mb-4">
            Stay Updated with{" "}
            <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
              Productivity Tips
            </span>
          </h3>
          
          <p className="text-gray-300 text-lg mb-6 max-w-2xl mx-auto">
            Get weekly insights, productivity hacks, and exclusive tips delivered to your inbox. 
            Join thousands of productivity enthusiasts who are already improving their lives.
          </p>
        </div>

        {!isSubscribed ? (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex gap-3 mb-4">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500/20"
                required
              />
              <Button
                type="submit"
                disabled={isLoading || !email}
                className="px-6 bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 hover:from-purple-700 hover:via-blue-700 hover:to-emerald-700 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 focus:ring-4 focus:ring-purple-500/50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Subscribe
                    <ArrowRight size={16} className="ml-2" />
                  </>
                )}
              </Button>
            </div>
            
            <p className="text-xs text-gray-400 text-center">
              🔒 We respect your privacy. Unsubscribe at any time.
            </p>
          </form>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h4 className="text-xl font-semibold text-white mb-2">
              Welcome to the family! 🎉
            </h4>
            <p className="text-gray-300">
              Your first productivity tip is on its way to your inbox.
            </p>
          </motion.div>
        )}

        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-purple-400">10,000+</div>
            <div className="text-sm text-gray-400">Subscribers</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-400">Weekly</div>
            <div className="text-sm text-gray-400">Updates</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-400">Free</div>
            <div className="text-sm text-gray-400">Forever</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default NewsletterSignup;
