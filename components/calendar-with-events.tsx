"use client"

import { useState, useMemo } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface CalendarEvent {
  id: string
  title: string
  date: Date
  status: string
}

interface CalendarWithEventsProps {
  events: CalendarEvent[]
}

export function CalendarWithEvents({ events }: CalendarWithEventsProps) {
  const [date, setDate] = useState<Date | undefined>(new Date())

  const datesWithEvents = useMemo(() => {
    const dates = new Set<string>()
    events.forEach(event => {
      dates.add(event.date.toDateString())
    })
    return dates
  }, [events])

  const selectedDateEvents = useMemo(() => {
    if (!date) return []
    return events.filter(event => event.date.toDateString() === date.toDateString())
  }, [date, events])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Project Timeline Calendar</CardTitle>
          <CardDescription>Click on dates with dots to see scheduled tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-lg border"
            classNames={{
              day: "relative",
            }}
            components={{
              DayButton: (props: any) => {
                const dayDate = props.day.date
                const hasEvent = datesWithEvents.has(dayDate.toDateString())
                return (
                  <button
                    {...props}
                    className={`relative aspect-square p-2 text-sm ${props.className}`}
                  >
                    {props.children}
                    {hasEvent && (
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-primary"></div>
                    )}
                  </button>
                )
              }
            }}
          />
        </CardContent>
      </Card>

      {selectedDateEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Events for {date?.toLocaleDateString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {selectedDateEvents.map(event => (
                <div key={event.id} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${
                    event.status === 'completed' ? 'bg-green-500' :
                    event.status === 'in_progress' ? 'bg-blue-500' :
                    event.status === 'upcoming' ? 'bg-orange-500' :
                    'bg-gray-400'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{event.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">{event.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
