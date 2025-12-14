
"use client"

import DashboardLayout from "@/app/dashboard/layout"

export default function FinanceiroLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  )
}
