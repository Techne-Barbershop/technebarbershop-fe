const a = { date: "2026-08-30T23:13:46.516212Z" }; // Example tx
const b = { date: "2026-08-31T00:34:17+07:00" }; // Example ps
console.log(new Date(a.date).getTime());
console.log(new Date(b.date).getTime());
