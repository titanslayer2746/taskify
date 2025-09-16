import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import LandingNavbar from "../components/LandingNavbar";
import EnhancedFooter from "../components/EnhancedFooter";
import TestimonialCard from "../components/TestimonialCard";
import StatisticsCard from "../components/StatisticsCard";
import FAQAccordion from "../components/FAQAccordion";
import {
  Target,
  Clock,
  CheckSquare,
  TrendingUp,
  Zap,
  BarChart3,
  Calendar,
  ArrowRight,
  Play,
  Star,
  Wallet,
  BookOpen,
  Heart,
  Moon,
  Users,
  CheckCircle,
  Timer,
  TrendingUp as TrendingUpIcon,
} from "lucide-react";

const Index = () => {
  const features = [
    {
      icon: <Target className="w-8 h-8" />,
      title: "Habit Tracking",
      description:
        "Build lasting habits with visual heatmaps and streak tracking. See your progress over time and stay motivated.",
      color: "from-purple-500 to-pink-500",
      route: "/habits",
    },
    {
      icon: <CheckSquare className="w-8 h-8" />,
      title: "Task Management",
      description:
        "Organize your tasks with priority levels, due dates, and smart sorting. Never miss an important deadline again.",
      color: "from-blue-500 to-cyan-500",
      route: "/todo",
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Pomodoro Timer",
      description:
        "Boost your productivity with focused work sessions and strategic breaks. Stay in the zone longer.",
      color: "from-emerald-500 to-teal-500",
      route: "/pomodoro",
    },
    {
      icon: <Wallet className="w-8 h-8" />,
      title: "Finance Tracker",
      description:
        "Track your income, expenses, and build better financial habits with detailed analytics and smart categorization.",
      color: "from-amber-500 to-orange-500",
      route: "/finance-tracker",
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Journal",
      description:
        "Capture your thoughts, ideas, and memories in a beautiful journal. Write, reflect, and grow with every entry.",
      color: "from-yellow-500 to-amber-500",
      route: "/journal",
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Health & Wellness",
      description:
        "Create personalized workout and diet plans, track your fitness journey, and maintain daily health notes for continuous improvement.",
      color: "from-red-500 to-pink-500",
      route: "/health",
    },
    {
      icon: <Moon className="w-8 h-8" />,
      title: "Sleep Tracker",
      description:
        "Track your sleep patterns, monitor sleep quality, and maintain detailed sleep notes to improve your rest and overall health.",
      color: "from-cyan-500 to-teal-500",
      route: "/sleep",
    },
  ];

  const benefits = [
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Track Progress",
      description:
        "Visualize your daily progress with beautiful heatmaps and analytics",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Stay Focused",
      description:
        "Use the Pomodoro technique to maintain concentration and avoid burnout",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Smart Analytics",
      description:
        "Get insights into your productivity patterns and optimize your workflow",
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Never Miss a Day",
      description: "Build streaks and maintain consistency with habit tracking",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Product Manager",
      company: "TechCorp",
      avatar: "SJ",
      rating: 5,
      testimonial:
        "Taskify completely transformed my productivity routine. The habit tracking feature helped me build a consistent morning routine, and the Pomodoro timer keeps me focused during deep work sessions. I've increased my daily productivity by 40%!",
      metric: "Productivity Increase",
      metricValue: "40%",
    },
    {
      name: "Michael Chen",
      role: "Software Engineer",
      company: "StartupXYZ",
      avatar: "MC",
      rating: 5,
      testimonial:
        "As a developer, I need to stay organized and focused. Taskify's task management and Pomodoro features are game-changers. I've completed 150+ tasks this month and maintained a 95% completion rate.",
      metric: "Tasks Completed",
      metricValue: "150+",
    },
    {
      name: "Emily Rodriguez",
      role: "Student",
      company: "University",
      avatar: "ER",
      rating: 5,
      testimonial:
        "Being a student with multiple deadlines, Taskify has been my lifesaver. The habit tracking helped me develop better study habits, and the finance tracker keeps my budget in check. Highly recommended!",
      metric: "Study Hours",
      metricValue: "25h/week",
    },
    {
      name: "David Kim",
      role: "Freelancer",
      company: "Self-employed",
      avatar: "DK",
      rating: 5,
      testimonial:
        "Running my own business requires excellent time management. Taskify's comprehensive suite of tools has helped me stay organized, track my progress, and maintain work-life balance. My income has increased by 60% since using it.",
      metric: "Income Increase",
      metricValue: "60%",
    },
  ];

  const statistics = [
    {
      icon: <Users className="w-8 h-8" />,
      value: 25000,
      suffix: "+",
      label: "Active Users",
      color: "bg-gradient-to-r from-purple-500 to-pink-500",
    },
    {
      icon: <CheckCircle className="w-8 h-8" />,
      value: 1500000,
      suffix: "+",
      label: "Habits Tracked",
      color: "bg-gradient-to-r from-blue-500 to-cyan-500",
    },
    {
      icon: <CheckSquare className="w-8 h-8" />,
      value: 5000000,
      suffix: "+",
      label: "Tasks Completed",
      color: "bg-gradient-to-r from-emerald-500 to-teal-500",
    },
    {
      icon: <Timer className="w-8 h-8" />,
      value: 250000,
      suffix: "h",
      label: "Focus Hours",
      color: "bg-gradient-to-r from-amber-500 to-orange-500",
    },
    {
      icon: <TrendingUpIcon className="w-8 h-8" />,
      value: 95,
      suffix: "%",
      label: "Success Rate",
      color: "bg-gradient-to-r from-red-500 to-pink-500",
    },
  ];

  const faqItems = [
    {
      question: "How does Taskify help me build better habits?",
      answer:
        "Taskify uses proven habit-building techniques like streak tracking, visual heatmaps, and progress analytics. Our habit tracker helps you visualize your consistency, identify patterns, and stay motivated with daily reminders and milestone celebrations.",
      category: "Habits",
    },
    {
      question: "Is my data secure and private?",
      answer:
        "Absolutely! We take your privacy seriously. All data is encrypted in transit and at rest. We never share your personal information with third parties, and you have full control over your data with options to export or delete it at any time.",
      category: "Privacy",
    },
    {
      question: "Can I use Taskify on multiple devices?",
      answer:
        "Yes! Taskify syncs seamlessly across all your devices. Whether you're on your phone, tablet, or computer, your habits, tasks, and progress are always up to date. Just sign in with your account and everything syncs automatically.",
      category: "Sync",
    },
    {
      question: "How does the Pomodoro timer work?",
      answer:
        "Our Pomodoro timer follows the classic 25-minute work session followed by a 5-minute break. After 4 work sessions, you get a longer 15-minute break. You can customize these intervals, track your focus sessions, and see your productivity patterns over time.",
      category: "Productivity",
    },
    {
      question: "What makes Taskify different from other productivity apps?",
      answer:
        "Taskify combines habit tracking, task management, time tracking, and wellness monitoring in one comprehensive platform. Unlike other apps that focus on just one aspect, we provide a complete productivity ecosystem that helps you build lasting habits while managing your daily tasks and maintaining work-life balance.",
      category: "Features",
    },
    {
      question: "How do I get started with Taskify?",
      answer:
        "Getting started is easy! Simply create an account, choose your first habit to track, and start building your productivity routine. Our onboarding process guides you through setting up your first habits and tasks, and you'll see results from day one.",
      category: "Getting Started",
    },
    {
      question: "Can I export my data if I want to switch platforms?",
      answer:
        "Yes, you have full control over your data. You can export your habits, tasks, journal entries, and analytics in various formats (CSV, JSON). We believe in data portability and want you to have access to your information whenever you need it.",
      category: "Data",
    },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const heroVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const cardHoverVariants = {
    hover: {
      scale: 1.05,
      y: -10,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  const buttonHoverVariants = {
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <LandingNavbar />

      {/* Hero Section */}
      <div className="relative">
        {/* Background Effects */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-emerald-500/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        />
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"
          variants={floatingVariants}
          animate="animate"
        />
        <motion.div
          className="absolute bottom-20 right-10 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl"
          variants={floatingVariants}
          animate="animate"
          transition={{ delay: 1.5 }}
        />

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            variants={heroVariants}
          >
            <motion.div
              className="flex items-center justify-center gap-2 mb-6"
              variants={itemVariants}
            >
              <div className="flex items-center gap-1 bg-purple-500/20 px-3 py-1 rounded-full">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium">Productivity Suite</span>
              </div>
            </motion.div>

            <motion.h1
              className="text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent mb-6 tracking-tight leading-tight"
              variants={itemVariants}
            >
              Taskify
            </motion.h1>

            <motion.p
              className="text-xl sm:text-2xl text-gray-300 mb-6 max-w-4xl mx-auto leading-relaxed"
              variants={itemVariants}
            >
              Your comprehensive productivity ecosystem. Transform your life
              with 6 powerful tools:
            </motion.p>

            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto mb-8"
              variants={itemVariants}
            >
              <div className="flex items-center gap-3 bg-gray-800/50 backdrop-blur-sm rounded-lg p-3 border border-gray-700/50">
                <Target className="w-5 h-5 text-purple-400" />
                <span className="text-gray-300 text-sm font-medium">
                  Habit Tracking
                </span>
              </div>
              <div className="flex items-center gap-3 bg-gray-800/50 backdrop-blur-sm rounded-lg p-3 border border-gray-700/50">
                <CheckSquare className="w-5 h-5 text-blue-400" />
                <span className="text-gray-300 text-sm font-medium">
                  Task Management
                </span>
              </div>
              <div className="flex items-center gap-3 bg-gray-800/50 backdrop-blur-sm rounded-lg p-3 border border-gray-700/50">
                <Wallet className="w-5 h-5 text-amber-400" />
                <span className="text-gray-300 text-sm font-medium">
                  Finance Tracker
                </span>
              </div>
              <div className="flex items-center gap-3 bg-gray-800/50 backdrop-blur-sm rounded-lg p-3 border border-gray-700/50">
                <BookOpen className="w-5 h-5 text-yellow-400" />
                <span className="text-gray-300 text-sm font-medium">
                  Journal
                </span>
              </div>
              <div className="flex items-center gap-3 bg-gray-800/50 backdrop-blur-sm rounded-lg p-3 border border-gray-700/50">
                <Heart className="w-5 h-5 text-red-400" />
                <span className="text-gray-300 text-sm font-medium">
                  Health & Wellness
                </span>
              </div>
              <div className="flex items-center gap-3 bg-gray-800/50 backdrop-blur-sm rounded-lg p-3 border border-gray-700/50">
                <Moon className="w-5 h-5 text-cyan-400" />
                <span className="text-gray-300 text-sm font-medium">
                  Sleep Tracker
                </span>
              </div>
            </motion.div>

            <motion.p
              className="text-lg text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed"
              variants={itemVariants}
            >
              Build lasting habits, manage finances, track health, boost
              productivity, and achieve your goals with intelligent analytics
              and beautiful visualizations.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              variants={itemVariants}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
                className="w-full sm:w-auto"
              >
                <Link
                  to="/habits"
                  className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 via-violet-600 to-purple-700 rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/25 focus:outline-none focus:ring-4 focus:ring-purple-500/50 block text-center"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-violet-600 to-purple-700 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-center gap-2">
                    <Target size={24} />
                    Get Started
                    <ArrowRight
                      size={20}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </div>
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
                className="w-full sm:w-auto"
              >
                <Link
                  to="/pomodoro"
                  className="group relative px-8 py-4 bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-2xl hover:shadow-gray-500/25 focus:outline-none focus:ring-4 focus:ring-gray-500/50 border border-gray-600 block text-center"
                >
                  <div className="relative flex items-center justify-center gap-2">
                    <Play size={20} />
                    Try Pomodoro
                  </div>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Everything you need to
              <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
                {" "}
                stay productive
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Seven powerful tools working together to help you achieve your
              goals and build better habits.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8 mb-16"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={cardHoverVariants}
                whileHover="hover"
                custom={index}
              >
                <Link
                  to={feature.route}
                  className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-8 border border-gray-700/30 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-500/30 block"
                >
                  <motion.div
                    className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                    whileHover={{ rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    {feature.icon}
                  </motion.div>
                  <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed mb-6">
                    {feature.description}
                  </p>
                  <motion.div
                    className="flex items-center text-purple-400 font-medium group-hover:translate-x-2 transition-transform duration-300"
                    whileHover={{ x: 5 }}
                  >
                    Explore <ArrowRight size={16} className="ml-2" />
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16 sm:py-20 bg-gradient-to-r from-gray-800/30 to-gray-900/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Why choose
              <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
                {" "}
                Taskify?
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Built with modern design and powerful features to help you stay on
              track and achieve your goals.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                className="text-center group"
                variants={itemVariants}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="w-16 h-16 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-emerald-500/20 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  {benefit.icon}
                </motion.div>
                <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                <p className="text-gray-400 leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-16 sm:py-20 bg-gradient-to-r from-gray-800/30 to-gray-900/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Loved by{" "}
              <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
                thousands
              </span>{" "}
              of users
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              See how Taskify is helping people transform their productivity and
              achieve their goals.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} index={index} />
            ))}
          </motion.div>

          {/* Overall Rating */}
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full px-6 py-3 border border-purple-500/20">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className="text-yellow-400 fill-current"
                  />
                ))}
              </div>
              <span className="text-white font-semibold">4.9/5</span>
              <span className="text-gray-400">from 2,500+ reviews</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Trusted by{" "}
              <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
                millions
              </span>{" "}
              worldwide
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Our platform has helped users achieve remarkable results and build
              lasting habits.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {statistics.map((stat, index) => (
              <StatisticsCard
                key={index}
                icon={stat.icon}
                value={stat.value}
                suffix={stat.suffix}
                label={stat.label}
                color={stat.color}
                index={index}
              />
            ))}
          </motion.div>

          {/* Additional Context */}
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full px-8 py-4 border border-purple-500/20">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">99.9%</div>
                <div className="text-sm text-gray-400">Uptime</div>
              </div>
              <div className="w-px h-8 bg-gray-600"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">24/7</div>
                <div className="text-sm text-gray-400">Support</div>
              </div>
              <div className="w-px h-8 bg-gray-600"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-400">50+</div>
                <div className="text-sm text-gray-400">Countries</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-16 sm:py-20 bg-gradient-to-r from-gray-800/30 to-gray-900/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Frequently Asked{" "}
              <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
                Questions
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Everything you need to know about Taskify. Can't find the answer
              you're looking for? Please chat to our friendly team.
            </p>
          </motion.div>

          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <FAQAccordion items={faqItems} />
          </motion.div>

          {/* Contact CTA */}
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full px-6 py-3 border border-purple-500/20">
              <span className="text-gray-300">Still have questions?</span>
              <Link
                to="/contact"
                className="text-purple-400 hover:text-purple-300 font-medium transition-colors duration-200"
              >
                Contact our support team
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Ready to transform your
              <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
                {" "}
                productivity?
              </span>
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
              Start building better habits, managing tasks efficiently, and
              staying focused with our powerful tools.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Link
                to="/habits"
                className="group relative inline-flex px-8 py-4 bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/25 focus:outline-none focus:ring-4 focus:ring-purple-500/50"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-2">
                  <Target size={24} />
                  Start Your Journey
                  <ArrowRight
                    size={20}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Enhanced Footer */}
      <EnhancedFooter />
    </motion.div>
  );
};

export default Index;
