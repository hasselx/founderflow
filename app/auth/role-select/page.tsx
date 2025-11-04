"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Lightbulb, Users, TrendingUp } from "lucide-react"

type UserRole = "creator" | "community_member" | "investor"

const ROLES = [
  {
    id: "creator",
    title: "Startup Founder",
    description: "Building a startup idea and looking for validation and co-founders",
    icon: Lightbulb,
    color: "from-primary/20 to-primary/5",
  },
  {
    id: "community_member",
    title: "Community Member",
    description: "Connect with founders, mentor others, and participate in discussions",
    icon: Users,
    color: "from-accent/20 to-accent/5",
  },
  {
    id: "investor",
    title: "Investor/Mentor",
    description: "Discover early-stage startups and provide guidance to founders",
    icon: TrendingUp,
    color: "from-primary/20 to-primary/5",
  },
]

const DOMAINS = [
  "AI/ML",
  "FinTech",
  "HealthTech",
  "EdTech",
  "ClimaTech",
  "SaaS",
  "E-commerce",
  "Logistics",
  "AgriTech",
  "Biotech",
  "Web3",
  "Cybersecurity",
  "Retail Tech",
  "InsurTech",
  "LegalTech",
]

export default function RoleSelectPage() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [selectedDomains, setSelectedDomains] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const toggleDomain = (domain: string) => {
    setSelectedDomains((prev) => (prev.includes(domain) ? prev.filter((d) => d !== domain) : [...prev, domain]))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!selectedRole) {
      setError("Please select a role")
      return
    }

    if (selectedDomains.length === 0) {
      setError("Please select at least one domain of interest")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole, domains: selectedDomains }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Profile setup failed")
        return
      }

      router.push("/dashboard")
    } catch (err) {
      setError("An error occurred. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-card p-4">
      <div className="mx-auto max-w-4xl space-y-8 py-12">
        {/* Header */}
        <div className="space-y-2 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
              FF
            </div>
            <span className="text-2xl font-bold text-foreground">FounderFlow</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground">Complete Your Profile</h1>
          <p className="text-lg text-muted-foreground">
            Select your role and interests to get personalized recommendations
          </p>
        </div>

        {/* Error message */}
        {error && <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Role Selection */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">What is your role?</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {ROLES.map((role) => {
                const Icon = role.icon
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role.id as UserRole)}
                    className={`relative p-6 rounded-lg border-2 transition-all ${
                      selectedRole === role.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-border/60 bg-card"
                    }`}
                  >
                    {selectedRole === role.id && (
                      <CheckCircle2 className="absolute top-4 right-4 h-6 w-6 text-primary" />
                    )}
                    <Icon className="h-8 w-8 text-primary mb-3" />
                    <h3 className="font-bold text-foreground text-left">{role.title}</h3>
                    <p className="text-xs text-muted-foreground mt-2 text-left">{role.description}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Domain Selection */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">Select your areas of interest</h2>
            <p className="text-muted-foreground">This helps us provide tailored recommendations</p>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {DOMAINS.map((domain) => (
                <button
                  key={domain}
                  type="button"
                  onClick={() => toggleDomain(domain)}
                  className={`py-3 px-4 rounded-lg border-2 font-medium transition-all text-sm ${
                    selectedDomains.includes(domain)
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border bg-card hover:border-border/60 text-foreground"
                  }`}
                >
                  {domain}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90" disabled={loading}>
              {loading ? "Setting up..." : "Continue to Dashboard"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
