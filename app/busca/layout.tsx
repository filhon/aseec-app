"use client"

import { AppSidebar } from "@/components/layout/app-sidebar"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <AppSidebar />

      {/* Main Content */}
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-64 w-full">
        <main className="p-4 sm:px-6 sm:py-0 w-full max-w-[1600px] mx-auto">
            <Breadcrumbs />
            {children}
        </main>
      </div>
    </div>
  )
}
