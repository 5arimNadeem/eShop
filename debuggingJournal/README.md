# Debugging Journal

A running log of real bugs, how they were reproduced, and where my reasoning was wrong.

The most valuable column in any entry is **First hypothesis vs. Actual cause**. Reading a
list of past bugs teaches a little; reading a list of my own wrong guesses teaches a lot,
because the same biases repeat. After ~30 entries, patterns show up and I start checking
my known blind spots first.

---

## The method: Reproduce → Diagnose → Fix → Reflect

### 1. Reproduce (do not skip, do not shortcut)

A reproduction is **a repeatable recipe that makes the bug appear on demand.** Not "signup
is broken" — an actual command I can run fifty times and get the same failure fifty times.

Three properties:

| Property | Means | Why |
|---|---|---|
| **Reliable** | Fails every single time | Intermittent = not understood yet |
| **Minimal** | No browser, no framework, no extra layers | Every layer removed is a layer that can't be the cause |
| **Observable** | I can see the real error text | UIs hide the sentence that solves the case |

**Hard rule: no fix before a repro I can run on demand.** Write the command down first.
If I can't produce one, producing one *is* the current task.

### 2. Diagnose

- Read the **error handler** early — it tells you what class of error you're hunting.
  (`err.statusCode || 500` means a generic 500 = a raw library/JS error, not one of my own.)
- Trace in **execution order**. Global middleware runs before route bodies. If something
  fails there, the file I'm staring at never executes at all.
- **Look for physical evidence** — files on disk, row counts, log lines. Side effects are
  facts; comments and assumptions are not.
- **Control experiment** when a stack is the suspect: rebuild just that stack in isolation,
  toggle exactly one variable, confirm the symptom tracks it. That is the difference between
  "these two libraries are known to conflict" and "this line causes this 500."
- **Change one thing, re-run.** Two simultaneous changes and the causal chain is lost.
- **Time-box guessing to 10 minutes**, then go gather data. Guessing feels productive.

### 3. Fix

One bug at a time, re-running the repro after each. Errors queue up behind each other — a
*different* error message is progress; the *same* one is not. That signal only exists if
the input was byte-identical both runs.

### 4. Reflect

Turn the repro into a test so the fix is permanent. Then write the entry below, honestly.

---

## Entry template

```markdown
## NNN — <one-line symptom> — YYYY-MM-DD

**Status:** open | fixed
**Area:** <file / subsystem>

### Symptom (what the user sees)

### Repro
```bash
<exact command>
```
**Observed:** <verbatim output + status code>

### Evidence
- <side effects, log lines, counts before/after>

### Control experiment (if run)
| Variable | Result |
|---|---|

### First hypothesis
<what I guessed before measuring> → **right / WRONG**

### Actual cause
<file:line + mechanism>

### Fix

### Lesson
<the transferable part>
```

---

## 001 — Signup returns HTTP 500 on submit — 2026-07-31

**Status:** open (diagnosed, not yet fixed)
**Area:** `backend/app.js`, `backend/controller/user.js`, `backend/multer.js`

### Symptom

Clicking Submit on the signup page shows the toast `"Something went wrong!"`. Network tab
shows 500 on `POST /api/v2/user/create-user`.

The toast text comes from `SignUp.jsx` — `error.response?.data?.message || "Something went
wrong!"`. **The UI was actively hiding the real error**, which is why step 1 was to leave
the browser entirely.

### Repro

```bash
# server: cd backend && node server.js
# a.png = any small file with a PNG magic header
curl -s -w '\nHTTP %{http_code}\n' -X POST localhost:8000/api/v2/user/create-user \
  -F "file=@a.png;type=image/png" -F "name=Test" \
  -F "email=probe@example.com" -F "password=secret123"
```

**Observed:** `{"success":false,"message":"Unexpected end of form"}` — **HTTP 500**

Sanity-checked `GET /test` first (200, "Server is working fine", Mongo connected), so a
dead server or DB couldn't be mistaken for a handler bug.

### Evidence

- `backend/tmp/` grew **34 → 35 files** across one single request (new file
  `tmp-1-707391785496519483`). That naming is `express-fileupload`'s temp-file convention
  with `useTempFiles: true`.
- ~34 such files had already accumulated from previous failed attempts. **The evidence was
  sitting on disk the whole time, before I ran anything.**
- `Unexpected end of form` is busboy's (multer's parser) specific error for *the request
  stream ended before I finished reading it* — i.e. something already drained it.

### Control experiment

Two identical throwaway servers in a scratch dir, one variable flipped — `express-fileupload`
mounted before multer, or not:

| `express-fileupload` | Result |
|---|---|
| **ON** | `{"errorName":"Error","message":"Unexpected end of form"}` — **HTTP 500** |
| **OFF** | `{"multerSawFile":true,"hasBuffer":true,"bodyFields":["name","email"]}` — **HTTP 200** |

Same code, same request, one line of middleware. The 500 appears and disappears with it.
That is causation, not correlation.

**Bonus finding from the same run:** `filename` is *absent* from the OFF response.
`JSON.stringify` drops `undefined` keys — so `req.file.filename` is `undefined`, exactly as
`multer.memoryStorage()` implies. One experiment, two bugs confirmed.

### First hypothesis

`uploadResult is not defined` at `controller/user.js:37`. → **WRONG.**

It's a real bug, but not this 500. Reading the code produced *five* defensible suspects and
**reading cannot rank them**, because ranking depends on execution order — the global
middleware in `app.js` runs before the route body, so `user.js:37` never executed.

**I was wrong a second time**, on the ordering of what breaks next. Verified with
`node -e`:

