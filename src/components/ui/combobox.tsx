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
    const inputRef = React.useRef<HTMLInputElement>(null)

    const selectedOption = options.find((opt) => opt.value === value)

    // Sync internal input value when external value changes
    React.useEffect(() => {
        if (selectedOption) {
            setInputValue(selectedOption.label)
        } else {
            setInputValue("")
        }
    }, [value, selectedOption])

    // Filter options based on input
    const filteredOptions = React.useMemo(() => {
        if (!inputValue) return options
        const lowerVal = inputValue.toLowerCase()
        return options.filter(opt =>
            opt.label.toLowerCase().includes(lowerVal) ||
            opt.value.toLowerCase().includes(lowerVal)
        )
    }, [options, inputValue])

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
                    {selectedOption?.flag && (
                        <div className="absolute left-4 z-10 text-3xl flex items-center h-full" aria-hidden="true">
                            {selectedOption.flag}
                        </div>
                    )}
                    <input
                        ref={inputRef}
                        type="text"
                        className={cn(
                            "absolute inset-0 w-full h-full bg-transparent outline-none placeholder:text-muted-foreground placeholder:font-normal font-bold text-lg text-foreground",
                            selectedOption?.flag ? "pl-16 pr-10" : "px-4 pr-10"
                        )}
                        placeholder={placeholder}
                        value={inputValue}
                        onChange={(e) => {
                            setInputValue(e.target.value)
                            if (!open) setOpen(true)
                            if (e.target.value === "") onChange("")
                        }}
                        onFocus={() => setOpen(true)}
                        onBlur={(e) => {
                            // On blur, if they haven't made a valid selection, revert to the actual selected value
                            // We'll delay it slightly so clicking an item has time to register `onChange`
                            setTimeout(() => {
                                if (inputRef.current !== document.activeElement) {
                                    const currSelected = options.find((opt) => opt.value === value)
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
                                {filteredOptions.map((option) => (
                                    <CommandItem
                                        key={option.value}
                                        value={option.label}
                                        onSelect={() => {
                                            onChange(option.value)
                                            setInputValue(option.label)
                                            setOpen(false)
                                            inputRef.current?.blur()
                                        }}
                                        className="py-4 text-lg cursor-pointer font-bold"
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
