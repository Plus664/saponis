function toICSDate(date) {
  const pad = n => String(n).padStart(2, "0");

  return (
    date.getFullYear() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    "T090000"
  );
}

function createCureICS({
  title,
  releaseDate,
  memo = ""
}) {
  const uid = crypto.randomUUID();

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Saponis//Cure Calendar//JP",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${toICSDate(new Date())}`,
    `DTSTART:${toICSDate(releaseDate)}`,
    `DTEND:${toICSDate(releaseDate)}`,
    `SUMMARY:🧼 石けん解禁：${title}`,
    `DESCRIPTION:${memo}`,
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    "DESCRIPTION:石けんが明日解禁されます",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");

  return ics;
}

function downloadICS(icsText, filename = "soap_cure.ics") {
  const blob = new Blob([icsText], { type: "text/calender" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function testICS() {
  const releaseDate = new Date();
  releaseDate.setDate(releaseDate.getDate() + 40);

  const ics = createCureICS({
    title: "テストせっけん",
    releaseDate,
    memo: "熟成40日"
  });

  downloadICS(ics, "test_cure.ics");
}