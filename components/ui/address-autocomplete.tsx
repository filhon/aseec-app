"use client"

import * as React from "react"
import { Loader2, MapPin, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

import { cn } from "@/lib/utils"
 

export interface AddressData {
    display_name: string
    street: string
    number: string
    neighborhood: string
    city: string
    state: string
    country: string
    zipCode: string
    latitude: number
    longitude: number
}

interface AddressAutocompleteProps {
    onAddressSelect: (address: AddressData) => void
    defaultValue?: string
    className?: string
}

export function AddressAutocomplete({ onAddressSelect, defaultValue = "", className }: AddressAutocompleteProps) {
    const [query, setQuery] = React.useState(defaultValue)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [results, setResults] = React.useState<any[]>([])
    const [loading, setLoading] = React.useState(false)
    const [open, setOpen] = React.useState(false)
    const containerRef = React.useRef<HTMLDivElement>(null)

    // Debounce search to respect API policy (1s delay)
    // Implementing simple debounce effect since we don't have the hook yet
    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (query.length >= 3) {
                searchAddress(query)
            } else {
                setResults([])
                setOpen(false)
            }
        }, 1000)

        return () => clearTimeout(timer)
    }, [query])

    const searchAddress = async (searchQuery: string) => {
        setLoading(true)
        try {
            // Check if it's a CEP (numbers, optionally dash, 8 digits total)
            const cleanQuery = searchQuery.replace(/\D/g, "")
            const isCEP = /^\d{8}$/.test(cleanQuery)

            let url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5`
            
            if (isCEP) {
                // For CEP, we use the postalcode parameter for better accuracy
                url += `&postalcode=${cleanQuery}`
            } else {
                url += `&q=${encodeURIComponent(searchQuery)}`
            }

            const response = await fetch(
                url,
                {
                    headers: {
                        "User-Agent": "AseecApp/1.0"
                    }
                }
            )
            const data = await response.json()
            setResults(data)
            setOpen(true)
        } catch (error) {
            console.error("Error searching address:", error)
            setResults([])
        } finally {
            setLoading(false)
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSelect = (item: any) => {
        const address = item.address

        // Parse Nominatim response to our format
        const parsedAddress: AddressData = {
            display_name: item.display_name,
            street: address.road || address.pedestrian || "",
            number: address.house_number || "",
            neighborhood: address.suburb || address.neighbourhood || "",
            city: address.city || address.town || address.village || address.municipality || "",
            state: address.state || "",
            country: address.country || "",
            zipCode: address.postcode || "",
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon)
        }

        setQuery(item.display_name.split(",")[0]) // Set generic name to input
        setOpen(false)
        onAddressSelect(parsedAddress)
    }

    // Click outside to close
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    return (
        <div className={cn("relative", className)} ref={containerRef}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value)
                        if (!open && e.target.value.length >= 3) setLoading(true)
                    }}
                    placeholder="Digite o endereço ou CEP..."
                    className="pl-9"
                />
                {loading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                )}
            </div>

            {open && results.length > 0 && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover text-popover-foreground border rounded-md shadow-lg max-h-[200px] overflow-auto">
                    <ul className="py-1">
                        {results.map((item, index) => (
                            <li
                                key={index}
                                className="px-3 py-2 text-sm hover:bg-muted cursor-pointer flex items-start gap-2"
                                onClick={() => handleSelect(item)}
                            >
                                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                                <span className="line-clamp-2">{item.display_name}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}
