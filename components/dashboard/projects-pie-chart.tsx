"use client"

import { useMemo, useState } from "react"
import { PieChart, Pie, Sector, ResponsiveContainer, Cell, Label } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DashboardProject } from "@/components/dashboard/data"
import { cn } from "@/lib/utils"

// Modern palette using CSS variables where possible or curated hex codes
// We will use a gradient-like palette or distinct modern colors
const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

// Fallback if vars aren't set, though shadcn usually sets them. 
// Using hex to ensure visibility if variables fail or for specific look.
const MODERN_COLORS = [
  "#2563eb", // blue-600
  "#3b82f6", // blue-500
  "#60a5fa", // blue-400
  "#93c5fd", // blue-300
  "#bfdbfe", // blue-200
  "#1d4ed8", // blue-700
]

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value, percent } = props

  return (
    <g>
      <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill="currentColor" className="text-3xl font-bold fill-foreground">
        {value}
      </text>
      <text x={cx} y={cy + 15} dy={8} textAnchor="middle" fill="currentColor" className="text-xs fill-muted-foreground uppercase tracking-widest">
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8} // Expand on hover
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        cornerRadius={6}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={innerRadius - 8}
        outerRadius={innerRadius - 4}
        fill={fill}
        opacity={0.3}
        cornerRadius={4}
      />
    </g>
  )
}

interface ProjectsPieChartProps {
  projects: DashboardProject[]
  onCategoryClick?: (category: string) => void
  selectedCategory?: string | null
}

export function ProjectsPieChart({ projects, onCategoryClick, selectedCategory }: ProjectsPieChartProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  const data = useMemo(() => {
    const categoryCount: Record<string, number> = {}
    projects.forEach(p => {
      categoryCount[p.category] = (categoryCount[p.category] || 0) + 1
    })

    return Object.entries(categoryCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [projects])

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index)
  }

  return (
    <Card className="h-full shadow-sm flex flex-col overflow-hidden">
      <CardHeader className="pb-0 shrink-0">
        <CardTitle className="text-base font-semibold">Categorias</CardTitle>
        <CardDescription>Distribuição dos projetos por área de atuação.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 flex items-center justify-center relative p-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65} // Thinner ring
              outerRadius={90}
              dataKey="value"
              onMouseEnter={onPieEnter}
              onClick={(data) => onCategoryClick?.(data.name)}
              stroke="none"
              paddingAngle={2}
              cornerRadius={6} // Modern rounded edges
              className="cursor-pointer focus:outline-none"
            >
              {data.map((entry, index) => {
                 const isSelected = selectedCategory === entry.name
                 const isDimmed = selectedCategory && !isSelected
                 return (
                    <Cell 
                        key={`cell-${index}`} 
                        fill={MODERN_COLORS[index % MODERN_COLORS.length]} 
                        className={cn(
                            "stroke-background transition-all duration-300", 
                            isDimmed ? "opacity-30 hover:opacity-50" : "hover:opacity-100",
                            isSelected && "stroke-primary stroke-2"
                        )}
                        strokeWidth={isSelected ? 2 : 4}
                    />
                 )
              })}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        {/* Custom Legend at bottom */}
        {data.length > 0 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 text-xs text-muted-foreground">
             {/* Limit legend items or show summary. With Active Shape, legend is less critical for identification, but good for overview. 
                 Let's keep it clean and minimal. */}
            </div>
        )}
      </CardContent>
      {/* Footer / Legend List */}
      <div className="border-t p-4 bg-muted/5 shrink-0">
          <div className="grid grid-cols-2 gap-3 text-sm">
            {data.slice(0, 6).map((item, index) => {
                const isSelected = selectedCategory === item.name
                const isDimmed = selectedCategory && !isSelected
                return (
                    <div 
                        key={item.name} 
                        className={cn(
                            "flex items-center justify-between gap-2 cursor-pointer rounded px-1 transition-colors hover:bg-muted/50",
                            isDimmed ? "opacity-50" : "opacity-100",
                            isSelected && "bg-muted font-medium"
                        )}
                        onClick={() => onCategoryClick?.(item.name)}
                    >
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: MODERN_COLORS[index % MODERN_COLORS.length] }} />
                            <span className="truncate text-muted-foreground text-xs">{item.name}</span>
                        </div>
                        <span className="font-semibold text-xs tabular-nums">{item.value}</span>
                    </div>
                )
            })}
          </div>
      </div>
    </Card>
  )
}
