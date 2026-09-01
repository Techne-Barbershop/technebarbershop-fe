const txs = [
  { id: "TRX-00067", date: "2026-08-30T23:13:46.516212Z" },
  { id: "PSL-00022", date: "2026-08-31T00:34:17+07:00" },
  { id: "PSL-00016", date: "2026-08-30T23:24:59+07:00" }
];
txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
console.log(txs);
