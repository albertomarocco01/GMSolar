'use client';

import React, { useState } from 'react';
import ClosingBubbles from './ClosingBubbles';

export default function BubblePlayground() {
  const [count, setCount] = useState(12);
  const [minSize, setMinSize] = useState(40);
  const [maxSize, setMaxSize] = useState(220);
  const [speedScale, setSpeedScale] = useState(1.5);
  const [opacityScale, setOpacityScale] = useState(1.0);
  const [blur, setBlur] = useState(0);
  const [sharpness, setSharpness] = useState(0);
  const [edgeBleed, setEdgeBleed] = useState(100);

  return (
    <div className="relative min-h-screen bg-[#f4f6f4] overflow-hidden w-full h-full flex flex-col items-center justify-center">
      {/* Background layer */}
      <div className="absolute inset-0 z-0">
        <ClosingBubbles 
          count={count}
          minSize={minSize}
          maxSize={maxSize}
          speedScale={speedScale}
          opacityScale={opacityScale}
          blur={blur}
          sharpness={sharpness}
          edgeBleed={edgeBleed}
        />
      </div>

      {/* Control Panel */}
      <div className="absolute top-4 right-4 z-50 w-72 bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/50 text-sm overflow-y-auto max-h-[calc(100vh-2rem)] scrollbar-hide">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Animation Settings</h2>
        
        <div className="space-y-5">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-gray-600 font-medium">Bubble Count</label>
              <span className="text-gray-900 font-mono bg-white px-2 py-0.5 rounded-md shadow-sm border border-gray-100">{count}</span>
            </div>
            <input 
              type="range" 
              min="1" max="50" step="1" 
              value={count} 
              onChange={(e) => setCount(Number(e.target.value))} 
              className="w-full accent-lime-500"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-gray-600 font-medium">Blur Amount</label>
              <span className="text-gray-900 font-mono bg-white px-2 py-0.5 rounded-md shadow-sm border border-gray-100">{blur}px</span>
            </div>
            <input 
              type="range" 
              min="0" max="40" step="1" 
              value={blur} 
              onChange={(e) => setBlur(Number(e.target.value))} 
              className="w-full accent-lime-500"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-gray-600 font-medium">Base Speed</label>
              <span className="text-gray-900 font-mono bg-white px-2 py-0.5 rounded-md shadow-sm border border-gray-100">{speedScale.toFixed(1)}x</span>
            </div>
            <input 
              type="range" 
              min="0.1" max="5.0" step="0.1" 
              value={speedScale} 
              onChange={(e) => setSpeedScale(Number(e.target.value))} 
              className="w-full accent-lime-500"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-gray-600 font-medium">Opacity</label>
              <span className="text-gray-900 font-mono bg-white px-2 py-0.5 rounded-md shadow-sm border border-gray-100">{opacityScale.toFixed(1)}x</span>
            </div>
            <input 
              type="range" 
              min="0.1" max="3.0" step="0.1" 
              value={opacityScale} 
              onChange={(e) => setOpacityScale(Number(e.target.value))} 
              className="w-full accent-lime-500"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-gray-600 font-medium">Min Size</label>
              <span className="text-gray-900 font-mono bg-white px-2 py-0.5 rounded-md shadow-sm border border-gray-100">{minSize}px</span>
            </div>
            <input 
              type="range" 
              min="10" max="150" step="1" 
              value={minSize} 
              onChange={(e) => {
                const val = Number(e.target.value);
                setMinSize(val);
                if (val > maxSize) setMaxSize(val);
              }} 
              className="w-full accent-lime-500"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-gray-600 font-medium">Max Size</label>
              <span className="text-gray-900 font-mono bg-white px-2 py-0.5 rounded-md shadow-sm border border-gray-100">{maxSize}px</span>
            </div>
            <input 
              type="range" 
              min="50" max="500" step="1" 
              value={maxSize} 
              onChange={(e) => {
                const val = Number(e.target.value);
                setMaxSize(val);
                if (val < minSize) setMinSize(val);
              }} 
              className="w-full accent-lime-500"
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-gray-600 font-medium">Sharpness (HD)</label>
              <span className="text-gray-900 font-mono bg-white px-2 py-0.5 rounded-md shadow-sm border border-gray-100">{sharpness.toFixed(2)}</span>
            </div>
            <input 
              type="range" 
              min="0" max="0.99" step="0.05" 
              value={sharpness} 
              onChange={(e) => setSharpness(Number(e.target.value))} 
              className="w-full accent-lime-500"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-gray-600 font-medium">Spread (Edge Bleed)</label>
              <span className="text-gray-900 font-mono bg-white px-2 py-0.5 rounded-md shadow-sm border border-gray-100">{edgeBleed}px</span>
            </div>
            <input 
              type="range" 
              min="0" max="500" step="10" 
              value={edgeBleed} 
              onChange={(e) => setEdgeBleed(Number(e.target.value))} 
              className="w-full accent-lime-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
