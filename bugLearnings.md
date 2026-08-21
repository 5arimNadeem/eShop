# 📖 The eShop Bug Book
### *Learning Through Our Mistakes*

> *"Debugging is not about fixing code. It is about reading a story — finding where the story went wrong, and understanding why."*

---

## About This Book

Every bug in this file was encountered during the real development of this project.
Each chapter follows the **Scientific Debugging Method**:

```
1. OBSERVE     → Collect data. Read the code. Don't touch anything yet.
2. HYPOTHESIZE → Form all possible explanations before testing any.
3. TEST        → Use instrumentation (logs, curl, debugger) to prove or disprove.
4. CONCLUDE    → Fix it. Understand WHY. Document it here.
```

Read this book when you are stuck. The bugs here are not embarrassments — they are your education.

---

## 📋 Table of Contents

| # | Chapter Title | Category | File(s) |
|---|--------------|----------|---------|
| 1 | [The Dead Guard](#chapter-1-the-dead-guard) | Logic Bug | `controller/shop.js` |
| 2 | [The Missing Slash](#chapter-2-the-missing-slash) | Routing | `controller/shop.js` |
| 3 | [The Double Path](#chapter-3-the-double-path) | Routing | `app.js` + `controller/shop.js` |
| 4 | [The Server That Opened Too Early](#chapter-4-the-server-that-opened-too-early) | Async / Startup | `server.js` |
| 5 | [The Phantom Duplicate](#chapter-5-the-phantom-duplicate) | Race Condition + Schema | `model/shop.js` + `SellerActivationPage.jsx` |
| 6 | [The Bubble That Swallowed the Click](#chapter-6-the-bubble-that-swallowed-the-click) | DOM / Event Bubbling | `ShopProfileData.jsx` |
| 7 | [The Inverted Screen](#chapter-7-the-inverted-screen) | Logic Bug (UI) | `SellerActivationPage.jsx` |
| 8 | [The Ghost in the Store](#chapter-8-the-ghost-in-the-store) | Redux / State | `store.js` + `reducers/product.js` |

---
---

## Chapter 1: The Dead Guard

**Date Encountered:** 2026-08-16
**Symptom:** Shop creation crashed with `Cannot read properties of undefined (reading 'filename')` even for valid requests.

### The Story

The code had a guard that was *supposed* to delete the uploaded file and return an error if the email already existed. But the guard was placed *after* the email check that returned early. The guard was a dead man — it could never run.

Then came the real killer: `req.file.filename` was accessed directly with no protection. If the user submitted without an avatar image, `req.file` was `undefined`. The crash happened before anything useful could run.

### Investigation Steps

1. **Observe:** Read `controller/shop.js` top-to-bottom, tracing the flow of a request line by line.
2. **Hypothesize:** Spotted the `if (sellerEmail)` block on line 31 — but `sellerEmail` had already been checked on line 23 with an early `return`. This second block was **unreachable**. Also noted `req.file.filename` with no null check.
3. **Test:** Sent a `curl` request without a file attached. Got `TypeError: Cannot read properties of undefined`.
4. **Conclude:** Two bugs in one place — dead code masking the real problem, and a missing file guard.

### Root Cause

```js
// BEFORE — dead code (sellerEmail is always falsy here) + unguarded file access
if (sellerEmail) {              // unreachable — already returned above
    const filename = req.file.filename  // dead code
}
const filename = req.file.filename  // CRASH if no file uploaded
```

### The Fix

```js
// AFTER — restore the guard, remove the dead block
if (!req.file) {
    return next(new ErrorHandler("Avatar image is required", 400));
}
const filename = req.file.filename;
```

### The Lesson

> **Dead code is not harmless.** It confuses you when debugging and hides the real issue. If a block of code can never run, delete it — it is noise that pulls your eyes away from the real story.
> Always ask: "Can the code even reach this line?" If the answer is no, the code above it has a bug — or this code is a ghost.

---
---

## Chapter 2: The Missing Slash

**Date Encountered:** 2026-08-16
**Symptom:** Clicking the activation link in the email did nothing. The shop was never saved to the database.

### The Story

The activation route existed. The email was sent. The link was clicked. But the database stayed empty. The route that writes to the database was registered without a leading `/`, causing Express to silently register it at the wrong path.

### Investigation Steps

1. **Observe:** Traced the full flow: form submit → `/create-shop` → email → activation link → `/shop/activation` → `Shop.create()`. Identified that `Shop.create()` lives only inside the activation route.
2. **Hypothesize:** If the DB is never written to, the activation route is either (a) never reached, or (b) crashing silently. Spotted `"shop/activation"` without a leading `/` on the route registration.
3. **Test:** Used `curl` to hit the activation endpoint directly with a bad token.
   - Before fix: `404 Cannot POST` — route not found.
   - After fix: `jwt malformed` — route reached, handler ran.
4. **Conclude:** The missing `/` was the entire bug.

### Root Cause

```js
// BEFORE — missing leading slash
router.post(
    "shop/activation",   // Express registers this incorrectly
    ...
)
```

### The Fix

```js
// AFTER
router.post(
    "/shop/activation",
    ...
)
```

### The Lesson

> **Use `curl` as your bisection tool.** When something does not work, bypass the frontend entirely. Hit the backend directly with `curl`. If `curl` returns `404`, the route does not exist. If it returns a real error message, the route exists but has a logic problem. This eliminates half the system from suspicion in one command.

---
---

## Chapter 3: The Double Path

**Date Encountered:** 2026-08-16
**Symptom:** After fixing the slash, activation still failed. Frontend received `Cannot POST /api/v2/shop/activation`.

### The Story

Express **compounds** paths. `app.use('/api/v2/shop', router)` prefixes every route inside that router. So `/shop/activation` inside the router becomes `/api/v2/shop/shop/activation` — with `shop` doubled. The frontend was calling the correct single-path URL, but the backend had registered the route at the double-path URL. They never matched.

### Investigation Steps

1. **Observe:** Read `app.js` — `app.use('/api/v2/shop', shop)`. Read `shop.js` — `router.post("/shop/activation")`. Drew the resulting URL on paper:
   ```
   /api/v2/shop  +  /shop/activation  =  /api/v2/shop/shop/activation
   ```
2. **Hypothesize:** Frontend calls `/api/v2/shop/activation`. Backend registered at `/api/v2/shop/shop/activation`. Mismatch is certain.
3. **Test:** Used `curl` on both URLs. Double-path returned `jwt malformed` (route found). Single-path returned `404` (not found). Proof complete.
4. **Conclude:** Change route to `/activation` so compounding produces the correct `/api/v2/shop/activation`.

### Root Cause

```
app.use('/api/v2/shop', router) + router.post("/shop/activation")
= /api/v2/shop/shop/activation    (WRONG — double /shop/)

app.use('/api/v2/shop', router) + router.post("/activation")
= /api/v2/shop/activation         (CORRECT)
```

### The Fix

```js
// BEFORE
router.post("/shop/activation", ...)

// AFTER — the prefix is already added by app.use()
router.post("/activation", ...)
```

### The Lesson

> **Think of `app.use()` as a folder, and `router.post()` as the filename inside that folder.** You never repeat the folder name inside the filename.
> Full URL = prefix + suffix. Always write both on paper before registering a route.

---
---

## Chapter 4: The Server That Opened Too Early

**Date Encountered:** 2026-08-16
**Symptom:** First request after server startup always failed with `Operation 'shops.findOne()' buffering timed out after 10000ms`.

### The Story

The server started and immediately opened its door to accept requests — before the database was connected. Mongoose queued the incoming DB operations in a buffer, hoping Atlas would connect in time. But the 10-second timeout was shorter than Atlas's cold-start time of ~6 seconds, so the race was lost. The root cause was a single missing `await`.

### Investigation Steps

1. **Observe:** The error `buffering timed out` means Mongoose queued the operation but gave up waiting. This means DB was not connected when the request arrived.
2. **Hypothesize:** Looked at `server.js`. Saw `initializeDatabase()` on line 28 called *without* `await`. Then `app.listen()` on line 30 runs immediately after. The door opened before the DB connected.
3. **Test:** Ran an isolated `node -e` script to time the MongoDB connection. Atlas took **6354ms**. The buffer timeout was **10000ms** — a narrow and unreliable margin.
4. **Conclude:** Fix the startup order. `await` the DB connection, *then* open the server. Also raise `bufferTimeoutMS` as a safety net.

### Root Cause

```js
// BEFORE — fires and forgets, no await
initializeDatabase()    // starts connecting, doesn't wait
app.listen(8000)        // door opens immediately — DB not ready!
```

### The Fix

```js
// AFTER — correct startup order
const startServer = async () => {
    await connectDatabase();   // wait for DB first
    app.listen(PORT);          // THEN open the door
};
startServer();
```

### The Lesson

> **`await` is a door lock.** Without it, you open the shop before the shelves are stocked.
>
> Any `async` function called without `await` runs in the background while your code moves on. This is useful for truly parallel work, but catastrophic for sequential dependencies like "connect to DB, *then* start server."
>
> **Atlas Free Tier:** M0 clusters pause after 60 minutes of inactivity and take 6–10 seconds to wake up. Use M2+ in production to eliminate cold starts.

---
---

## Chapter 5: The Phantom Duplicate

**Date Encountered:** 2026-08-16
**Symptom:** After activating a shop, two records with the same email appeared in the database.

### The Story

Three bugs worked together to create this phantom. The activation page could fire its API call more than once. Both requests arrived nearly simultaneously. Both ran `findOne()` — both found nothing (DB not yet written) — both ran `Shop.create()` — two records created. The database had no `unique` constraint on email, so it accepted both writes silently.

A fourth quieter bug also lived here: the `pre('save')` hook was missing a `return`, so bcrypt re-ran on every save even when the password had not changed.

### Investigation Steps

1. **Observe:** Read `SellerActivationPage.jsx` — a `useEffect` with `[]` dependency, no guard against multiple invocations.
2. **Hypothesize (ranked):**
   - Hypothesis 1: Race condition — two requests overlap, both pass `findOne` before either writes
   - Hypothesis 2: No `unique: true` on email — DB has no enforcement layer at all
   - Hypothesis 3: Missing `return next()` in `pre('save')` — bcrypt runs unnecessarily on every save
3. **Test:** Inspected `shop.js` schema — confirmed `email` field had no `unique: true`. Race condition proved by reading the timing of async operations.
4. **Conclude:** Fix at both layers. App level (useRef lock) and DB level (unique index).

### Root Cause

```js
// Schema — no uniqueness enforcement
email: { type: String, required: true }  // DB accepts duplicates silently

// pre-save hook — missing return
if (!this.isModified("password")) {
    next();   // execution CONTINUES — bcrypt still runs!
}
this.password = await bcrypt.hash(this.password, 10); // runs even when unchanged
```

### The Fix

```js
// Schema — DB-level guard
email: { type: String, required: true, unique: true }

// pre-save hook — stop execution properly
if (!this.isModified("password")) {
    return next();
}

// Frontend — useRef lock prevents double-fire
const hasFired = useRef(false);
useEffect(() => {
    if (!activationToken || hasFired.current) return;
    hasFired.current = true;   // set BEFORE the async call
    activationEmail();
}, []);
```

### The Lesson

> **Defence in depth — always have two layers of protection.**
> - Layer 1 (App): `findOne` check + `useRef` lock
> - Layer 2 (Database): `unique: true` index
>
> If Layer 1 has a race condition, Layer 2 catches it. A database constraint is the last honest judge — it enforces the rule regardless of timing.
>
> **On `return next()` vs `next()`:** In callback-style code, `next()` does NOT stop execution. Only `return next()` does. Think of it like `res.json()` — forget the `return` and the code below still runs.

---
---

## Chapter 6: The Bubble That Swallowed the Click

**Date Encountered:** 2026-08-21
**Symptom:** Clicking "Running Events" or "Shop Reviews" tabs always selected "Shop Products". The `active` state was always 1.

### The Story

In HTML, a click event does not stay where you clicked. It travels *upward* through every parent element — this is **event bubbling**. The three tab divs were nested inside each other instead of sitting side by side. When "Running Events" was clicked, `setActive(2)` fired — and then the click bubbled up to the parent div, firing `setActive(1)`. The parent always won, overwriting the child.

### Investigation Steps

1. **Observe:** Read the JSX structure carefully. Counted opening vs closing tags. Found the closing `</div>` on line 36 was closing all three divs, not just one. "Running Events" and "Shop Reviews" were *inside* the "Shop Products" div.
2. **Hypothesize:** Event bubbling. Child fires `setActive(2)`, click bubbles to parent, parent fires `setActive(1)`. Active is always 1.
3. **Test (mental model):** Drew the DOM tree:
   ```
   <div onClick=setActive(1)>          (parent)
       <h5>Shop Products</h5>
       <div onClick=setActive(2)>      (child — wrong!)
       <div onClick=setActive(3)>      (child — wrong!)
   </div>
   ```
4. **Conclude:** Make all three divs siblings at the same level inside a shared container.

### Root Cause

```jsx
// BEFORE — Running Events and Shop Reviews are CHILDREN of Shop Products
<div onClick={() => setActive(1)}>
    <h5>Shop Products</h5>
    <div onClick={() => setActive(2)}>   // nested inside!
        <h5>Running Events</h5>
    </div>
    <div onClick={() => setActive(3)}>   // nested inside!
        <h5>Shop Reviews</h5>
    </div>
</div>  // closes ALL THREE
```

### The Fix

```jsx
// AFTER — all three are SIBLINGS
<div className="flex">
    <div onClick={() => setActive(1)}><h5>Shop Products</h5></div>
    <div onClick={() => setActive(2)}><h5>Running Events</h5></div>
    <div onClick={() => setActive(3)}><h5>Shop Reviews</h5></div>
</div>
```

### The Lesson

> **Event bubbling:** A click fires on the target element, then on every parent above it. Siblings do not interfere with each other.
>
> **How to spot nesting bugs:** Count your opening and closing tags. Use your editor's bracket highlighting. A single misplaced `</div>` is the most common source of this class of bug in JSX.
>
> **The React error was a red herring.** The `dispatchSetState` error was React working perfectly — it called `setActive(2)` then `setActive(1)` exactly as the DOM structure instructed. Always ask: "What *caused* this to be called?" not just "What is this function?"

---
---

## Chapter 7: The Inverted Screen

**Date Encountered:** 2026-08-16
**Symptom:** The activation page showed "Your account has been created successfully!" immediately on load — before any request had been made. Errors were never displayed.

### The Story

A ternary operator was inverted. `!success` was used as the condition, meaning when `success` was `false` (the initial state), it showed the success message. The logic was completely backwards.

### Investigation Steps

1. **Observe:** Read the return JSX. The condition was `{!success ? <success message> : error ? <error> : <loading>}`.
2. **Hypothesize:** `!success` starts as `true` (since `success` initialises to `false`). On first render, the success message shows immediately — before any request.
3. **Conclude:** Flip the ternary. Check `error` first, then `success`, then fall back to loading state.

### Root Cause

```jsx
// BEFORE — inverted
{!success ? (
    <p>Your account has been created successfully!</p>  // shows at start!
) : error ? (
    <p>{error}</p>
) : (
    <p>Activating...</p>
)}
```

### The Fix

```jsx
// AFTER — correct priority
{error ? (
    <p style={{ color: "red" }}>{error}</p>
) : success ? (
    <p style={{ color: "green" }}>Account created! You can now login.</p>
) : (
    <p>Activating your account...</p>
)}
```

### The Lesson

> **When reading conditional UI, trace it with the initial state first.** Ask: "What does this show on first render, before any data loads?" If the answer is wrong, the logic is inverted.
>
> **Priority order for status UI:** error first, success second, loading/default last. Error has the highest priority and should always override everything else.

---
---

## Chapter 8: The Ghost in the Store

**Date Encountered:** 2026-08-21
**Symptom:** `success` and `error` from the product reducer were always `undefined`. Dispatching actions appeared to have no effect.

### The Story

Two independent bugs together created the same symptom, and either one alone would have been enough to break things.

**Bug A:** `productReducer` was commented out of `store.js`. The Redux store had no `products` key. `useSelector((state) => state.products)` returned `undefined`. Destructuring `undefined` gave `undefined` for `success` and `error`.

**Bug B:** Even if the reducer had been registered, every line used `state?.x = value` — invalid syntax. Optional chaining (`?.`) is a reading operator. You cannot write through it. All state mutations silently did nothing.

### Investigation Steps

1. **Observe:**
   - `CreateProduct.jsx` line 10: `useSelector((state) => state.products)`
   - `store.js` line 16: `// products: productReducer,` — **commented out**
   - `reducers/product.js` line 10: `state?.isLoading = true` — **invalid write syntax**
2. **Hypothesize (ranked):**
   - Hypothesis 1: Reducer not in store → `state.products` is `undefined`
   - Hypothesis 2: `state?.x = value` invalid → state never mutates even if registered
3. **Test:** Read the store file. Confirmed both the import and the registration were commented out.
4. **Conclude:** Two fixes — uncomment the registration, remove all `?.` from state assignments.

### Root Cause

```js
// store.js — reducer never registered
// import { productReducer } from './reducers/product';
// products: productReducer,

// reducers/product.js — invalid write syntax (all 68 lines)
state?.isLoading = true;        // cannot write through optional chain
state?.success = true;          // silently does nothing
state?.error = action.payload;  // silently does nothing
```

### The Fix

```js
// store.js — register the reducer
import { productReducer } from './reducers/product';
products: productReducer,

// reducers/product.js — direct assignment (Immer guarantees state exists)
state.isLoading = true;
state.success = true;
state.error = action.payload;
```

### The Lesson

> **`?.` is for READING. Never for WRITING.**
>
> ```js
> // Reading — valid
> const msg = error?.response?.data?.message
>
> // Writing — INVALID
> state?.success = true
>
> // Writing — correct
> state.success = true
> ```
>
> In Redux Toolkit's `createReducer`, Immer wraps `state` in a Proxy and guarantees it is never null or undefined. You will never need `?.` when writing to state inside a reducer.
>
> **Always check the store registration first when Redux state appears undefined.** A selector reading a missing key returns `undefined` — and `undefined` looks like every other kind of failure.

---
---

## 📐 The Debugging Toolkit

| Tool | When To Use | What It Tells You |
|------|------------|-------------------|
| `console.log("[DEBUG]")` | First step — add checkpoints at every branch | Which path the code actually takes |
| `curl` | Testing backend routes without browser | Is the route registered? Does it respond correctly? |
| Count tags | JSX nesting bugs | Whether elements are siblings or parent/child |
| Read `store.js` first | Redux state is `undefined` | Whether the reducer is even registered |
| Trace initial render | UI logic bugs | What the component shows before any data loads |
| Draw the full URL | Express routing bugs | Whether prefix + suffix produce the correct path |

---

## 🧠 Universal Rules Extracted

1. **Read before touching.** Observe first. Hypothesize second. Test third.
2. **`curl` before browser.** Isolate backend bugs from frontend bugs.
3. **`return next()` not `next()`.** In callbacks, `next()` alone does not stop execution.
4. **`?.` reads. Never writes.** Optional chaining is for reading uncertain values, not for assigning.
5. **Two layers of defence.** App-level check + database constraint. Never trust only one.
6. **`await` is a door lock.** Without it, sequential operations run in parallel.
7. **Express path compounding.** `app.use('/prefix', router)` + `router.post('/route')` = `/prefix/route`. Never repeat the prefix.
8. **Clicks bubble upward.** A click fires on the target, then every parent. Siblings do not interfere.
9. **Check the store first.** When Redux state is `undefined`, the reducer is probably not registered.
10. **The error points to where it appears, not where it starts.** Always trace back to the source.

---

*Last updated: 2026-08-21*
*Project: eShop — Multi-Vendor MERN Application*
