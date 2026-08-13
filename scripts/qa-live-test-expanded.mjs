// Chujai Legal — expanded QA test: parse the full 135-question set and run a
// configurable number of questions per category against the live AI search.
// Usage: node scripts/qa-live-test-expanded.mjs [perCategory]   (default 6)
import { readFileSync, writeFileSync } from "node:fs";

const BASE = "http://localhost:3000";
const QUESTIONS_FILE = "D:/hermes-bess-project/docs/qa_135_real_questions.md";
const PER_CATEGORY = Number(process.argv[2] || 6);

// Header token (Thai or EN) → category id
const CATEGORY_MAP = [
  [/ออนไลน์และหลอกลวง|ONLINE FRAUD/i, "online_fraud"],
  [/อาชญากรรม|CRIME/i, "crime"],
  [/หมิ่นประมาท|DEFAMATION/i, "defamation"],
  [/ประกันภัย|INSURANCE/i, "insurance"],
  [/ราชการและรัฐ|GOVERNMENT/i, "government"],
  [/ที่ดินและทรัพย์สิน|PROPERTY/i, "property"],
  [/แรงงาน|LABOUR/i, "labour"],
  [/ผู้บริโภค|CONSUMER/i, "consumer"],
  [/หนี้สิน|DEBT/i, "debt"],
  [/ที่อยู่อาศัย|HOUSING/i, "housing"],
  [/ครอบครัว|FAMILY/i, "family"],
  [/อุบัติเหตุ|ACCIDENT/i, "accident"],
];

function parseQuestions() {
  const text = readFileSync(QUESTIONS_FILE, "utf8");
  const lines = text.split(/\r?\n/);
  const out = {};
  let current = null;
  for (const line of lines) {
    const h = line.match(/^##\s+(.+)$/);
    if (h) {
      const title = h[1].trim();
      const cat = CATEGORY_MAP.find(([re]) => re.test(title));
      current = cat ? cat[1] : null;
      continue;
    }
    if (!current) continue;
    const row = line.match(/^\|\s*\d+\s*\|\s*(.+?)\s*\|$/);
    if (row) {
      const q = row[1].trim();
      if (q && q.length > 10) (out[current] ??= []).push(q);
    }
  }
  return out;
}

async function search(query) {
  const res = await fetch(`${BASE}/api/ai/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  return res.json();
}

const byCategory = parseQuestions();
const catCounts = Object.fromEntries(
  Object.entries(byCategory).map(([k, v]) => [k, v.length]),
);
console.log("Parsed questions per category:", JSON.stringify(catCounts));

// Sample PER_CATEGORY questions per category (spread across the list).
const samples = {};
for (const [cat, qs] of Object.entries(byCategory)) {
  const n = Math.min(PER_CATEGORY, qs.length);
  const step = qs.length / n;
  const picked = [];
  for (let i = 0; i < n; i++) picked.push(qs[Math.floor(i * step)]);
  samples[cat] = picked;
}

const results = [];
let passed = 0, partial = 0, failed = 0;

for (const [category, questions] of Object.entries(samples)) {
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
    const answerLen = r?.answer?.length ?? 0;

    let verdict = "FAIL";
    if (matched && ai && hasSource && answerLen > 50) verdict = "PASS";
    else if (matched && (ai || hasSource)) verdict = "PARTIAL";
    else verdict = "FAIL";

    if (verdict === "PASS") passed++;
    else if (verdict === "PARTIAL") partial++;
    else failed++;

    results.push({
      category, query: q, verdict, matched, ai, hasSource, answerLen, ms,
      categoryTitle: r?.categoryTitle ?? r?.categoryId ?? "",
      sources: (r?.sources ?? []).map((s) => s.ref).join(", "),
    });
    console.log(`[${verdict}] ${category} | ${q.slice(0, 42)}... | ${ms}ms`);
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  total: results.length, passed, partial, failed,
  passRate: results.length ? Math.round((passed / results.length) * 100) : 0,
  results,
};

const out = "D:/hermes-bess-project/docs/chujai_qa_live_test_expanded_report.json";
writeFileSync(out, JSON.stringify(report, null, 2), "utf8");

console.log(`\n========== EXPANDED SUMMARY (${PER_CATEGORY}/category) ==========`);
console.log(`✅ PASS: ${passed}  ⚠️ PARTIAL: ${partial}  ❌ FAIL: ${failed}`);
console.log(`Pass rate: ${report.passRate}%`);
console.log(`Report → ${out}`);
