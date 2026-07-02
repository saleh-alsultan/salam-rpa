كيفية ربط الملف بقاعدة بيانات Supabase (مجانية)
================================================

الملف HTML الآن يدعم التخزين السحابي عبر Supabase.
إذا ما سويت الإعداد، راح يشتغل على localStorage (محلي) بشكل طبيعي.

خطوات الإعداد:

1. روح لموقع https://supabase.com
2. سجل حساب مجاني (Google or GitHub)
3. اضغط "New Project"
   - Name: salam-rpa-tracker
   - Database Password: (اختار كلمة سر وحفظها)
   - Region: (اختار منطقة قريبة منك)
   - اضغط "Create new project" (ياخذ دقيقتين)

4. بعد ما يفتح المشروع:
   - من الشريط الجانبي، اضغط على "SQL Editor"
   - اضغط "New Query"
   - انسخ محتوى ملف "salam_rpa_supabase_schema.sql" والصقه
   - اضغط "Run" عشان تنشئ الجداول

5. من الشريط الجانبي، اضغط على "Project Settings" ⚙️
   - بعدين اضغط "API"
   - نسخ:
     a. "Project URL" (شي مثل: https://abc123.supabase.co)
     b. "anon public" key (شي مثل: eyJhbGciOiJIUzI1NiIs...)

6. افتح ملف Salam_RPA_Tracker.html في محرر نصوص (Notepad)
   - غير السطرين:
     SUPABASE_URL='https://YOUR_PROJECT.supabase.co'
     SUPABASE_ANON_KEY='YOUR_ANON_KEY'
   - حط القيم اللي نسختها من الخطوة 5

7. احفظ الملف وافتحه في المتصفح

الحين كل أعضاء الفريق يفتحون نفس الملف HTML
(نفس الـ URL والـ Key) ويشوفون نفس البيانات!

ملاحظة: إذا أحد غير البيانات، راح تظهر للكل لأن الكل يتصل بنفس قاعدة البيانات.
