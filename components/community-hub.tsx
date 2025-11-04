"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, ThumbsUp, Users, Search, Plus, Sparkles, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CoFounderMatches {
  matches: string
  colabAdvice: string
}

export default function CommunityHub() {
  const [userProfile, setUserProfile] = useState("")
  const [isMatching, setIsMatching] = useState(false)
  const [matchResults, setMatchResults] = useState<CoFounderMatches | null>(null)
  const [error, setError] = useState<string | null>(null)

  const discussions = [
    {
      title: "Best practices for validating your MVP",
      author: "Sarah Chen",
      category: "Validation",
      replies: 24,
      views: 842,
      likes: 156,
    },
    {
      title: "Fundraising: How to approach VCs",
      author: "David Park",
      category: "Funding",
      replies: 18,
      views: 634,
      likes: 98,
    },
    {
      title: "Finding the right co-founder",
      author: "Emma Rodriguez",
      category: "Team",
      replies: 32,
      views: 1203,
      likes: 245,
    },
  ]

  const coFounders = [
    { name: "Alex Johnson", skills: "Full-stack Developer", interests: "EdTech", match: 92 },
    { name: "Maya Patel", skills: "Product Designer", interests: "FinTech", match: 87 },
    { name: "James Wilson", skills: "Business Dev", interests: "EdTech", match: 95 },
  ]

  const handleFindMatches = async () => {
    if (!userProfile.trim()) {
      setError("Please describe yourself to find matches")
      return
    }

    setIsMatching(true)
    setError(null)

    try {
      const response = await fetch("/api/match-cofounders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userProfile }),
      })

      if (!response.ok) {
        throw new Error("Failed to find matches")
      }

      const data = await response.json()
      setMatchResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to find matches")
    } finally {
      setIsMatching(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Community Hub</h1>
        <p className="text-muted-foreground">Connect, collaborate, and learn from fellow entrepreneurs.</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Discussions */}
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Community Discussions</CardTitle>
                  <CardDescription>Join conversations and share insights</CardDescription>
                </div>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  New Discussion
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search discussions..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {discussions.map((discussion, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-card/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">{discussion.title}</h3>
                        <p className="text-sm text-muted-foreground">By {discussion.author}</p>
                      </div>
                      <Badge variant="outline" className="ml-2">
                        {discussion.category}
                      </Badge>
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground mt-3">
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        {discussion.replies} replies
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {discussion.views} views
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4" />
                        {discussion.likes} likes
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Co-founder Matching */}
        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>AI Co-founder Matcher</CardTitle>
              <CardDescription>Find your ideal partner</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Tell us about yourself</label>
                <textarea
                  placeholder="Skills, experience, startup vision, what you're looking for..."
                  value={userProfile}
                  onChange={(e) => setUserProfile(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm min-h-32"
                />
              </div>
              <Button onClick={handleFindMatches} disabled={!userProfile || isMatching} className="w-full gap-2">
                <Sparkles className="w-4 h-4" />
                {isMatching ? "Matching..." : "Find Matches"}
              </Button>
            </CardContent>
          </Card>

          {matchResults && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Match Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2 text-sm">Ideal Co-founder Profile</h4>
                  <div className="prose prose-sm prose-invert max-w-none text-xs text-foreground whitespace-pre-wrap">
                    {matchResults.matches}
                  </div>
                </div>
                <div className="border-t border-border pt-4">
                  <h4 className="font-semibold text-foreground mb-2 text-sm">Finding & Vetting Advice</h4>
                  <div className="prose prose-sm prose-invert max-w-none text-xs text-foreground whitespace-pre-wrap">
                    {matchResults.colabAdvice}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Featured Co-founders</CardTitle>
              <CardDescription>AI-matched profiles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {coFounders.map((founder, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-foreground text-sm">{founder.name}</p>
                        <p className="text-xs text-muted-foreground">{founder.skills}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {founder.match}%
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">Interested in: {founder.interests}</p>
                    <Button size="sm" variant="outline" className="w-full bg-transparent">
                      View Profile
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
