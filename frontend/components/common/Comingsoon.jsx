"use client";
import { useState, useEffect } from "react";

function AnimatedComingSoon() {
  const [sparkles, setSparkles] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newSparkle = {
        id: Math.random(),
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 6 + 4,
        duration: Math.random() * 2 + 1,
      };

      setSparkles((prev) => [...prev.slice(-15), newSparkle]);

      setTimeout(() => {
        setSparkles((prev) => prev.filter((s) => s.id !== newSparkle.id));
      }, newSparkle.duration * 1000);
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 p-8 rounded-2xl shadow-2xl z-0 min-h-screen">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20 animate-pulse"></div>

      {/* Dynamic sparkles */}
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          className="absolute pointer-events-none"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            width: `${sparkle.size}px`,
            height: `${sparkle.size}px`,
            animation: `twinkle ${sparkle.duration}s ease-out forwards`,
          }}
        >
          <div className="w-full h-full bg-white rounded-full opacity-80 animate-ping"></div>
        </div>
      ))}

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
        {/* Top lightning bolts */}
        <div className="flex items-center space-x-2 mb-2">
          <span
            className="text-yellow-300 text-2xl animate-bounce"
            style={{ animationDelay: "0s" }}
          >
            ⚡
          </span>
          <span
            className="text-yellow-300 text-3xl animate-bounce"
            style={{ animationDelay: "0.2s" }}
          >
            ⚡
          </span>
          <span
            className="text-yellow-300 text-2xl animate-bounce"
            style={{ animationDelay: "0.4s" }}
          >
            ⚡
          </span>
        </div>

        {/* Main text with gradient */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-yellow-200 to-white bg-clip-text text-transparent animate-pulse">
            Тун удахгүй...
          </h1>
          <p className="text-blue-100 text-lg mt-2 animate-fade-in opacity-80">
            Гайхамшигтай зүйл бэлдэж байна
          </p>
        </div>

        {/* Animated progress bar */}
        <div className="w-64 h-2 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-yellow-400 to-pink-500 rounded-full animate-loading"></div>
        </div>

        {/* Bottom decorative elements */}
        <div className="flex space-x-4 mt-4">
          <div
            className="w-3 h-3 bg-white rounded-full animate-ping"
            style={{ animationDelay: "0s" }}
          ></div>
          <div
            className="w-3 h-3 bg-white rounded-full animate-ping"
            style={{ animationDelay: "0.3s" }}
          ></div>
          <div
            className="w-3 h-3 bg-white rounded-full animate-ping"
            style={{ animationDelay: "0.6s" }}
          ></div>
        </div>
      </div>

      {/* Corner decorations */}
      <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-yellow-400 to-pink-500 rounded-full opacity-30 animate-pulse"></div>
      <div className="absolute -top-2 -right-6 w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full opacity-40 animate-ping"></div>
      <div className="absolute -bottom-6 -left-2 w-10 h-10 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full opacity-25 animate-bounce"></div>
      <div className="absolute -bottom-4 -right-4 w-14 h-14 bg-gradient-to-br from-pink-400 to-red-500 rounded-full opacity-20 animate-pulse"></div>

      <style jsx>{`
        @keyframes twinkle {
          0% {
            opacity: 0;
            transform: scale(0) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: scale(1) rotate(180deg);
          }
          100% {
            opacity: 0;
            transform: scale(0) rotate(360deg);
          }
        }

        @keyframes loading {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(400%);
          }
        }

        @keyframes fade-in {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-loading {
          animation: loading 2s ease-in-out infinite;
        }

        .animate-fade-in {
          animation: fade-in 2s ease-out infinite alternate;
        }
      `}</style>
    </div>
  );
}

export default AnimatedComingSoon;
