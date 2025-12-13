"use client"

import DashboardLayout from "@/app/dashboard/layout"

export default function AseecIALayout({
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
