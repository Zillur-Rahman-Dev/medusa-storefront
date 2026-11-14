import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import React from "react"
import { formatSize } from "@lib/util/money"

type OptionSelectProps = {
  option: HttpTypes.StoreProductOption
  current: string | undefined
  updateOption: (title: string, value: string) => void
  title: string
  disabled: boolean
  "data-testid"?: string
}

const OptionSelect: React.FC<OptionSelectProps> = ({
  option,
  current,
  updateOption,
  title,
  "data-testid": dataTestId,
  disabled,
}) => {
  const filteredOptions = (option.values ?? []).map((v) => v.value)
  const displayTitle =
    title?.toLowerCase() === "size" || title?.toLowerCase() === "ওজন" || title?.toLowerCase() === "সাইজ"
      ? "প্যাক সাইজ / ওজন নির্বাচন করুন:"
      : `${title} নির্বাচন করুন:`

  return (
    <div className="flex flex-col gap-y-1.5">
      <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
        {displayTitle}
      </span>
      <div
        className="flex flex-wrap gap-2"
        data-testid={dataTestId}
      >
        {filteredOptions.map((v) => {
          const isSelected = v === current
          return (
            <button
              type="button"
              onClick={() => updateOption(option.id, v)}
              key={v}
              className={clx(
                "h-9 px-3.5 rounded-lg text-xs sm:text-sm font-bold border-2 transition-all flex items-center justify-center min-w-[70px]",
                {
                  "border-amber-500 bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 shadow-sm ring-1 ring-amber-400/30":
                    isSelected,
                  "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:border-amber-400 hover:text-amber-600":
                    !isSelected,
                }
              )}
              disabled={disabled}
              data-testid="option-button"
            >
              {formatSize(v)}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default OptionSelect
