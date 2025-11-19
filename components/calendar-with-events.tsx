"use client"

import { useState, useMemo } from "react"
import { Calendar } from "@/components/ui/calendar"

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
    <div className="w-full max-w-4xl">
      <div className="flex gap-4 flex-col lg:flex-row">
        {/* Calendar Section */}
        <div className="flex-shrink-0 w-full lg:w-auto">
          <div className="mb-3">
            <h3 className="text-sm font-semibold">Click on dates with dots to see scheduled tasks</h3>
          </div>
          <div className="flex justify-center p-3 border rounded-lg bg-card">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-lg"
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
        </div>

        {/* Events Section */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold mb-3">
            Events for {date?.toLocaleDateString()}
          </h3>
          <div className="max-h-[300px] overflow-y-auto border rounded-lg bg-card p-3">
            {selectedDateEvents.length > 0 ? (
              <div className="space-y-2">
                {selectedDateEvents.map(event => (
                  <div key={event.id} className="flex items-start gap-2 p-2 bg-muted rounded-lg border text-sm">
                    <div className={`w-3 h-3 rounded-full mt-0.5 flex-shrink-0 ${
                      event.status === 'completed' ? 'bg-green-500' :
                      event.status === 'in_progress' ? 'bg-blue-500' :
                      event.status === 'upcoming' ? 'bg-orange-500' :
                      'bg-gray-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{event.title}</p>
                      <p className="text-xs text-muted-foreground capitalize mt-1">{event.status.replace('_', ' ')}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <div className="text-center text-muted-foreground text-sm">
                  <p>No events scheduled</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
