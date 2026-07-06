import React from "react";

export default function SkeletonLoader() {
  return (
    <div id="skeleton_loader" className="space-y-6 animate-pulse">
      {/* 1. Executive Summary Box Skeleton */}
      <div className="bg-[#05070a]/60 border border-white/5 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div className="flex-1 space-y-4">
            <div className="flex gap-2">
              <div className="h-5 w-40 bg-white/10 rounded"></div>
              <div className="h-5 w-24 bg-white/10 rounded"></div>
            </div>
            <div className="h-8 w-2/3 bg-white/10 rounded"></div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-white/5 rounded"></div>
              <div className="h-4 w-5/6 bg-white/5 rounded"></div>
              <div className="h-4 w-4/5 bg-white/5 rounded"></div>
            </div>
          </div>
          <div className="md:w-64 bg-white/5 border border-white/5 rounded-xl p-4 space-y-4 shrink-0">
            <div className="space-y-2">
              <div className="h-3 w-20 bg-white/10 rounded"></div>
              <div className="h-5 w-28 bg-white/5 rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-24 bg-white/10 rounded"></div>
              <div className="h-5 w-32 bg-white/5 rounded"></div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. IT Strategy Roadmap Skeleton */}
      <div className="bg-[#05070a]/40 border border-white/5 rounded-xl p-5 space-y-4">
        <div className="h-6 w-48 bg-white/10 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-32 bg-white/5 rounded-lg border border-white/5 p-4 space-y-3">
            <div className="h-4 w-24 bg-white/10 rounded"></div>
            <div className="h-3 w-full bg-white/5 rounded"></div>
            <div className="h-3 w-5/6 bg-white/5 rounded"></div>
          </div>
          <div className="h-32 bg-white/5 rounded-lg border border-white/5 p-4 space-y-3">
            <div className="h-4 w-24 bg-white/10 rounded"></div>
            <div className="h-3 w-full bg-white/5 rounded"></div>
            <div className="h-3 w-5/6 bg-white/5 rounded"></div>
          </div>
          <div className="h-32 bg-white/5 rounded-lg border border-white/5 p-4 space-y-3">
            <div className="h-4 w-24 bg-white/10 rounded"></div>
            <div className="h-3 w-full bg-white/5 rounded"></div>
            <div className="h-3 w-5/6 bg-white/5 rounded"></div>
          </div>
        </div>
      </div>

      {/* 3. Topology & Details Skeleton */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div className="h-6 w-56 bg-white/10 rounded"></div>
          <div className="h-4 w-40 bg-white/5 rounded"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left panel topology board skeleton */}
          <div className="lg:col-span-2 h-[450px] bg-[#05070a]/60 border border-white/5 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden">
            <div className="flex justify-between items-center">
              <div className="h-4 w-32 bg-white/10 rounded"></div>
              <div className="flex gap-1">
                <div className="h-6 w-16 bg-white/5 rounded"></div>
                <div className="h-6 w-16 bg-white/5 rounded"></div>
              </div>
            </div>
            {/* Pulsing connections and nodes representations */}
            <div className="relative flex-1 flex items-center justify-center">
              <div className="absolute top-1/4 left-1/4 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/10"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-indigo-500/15 flex items-center justify-center border border-indigo-500/20"></div>
              <div className="absolute bottom-1/4 right-1/4 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/10"></div>
              {/* Fake connecting line */}
              <div className="w-2/3 h-0.5 bg-white/5"></div>
            </div>
            <div className="h-4 w-48 bg-white/5 rounded self-center"></div>
          </div>

          {/* Right panel node specs skeleton */}
          <div className="lg:col-span-1 bg-[#05070a]/60 border border-white/5 rounded-xl p-5 flex flex-col justify-between h-[450px]">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <div className="space-y-1.5">
                  <div className="h-3 w-20 bg-white/10 rounded"></div>
                  <div className="h-5 w-28 bg-white/10 rounded"></div>
                </div>
                <div className="h-6 w-16 bg-white/10 rounded"></div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-28 bg-white/5 rounded"></div>
                <div className="h-4 w-full bg-white/5 rounded"></div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-36 bg-white/5 rounded"></div>
                <div className="h-14 w-full bg-white/5 rounded border border-white/5"></div>
              </div>
            </div>
            <div className="h-8 w-full bg-white/5 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
