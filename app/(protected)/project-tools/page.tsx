"use client"

import { useState } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, CheckSquare, Users, BarChart3, Bell } from "lucide-react"

export default function ProjectToolsPage() {
  const [activeTab, setActiveTab] = useState("timeline")

  return (
    <DashboardLayout currentPage={activeTab}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Project Tools</h1>
          <p className="text-muted-foreground">Manage your startup project across all phases</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-5">
            <TabsTrigger value="timeline" className="gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Timeline</span>
            </TabsTrigger>
            <TabsTrigger value="tasks" className="gap-2">
              <CheckSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Tasks</span>
            </TabsTrigger>
            <TabsTrigger value="resources" className="gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Resources</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="mt-8">
            <ProjectTimeline />
          </TabsContent>
          <TabsContent value="tasks" className="mt-8">
            <ProjectTasks />
          </TabsContent>
          <TabsContent value="resources" className="mt-8">
            <ResourceManagement />
          </TabsContent>
          <TabsContent value="analytics" className="mt-8">
            <ProjectAnalytics />
          </TabsContent>
          <TabsContent value="notifications" className="mt-8">
            <ProjectNotifications />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

function ProjectTimeline() {
  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h2 className="text-2xl font-bold mb-6">Project Timeline</h2>
      <p className="text-muted-foreground">Track progress across all project phases</p>
      {/* Timeline content */}
    </div>
  )
}

function ProjectTasks() {
  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h2 className="text-2xl font-bold mb-6">Tasks</h2>
      <p className="text-muted-foreground">Manage and track project tasks</p>
      {/* Tasks content */}
    </div>
  )
}

function ResourceManagement() {
  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h2 className="text-2xl font-bold mb-6">Resource Management</h2>
      <p className="text-muted-foreground">Track budget, team capacity, and external resources</p>
      {/* Resources content */}
    </div>
  )
}

function ProjectAnalytics() {
  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h2 className="text-2xl font-bold mb-6">Analytics</h2>
      <p className="text-muted-foreground">View detailed project analytics and insights</p>
      {/* Analytics content */}
    </div>
  )
}

function ProjectNotifications() {
  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h2 className="text-2xl font-bold mb-6">Notifications</h2>
      <p className="text-muted-foreground">Stay updated with project activities and deadlines</p>
      {/* Notifications content */}
    </div>
  )
}
