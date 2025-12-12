"use client"

import DashboardLayout from "@/app/dashboard/layout"

export default function ProjetosLayout({
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
