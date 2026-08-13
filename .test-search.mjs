const qs = [
  "ซื้อของออนไลน์ไม่ได้ของ ทำไงดี",
  "ถูกโกงโอนเงิน",
  "ถูกเลิกจ้างไม่เป็นธรรม",
];
(async () => {
  for (const q of qs) {
    const res = await fetch("http://127.0.0.1:3005/api/ai/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: q }),
    });
    const j = await res.json();
    console.log("Q:", q);
    console.log("  matched:", j.matched, "| aiGenerated:", j.aiGenerated, "| cat:", j.categoryId, "| title:", j.categoryTitle);
    console.log("  answer:", (j.answer || "").slice(0, 400));
    console.log("  sources:", JSON.stringify(j.sources));
    console.log("---");
  }
})();
