"use client"

import { Card } from "@/components/ui/card"
import { MessageSquare, BookOpen, Users, TrendingUp } from "lucide-react"
import { fetchAdminStats, type DashboardStats } from "@/app/actions/fetch-admin-stats"

export default async function AdminDashboard() {
  const statsResult = await fetchAdminStats()

  const stats: DashboardStats = statsResult.success
    ? statsResult.data!
    : {
        totalFeedback: 0,
        totalInsights: 0,
        totalUsers: 0,
        averageSentiment: 0,
      }

  const statCards = [
    {
      label: "Total Feedback",
      value: stats.totalFeedback,
      icon: MessageSquare,
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      label: "Business Insights",
      value: stats.totalInsights,
      icon: BookOpen,
      color: "bg-purple-500/10 text-purple-600",
    },
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "bg-green-500/10 text-green-600",
    },
    {
      label: "Avg Sentiment Score",
      value: `${stats.averageSentiment}/10`,
      icon: TrendingUp,
      color: "bg-orange-500/10 text-orange-600",
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome to the admin panel. Manage feedback and business insights.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>• Review user feedback in the Feedback section</p>
          <p>• Manage business insights in the Business Insights section</p>
          <p>• Track user engagement and sentiment trends</p>
        </div>
      </Card>

      <Card className="p-6 border-l-4 border-l-primary">
        <h2 className="text-lg font-semibold text-foreground mb-4">Admin Access Guide</h2>
        <div className="space-y-6 text-sm">
          <div>
            <h3 className="font-semibold text-foreground mb-2">How to Access Admin Panel:</h3>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Click on your profile avatar in the top-right corner of the header</li>
              <li>
                Select <strong>"Admin Panel"</strong> from the dropdown menu (only visible to admins)
              </li>
              <li>You'll be redirected to the admin dashboard</li>
            </ol>
          </div>
          <div className="pt-4 border-t border-border">
            <h3 className="font-semibold text-foreground mb-2">Admin Credentials (Hardcoded):</h3>
            <div className="text-muted-foreground space-y-1">
              <p>
                Email: <strong className="text-foreground">nkrnaveen385@gmail.com</strong>
              </p>
              <p>
                Password: <strong className="text-foreground">admin123</strong>
              </p>
            </div>
          </div>
          <div className="pt-4 border-t border-border">
            <h3 className="font-semibold text-foreground mb-2">Admin Features:</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>View and manage user feedback with sentiment analysis</li>
              <li>Create, edit, and delete business insights/wisdom</li>
              <li>Filter feedback by status and sentiment</li>
              <li>Publish or save insights as drafts</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}
