"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

export interface ComboboxOption {
    value: string
    label: string
    flag?: string
}

interface ComboboxProps {
    options: ComboboxOption[]
    value: string
    onChange: (value: string) => void
    placeholder?: string
    emptyText?: string
    disabled?: boolean
    className?: string
}

export function Combobox({
    options,
    value,
    onChange,
    placeholder = "Seçiniz...",
    emptyText = "Sonuç bulunamadı.",
    disabled = false,
    className,
}: ComboboxProps) {
    const [open, setOpen] = React.useState(false)
    const [inputValue, setInputValue] = React.useState("")
    const [highlightedIndex, setHighlightedIndex] = React.useState(0)
    const inputRef = React.useRef<HTMLInputElement>(null)
    const isSelecting = React.useRef(false)
    const valueRef = React.useRef(value)

    const selectedOption = options.find((opt) => opt.value === value)

    React.useEffect(() => {
        valueRef.current = value
    }, [value])

    // Sync internal input value when external value changes
    React.useEffect(() => {
        if (!open) {
            if (selectedOption) {
                setInputValue(selectedOption.label)
            } else {
                setInputValue("")
            }
        }
    }, [value, selectedOption, open])

    // Filter options based on input
    const filteredOptions = React.useMemo(() => {
        if (!inputValue) return options
        const lowerVal = inputValue.toLocaleLowerCase('tr-TR')

        return options
            .filter(opt =>
                opt.label.toLocaleLowerCase('tr-TR').includes(lowerVal) ||
                opt.value.toLocaleLowerCase('tr-TR').includes(lowerVal)
            )
            .sort((a, b) => {
                const aLabel = a.label.toLocaleLowerCase('tr-TR')
                const bLabel = b.label.toLocaleLowerCase('tr-TR')

                const aStarts = aLabel.startsWith(lowerVal)
                const bStarts = bLabel.startsWith(lowerVal)

                if (aStarts && !bStarts) return -1
                if (!aStarts && bStarts) return 1

                // If both start with it or both don't, maintain alphabetical order
                return aLabel.localeCompare(bLabel, 'tr-TR')
            })
    }, [options, inputValue])

    // Reset highlighted index when filtered options change
    React.useEffect(() => {
        setHighlightedIndex(0)
    }, [inputValue, filteredOptions.length])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <div
                    className={cn(
                        "relative flex items-center h-14 w-full rounded-xl border border-input bg-white text-lg ring-offset-background cursor-text focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
                        disabled && "opacity-50 cursor-not-allowed",
                        className
                    )}
                    onClick={(e) => {
                        if (disabled) return
                        e.preventDefault()
                        setOpen(true)
                        inputRef.current?.focus()
                    }}
                >
                    {selectedOption?.flag && inputValue === selectedOption.label && (
                        <div className="absolute left-4 z-10 text-3xl flex items-center h-full" aria-hidden="true">
                            {selectedOption.flag}
                        </div>
                    )}
                    <input
                        ref={inputRef}
                        type="text"
                        className={cn(
                            "absolute inset-0 w-full h-full bg-transparent outline-none placeholder:text-muted-foreground placeholder:font-normal font-bold text-lg text-foreground",
                            (selectedOption?.flag && inputValue === selectedOption.label) ? "pl-16 pr-10" : "px-4 pr-10"
                        )}
                        placeholder={placeholder}
                        value={inputValue}
                        onChange={(e) => {
                            setInputValue(e.target.value)
                            if (!open) setOpen(true)
                            if (e.target.value === "") onChange("")
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && filteredOptions.length > 0) {
                                e.preventDefault()
                                const autoSelect = filteredOptions[highlightedIndex] || filteredOptions[0]
                                isSelecting.current = true
                                onChange(autoSelect.value)
                                setInputValue(autoSelect.label)
                                setOpen(false)
                                inputRef.current?.blur()
                                setTimeout(() => { isSelecting.current = false }, 200)
                            }
                            if (e.key === "ArrowDown") {
                                e.preventDefault()
                                if (!open) setOpen(true)
                                setHighlightedIndex(prev => Math.min(prev + 1, filteredOptions.length - 1))
                            }
                            if (e.key === "ArrowUp") {
                                e.preventDefault()
                                setHighlightedIndex(prev => Math.max(prev - 1, 0))
                            }
                            if (e.key === "Backspace" && selectedOption && inputValue === selectedOption.label) {
                                e.preventDefault()
                                setInputValue("")
                                onChange("")
                            }
                        }}
                        onFocus={() => {
                            setInputValue("")
                            setOpen(true)
                        }}
                        onBlur={(e) => {
                            if (isSelecting.current) return;

                            // On blur, if they haven't made a valid selection, revert to the actual selected value
                            setTimeout(() => {
                                if (inputRef.current !== document.activeElement && !isSelecting.current) {
                                    const currSelected = options.find((opt) => opt.value === valueRef.current)
                                    if (currSelected) {
                                        setInputValue(currSelected.label)
                                    } else {
                                        setInputValue("")
                                    }
                                }
                            }, 150)
                        }}
                        disabled={disabled}
                        autoComplete="off"
                        role="combobox"
                        aria-expanded={open}
                        aria-controls="combobox-options"
                    />
                    <div className="absolute right-4 z-10 pointer-events-none text-muted-foreground">
                        <Search className="h-4 w-4 opacity-50" />
                    </div>
                </div>
            </PopoverTrigger>

            <PopoverContent
                className="w-[--radix-popover-trigger-width] p-0 shadow-lg border-border"
                align="start"
                onOpenAutoFocus={(e) => e.preventDefault()} // Don't steal focus from input
            >
                <Command shouldFilter={false}>
                    <CommandList id="combobox-options" className="max-h-60 overflow-y-auto">
                        {filteredOptions.length === 0 ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">{emptyText}</div>
                        ) : (
                            <CommandGroup>
                                {filteredOptions.map((option, index) => (
                                    <CommandItem
                                        key={option.value}
                                        value={option.label}
                                        onSelect={() => {
                                            isSelecting.current = true
                                            onChange(option.value)
                                            setInputValue(option.label)
                                            setOpen(false)
                                            inputRef.current?.blur()
                                            setTimeout(() => { isSelecting.current = false }, 200)
                                        }}
                                        className={cn(
                                            "py-4 text-lg cursor-pointer font-bold transition-colors",
                                            highlightedIndex === index ? "bg-accent/10 text-accent" : ""
                                        )}
                                        onMouseEnter={() => setHighlightedIndex(index)}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-3 h-5 w-5 text-[#00D69E]",
                                                value === option.value ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {option.flag && <span className="mr-3 text-3xl">{option.flag}</span>}
                                        {option.label}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
