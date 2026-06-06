"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = ["Home", "Collections", "Artists", "Events", "Visit"];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 flex justify-between items-center px-6 md:px-12 py-6 bg-gradient-to-b from-luxury-black/90 via-luxury-black/40 to-transparent backdrop-blur-[2px] transition-all duration-300">
        {/* Brand Logo */}
        <a
          href="#"
          className="font-serif text-lg md:text-xl tracking-[0.25em] uppercase text-white hover:text-gold transition-colors duration-300 z-50 select-none"
        >
          MUSEION
        </a>

        {/* Center Nav (Desktop) */}
        <div className="hidden md:flex gap-8 items-center bg-white/5 border border-white/10 px-8 py-3 rounded-full backdrop-blur-md">
          {navItems.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="relative text-[10px] uppercase tracking-[0.2em] text-white/70 hover:text-white transition-colors duration-300 py-1 group"
            >
              {item}
              <span className="absolute bottom-0 left-0 w-full h-[1px] bg-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </a>
          ))}
        </div>

        {/* Floating Menu Button (Top Right) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="z-50 text-white hover:text-gold transition-colors duration-300 p-2 focus:outline-none interactive flex items-center gap-3"
          aria-label="Toggle Menu"
        >
          <span className="text-[10px] tracking-[0.2em] uppercase font-light hidden sm:inline opacity-70">
            {isOpen ? "CLOSE" : "MENU"}
          </span>
          <div className="relative w-5 h-5 flex flex-col justify-center items-center gap-1.5">
            <span
              className={`h-[1px] w-5 bg-white transition-transform duration-300 ${
                isOpen ? "rotate-45 translate-y-[3.5px]" : ""
              }`}
            />
            <span
              className={`h-[1px] w-5 bg-white transition-transform duration-300 ${
                isOpen ? "-rotate-45 -translate-y-[3.5px]" : ""
              }`}
            />
          </div>
        </button>
      </nav>

      {/* Full-screen Overlay Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 bg-luxury-black/98 z-30 flex flex-col justify-center items-center p-8 backdrop-blur-lg"
          >
            {/* Background floating decor */}
            <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none select-none">
              <span className="font-serif text-[35vw] text-white select-none leading-none opacity-20">
                M
              </span>
            </div>

            <div className="flex flex-col gap-6 items-center z-10">
              {navItems.map((item, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * idx, duration: 0.5, ease: "easeOut" }}
                  key={item}
                >
                  <a
                    onClick={() => setIsOpen(false)}
                    href={`#${item.toLowerCase()}`}
                    className="font-serif text-3xl sm:text-5xl md:text-6xl text-white hover:text-gold transition-colors duration-300 uppercase tracking-widest block text-center"
                  >
                    {item}
                  </a>
                </motion.div>
              ))}
            </div>

            {/* Bottom info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 0.6 }}
              className="absolute bottom-12 text-center text-[9px] tracking-[0.3em] uppercase text-white w-full px-4"
            >
              PARIS • ROME • ATHENS
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
