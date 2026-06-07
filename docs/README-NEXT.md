Alraqi Sports Next.js
=====================

هذه هي النسخة الفعالة المخصصة للرفع على Vercel.

التشغيل المحلي:

```bash
npm install
npm run dev
```

الرابط المحلي:

```text
http://127.0.0.1:4174/
```

البناء:

```bash
npm run build
```

النشر على Vercel:

1. ارفع جذر المشروع إلى GitHub.
2. أنشئ مشروعاً جديداً في Vercel واختر هذا المستودع.
3. اترك إعدادات Vercel الافتراضية:
   - Framework Preset: Next.js
   - Build Command: npm run build
   - Output Directory: .next

جلب البيانات:

- المتصفح لا يتصل مباشرة مع `worldcup26.ir`.
- يتم الجلب عبر Route Handler داخل Next:
  - `/api/worldcup/games`
  - `/api/worldcup/teams`
  - `/api/worldcup/groups`
  - `/api/worldcup/stadiums`
- هذا يحل مشكلة CORS عند الرفع على Vercel.

ملاحظة:

- لا توجد بيانات محلية بديلة للمباريات أو الفرق أو المجموعات أو الملاعب في نسخة Next المستخدمة داخل `public/js/api.js`.
- قنوات beIN محفوظة كإعدادات بث داخل `/api/channels` لأنها روابط مشاهدة مضافة وليست بيانات كأس العالم.
- مجلد `src` هو نسخة HTML القديمة وغير مستخدم في تشغيل Next أو Vercel.
