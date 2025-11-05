import type React from "react"
import DashboardLayout from "@/components/dashboard-layout"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayout currentPage="dashboard">{children}</DashboardLayout>
}
