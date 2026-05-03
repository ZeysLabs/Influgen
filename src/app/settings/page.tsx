"use client";

import { motion } from "framer-motion";
import Header from "@/components/Header";

export default function SettingsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-black pt-24 pb-16 px-6">
        <div className="max-w-2xl mx-auto">
          <motion.h1
            className="text-3xl md:text-4xl font-bold text-white mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Settings
          </motion.h1>
          <motion.p
            className="text-[#999999] mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Placeholder settings. Backend will manage real preferences.
          </motion.p>

          <div className="space-y-4">
            {[
              { label: "Account", desc: "Manage your profile and preferences" },
              { label: "Notifications", desc: "Email and push notification settings" },
              { label: "Billing", desc: "Subscription and payment details" },
            ].map((setting, i) => (
              <motion.div
                key={setting.label}
                className="p-5 rounded-[18px] border border-white/10 bg-[#151515] flex items-center justify-between"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
              >
                <div>
                  <h3 className="text-white font-medium">{setting.label}</h3>
                  <p className="text-sm text-[#999999]">{setting.desc}</p>
                </div>
                <button className="px-4 py-2 rounded-full border border-white/20 text-white text-sm hover:bg-white/10 transition-colors">
                  Manage
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
