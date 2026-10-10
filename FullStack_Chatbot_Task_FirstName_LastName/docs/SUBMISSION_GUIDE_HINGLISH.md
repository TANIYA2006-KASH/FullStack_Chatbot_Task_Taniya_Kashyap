# Submission Guide (Hinglish) - sirf tumhare liye, GitHub par mat daalna zaruri nahi

## 1. Pehle project chalao (15 min)
1. PostgreSQL start karo: `docker compose up -d` (ya local Postgres).
2. `cd backend` → `cp .env.example .env` → `.env` me JWT_SECRET, ADMIN_PASSWORD badlo → `npm install` → `npm run db:seed` → `npm run dev`
3. Naye terminal me: `cd frontend` → `npm install` → `npm run dev`
4. Browser: http://localhost:5173 aur admin: http://localhost:5173/admin/login

## 2. Naam badlo
`FirstName_LastName` ko apne naam se replace karo (folder name, GitHub repo, Drive folder, README).
`frontend/src/data/content.ts` me dronetv.in dekh kar real services/courses/contact details daalo.

## 3. GitHub
```
git init
git add .
git commit -m "Initial commit: DroneTV AI Support & Lead Assistant"
git branch -M main
git remote add origin https://github.com/<username>/FullStack_Chatbot_Task_FirstName_LastName.git
git push -u origin main
```
`.env` push nahi hona chahiye (.gitignore me already hai). Chahe to 4-5 chhote commits karo (backend, frontend, chatbot, docs), accha impression padta hai.

## 4. Google Drive folder structure
```
FullStack_Chatbot_Task_FirstName_LastName
├── 01_Source_Code        → pura project ka ZIP (node_modules aur .env ke bina)
├── 02_Screenshots        → home, chatbot, form, admin, drawer, mobile view, error states
├── 03_API_Documentation  → docs/API.md (PDF bana do to aur accha)
├── 04_Database           → database/schema.sql, seed.sql, + 1 screenshot of table records
├── 05_Video_Walkthrough  → 5-10 min video
├── 06_GitHub             → ek text file jisme repo link ho
└── 07_Resume             → updated resume PDF
```
Sharing: "Anyone with the link – Viewer". Incognito window me khol ke verify karo. Phir link WhatsApp karo: +91 88043 49999 aur +91 6303230227.

## 5. Video script (7-8 min)
| Time | Kya dikhana hai |
|---|---|
| 0:00-0:30 | Intro + architecture: **Frontend (React+TS) → API (Express) → Backend logic/validation → PostgreSQL** |
| 0:30-1:30 | Home page, responsive (browser ko chhota karke mobile view), dark mode |
| 1:30-3:30 | Chatbot: 7 questions, unknown question (fallback), student flow me enquiry submit, reset button |
| 3:30-4:15 | Contact form: empty submit, galat email/phone errors, phir success |
| 4:15-5:00 | Database record dikhao (psql ya pgAdmin) aur Postman/cURL se API call |
| 5:00-6:30 | Admin login → search, filter, drawer, status change, delete, CSV export |
| 6:30-7:30 | Error handling: backend band karke form submit (friendly error), galat ID `/api/enquiries/9999` (404), security points (zod, helmet, JWT, .env) |

## 6. Viva / interview me ye samajh lo (code explain karna padega)
- **Chatbot kaise kaam karta hai?** `chatbot/engine.ts` me intents hain. Har intent ke phrases (5 points) aur keywords (1 point). Jiska score zyada, wahi reply. Koi match nahi → fallback.
- **Lead flow?** `chatbot/leadFlow.ts` ek state machine hai: name → email → phone → type → interest → message → confirm. Har step par validation.
- **Validation do jagah kyu?** Frontend = quick feedback. Backend (zod) = asli security, kyunki client bypass ho sakta hai.
- **SQL injection se bachav?** Parameterised queries (`$1, $2`). Sort/column names whitelist se aate hain.
- **XSS?** HTML tags strip hote hain + React output escape karta hai.
- **Admin security?** JWT (8 ghante), `requireAuth` middleware, login rate limit, credentials `.env` me.
- **Secrets?** `.env` git-ignore, `.env.example` me sirf placeholders.
- **PUT vs PATCH?** Dono partial update karte hain is project me; PATCH semantic roop se sahi hai.
- **Pagination kaise?** `LIMIT/OFFSET` + total count `meta` me.
- **State management?** Local state + Context (Theme, Toast, Auth). Itne chhote app ke liye Redux ki zarurat nahi.

## 7. Final checklist
- [ ] Folder/repo naam sahi (FirstName_LastName)
- [ ] README me screenshots add kiye
- [ ] `.env` GitHub par nahi hai
- [ ] Video me sab features aur architecture explain
- [ ] Resume PDF updated
- [ ] Drive link incognito me khulta hai
- [ ] 3 din ke andar WhatsApp par bhej diya
