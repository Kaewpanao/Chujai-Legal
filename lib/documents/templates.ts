/**
 * Chujai Legal — document template bodies.
 * Real, editable Thai legal-document skeletons with {{field}} placeholders.
 * The template `id`s match `lib/documents/categories.ts` (DOCUMENT_TEMPLATES).
 * All bodies are drafts for education, NOT legal advice (guardrail:
 * "always-disclaimer").
 */

export interface TemplateField {
  key: string;
  label: string;
}

export interface DocumentTemplateBody {
  id: string;
  title: string;
  fields: TemplateField[];
  body: string;
}

export const DOCUMENT_TEMPLATE_BODIES: DocumentTemplateBody[] = [
  {
    id: "police-report",
    title: "คำร้องทุกข์แจ้งความ",
    fields: [
      { key: "name", label: "ชื่อ-นามสกุลผู้ร้องทุกข์" },
      { key: "idCard", label: "เลขบัตรประชาชน" },
      { key: "address", label: "ที่อยู่" },
      { key: "phone", label: "เบอร์โทรศัพท์" },
      { key: "date", label: "วันที่เกิดเหตุ" },
      { key: "place", label: "สถานที่เกิดเหตุ" },
      { key: "facts", label: "ข้อเท็จจริงที่เกิดขึ้น" },
      { key: "suspect", label: "ข้อมูลผู้ต้องหา (ถ้าทราบ)" },
      { key: "evidence", label: "หลักฐานที่นำมาประกอบ" },
    ],
    body: `# คำร้องทุกข์แจ้งความ

ข้าพเจ้า **{{name}}** เลขบัตรประชาชน **{{idCard}}** อยู่บ้านเลขที่ **{{address}}** โทรศัพท์ **{{phone}}**

ขอแจ้งความต่อพนักงานสอบสวนเพื่อดำเนินคดีอาญาในเหตุการณ์ที่เกิดขึ้นเมื่อวันที่ **{{date}}** ณ **{{place}}**

## ข้อเท็จจริง
{{facts}}

## ผู้ต้องหา
{{suspect}}

## หลักฐานที่นำมาประกอบ
{{evidence}}

ข้าพเจ้าขอรับรองว่าข้อความข้างต้นเป็นความจริงทุกประการ และรับทราบว่าหากแจ้งความเท็จจะมีความผิดตามประมวลกฎหมายอาญา มาตรา 177

ลงชื่อ ______________________ ผู้ร้องทุกข์
วันที่ ______________________`,
  },
  {
    id: "demand-letter",
    title: "หนังสือทวงหนี้",
    fields: [
      { key: "creditorName", label: "ชื่อผู้ทวงหนี้" },
      { key: "creditorAddress", label: "ที่อยู่ผู้ทวงหนี้" },
      { key: "debtorName", label: "ชื่อลูกหนี้" },
      { key: "debtorAddress", label: "ที่อยู่ลูกหนี้" },
      { key: "amount", label: "จำนวนหนี้" },
      { key: "dueDate", label: "วันครบกำหนดชำระ" },
      { key: "details", label: "รายละเอียดหนี้" },
    ],
    body: `# หนังสือทวงหนี้

เรียน **{{debtorName}}** ({{debtorAddress}})

ตามที่ท่านได้มีภาระหนี้ต่อข้าพเจ้า **{{creditorName}}** ({{creditorAddress}}) เป็นจำนวนเงิน **{{amount}}** บาท โดยมีกำหนดชำระภายในวันที่ **{{dueDate}}**

## รายละเอียดหนี้
{{details}}

ข้าพเจ้าขอให้ท่านชำระหนี้ดังกล่าวภายใน **15 วัน** นับจากวันที่ได้รับหนังสือฉบับนี้ หากพ้นกำหนด ข้าพเจ้าจำต้องดำเนินการตามกฎหมายต่อไป

ขอแสดงความนับถือ

ลงชื่อ ______________________ {{creditorName}}
วันที่ ______________________`,
  },
  {
    id: "consumer-complaint",
    title: "หนังสือร้องเรียนผู้บริโภค",
    fields: [
      { key: "name", label: "ชื่อผู้ร้องเรียน" },
      { key: "address", label: "ที่อยู่" },
      { key: "company", label: "ชื่อผู้ประกอบการ" },
      { key: "orderDate", label: "วันที่ซื้อ/ใช้บริการ" },
      { key: "product", label: "สินค้า/บริการ" },
      { key: "problem", label: "ปัญหาที่พบ" },
      { key: "demand", label: "สิ่งที่ต้องการให้แก้ไข" },
      { key: "evidence", label: "หลักฐาน" },
    ],
    body: `# หนังสือร้องเรียนผู้บริโภค

เรียน **{{company}}**

ข้าพเจ้า **{{name}}** ({{address}}) ได้ซื้อสินค้า/ใช้บริการ **{{product}}** เมื่อวันที่ **{{orderDate}}**

## ปัญหาที่พบ
{{problem}}

ตามพระราชบัญญัติคุ้มครองผู้บริโภค พ.ศ. 2522 มาตรา 4 ข้าพเจ้ามีสิทธิได้รับความคุ้มครองในฐานะผู้บริโภค จึงขอให้ท่านดำเนินการดังนี้

## สิ่งที่ต้องการให้แก้ไข
{{demand}}

## หลักฐานที่แนบ
{{evidence}}

ขอให้ท่านดำเนินการภายใน **7 วัน** หากไม่ได้รับการตอบสนอง ข้าพเจ้าจะร้องเรียนต่อสำนักงานคณะกรรมการคุ้มครองผู้บริโภค (สคบ.) ต่อไป

ลงชื่อ ______________________ {{name}}
วันที่ ______________________`,
  },
  {
    id: "consumer-filing",
    title: "คำฟ้องคดีผู้บริโภค",
    fields: [
      { key: "court", label: "ศาล" },
      { key: "plaintiffName", label: "ชื่อโจทก์" },
      { key: "plaintiffAddress", label: "ที่อยู่โจทก์" },
      { key: "defendantName", label: "ชื่อจำเลย" },
      { key: "defendantAddress", label: "ที่อยู่จำเลย" },
      { key: "facts", label: "ข้อเท็จจริง" },
      { key: "damage", label: "ค่าเสียหายที่เรียก" },
      { key: "evidence", label: "หลักฐาน" },
    ],
    body: `# คำฟ้องคดีผู้บริโภค

ศาล **{{court}}**

โจทก์: **{{plaintiffName}}** ({{plaintiffAddress}})
จำเลย: **{{defendantName}}** ({{defendantAddress}})

## ข้อเท็จจริง
{{facts}}

## คำขอ
โจทก์ขอให้ศาลมีคำพิพากษาให้จำเลยชำระค่าเสียหายเป็นจำนวนเงิน **{{damage}}** บาท พร้อมดอกเบี้ยตามกฎหมาย

## พยานหลักฐาน
{{evidence}}

> เอกสารนี้เป็นร่างเพื่อการศึกษา ก่อนยื่นฟ้องควรให้ทนายความตรวจสอบความถูกต้อง

ลงชื่อ ______________________ โจทก์`,
  },
  {
    id: "divorce-petition",
    title: "คำฟ้องหย่า",
    fields: [
      { key: "court", label: "ศาล" },
      { key: "plaintiffName", label: "ชื่อโจทก์" },
      { key: "defendantName", label: "ชื่อจำเลย" },
      { key: "marriageDate", label: "วันที่จดทะเบียนสมรส" },
      { key: "reason", label: "เหตุแห่งการหย่า" },
      { key: "childCustody", label: "ข้อตกลงเรื่องบุตร (ถ้ามี)" },
      { key: "assetSplit", label: "การแบ่งสินสมรส" },
    ],
    body: `# คำฟ้องหย่า

ศาล **{{court}}**

โจทก์: **{{plaintiffName}}**
จำเลย: **{{defendantName}}**

โจทก์และจำเลยได้จดทะเบียนสมรสเมื่อวันที่ **{{marriageDate}}**

## เหตุแห่งการหย่า
{{reason}}

## การแบ่งสินสมรส
{{assetSplit}}

## บุตร (ถ้ามี)
{{childCustody}}

โจทก์จึงขอให้ศาลพิพากษาให้โจทก์และจำเลยหย่าขาดจากกัน และแบ่งสินสมรสตามที่เสนอ

> เอกสารนี้เป็นร่างเพื่อการศึกษา โปรดปรึกษาทนายความก่อนยื่นฟ้อง

ลงชื่อ ______________________ โจทก์`,
  },
  {
    id: "lease-agreement",
    title: "สัญญาเช่าที่อยู่อาศัย",
    fields: [
      { key: "lessorName", label: "ชื่อผู้ให้เช่า" },
      { key: "lesseeName", label: "ชื่อผู้เช่า" },
      { key: "property", label: "ที่อยู่ทรัพย์สิน" },
      { key: "rent", label: "ค่าเช่าต่อเดือน" },
      { key: "deposit", label: "เงินมัดจำ" },
      { key: "startDate", label: "วันที่เริ่มสัญญา" },
      { key: "endDate", label: "วันที่สิ้นสุดสัญญา" },
      { key: "terms", label: "เงื่อนไขเพิ่มเติม" },
    ],
    body: `# สัญญาเช่าที่อยู่อาศัย

สัญญาฉบับนี้ทำขึ้นระหว่าง

ผู้ให้เช่า: **{{lessorName}}**
ผู้เช่า: **{{lesseeName}}**

## ข้อ 1 ทรัพย์สินที่เช่า
{{property}}

## ข้อ 2 ค่าเช่าและเงินมัดจำ
- ค่าเช่าเดือนละ **{{rent}}** บาท
- เงินมัดจำ **{{deposit}}** บาท

## ข้อ 3 ระยะเวลาเช่า
ตั้งแต่วันที่ **{{startDate}}** ถึง **{{endDate}}**

## ข้อ 4 เงื่อนไขเพิ่มเติม
{{terms}}

คู่สัญญาทั้งสองฝ่ายได้อ่านและเข้าใจข้อตกลงนี้โดยตลอดแล้ว จึงลงลายมือชื่อไว้เป็นหลักฐาน

ลงชื่อ ______________________ ผู้ให้เช่า
ลงชื่อ ______________________ ผู้เช่า`,
  },
  {
    id: "employment-contract",
    title: "สัญญาจ้างแรงงาน",
    fields: [
      { key: "employer", label: "ชื่อนายจ้าง" },
      { key: "employee", label: "ชื่อลูกจ้าง" },
      { key: "position", label: "ตำแหน่งงาน" },
      { key: "salary", label: "ค่าจ้าง" },
      { key: "startDate", label: "วันเริ่มงาน" },
      { key: "probation", label: "ระยะทดลองงาน" },
      { key: "benefits", label: "สวัสดิการ" },
      { key: "terms", label: "เงื่อนไขอื่น ๆ" },
    ],
    body: `# สัญญาจ้างแรงงาน

สัญญาฉบับนี้ทำขึ้นระหว่าง

นายจ้าง: **{{employer}}**
ลูกจ้าง: **{{employee}}**

## ข้อ 1 ตำแหน่งและหน้าที่
ตำแหน่ง **{{position}}**

## ข้อ 2 ค่าจ้าง
ค่าจ้างเดือนละ **{{salary}}** บาท

## ข้อ 3 วันเริ่มงานและทดลองงาน
เริ่มงานวันที่ **{{startDate}}** ระยะทดลองงาน **{{probation}}**

## ข้อ 4 สวัสดิการ
{{benefits}}

## ข้อ 5 เงื่อนไขอื่น ๆ
{{terms}}

สัญญานี้เป็นไปตามพระราชบัญญัติคุ้มครองแรงงาน พ.ศ. 2541

ลงชื่อ ______________________ นายจ้าง
ลงชื่อ ______________________ ลูกจ้าง`,
  },
  {
    id: "power-of-attorney",
    title: "หนังสือมอบอำนาจ",
    fields: [
      { key: "grantorName", label: "ชื่อผู้มอบอำนาจ" },
      { key: "grantorId", label: "เลขบัตรประชาชนผู้มอบอำนาจ" },
      { key: "granteeName", label: "ชื่อผู้รับมอบอำนาจ" },
      { key: "granteeId", label: "เลขบัตรประชาชนผู้รับมอบอำนาจ" },
      { key: "scope", label: "ขอบเขตการมอบอำนาจ" },
      { key: "place", label: "สถานที่" },
      { key: "date", label: "วันที่" },
    ],
    body: `# หนังสือมอบอำนาจ

ข้าพเจ้า **{{grantorName}}** เลขบัตรประชาชน **{{grantorId}}** ขอมอบอำนาจให้ **{{granteeName}}** เลขบัตรประชาชน **{{granteeId}}** เป็นผู้รับมอบอำนาจ

## ขอบเขตการมอบอำนาจ
{{scope}}

ในการนี้ผู้รับมอบอำนาจมีอำนาจลงลายมือชื่อและดำเนินการแทนข้าพเจ้าได้ทุกประการ

ทำที่ **{{place}}** วันที่ **{{date}}**

ลงชื่อ ______________________ ผู้มอบอำนาจ
ลงชื่อ ______________________ ผู้รับมอบอำนาจ`,
  },
  {
    id: "will",
    title: "พินัยกรรม",
    fields: [
      { key: "testatorName", label: "ชื่อผู้ทำพินัยกรรม" },
      { key: "testatorId", label: "เลขบัตรประชาชน" },
      { key: "address", label: "ที่อยู่" },
      { key: "beneficiaries", label: "ผู้รับมรดกและทรัพย์สิน" },
      { key: "executor", label: "ผู้จัดการมรดก (ถ้ามี)" },
      { key: "date", label: "วันที่ทำพินัยกรรม" },
    ],
    body: `# พินัยกรรม

ข้าพเจ้า **{{testatorName}}** เลขบัตรประชาชน **{{testatorId}}** อยู่บ้านเลขที่ **{{address}}** ทำพินัยกรรมฉบับนี้ด้วยความสมัครใจและสติสัมปชัญญะสมบูรณ์

## ข้อกำหนดการยกทรัพย์มรดก
{{beneficiaries}}

## ผู้จัดการมรดก
{{executor}}

ข้าพเจ้าขอรับรองว่าพินัยกรรมฉบับนี้เป็นฉบับเดียวที่ข้าพเจ้าทำขึ้น

ทำเมื่อวันที่ **{{date}}**

ลงชื่อ ______________________ ผู้ทำพินัยกรรม
(พยาน 2 คน: ______________________ , ______________________)`,
  },
  {
    id: "termination-notice",
    title: "หนังสือบอกเลิกสัญญา",
    fields: [
      { key: "name", label: "ชื่อผู้บอกเลิกสัญญา" },
      { key: "counterparty", label: "ชื่อคู่สัญญา" },
      { key: "contractDate", label: "วันที่ทำสัญญา" },
      { key: "contractType", label: "ประเภทสัญญา" },
      { key: "reason", label: "เหตุผลการบอกเลิก" },
      { key: "effectiveDate", label: "วันที่มีผล" },
    ],
    body: `# หนังสือบอกเลิกสัญญา

เรียน **{{counterparty}}**

ตามที่ข้าพเจ้า **{{name}}** ได้ทำสัญญา **{{contractType}}** กับท่านเมื่อวันที่ **{{contractDate}}**

ข้าพเจ้าขอบอกเลิกสัญญาดังกล่าว ด้วยเหตุผลดังนี้

## เหตุผล
{{reason}}

การบอกเลิกสัญญานี้ให้มีผลตั้งแต่วันที่ **{{effectiveDate}}** เป็นต้นไป

ขอแสดงความนับถือ

ลงชื่อ ______________________ {{name}}
วันที่ ______________________`,
  },
  {
    id: "child-support",
    title: "คำร้องค่าเลี้ยงดูบุตร",
    fields: [
      { key: "court", label: "ศาล" },
      { key: "petitionerName", label: "ชื่อผู้ร้อง" },
      { key: "otherParty", label: "ชื่ออีกฝ่าย" },
      { key: "childName", label: "ชื่อบุตร" },
      { key: "childAge", label: "อายุบุตร" },
      { key: "amount", label: "จำนวนค่าเลี้ยงดูที่ขอ" },
      { key: "reason", label: "เหตุผลประกอบ" },
    ],
    body: `# คำร้องค่าเลี้ยงดูบุตร

ศาล **{{court}}**

ผู้ร้อง: **{{petitionerName}}**
อีกฝ่าย: **{{otherParty}}**

ผู้ร้องและอีกฝ่ายมีบุตรร่วมกันคือ **{{childName}}** อายุ **{{childAge}}** ปี

## เหตุผลประกอบ
{{reason}}

ผู้ร้องขอให้ศาลมีคำสั่งให้อีกฝ่ายชำระค่าเลี้ยงดูบุตรเป็นจำนวน **{{amount}}** บาท/เดือน ตามประมวลกฎหมายแพ่งและพาณิชย์

> เอกสารนี้เป็นร่างเพื่อการศึกษา โปรดปรึกษาทนายความก่อนยื่น

ลงชื่อ ______________________ ผู้ร้อง`,
  },
  {
    id: "labour-complaint",
    title: "คำร้องแรงงาน",
    fields: [
      { key: "employeeName", label: "ชื่อลูกจ้าง" },
      { key: "employerName", label: "ชื่อนายจ้าง" },
      { key: "startDate", label: "วันเริ่มงาน" },
      { key: "endDate", label: "วันสิ้นสุดการจ้าง (ถ้ามี)" },
      { key: "position", label: "ตำแหน่ง" },
      { key: "salary", label: "ค่าจ้าง" },
      { key: "claim", label: "ข้อเรียกร้อง" },
      { key: "facts", label: "ข้อเท็จจริง" },
    ],
    body: `# คำร้องแรงงาน

ข้าพเจ้า **{{employeeName}}** เป็นลูกจ้างของ **{{employerName}}** ตั้งแต่ **{{startDate}}** ถึง **{{endDate}}** ตำแหน่ง **{{position}}** ค่าจ้าง **{{salary}}** บาท

## ข้อเท็จจริง
{{facts}}

## ข้อเรียกร้อง
{{claim}}

ข้าพเจ้าขอใช้สิทธิตามพระราชบัญญัติคุ้มครองแรงงาน พ.ศ. 2541 มาตรา 118 (ค่าชดเชยกรณีเลิกจ้าง) และขอให้พนักงานตรวจแรงงาน/ศาลแรงงานพิจารณา

ลงชื่อ ______________________ ผู้ร้อง
วันที่ ______________________`,
  },
];

const BODY_MAP = new Map(DOCUMENT_TEMPLATE_BODIES.map((t) => [t.id, t]));

export function getTemplateBody(id: string): DocumentTemplateBody | undefined {
  return BODY_MAP.get(id);
}
