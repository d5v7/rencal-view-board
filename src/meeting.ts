import type { CalendarEvent } from "@rencomputer/rencal-sdk"

export type MeetingProvider = "Google Meet" | "Zoom" | "Jitsi" | "Microsoft Teams" | "Webex" | "Whereby" | "Proton Meet"
export type Meeting = { provider: MeetingProvider; url: string }

// Whereby room names are single path segments; these are public site pages.
const wherebyReservedPaths = new Set(["about", "blog", "careers", "contact", "help", "information", "login", "pricing", "privacy", "security", "signup", "terms"])
const providers: [MeetingProvider, (host: string, path: string) => boolean][] = [
  ["Google Meet", (host, path) => host === "meet.google.com" && /^\/(?:[a-z]{3}-[a-z]{4}-[a-z]{3}|lookup\/[^/]+)\/?$/i.test(path)],
  ["Zoom", (host, path) => /(^|\.)(zoom\.us|zoomgov\.com)$/.test(host) && /^\/(j|my|s|w|wc)\/[^/]+/i.test(path)],
  ["Jitsi", (host, path) => host === "meet.jit.si" && /^\/[^/]+\/?$/.test(path)],
  ["Microsoft Teams", (host, path) => (host === "teams.microsoft.com" || host === "teams.live.com") && /^\/l\/meetup-join\/[^/]+/i.test(path)],
  ["Webex", (host, path) => (host === "webex.com" || host.endsWith(".webex.com")) && /^\/(?:meet|join|weblink\/join|w)\/[^/]+/i.test(path)],
  ["Whereby", (host, path) => {
    const room = path.match(/^\/([^/]+)\/?$/)?.[1]
    return (host === "whereby.com" || host.endsWith(".whereby.com")) && !!room && !wherebyReservedPaths.has(room.toLowerCase())
  }],
  ["Proton Meet", (host, path) => host === "meet.proton.me" && /^\/[^/]+\/?$/.test(path)],
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
        if (provider) return { provider: provider[0], url: candidate }
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
  if (!locationMeeting || locationMeeting.url !== meeting.url) return location.trim()
  const remaining = location.replace(locationMeeting.url, "").replace(/^[\s,;|()\-]+|[\s,;|()\-]+$/g, "").trim()
  return remaining || null
}
