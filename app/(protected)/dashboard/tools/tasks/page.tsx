import { Card, CardContent } from "@/components/ui/card"
import { CheckSquare } from "lucide-react"

export default function TasksPage() {
  const tasks = [
    { id: 1, title: "Define product roadmap", status: "completed" },
    { id: 2, title: "Market research", status: "in-progress" },
    { id: 3, title: "Build MVP", status: "pending" },
    { id: 4, title: "User testing", status: "pending" },
  ]

  return (
    <div className="flex-1 p-6 md:p-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Tasks</h1>
        <p className="text-muted-foreground mb-8">Manage your project tasks and to-dos</p>

        <div className="space-y-3">
          {tasks.map((task) => (
            <Card key={task.id} className="cursor-pointer hover:border-primary/50 transition-colors">
              <CardContent className="p-4 flex items-center gap-4">
                <div
                  className={`w-6 h-6 rounded flex items-center justify-center ${
                    task.status === "completed" ? "bg-green-500/20" : "bg-muted"
                  }`}
                >
                  <CheckSquare
                    className={`w-5 h-5 ${task.status === "completed" ? "text-green-600" : "text-muted-foreground"}`}
                  />
                </div>
                <div className="flex-1">
                  <p
                    className={`font-medium ${
                      task.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"
                    }`}
                  >
                    {task.title}
                  </p>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded ${
                    task.status === "completed"
                      ? "bg-green-500/10 text-green-700"
                      : task.status === "in-progress"
                        ? "bg-blue-500/10 text-blue-700"
                        : "bg-gray-500/10 text-gray-700"
                  }`}
                >
                  {task.status.replace("-", " ")}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
