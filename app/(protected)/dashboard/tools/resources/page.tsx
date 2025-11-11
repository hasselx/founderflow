import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"

export default function ResourcesPage() {
  const resources = [
    {
      category: "Team Members",
      items: [
        { name: "John Doe", role: "Co-founder" },
        { name: "Jane Smith", role: "CTO" },
      ],
    },
    {
      category: "Tools & Services",
      items: [
        { name: "AWS", role: "Cloud Infrastructure" },
        { name: "Figma", role: "Design Tool" },
      ],
    },
    {
      category: "Funding & Financial",
      items: [
        { name: "Angel Investor Fund", role: "$100K available" },
        { name: "Bootstrapping Budget", role: "$50K" },
      ],
    },
  ]

  return (
    <div className="flex-1 p-6 md:p-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Resources</h1>
        <p className="text-muted-foreground mb-8">Manage your team, tools, and financial resources</p>

        <div className="space-y-6">
          {resources.map((resource) => (
            <Card key={resource.category}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {resource.category}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {resource.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span className="font-medium text-foreground">{item.name}</span>
                      <span className="text-sm text-muted-foreground">{item.role}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
