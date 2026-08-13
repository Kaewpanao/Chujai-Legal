// Chujai Legal — QA test: 135 real user questions against live AI search
// Samples 3 questions per category (36 total), calls /api/ai/search, records results.
import { readFileSync, writeFileSync } from "node:fs";

const BASE = "http://localhost:3000";
const QUESTIONS_FILE = "D:/hermes-bess-project/docs/qa_135_real_questions.md";

// Category → sample questions (3 each, from the 135-question set)
const SAMPLES = {
  online_fraud: [
    "ซื้อของออนไลน์ไม่ได้ของ โอนเงินไปแล้วโดนบล็อก",
    "มีคนโทรมาอ้างเป็นสรรพากร หลอกให้โอนเงิน 120,000",
    "โดนหลอกให้ลงทุนแชร์ลูกโซ่ เสียเงินไป 50,000",
  ],
  crime: [
    "ถูกชกหน้าจนเย็บ 5 เข็ม ต้องทำยังไง",
    "บ้านโดนงัด ทองและพระหายครึ่งล้าน",
    "โดนขู่กรรโชกให้โอนเงิน ไม่งั้นจะเปิดเผยความลับ",
  ],
  defamation: [
    "ถูกด่าในกลุ่ม Facebook ว่าเป็นคนไม่ดี",
    "แฟนเอารูปโป๊ไปโพสต์ในกลุ่ม Telegram",
    "ถูกใส่ความว่าโกงเงินทั้งที่ไม่ได้ทำ",
  ],
  insurance: [
    "รถชนแต่ประกันไม่จ่าย บอกขาดต่อทะเบียน",
    "เคลมประกันสุขภาพไม่ผ่าน ทั้งที่เข้าเงื่อนไข",
    "อยากยกเลิกกรมธรรม์ประกันชีวิต แต่บริษัทไม่ยอม",
  ],
  government: [
    "ทำบัตรประชาชนไม่ได้เพราะไม่มีชื่อในทะเบียนบ้าน",
    "โดนเจ้าหน้าที่รัฐละเมิดสิทธิ ต้องร้องเรียนที่ไหน",
    "ร้องเรียนหน่วยงานรัฐไปแล้ว 3 เดือน ไม่มีคำตอบ",
  ],
  property: [
    "ที่ดินถูกเพื่อนบ้านบุกรุก จะทำยังไง",
    "ซื้อที่ดินมา 5 ปี แต่โอนไม่ได้เพราะติดจำนอง",
    "โฉนดหาย ต้องทำยังไง",
  ],
  labour: [
    "ถูกเลิกจ้างโดยไม่แจ้งล่วงหน้า ไม่ได้ค่าชดเชย",
    "นายจ้างไม่จ่ายค่าจ้าง 3 เดือน",
    "บาดเจ็บจากการทำงานแต่บริษัทไม่รับผิดชอบ",
  ],
  consumer: [
    "ซื้อของ Shopee ได้ของไม่ตรงปก ร้านไม่คืนเงิน",
    "โดนโฆษณาหลอกให้ซื้ออาหารเสริมไม่ได้ผล",
    "สัญญาสำเร็จรูปเอาเปรียบผู้บริโภค",
  ],
  debt: [
    "โดนทวงหนี้นอกระบบข่มขู่ จะทำยังไง",
    "หนี้บัตรเครดิตท่วม อยากปรึกษาเรื่องล้มละลาย",
    "ค้ำประกันให้เพื่อน แล้วเพื่อนหนี ต้องจ่ายไหม",
  ],
  housing: [
    "เจ้าของหอไม่คืนเงินมัดจำ อ้างว่าทำห้องสกปรก",
    "โดนไล่ออกจากคอนโดกะทันหันโดยไม่แจ้งล่วงหน้า",
    "ค่าเช่าขึ้น 50% ไม่เป็นธรรม",
  ],
  family: [
    "สามีนอกใจ อยากฟ้องหย่าและเรียกค่าเสียหาย",
    "อยากได้สิทธิเลี้ยงดูบุตรหลังหย่า",
    "โดนความรุนแรงในครอบครัว ต้องทำยังไง",
  ],
  accident: [
    "ถูกรถชนแล้วหนี จำทะเบียนไม่ได้",
    "มอเตอร์ไซค์ชนท้ายรถยนต์ ใครผิด",
    "โดนรถชนบาดเจ็บ เรียกค่าเสียหายยังไง",
  ],
};

async function search(query) {
  const res = await fetch(`${BASE}/api/ai/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  return res.json();
}

const results = [];
let passed = 0, partial = 0, failed = 0;

for (const [category, questions] of Object.entries(SAMPLES)) {
  for (const q of questions) {
    const t0 = Date.now();
    let r;
    try {
      r = await search(q);
    } catch (e) {
      r = { error: e.message };
    }
    const ms = Date.now() - t0;
    const matched = r?.matched === true;
    const ai = r?.aiGenerated === true;
    const hasSource = (r?.sources?.length ?? 0) > 0;
    const answerLen = (r?.answer?.length ?? 0);

    let verdict = "FAIL";
    if (matched && ai && hasSource && answerLen > 50) verdict = "PASS";
    else if (matched && (ai || hasSource)) verdict = "PARTIAL";
    else verdict = "FAIL";

    if (verdict === "PASS") passed++;
    else if (verdict === "PARTIAL") partial++;
    else failed++;

    results.push({
      category, query: q, verdict, matched, ai, hasSource, answerLen, ms,
      answer: (r?.answer ?? "").slice(0, 120),
      sources: (r?.sources ?? []).map((s) => s.ref).join(", "),
    });
    console.log(`[${verdict}] ${category} | ${q.slice(0, 40)}... | ${ms}ms`);
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  total: results.length, passed, partial, failed,
  passRate: Math.round((passed / results.length) * 100),
  results,
};

const out = "D:/hermes-bess-project/docs/chujai_qa_live_test_report.json";
writeFileSync(out, JSON.stringify(report, null, 2), "utf8");

console.log(`\n========== SUMMARY ==========`);
console.log(`✅ PASS: ${passed}  ⚠️ PARTIAL: ${partial}  ❌ FAIL: ${failed}`);
console.log(`Pass rate: ${Math.round((passed / results.length) * 100)}%`);
console.log(`Report → ${out}`);
