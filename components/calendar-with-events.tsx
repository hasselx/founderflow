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
    <div className="flex gap-6 h-[500px]">
      <div className="flex-shrink-0 w-80">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Click on dates with dots to see scheduled tasks</h3>
        </div>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-lg border w-full"
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
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary"></div>
                  )}
                </button>
              )
            }
          }}
        />
      </div>

      <div className="flex-1 overflow-y-auto border-l border-border pl-6">
        {selectedDateEvents.length > 0 ? (
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Events for {date?.toLocaleDateString()}
            </h3>
            <div className="space-y-3">
              {selectedDateEvents.map(event => (
                <div key={event.id} className="flex items-start gap-3 p-4 bg-muted rounded-lg border">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    event.status === 'completed' ? 'bg-green-500' :
                    event.status === 'in_progress' ? 'bg-blue-500' :
                    event.status === 'upcoming' ? 'bg-orange-500' :
                    'bg-gray-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium break-words">{event.title}</p>
                    <p className="text-xs text-muted-foreground capitalize mt-1">{event.status.replace('_', ' ')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <p className="text-sm">No events scheduled for this date</p>
              <p className="text-xs mt-1">Select a date with a dot to view tasks</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
