"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Minus, Plus } from "lucide-react"

type PriceRangeSliderProps = {
  min: number
  max: number
  value: [number, number]
  onChange: (value: [number, number]) => void
  step?: number
}

export default function PriceRangeSlider({
  min,
  max,
  value,
  onChange,
  step = 50,
}: PriceRangeSliderProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [minVal, setMinVal] = useState(value[0])
  const [maxVal, setMaxVal] = useState(value[1])

  useEffect(() => {
    setMinVal(value[0])
    setMaxVal(value[1])
  }, [value])

  const handleMinChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newMin = Math.min(Number(e.target.value), maxVal - step)
      setMinVal(newMin)
      onChange([newMin, maxVal])
    },
    [maxVal, onChange, step]
  )

  const handleMaxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newMax = Math.max(Number(e.target.value), minVal + step)
      setMaxVal(newMax)
      onChange([minVal, newMax])
    },
    [minVal, onChange, step]
  )

  const range = Math.max(max - min, 1)
  const minPercent = Math.max(0, Math.min(100, ((minVal - min) / range) * 100))
  const maxPercent = Math.max(0, Math.min(100, ((maxVal - min) / range) * 100))

  return (
    <div className="w-full bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
      {/* Title Header matching the reference image */}
      <div className="pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="relative inline-block pb-1">
            <span className="text-xs sm:text-sm font-black tracking-wider text-zinc-900 dark:text-zinc-100 uppercase">
              মূল্য সীমা / PRICE RANGE
            </span>
            {/* Orange underline matching reference image */}
            <div className="absolute left-0 bottom-0 w-full h-[2.5px] bg-orange-500 rounded-full" />
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            aria-label={isOpen ? "Collapse price range" : "Expand price range"}
          >
            {isOpen ? (
              <Minus className="w-4 h-4 stroke-[2.5]" />
            ) : (
              <Plus className="w-4 h-4 stroke-[2.5]" />
            )}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="pt-4 space-y-3">
          {/* Price values row: ৳ 0 on left, ৳ 2,500 on right */}
          <div className="flex items-center justify-between text-sm sm:text-base font-bold text-zinc-800 dark:text-zinc-200">
            <span>৳ {minVal.toLocaleString()}</span>
            <span>৳ {maxVal.toLocaleString()}</span>
          </div>

          {/* Slider track container: Perfectly centered */}
          <div className="relative w-full h-8 flex items-center justify-center">
            {/* Inactive gray track line */}
            <div className="absolute left-0 right-0 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full pointer-events-none" />

            {/* Active orange track line */}
            <div
              className="absolute h-1.5 bg-orange-500 rounded-full pointer-events-none"
              style={{
                left: `${minPercent}%`,
                width: `${Math.max(0, maxPercent - minPercent)}%`,
              }}
            />

            {/* Native Range Inputs with circular thumbs mathematically centered at (32 - 20)/2 = 6px */}
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={minVal}
              onChange={handleMinChange}
              className="price-slider-input pointer-events-none absolute w-full h-8 appearance-none bg-transparent focus:outline-none z-20 m-0 p-0"
              aria-label="Minimum price"
            />
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={maxVal}
              onChange={handleMaxChange}
              className="price-slider-input pointer-events-none absolute w-full h-8 appearance-none bg-transparent focus:outline-none z-20 m-0 p-0"
              aria-label="Maximum price"
            />
          </div>

          {/* Active status & Reset */}
          {(minVal > min || maxVal < max) && (
            <div className="pt-1 flex items-center justify-between text-xs text-zinc-500">
              <span>ফিল্টার সক্রিয়</span>
              <button
                type="button"
                onClick={() => {
                  setMinVal(min)
                  setMaxVal(max)
                  onChange([min, max])
                }}
                className="text-orange-600 hover:text-orange-700 font-bold underline cursor-pointer"
              >
                রিসেট
              </button>
            </div>
          )}

          <style jsx>{`
            .price-slider-input {
              -webkit-appearance: none;
              appearance: none;
              background: transparent;
              pointer-events: none;
              height: 32px;
              margin: 0;
              padding: 0;
            }
            .price-slider-input::-webkit-slider-runnable-track {
              -webkit-appearance: none;
              background: transparent;
              height: 32px;
              border: none;
            }
            .price-slider-input::-webkit-slider-thumb {
              pointer-events: auto;
              -webkit-appearance: none;
              appearance: none;
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background-color: #f97316;
              border: 2.5px solid #ffffff;
              box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
              cursor: pointer;
              margin-top: 6px; /* Exactly (32px track - 20px thumb) / 2 = 6px! Perfectly centered on the horizontal line */
              transition: transform 0.1s ease, box-shadow 0.1s ease;
            }
            .price-slider-input::-webkit-slider-thumb:hover {
              transform: scale(1.15);
              box-shadow: 0 2px 6px rgba(249, 115, 22, 0.5);
            }
            .price-slider-input::-webkit-slider-thumb:active {
              transform: scale(1.2);
            }
            .price-slider-input::-moz-range-track {
              background: transparent;
              height: 32px;
              border: none;
            }
            .price-slider-input::-moz-range-thumb {
              pointer-events: auto;
              appearance: none;
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background-color: #f97316;
              border: 2.5px solid #ffffff;
              box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
              cursor: pointer;
              transition: transform 0.1s ease, box-shadow 0.1s ease;
            }
            .price-slider-input::-moz-range-thumb:hover {
              transform: scale(1.15);
              box-shadow: 0 2px 6px rgba(249, 115, 22, 0.5);
            }
            .price-slider-input::-moz-range-thumb:active {
              transform: scale(1.2);
            }
          `}</style>
        </div>
      )}
    </div>
  )
}
