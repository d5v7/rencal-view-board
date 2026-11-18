import { openUrl } from "@tauri-apps/plugin-opener"
import { memo } from "react"
import { siGooglemeet, siJitsi, siProton, siWebex, siZoom } from "simple-icons"

import {
  type CalendarEvent,
  dateInViewerZone,
  formatMonth,
  formatShortDate,
  formatTime,
  isSameDay,
  UntitledEventText,
  useDisplaySettings,
  useEventProps,
} from "@rencomputer/rencal-sdk"

import { displayLocation, findMeeting, type MeetingProvider } from "./meeting"

function LocationIcon() {
  return <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="board-icon"><path d="M13 6.5c0 3.5-5 7.5-5 7.5s-5-4-5-7.5a5 5 0 0 1 10 0Z"/><circle cx="8" cy="6.5" r="1.6"/></svg>
}

const meetingIcons: Partial<Record<MeetingProvider, { path: string; hex: string }>> = {
  "Google Meet": siGooglemeet,
  Zoom: siZoom,
  Jitsi: siJitsi,
  Webex: siWebex,
  "Proton Meet": siProton,
}

function MeetingIcon({ provider }: { provider: MeetingProvider }) {
  const icon = meetingIcons[provider]
  if (icon) return <svg aria-hidden="true" viewBox="0 0 24 24" fill={`#${icon.hex}`} className="board-icon"><path d={icon.path} /></svg>
  return <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="board-icon"><rect x="1.75" y="4" width="8.5" height="8" rx="1.5"/><path d="m10.25 6.5 4-2v7l-4-2z"/></svg>
}

export const BoardCard = memo(function BoardCard({ event, showDate }: { event: CalendarEvent; showDate?: boolean }) {
  const { timeFormat } = useDisplaySettings()
  const eventProps = useEventProps(event)
  const meeting = findMeeting(event)
  const location = displayLocation(event.location, meeting)

  const formatRangeDate = (date: CalendarEvent["start"]): string => {
    const plainDate = dateInViewerZone(date)
    return `${formatMonth(plainDate, "short")} ${plainDate.day},`
  }

  const time = event.start.kind === "date" ? "All day" : isSameDay(event.start, event.end)
    ? `${formatTime(event.start, timeFormat)} - ${formatTime(event.end, timeFormat)}`
    : `${formatRangeDate(event.start)} ${formatTime(event.start, timeFormat)} - ${formatRangeDate(event.end)} ${formatTime(event.end, timeFormat)}`

  return (
    <div {...eventProps} data-view="board" className="cursor-default py-2 border-b border-border last:border-b-0 outline-none">
      <div className="flex gap-2 pl-3 pr-2">
        <div data-slot="calendar-event-color-marker" className="w-[3px] shrink-0 self-stretch" />
        <div className="min-w-0 flex-1">
          <div data-slot="calendar-event-title" className="board-title text-sm font-medium">
            {event.summary || <UntitledEventText />}
          </div>
          <div className="board-meta text-xs text-muted-foreground">
            {showDate && <span data-typography="numerical" className="board-date">{formatShortDate(event.start)} ·</span>}
            {meeting ? (
              <button type="button" data-slot="calendar-event-time" data-typography="numerical" className="board-time board-join" title={`Join ${meeting.provider} meeting`} aria-label={`Join ${meeting.provider} meeting, ${time}`} onClick={(e) => { e.stopPropagation(); void openUrl(meeting.url) }}>
                <MeetingIcon provider={meeting.provider} /><span>{time}</span>
              </button>
            ) : (
              <span data-slot="calendar-event-time" data-typography="numerical" className="board-time">{time}</span>
            )}
            {location && <span className="board-location" title={location}><LocationIcon /><span className="board-location-text">{location}</span></span>}
          </div>
        </div>
      </div>
    </div>
  )
})
