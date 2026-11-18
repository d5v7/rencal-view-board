import type { CalendarEvent } from "@rencomputer/rencal-sdk"

export type MeetingProvider = "Google Meet" | "Zoom" | "Jitsi" | "Microsoft Teams" | "Webex" | "Whereby" | "Proton Meet"
export type Meeting = { provider: MeetingProvider; url: string }

const providers: [MeetingProvider, (host: string, path: string) => boolean][] = [
  ["Google Meet", (host) => host === "meet.google.com"],
  ["Zoom", (host, path) => /(^|\.)(zoom\.us|zoomgov\.com)$/.test(host) && /^\/(j|my|s|w|wc)\//.test(path)],
  ["Jitsi", (host) => host === "meet.jit.si"],
  ["Microsoft Teams", (host) => host === "teams.microsoft.com" || host === "teams.live.com"],
  ["Webex", (host) => host === "webex.com" || host.endsWith(".webex.com")],
  ["Whereby", (host) => host === "whereby.com" || host === "www.whereby.com"],
  ["Proton Meet", (host) => host === "meet.proton.me"],
]

/** Only recognizable meeting URLs are actionable; ordinary event URLs remain event details. */
export function findMeeting(event: Pick<CalendarEvent, "url" | "location" | "description">): Meeting | null {
  for (const text of [event.url, event.location, event.description]) {
    if (!text) continue
    for (const match of text.matchAll(/https?:\/\/[^\s<>"']+/gi)) {
      const candidate = match[0].replace(/[),.;:!?\]]+$/, "")
      try {
        const url = new URL(candidate)
        const provider = providers.find(([, matches]) => matches(url.hostname.toLowerCase(), url.pathname))
        if (provider && url.pathname !== "/") return { provider: provider[0], url: candidate }
      } catch {
        // Free-form event text may contain malformed URLs.
      }
    }
  }
  return null
}

export function displayLocation(location: string | null, meeting: Meeting | null): string | null {
  if (!location?.trim()) return null
  if (!meeting) return location.trim()
  const locationMeeting = findMeeting({ url: null, location, description: null })
  if (!locationMeeting) return location.trim()
  const remaining = location.replace(locationMeeting.url, "").replace(/^[\s,;|()\-]+|[\s,;|()\-]+$/g, "").trim()
  return remaining || null
}
