// Cloudflare Worker : génère un fichier .ics à la volée, servi inline.
// Sur iPhone (Safari et Chrome), l'événement s'ouvre directement avec « Ajouter tout ».
// Paramètres : s=titre  d=AAAA-MM-JJ  t=HH:MM  l=lieu  n=note  h=durée en heures (défaut 3)

export default {
  async fetch(request) {
    const q = new URL(request.url).searchParams;
    const d = q.get('d'), t = q.get('t');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d || '') || !/^\d{2}:\d{2}$/.test(t || '')) {
      return new Response('Paramètres d et t requis', { status: 400 });
    }
    const title = (q.get('s') || 'Rendez-vous').slice(0, 200);
    const lieu = (q.get('l') || '').slice(0, 500);
    const note = (q.get('n') || '').slice(0, 2000);
    const hours = Math.min(24, Math.max(1, parseInt(q.get('h') || '3', 10) || 3));

    const start = d.replace(/-/g, '') + 'T' + t.replace(':', '') + '00';
    const endDate = new Date(d + 'T' + t + ':00Z');
    endDate.setUTCHours(endDate.getUTCHours() + hours);
    const pad = n => String(n).padStart(2, '0');
    const end = endDate.getUTCFullYear() + pad(endDate.getUTCMonth() + 1) + pad(endDate.getUTCDate())
      + 'T' + pad(endDate.getUTCHours()) + pad(endDate.getUTCMinutes()) + '00';
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const esc = s => String(s)
      .replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//rdv//FR', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:' + start + '-' + Math.random().toString(36).slice(2) + '@rdv',
      'DTSTAMP:' + stamp,
      'DTSTART;TZID=Europe/Paris:' + start,
      'DTEND;TZID=Europe/Paris:' + end,
      'SUMMARY:' + esc(title),
      'LOCATION:' + esc(lieu),
      'DESCRIPTION:' + esc(note),
      'BEGIN:VALARM', 'TRIGGER:-PT2H', 'ACTION:DISPLAY', 'DESCRIPTION:Rappel', 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR', ''
    ].join('\r\n');

    return new Response(ics, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'inline; filename="rdv.ics"',
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};
