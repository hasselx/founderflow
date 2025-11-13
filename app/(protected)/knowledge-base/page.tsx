"use client"

export default function KnowledgeBasePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-full px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-foreground">Startup Metrics Knowledge Base</h1>
          <p className="text-muted-foreground mt-2">Learn key startup terminology and metrics</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-full px-4 sm:px-6 lg:px-8 py-8">
        <iframe
          src="https://founderflowtermbook.floot.app/embed"
          width="100%"
          height="800"
          style={{ border: "1px solid #e5e7eb", borderRadius: "8px" }}
          title="Startup Metrics Knowledge Base"
        />
      </div>
    </div>
  )
}
