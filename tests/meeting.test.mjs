import { test } from 'node:test'
import assert from 'node:assert/strict'
import { displayLocation, findMeeting } from '../src/meeting.ts'

const event = (fields = {}) => ({ url: null, location: null, description: null, ...fields })

test('recognizes supported meetings across event fields', () => {
  for (const [url, provider] of [
    ['https://meet.google.com/abc-defg-hij', 'Google Meet'],
    ['https://company.zoom.us/j/123?pwd=secret', 'Zoom'],
    ['https://meet.jit.si/team', 'Jitsi'],
    ['https://teams.microsoft.com/l/meetup-join/123', 'Microsoft Teams'],
    ['https://company.webex.com/meet/alice', 'Webex'],
    ['https://whereby.com/team', 'Whereby'],
    ['https://meet.proton.me/room', 'Proton Meet'],
  ]) {
    assert.deepEqual(findMeeting(event({ description: `Join (${url}).` })), { provider, url })
  }
})

test('does not mistake unrelated or malformed links for meetings', () => {
  for (const url of ['https://zoom.us.evil.example/j/123', 'https://zoom.us/', 'javascript:alert(1)', 'https://example.com/meeting']) {
    assert.equal(findMeeting(event({ url })), null)
  }
})

test('retains physical location while removing a meeting URL', () => {
  const location = 'Room 3, https://meet.google.com/abc-defg-hij'
  const meeting = findMeeting(event({ location }))
  assert.equal(displayLocation(location, meeting), 'Room 3')
  assert.equal(displayLocation(meeting.url, meeting), null)
  assert.equal(displayLocation('Room 3', meeting), 'Room 3')
  assert.equal(displayLocation(null, meeting), null)
})

test('recognizes Whereby subdomains without accepting lookalike hosts', () => {
  const url = 'https://example.whereby.com/room'
  assert.deepEqual(findMeeting(event({ url })), { provider: 'Whereby', url })
  assert.equal(findMeeting(event({ url: 'https://notwhereby.com/room' })), null)
  assert.equal(findMeeting(event({ url: 'https://whereby.com.evil.example/room' })), null)
})

test('skips ordinary provider pages and continues searching for a meeting', () => {
  const location = 'https://meet.google.com/abc-defg-hij'
  for (const url of ['https://whereby.com/information/tos', 'https://whereby.com/pricing', 'https://zoom.us/j/', 'https://teams.microsoft.com/about']) {
    assert.deepEqual(findMeeting(event({ url, location })), { provider: 'Google Meet', url: location })
  }
})

test('preserves a location meeting URL when another meeting was selected', () => {
  const location = 'Room 3, https://meet.google.com/abc-defg-hij'
  const meeting = findMeeting(event({ url: 'https://company.zoom.us/j/123', location }))
  assert.equal(displayLocation(location, meeting), location)
})
