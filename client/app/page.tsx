"use client";

import React from "react";
import Link from "next/link";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
import { GithubIcon } from "lucide-react";
import { SiteFooter } from "./Footer";
import { EyeCatchingButton_v1 } from "@/components/ui/shimmerButton";
import { SparklesCore } from "@/components/ui/sparkles";
import { BackgroundBeams } from "@/components/ui/bgBeams";

import {
  Zap,
  Shield,
  Link2,
  Wifi,
  Lock,
  Globe,
  Code,
  Smartphone,
  Cloud,
  ChevronDown,
} from "lucide-react";

const Home = () => {
  const words = [
    { text: "Share" },
    { text: "files" },
    { text: "blazingly" },
    { text: "fast" },
    { text: "using" },
    { text: "z1ppie.", className: "underline text-blue-500 dark:text-blue-500" },
  ];

  const whyItems = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Blazing Fast",
      desc: "Direct P2P connections skip the slow server upload/download process.",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Fort‑Knox Secure",
      desc: "Files are encrypted and never stored on servers.",
    },
    {
      icon: <Link2 className="w-8 h-8" />,
      title: "Wonderfully Simple",
      desc: "No accounts, no downloads – just share a code.",
    },
  ];

  const techItems = [
    { icon: <Wifi className="w-6 h-6" />, label: "WebRTC" },
    { icon: <Lock className="w-6 h-6" />, label: "WebCrypto" },
    { icon: <Zap className="w-6 h-6" />, label: "TypeScript" },
    { icon: <Globe className="w-6 h-6" />, label: "PWA" },
    { icon: <Code className="w-6 h-6" />, label: "Zero‑Knowledge" },
    { icon: <Smartphone className="w-6 h-6" />, label: "Cross‑Platform" },
    { icon: <Cloud className="w-6 h-6" />, label: "Browser Native" },
    { icon: <Cloud className="w-6 h-6" />, label: "Edge Computing" },
  ];

  const faqs = [
    {
      q: "Do both users need to be online at the same time?",
      a: "Yes – z1ppie uses real‑time WebRTC. Both peers must be connected simultaneously.",
    },
    {
      q: "Is there a file size limit?",
      a: "No limit from z1ppie. Only browser memory and your internet speed apply.",
    },
    {
      q: "Are files encrypted?",
      a: "Yes. All data is end‑to‑end encrypted via WebRTC (DTLS‑SRTP).",
    },
    {
      q: "Can I use z1ppie on mobile?",
      a: "Absolutely – works on Chrome, Safari, Firefox (mobile & desktop).",
    },
    {
      q: "Do I need to install anything?",
      a: "No. Just open in your browser – no accounts, no apps.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* ────── HERO ────── */}
      <section className="relative flex flex-col items-center justify-center h-[40rem] overflow-hidden">
        <BackgroundBeams className="hidden md:block" />
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={100}
          className="absolute inset-0 z-0 block md:hidden"
          particleColor={"#FFFFFF"}
        />
        <TypewriterEffectSmooth words={words} />
        <p className="mt-2 text-lg">A peer‑to‑peer file sharing app.</p>

        <div className="mt-8 flex gap-3 z-10">
          <Link href="/share">
            <EyeCatchingButton_v1>Start sharing</EyeCatchingButton_v1>
          </Link>
        </div>
      </section>

      {/* ────── WHY Z1PPIE ────── */}
      <section className="py-20 px-4 bg-gradient-to-b from-zinc-900 to-black text-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-12">Why z1ppie?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {whyItems.map((item, i) => (
              <div
                key={i}
                className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="flex justify-center mb-4 text-blue-400">{item.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-sm opacity-80">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────── DIRECT FLIGHT (STATIC) ────── */}
      <section className="py-20 px-4 bg-gradient-to-b from-black to-zinc-900 text-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8">From Your Screen to Theirs, Instantly</h2>

          <div className="my-12 bg-zinc-800 rounded-2xl p-12">
            <div className="flex items-center justify-center gap-8">
              <div className="bg-zinc-700 rounded-lg px-6 py-3 text-sm font-medium">User A</div>
              <div className="flex items-center gap-4">
                <div className="w-20 h-px bg-white/30"></div>
                <div className="w-3 h-3 bg-white rounded-full"></div>
                <div className="w-20 h-px bg-white/30"></div>
              </div>
              <div className="bg-zinc-700 rounded-lg px-6 py-3 text-sm font-medium">User B</div>
            </div>
            <p className="mt-6 text-sm opacity-70">
              Files travel through a direct connection for lightning‑fast transfers.
            </p>
          </div>

          <p className="mt-8 max-w-3xl mx-auto text-sm opacity-80">
            Traditional file sharing bounces through multiple servers, adding delays and security risks. 
            <strong> z1ppie creates a direct bridge</strong> – faster and infinitely more private.
          </p>
        </div>
      </section>

      {/* ────── TECH STACK ────── */}
      <section className="py-20 px-4 bg-black text-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Built with Cutting‑Edge Tech</h2>
          <p className="mb-12 text-sm opacity-70">
            z1ppie leverages the latest web technologies for a seamless experience.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {techItems.map((t, i) => (
              <div
                key={i}
                className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 flex flex-col items-center hover:bg-white/10 transition-colors rounded-lg"
              >
                <div className="mb-3 text-blue-400">{t.icon}</div>
                <p className="text-sm font-medium">{t.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────── FAQ ────── */}
      <section className="py-20 px-4 bg-gradient-to-b from-black to-zinc-900 text-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 cursor-pointer"
              >
                <summary className="flex justify-between items-center text-lg font-medium list-none">
                  {faq.q}
                  <ChevronDown className="w-5 h-5 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm opacity-80">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ────── FOOTER ────── */}
      <SiteFooter />
    </div>
  );
};

export default Home;