```
path.join(undefined)  -> TypeError: The "path" argument must be of type string. Received undefined
uploadResult.fileUrl  -> ReferenceError: uploadResult is not defined
```

Both carry `statusCode: undefined`, which is why `middleware/error.js` renders all three
as one indistinguishable generic 500.

### Actual cause

`app.js:20` — `app.use(fileUpload({ useTempFiles: true }))` mounted globally. It parses the
multipart body first and writes it to `tmp/`; multer then receives an already-drained stream
and throws. **Two parsers, one stream — the second gets nothing.**

### Fix

Not yet applied. Bug queue in the order each will surface:

| # | Bug | Location |
|---|---|---|
| 1 | `express-fileupload` conflicts with multer — **the current 500** | `app.js:20` |
| 2 | `path.join(undefined)` — `memoryStorage` has no `.filename` | `controller/user.js:31` |
| 3 | `uploadResult` is not defined; `cloudinary` isn't even installed | `controller/user.js:37` |
| 4 | Never calls `User.create()`, never sends a response → request hangs | `controller/user.js:33-40` |
| 5 | Route not wrapped in `catchAsyncError` (imported but unused) | `controller/user.js:17` |

Open decision: `diskStorage` into the existing `backend/uploads/` (already served statically
by `app.js:15`) vs. installing `cloudinary`.

Unrelated but found along the way:
- `middleware/auth.js` reads `process.env.JWT_SECRET`; `.env` defines `JWT_SECRET_KEY`.
- **No `.gitignore` anywhere** — `backend/config/.env` with live Mongo + Cloudinary
  credentials is staged for commit. Rotate those keys and gitignore the file.

### Lesson

**Reading code gives you suspects; reproduction gives you the culprit.** I had five real
bugs and picked the wrong one as the active failure — twice. One curl command settled in
seconds what code review could not settle at all.

Corollary: without a repro I couldn't have distinguished "wrong fix" from "right fix, second
bug behind it." I'd have changed `uploadResult`, seen a 500 again, concluded the fix failed,
and reverted a *correct* change.

---

## Resources

Verified 2026-07-31.

**Start here (free, all about reproduction)**
- [How to create a Minimal, Reproducible Example](https://stackoverflow.com/help/minimal-reproducible-example) — Stack Overflow. The densest thing written on this. ([friendlier version](https://overflow.tips/write-good-question/minimal-complete-reproducible-example))
- [How to Report Bugs Effectively](https://www.chiark.greenend.org.uk/~sgtatham/bugs.html) — Simon Tatham. *"The aim of a bug report is to enable the programmer to see the program failing in front of them."* Also: separate facts from speculation.
- [The Pocket Guide to Debugging](https://jvns.ca/blog/2022/12/21/new-zine--the-pocket-guide-to-debugging/) — Julia Evans (paid). Free: [debugging zine PDF](https://jvns.ca/debugging-zine.pdf), [all zines](https://jvns.ca/zines), [blog](https://jvns.ca/).

**Books**
- [Debug It! — Paul Butcher](https://www.amazon.com/Debug-Repair-Prevent-Pragmatic-Programmers/dp/193435628X) — the Reproduce → Diagnose → Fix → Reflect process above comes from here. Best single purchase.
- [Debugging: The 9 Indispensable Rules — David Agans](https://www.amazon.com/Debugging-Indispensable-Software-Hardware-Problems/dp/0814474578) — Rule 3 "Quit Thinking and Look", Rule 5 "Change One Thing at a Time". [debuggingrules.com](http://www.debuggingrules.com) · [borrow free](https://archive.org/details/debugging9indisp0000agan) · [summary review](https://dwheeler.com/essays/debugging-agans.html)

**Deeper / systematic**
- [The Debugging Book](https://www.debuggingbook.org/) — Andreas Zeller. **Free, executable notebooks.** Source of "scientific debugging" (hypothesis → prediction → experiment → observation).
- [Reducing Failure-Inducing Inputs](https://www.debuggingbook.org/html/DeltaDebugger.html) — delta debugging: the algorithmic version of shrinking a repro to minimal.
- [Why Programs Fail](https://www.oreilly.com/library/view/why-programs-fail/9780123745156/) — Zeller's print predecessor.

**Tooling for this stack**
- [Debugging Node.js](https://nodejs.org/learn/getting-started/debugging) + [Using Inspector](https://nodejs.org/learn/diagnostics/live-debugging/using-inspector) — `node --inspect server.js` and real breakpoints. Replaces most `console.log`.
- [git bisect](https://git-scm.com/docs/git-bisect) — for "it used to work". Binary search over commits; **requires a reliable repro to work at all.** `git bisect run ./repro.sh` automates it.
- [Playwright Trace Viewer](https://playwright.dev/docs/trace-viewer) — records actions, network, DOM snapshots so a CI failure arrives pre-reproduced. Relevant given the toast swallows real errors.
- [rr](https://rr-project.org/) ([GitHub](https://github.com/rr-debugger/rr)) — Linux record-and-replay, built at Mozilla for intermittent Firefox bugs. Replay one exact execution, even backwards. Mostly C/C++ — bookmark, don't learn yet.

---

## Practice habits

1. **Journal every real bug** — especially first hypothesis vs. actual cause.
2. **No fix before a repro.** Write the command down first.
3. **Turn every repro into a test** before fixing. This is how the skill compounds.
4. **Time-box guessing to 10 minutes**, then gather data.
5. **One change, re-run, record.**
6. **Practice on strangers' bugs** — pick an open issue in a library I use and just try to
   reproduce it, without fixing it. Purest available drill, and no personal assumptions to
   lean on.
7. **Predict the error before running.** Break something deliberately, guess the exact
   message, then check.
8. **Learn tools while calm.** Nobody learns a debugger during an outage.
