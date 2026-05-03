"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    question: "Can I generate images on the Free plan?",
    answer: "Yes. The Free plan lets you explore the builder and generate a limited number of images so you can test the workflow before upgrading.",
  },
  {
    question: "What happens when I reach my monthly limit?",
    answer: "When you hit your monthly usage limit, generation is paused until your quota resets or you upgrade to a higher plan.",
  },
  {
    question: "How many people can use the Agency plan?",
    answer: "The Agency plan is built for teams and supports multiple users, making it easier to manage prompt workflows across clients and internal projects.",
  },
  {
    question: "Is Polar secure, and do you store my payment information?",
    answer: "Payments are processed securely through Polar. We do not store your full payment card details on our servers.",
  },
  {
    question: "Can I switch between monthly and yearly billing?",
    answer: "Yes. You can move between monthly and yearly billing whenever that option is available for your plan.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Yes. You can cancel anytime, and your plan will remain active until the end of the current billing period.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="py-24 md:py-32 bg-black relative border-t border-white/5">
      <div className="max-w-3xl mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            Frequently Asked Questions
          </h2>
          <p className="text-[#999999] text-base md:text-lg">
            Everything you need to know before you start building.
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            
            return (
              <motion.div
                key={index}
                className={`border rounded-[16px] overflow-hidden bg-gradient-to-b from-[#1a1a1a] to-[#121212] transition-colors duration-300 ${
                  isOpen ? "border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.03)]" : "border-white/5 hover:border-white/10"
                }`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <button
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 rounded-[16px]"
                  onClick={() => toggleFAQ(index)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                  id={`faq-question-${index}`}
                >
                  <span className={`text-lg font-medium transition-colors duration-300 ${isOpen ? "text-white" : "text-[#dddddd]"}`}>
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className={`ml-4 flex-shrink-0 transition-colors duration-300 ${isOpen ? "text-white" : "text-[#666666]"}`}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-answer-${index}`}
                      role="region"
                      aria-labelledby={`faq-question-${index}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-0 text-[#999999] text-base leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
