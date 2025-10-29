import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Github,
  Twitter,
  Linkedin,
  Mail,
  Heart,
  ExternalLink,
} from "lucide-react";

const EnhancedFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Product",
      links: [
        { name: "Features", href: "/#features" },
        { name: "Pricing", href: "/#pricing" },
        { name: "How it Works", href: "/#how-it-works" },
        { name: "FAQ", href: "/#faq" },
      ],
    },
    {
      title: "Resources",
      links: [
        { name: "Blog", href: "/blog" },
        { name: "Help Center", href: "/help" },
        { name: "API Documentation", href: "/api" },
        { name: "Productivity Tips", href: "/tips" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "/about" },
        { name: "Careers", href: "/careers" },
        { name: "Contact", href: "/contact" },
        { name: "Press Kit", href: "/press" },
      ],
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms of Service", href: "/terms" },
        { name: "Cookie Policy", href: "/cookies" },
        { name: "GDPR", href: "/gdpr" },
      ],
    },
  ];

  const socialLinks = [
    {
      name: "GitHub",
      href: "https://github.com/taskify",
      icon: <Github size={20} />,
    },
    {
      name: "Twitter",
      href: "https://twitter.com/taskify",
      icon: <Twitter size={20} />,
    },
    {
      name: "LinkedIn",
      href: "https://linkedin.com/company/taskify",
      icon: <Linkedin size={20} />,
    },
    {
      name: "Email",
      href: "mailto:hello@taskify.com",
      icon: <Mail size={20} />,
    },
  ];

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="relative grain-texture royal-gradient border-t border-white/10"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-6">
                Taskify
              </h3>
              <p className="text-gray-300 mb-8 leading-relaxed text-lg font-light">
                Your all-in-one productivity companion. Build habits, manage tasks, 
                and boost focus with powerful tools designed for success.
              </p>
              
              {/* Social Links */}
              <div className="flex items-center gap-4">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.1, y: -2 }}
                    className="w-12 h-12 royal-card rounded-2xl flex items-center justify-center text-gray-300 hover:text-white hover:border-white/30 transition-all duration-300"
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + sectionIndex * 0.1 }}
              viewport={{ once: true }}
            >
              <h4 className="text-xl font-bold text-white mb-6">
                {section.title}
              </h4>
              <ul className="space-y-4">
                {section.links.map((link, linkIndex) => (
                  <motion.li
                    key={link.name}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 + sectionIndex * 0.1 + linkIndex * 0.05 }}
                    viewport={{ once: true }}
                  >
                    <Link
                      to={link.href}
                      className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center gap-2 group text-base font-medium"
                    >
                      {link.name}
                      {link.href.startsWith('http') && (
                        <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Newsletter Signup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="border-t border-white/10 pt-12 mb-12"
        >
          <div className="text-center royal-card rounded-3xl p-8 border border-white/10">
            <h4 className="text-2xl font-bold text-white mb-4">
              Stay in the loop
            </h4>
            <p className="text-gray-300 mb-8 text-lg font-light">
              Get the latest productivity tips and updates delivered to your inbox.
            </p>
            <div className="flex max-w-lg mx-auto gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 royal-card border border-white/20 rounded-2xl text-white placeholder:text-gray-400 focus:border-white/40 focus:ring-white/20 focus:outline-none text-lg"
              />
              <button className="px-8 py-4 pill-button pill-button-primary font-semibold text-lg">
                Subscribe
              </button>
            </div>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="border-t border-white/10 pt-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3 text-gray-300 text-lg">
              <span>© {currentYear} Taskify. All rights reserved.</span>
              <span>•</span>
              <span>Made with</span>
              <Heart size={18} className="text-red-400 fill-current" />
              <span>for productivity enthusiasts</span>
            </div>
            
            <div className="flex items-center gap-8 text-base text-gray-300">
              <Link to="/privacy" className="hover:text-white transition-colors duration-300 font-medium">
                Privacy
              </Link>
              <Link to="/terms" className="hover:text-white transition-colors duration-300 font-medium">
                Terms
              </Link>
              <Link to="/cookies" className="hover:text-white transition-colors duration-300 font-medium">
                Cookies
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default EnhancedFooter;
