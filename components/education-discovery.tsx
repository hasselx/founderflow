"use client"

import { useEffect, useState } from "react"
import { BookOpen, Play, FileText, Sparkles, ExternalLink, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EducationResource {
  title: string
  description: string
  url: string
  source: string
  image?: string
  publishedAt: string
  type: string
}

const CATEGORIES = [
  { id: "startup-fundamentals", label: "Startup Fundamentals", icon: BookOpen },
  { id: "fundraising", label: "Fundraising", icon: Sparkles },
  { id: "product-development", label: "Product Development", icon: FileText },
  { id: "marketing-sales", label: "Marketing & Sales", icon: Play },
]

export default function EducationDiscovery() {
  const [selectedCategory, setSelectedCategory] = useState("startup-fundamentals")
  const [resources, setResources] = useState<EducationResource[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/education/resources?category=${selectedCategory}`)
        const data = await res.json()
        setResources(data.resources || [])
      } catch (error) {
        console.error("[v0] Failed to fetch resources:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchResources()
  }, [selectedCategory])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-foreground">Education & Discovery</h2>
        <p className="text-muted-foreground">
          Learn from industry experts and stay updated with the latest startup trends
        </p>
      </div>

      {/* Category Selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {CATEGORIES.map((category) => {
          const Icon = category.icon
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`p-4 rounded-lg border-2 transition-all flex flex-col items-start gap-2 ${
                selectedCategory === category.id
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/50"
              }`}
            >
              <Icon className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-foreground">{category.label}</span>
            </button>
          )
        })}
      </div>

      {/* Resources Grid */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : resources.length > 0 ? (
          <div className="grid gap-4">
            {resources.map((resource, idx) => (
              <div
                key={idx}
                className="group p-4 rounded-lg border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all"
              >
                <div className="flex gap-4">
                  {resource.image && (
                    <img
                      src={resource.image || "/placeholder.svg"}
                      alt={resource.title}
                      className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-foreground leading-tight line-clamp-2">{resource.title}</h3>
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded hover:bg-muted flex-shrink-0"
                      >
                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                      </a>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{resource.description}</p>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-muted-foreground">{resource.source}</span>
                      <Button size="sm" variant="outline" onClick={() => window.open(resource.url, "_blank")}>
                        Read More
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">No resources found. Try another category.</div>
        )}
      </div>
    </div>
  )
}
