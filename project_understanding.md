# 🧭 The eShop Understanding Book
### *From "it works" to "I know exactly why, and what breaks it"*

> *"The first principle is that you must not fool yourself — and you are the easiest person to fool."*
> — Richard Feynman

---

## How to read this book

Its companion, [`bugLearnings.md`](bugLearnings.md), answers **"what went wrong and how did I fix it?"**
This book answers a harder question: **"do I actually understand what I built?"**

The rule I followed while writing it: **I only wrote down things I read in your code.** Every claim
points at a real file and a real line. Where I was unsure, I said so out loud in
[Part 13: Fact-Check & Confidence Log](#part-13-fact-check--confidence-log). Nothing here is
motivational filler — several sections say your code is broken, because it is.

**The Feynman method used throughout:**

```
1. Pick the idea.
2. Explain it in plain words, as if to a smart 12-year-old.
3. Find the spot where the explanation gets hand-wavy. ← that is your real gap
4. Go back to the source. Fill the gap. Simplify again.
```

Every concept below follows that shape: **Plain words → In your code → The trade-off → The gotcha.**

---

## 📋 Table of Contents

| Part | Title | What it gives you |
|------|-------|-------------------|
| 1 | [Why This Project Exists](#part-1-why-this-project-exists) | The honest answer + the 5 Whys |
| 2 | [The Map](#part-2-the-map--how-a-request-actually-travels) | How a request actually travels |
| 3 | [The Complete API Inventory](#part-3-the-complete-api-inventory) | Every route, and who can call it |
| 4 | [Authentication, Explained Properly](#part-4-authentication-explained-properly) | Cookies, JWTs, and what you got wrong |
| 5 | [The Five Integrations](#part-5-the-five-integrations) | Stripe, Cloudinary, SMTP, Socket.IO, Atlas |
| 6 | [Security Audit — What I Actually Found](#part-6-security-audit--what-i-actually-found) | 14 verified findings, ranked |
| 7 | [Correctness Bugs Found While Reading](#part-7-correctness-bugs-found-while-reading) | 7 non-security bugs |
| 8 | [Alternatives To Every Choice](#part-8-alternatives-to-every-choice-you-made) | What else you could have used |
| 9 | [Big Word Alerts](#part-9-big-word-alerts--the-jargon-decoder) | Jargon decoder ring |
| 10 | [The Honest Scorecard](#part-10-the-honest-scorecard) | Pros, cons, trade-offs |
| 11 | [Reading List](#part-11-the-reading-list) | Articles, books, docs |
| 12 | [The Interview Gauntlet](#part-12-the-interview-gauntlet) | Basic → Hard, answered from *your* code |
| 13 | [Fact-Check & Confidence Log](#part-13-fact-check--confidence-log) | Where I might be wrong |
| 14 | [What To Fix First](#part-14-what-to-fix-first) | The ordered roadmap |

---
---

# Part 1: Why This Project Exists

## The honest answer

Let me separate three things that usually get blurred together.

**1. Why does a multi-vendor marketplace exist in the world?**

A normal shop is one seller, many buyers. A **multi-vendor marketplace** (Amazon, Etsy, Daraz, eBay)
is *many* sellers, many buyers, and one platform sitting in the middle taking a cut.

The platform's actual product is not "a website." It is **trust and reach**. A small seller cannot
get 10,000 visitors or convince a stranger to hand over a credit card. The platform already has both.
In exchange, it takes a commission — in your code, exactly 10%:

```js
// backend/controller/order.js:204
const serviceCharge = order.totalPrice * .10;
```

That single line *is* the business model. Everything else in the repo is plumbing that exists to make
that line fire safely.

**2. Why does *this* codebase exist?**

Truthfully: **this is a learning project.** The evidence is in the repo itself, and it is not an insult —
it's an accurate reading:

- `bugLearnings.md` is 87,000 characters of debugging diaries. Production repos do not have these.
  Learning repos do. This is the single strongest signal.
- `controller/event.js` ends with a bare comment: `// 3:33:47`. That is a **video timestamp** —
  a bookmark for where you paused a tutorial.
- `[DEBUG]` logs are left switched on all over `controller/shop.js`.
- `techdebt.txt` is a single unfinished sentence.
- `backend/tmp/` holds ~35 orphaned temp files and `backend/uploads/` holds your actual desktop
  screenshots, both committed to git.

So: this exists to **teach you the full shape of an end-to-end app** — auth, file upload, payments,
real-time chat, state management — in one project. That is a legitimate and good reason. The danger is
only if you mistake "the demo runs" for "this is production-ready," because
[Part 6](#part-6-security-audit--what-i-actually-found) shows it very much is not.

**3. Why should *you* care beyond the tutorial?**

Because the interesting engineering in a marketplace is not the CRUD. It's the four hard problems
that only appear when you have two independent parties who don't trust each other:

| Hard problem | Where it lives in your repo | Is it solved? |
|---|---|---|
| **Money must be real** — the server must independently confirm payment | `controller/payment.js`, `controller/order.js` | ❌ No. See Finding #1 |
| **Tenant isolation** — seller A must not touch seller B's data | `isSeller` in `middleware/auth.js` | ❌ No. See Finding #4 |
| **Order splitting** — one cart, many sellers, many fulfilments | `order.js:13` `/create-order` | ⚠️ Partially. See Bug #1 |
| **Payouts & ledger** — the platform owes sellers money over time | `model/shop.js` `availableBalance` | ❌ No. See Bug #2 |

**Every one of those four is where a real interview will dig.** Not on `app.use(express.json())`.

---

## The 5 Whys

The **5 Whys** is a technique from the Toyota Production System: ask "why?" repeatedly until you hit
a root cause rather than a symptom. The number 5 is a rule of thumb, not a law. Let me run it on the
single most important fact about this codebase.

**Observation: A user can buy a $10,000 laptop for $0.50.**

> **Why #1 — Why can they?**
> Because the amount charged is taken from whatever the browser sends in the request body.
> `controller/payment.js:11` → `amount: req.body.amount`. The browser is asked "how much should
> I charge you?" and the server believes the answer.

> **Why #2 — Why does the server believe the browser?**
> Because there is no server-side recalculation step. The price is computed in
> `frontend/src/components/Checkout/Checkout.jsx:100`, stashed into `localStorage`, read back in
> `Payment.jsx:31`, and posted to the server. The server never looks up the products and re-adds them.

> **Why #3 — Why was it built that way?**
> Because in the browser, that data *looks* trustworthy. You wrote the checkout code; you saw the
> numbers come out right; you tested it and it worked. The failure mode is invisible from the
> developer's chair — you have to deliberately imagine a hostile user with DevTools open.

> **Why #4 — Why was that hostile user never imagined?**
> Because the project was built following a happy-path tutorial. Tutorials optimize for "the feature
> works by the end of the video." A trust boundary is invisible in a demo, because in a demo the
> attacker and the developer are the same friendly person.

> **Why #5 — Why is *that* the real root cause?**
> Because it reveals a missing mental model, not a missing line of code. The model is:
> **the network is the trust boundary.** Everything on the far side of it — browser, mobile app,
> `curl` — is under the attacker's control and is *input*, never *fact*. You cannot patch a
> missing mental model with one `if` statement; once you have it, you re-read all 9 controllers
> differently and find the other 13 holes.

**Root cause: the trust boundary was never drawn.**
**Not: "we forgot to validate the amount."**

That distinction is the entire point of 5 Whys, and it's a great thing to demonstrate in an interview.

---
---

# Part 2: The Map — How a Request Actually Travels

## Three servers, not one

A thing many people get wrong when describing this stack: **this is three separate Node processes.**

```
┌────────────────────────────┐
│  React dev server :3000    │   frontend/  (react-scripts)
│  the user's browser        │
└─────────┬──────────┬───────┘
          │          │
  HTTPS/  │          │  WebSocket
  axios   │          │  socket.io-client
          ▼          ▼
┌──────────────────┐  ┌──────────────────┐
│  API :8000       │  │  Socket :4000    │
│  backend/        │  │  socket/         │
│  Express + REST  │  │  Socket.IO       │
└────────┬─────────┘  └──────────────────┘
         │                   ▲
         │                   │  ⚠️ these two never talk
         ▼                      to each other
┌──────────────────┐
│  MongoDB Atlas   │
│  (cloud)         │
└──────────────────┘
         │
         ├──► Stripe API      (payments)
         ├──► Cloudinary API  (image hosting)
         └──► SMTP server     (activation emails)
```

**The detail worth noticing:** the socket server on `:4000` and the API on `:8000` share *nothing*.
No database, no memory, no auth. The socket server keeps its users in a plain JavaScript array
(`socket/index.js:29` → `let users = []`). Chat messages get *persisted* by the API
(`POST /message/create-new-message`) but *delivered* by the socket server, and neither one knows the
other did its half. That is a deliberate-looking design that is actually accidental, and it has
consequences — see [Integration 4](#integration-4-socketio--the-realtime-layer).

## The lifecycle of one request

Take `PUT /api/v2/product/create-new-review`. Here is every stop it makes.

```
1. Browser         axios.put(..., { withCredentials: true })
                   └─ withCredentials is what attaches the cookie. Without it,
                      the browser sends nothing and you get a 401.

2. CORS preflight  Browser sends OPTIONS first (because it's PUT + JSON).
                   app.js:12 replies "origin http://localhost:3000 is allowed,
                   and yes, credentials are allowed."

3. express.json()  app.js:10 — reads the request body stream, parses JSON,
                   puts the result on req.body. Before this line, req.body is undefined.

4. cookieParser()  app.js:11 — parses the `Cookie:` header string into req.cookies.

5. Router match    app.js:41 mounts the product router at /api/v2/product.
                   Express strips that prefix, so the router sees "/create-new-review".

6. isAuthenticated middleware/auth.js:11
                   ├─ read req.cookies.token
                   ├─ jwt.verify(token, JWT_SECRET)   ← throws if forged or expired
                   ├─ req.user = await User.findById(decoded.id)
                   └─ next()

7. catchAsyncErrors middleware/catchAsyncErrors.js
                   Wraps the handler in Promise.resolve(...).catch(next).
                   This is the glue that makes `throw` inside an async function
                   reach the error handler instead of crashing the process.

8. Handler         product.js:122 — the actual work.

9. Error handler   app.js:50 — app.use(ErrorHandler). Express recognises it as an
                   error handler because it takes FOUR arguments (err, req, res, next).
                   Three args = normal middleware. Four = error middleware.
                   That arity rule is real, and it is the #1 "why is my error
                   handler never called?" gotcha in Express.
```

**Feynman check:** if you cannot explain *why step 7 exists* without saying "it catches errors,"
you have a gap. The real reason: Express 4 does not await your handler. If an async handler rejects,
nobody is listening, and you get an `UnhandledPromiseRejection` and a hung request instead of a 500.
`catchAsyncErrors` manually re-attaches the rejection to Express's `next()`.

> **Aside — worth knowing:** your `backend/package.json` declares `express: ^5.2.1`. **Express 5
> forwards rejected promises to the error handler automatically**, which means `catchAsyncErrors` is
> largely redundant on v5. It is harmless to keep, and keeping it makes the code portable back to v4.
> But knowing *why* it's there and that it is now optional is exactly the kind of nuance that
> separates "I copied this" from "I understand this."

---
---

# Part 3: The Complete API Inventory

Nine routers, mounted in `backend/app.js:38-46`, all under `/api/v2`.

Read the **Guard** column carefully — it is the whole security story in one table.

### 👤 `/api/v2/user` — `controller/user.js`

| Method | Path | Guard | Notes |
|---|---|---|---|
| POST | `/create-user` | 🌐 none | Uploads avatar, emails an activation link. Does **not** create the user yet |
| POST | `/activation` | 🌐 none | Verifies the activation JWT, *then* creates the user |
| POST | `/login-user` | 🌐 none | ⚠️ No rate limit — brute-forceable |
| GET | `/get-user` | 🔒 user | |
| POST | `/logout` | 🌐 none | ⚠️ Cookie attributes don't match the ones used to set it |
| PUT | `/update-user-info` | 🔒 user | ⚠️ Looks the user up by `req.body.email`, not `req.user.id` |
| PUT | `/update-avatar` | 🔒 user | Deletes the old Cloudinary image first — nicely done |
| PUT | `/update-user-addresses` | 🔒 user | ⚠️ Edit path is dead code (Bug #4) |
| DELETE | `/delete-user-address/:id` | 🔒 user | Correctly scoped to `req.user._id` ✅ |
| PUT | `/update-user-password` | 🔒 user | Verifies old password ✅ |
| GET | `/user-info/:id` | 🌐 **none** | 🚨 **Leaks any user's email, phone, addresses.** Finding #6 |

### 🏪 `/api/v2/shop` — `controller/shop.js`

| Method | Path | Guard | Notes |
|---|---|---|---|
| POST | `/create-shop` | 🌐 none | 🚨 `console.log`s the plaintext password (line 19). Finding #8 |
| POST | `/activation` | 🌐 none | 🚨 Calls `sendToken` not `sendShopToken` (line 124). **Bug #6** |
| POST | `/login-shop` | 🌐 none | ⚠️ No rate limit |
| GET | `/get-seller` | 🔒 seller | |
| GET | `/logout` | 🌐 none | ⚠️ `GET` for a state change — should be POST |
| GET | `/get-shop-info/:id` | 🌐 none | Public shop page — reasonable, but returns the whole document |
| PUT | `/update-seller-info` | 🔒 seller | 🚨 `Shop.findOne(req.seller._id)` is wrong usage. **Bug #7** |

### 📦 `/api/v2/product` — `controller/product.js`

| Method | Path | Guard | Notes |
|---|---|---|---|
| POST | `/create-product` | 🌐 **none** | 🚨 Anyone can create a product under any `shopId`. Finding #3 |
| GET | `/get-all-products-shop/:shopId` | 🌐 none | Fine — public catalogue |
| DELETE | `/delete-shop-product/:id` | 🔓 seller, **no owner check** | 🚨 Any seller deletes any seller's product. Finding #4 |
| GET | `/get-all-products` | 🌐 none | ⚠️ No pagination — returns the entire collection |
| PUT | `/create-new-review` | 🔒 user | ⚠️ No "did you buy it?" check. Duplicate-review bug (#5) |

### 🎉 `/api/v2/event` — `controller/event.js`

| Method | Path | Guard | Notes |
|---|---|---|---|
| POST | `/create-event` | 🔒 seller | ⚠️ Trusts `req.body.shopId` — no check it's *your* shop |
| GET | `/get-all-events` | 🌐 none | |
| GET | `/get-all-events/:id` | 🌐 none | |
| DELETE | `/delete-shop-event/:id` | 🔓 seller, **no owner check** | 🚨 Same hole as products |

### 🎟️ `/api/v2/coupon` — `controller/couponCode.js`

| Method | Path | Guard | Notes |
|---|---|---|---|
| POST | `/create-coupon-code` | 🔒 seller | ⚠️ Uniqueness check is a read-then-write race |
| GET | `/get-coupon/:id` | 🔓 seller, **no owner check** | 🚨 Read any shop's coupons |
| DELETE | `/delete-coupon/:id` | 🔓 seller, **no owner check** | 🚨 Delete a competitor's coupons |
| GET | `/get-coupon-value/:name` | 🌐 none | 🚨 Coupon codes are **enumerable**. Finding #7 |

### 💳 `/api/v2/payment` — `controller/payment.js`

| Method | Path | Guard | Notes |
|---|---|---|---|
| POST | `/process` | 🌐 **none** | 🚨 **Charges `req.body.amount`.** Finding #1 |
| GET | `/stripeapikey` | 🌐 none | ✅ Correct — this is the *publishable* key, meant to be public |

### 🧾 `/api/v2/order` — `controller/order.js`

| Method | Path | Guard | Notes |
|---|---|---|---|
| POST | `/create-order` | 🌐 **none** | 🚨 `user` and `paymentInfo` come from the body. Finding #2 |
| GET | `/get-all-orders/:userId` | 🌐 **none** | 🚨 Read anyone's order history. Finding #5 |
| GET | `/get-seller-all-orders/:shopId` | 🌐 **none** | 🚨 Read any shop's full revenue |
| PUT | `/update-order-status/:id` | 🔓 seller, **no owner check** | 🚨 Mark someone else's order delivered |
| PUT | `/order-refund/:id` | 🌐 **none** | 🚨 Set any order to any status string |
| PUT | `/order-refund-success/:id` | 🔓 seller, **no owner check** | 🚨 Restocks inventory |

### 💬 `/api/v2/conversation` and `/api/v2/message`

| Method | Path | Guard | Notes |
|---|---|---|---|
| POST | `/conversation/create-new-conversation` | 🌐 none | |
| GET | `/conversation/get-all-conversation-seller/:id` | 🔓 seller, **no owner check** | 🚨 Read another seller's inbox list |
| GET | `/conversation/get-all-conversation-user/:id` | 🔓 user, **no owner check** | 🚨 Read another user's inbox list |
| PUT | `/conversation/update-last-message/:id` | 🌐 none | |
| POST | `/message/create-new-message` | 🌐 **none** | 🚨 Send a message as anybody — `sender` is from the body |
| GET | `/message/get-all-messages/:id` | 🌐 **none** | 🚨 **Read any conversation in the system** |

### The score

**41 routes. 19 of them are 🌐 completely unauthenticated. 9 more have a guard that
checks *"are you logged in?"* but never *"is this yours?"***

That second category is the subtle one, and it has a name worth memorising:
**BOLA — Broken Object Level Authorization**, ranked **#1 in the OWASP API Security Top 10**.
It is the most common serious API flaw in the world, and your repo is a textbook specimen of it.

---
---

# Part 4: Authentication, Explained Properly

## First: authentication vs. authorization

These get used interchangeably and they are completely different.

- **Authentication (authn) — "Who are you?"** Checking the password. Issuing the token. Done once.
- **Authorization (authz) — "Are you allowed to do *this specific thing*?"** Checked on *every*
  request, against *the specific object being touched*.

**Your authentication is decent. Your authorization is almost entirely missing.**
That single sentence summarises the whole audit, and it's the sentence to say in an interview.

## How your login actually works

Let me trace it in plain words.

**Step 1 — Signup does not create a user.** This is unusual and worth understanding.

```js
// controller/user.js:60 — the whole user object is signed into a JWT
const createActivationToken = (user) => {
  return jwt.sign(user, process.env.ACTIVATION_SECRET, { expiresIn: "5m" });
};
```

The user's details are put *inside a token*, the token is emailed as a link, and only when they click
it (`POST /activation`) does `User.create()` finally run.

**Why is this clever?** No database row exists until the email is proven real. No junk rows, no
cleanup job for unverified accounts. The token *is* the pending record. It's a genuinely neat trick
and you should be able to explain it.

**Why is this dangerous here?** Because `user` at that point still contains the **plaintext password**.
Read `controller/user.js:36` — the object is `{ name, email, password, avatar }`, and password is
the raw string. bcrypt hashing happens in a Mongoose `pre("save")` hook, which does not run until
`User.create()` at activation time.

**A JWT is signed, not encrypted.** This is the single most misunderstood fact about JWTs. The
payload is **base64url — reversible by anyone, no key needed.** Paste any JWT into jwt.io and read it.
The signature stops you from *changing* it; it does nothing to stop you *reading* it.

So the activation email contains a link that contains the user's plaintext password, sitting in:
the recipient's mailbox forever, every SMTP relay hop, browser history, `Referer` headers,
and any server access log. That is Finding #9.

**Step 2 — Login sets an httpOnly cookie.**

```js
// utils/jwtToken.js
const options = {
  expires: new Date(Date.now() + 5*24*60*60*1000),
  httpOnly: true,   // JavaScript cannot read this cookie
  sameSite: "none", // send it even on cross-site requests
  secure: true,     // HTTPS only
};
res.status(statusCode).cookie("token", token, options).json({ success: true, user, token });
```

Each flag, in plain words:

- **`httpOnly: true`** — `document.cookie` cannot see it. This is your **XSS defence**. If an attacker
  injects JavaScript into your page, they still can't steal the session. ✅ Good call.
- **`secure: true`** — only sent over HTTPS. ✅ Good.
- **`sameSite: "none"`** — send the cookie even when the request comes from a different site.
  ⚠️ **This is the risky one.** It exists because your frontend (`:3000`) and API (`:8000`) are
  different origins. But `SameSite=None` switches off the browser's built-in **CSRF** protection.
- **`expires: +5 days`** — a long-lived session with **no revocation mechanism**. See below.

**The contradiction to notice:** you set `httpOnly: true` to keep JavaScript away from the token…
and then return that same token in the **JSON body** on the very next line. Any XSS can just read
the login response. It's not fatal (the attacker needs to be present at login), but it defeats part
of the point. Pick one transport: cookie *or* body, not both.

## The three things about JWTs people get wrong

**1. "JWTs are secure because they're encrypted."** They are not encrypted. See above.

**2. "JWTs are stateless, so they're better than sessions."** Stateless is a *trade-off*, not a win.

| | Server sessions | Your JWTs |
|---|---|---|
| Where is the truth? | Database / Redis | Inside the token |
| Lookup per request | 1 (DB hit) | 0 (just verify the signature) |
| **Can you log someone out?** | ✅ Delete the row. Instant. | ❌ **No.** |
| Scales to many servers | Needs shared store | Free |
| Token size | Tiny ID | Bigger, sent on every request |

That ❌ is the real cost, and it is concrete for you: **your tokens live 5 days and cannot be
revoked.** If a token leaks, you cannot kill it. Your only options are to change `JWT_SECRET`
(logging out *every user on the planet*) or wait 5 days.

The industry answer is **short-lived access token (5–15 min) + long-lived refresh token** which
*is* stored server-side and *can* be revoked. You get statelessness for the common path and
revocation where it matters. Explaining that trade-off is a strong interview answer.

**3. "`jwt.verify` proves the user is valid."** It proves *the token was signed by you and hasn't
expired*. It says nothing about whether that user still exists, is banned, or changed their password.
Your code has this exact hole:

```js
// middleware/auth.js:16
req.user = await User.findById(decodedData.id);
next();   // ← no null check!
```

If the user was deleted, `req.user` is `null`, `next()` runs anyway, and the handler explodes on
`req.user.id` with a confusing 500. One `if (!req.user) return next(new ErrorHandler(...401))`
fixes it.

## 🚨 The token confusion bug

This one is genuinely interesting and I want you to understand it fully.

You have **two** cookies — `token` (users) and `seller_token` (shops). But look:

```js
// model/user.js:57  →  jwt.sign({ id: this._id }, process.env.JWT_SECRET, ...)
// model/shop.js:82  →  jwt.sign({ id: this._id }, process.env.JWT_SECRET, ...)
```

**Identical payload shape. Identical secret.** The two token types are *cryptographically
indistinguishable*. Nothing inside a token says "I am a user" or "I am a shop." Take your user
cookie, paste its value into a cookie named `seller_token`, and `jwt.verify` in `isSeller`
**will succeed.**

**Why aren't you owned right now?** Pure luck. `isSeller` then runs `Shop.findById(userId)`, and
since no Shop happens to share an ObjectId with a User, it returns `null` and the request dies with
a 500. **You are protected by an accident of ID allocation, not by a security control.**

That is a fragile place to be, and it turns into a real bug in `controller/shop.js:124`:

```js
sendToken(seller, 201, res);   // 🚨 should be sendShopToken
```

After activating a shop, the server sets a cookie named **`token`** (the *user* cookie) containing a
**Shop** ID. Now `isAuthenticated` runs `User.findById(shopId)` → `null` → `req.user = null` → 500s
in confusing places. This is Bug #6, and it's a direct consequence of the tokens being interchangeable.

**The fix is one line and it's the standard practice:** put the role *in the token* and check it.

```js
jwt.sign({ id: this._id, role: "user" }, JWT_SECRET, ...)   // or "seller"
// then in the guard:
if (decoded.role !== "seller") return next(new ErrorHandler("Forbidden", 403));
```

> **Big word alert — "token confusion" / "type confusion."** A general class of bug where the system
> can't tell two kinds of credential apart. The famous cousin is the **JWT `alg: none` attack**,
> where a library was tricked into accepting an unsigned token. The lesson is the same:
> *a credential must state what it is for, and you must check.*

---
---

# Part 5: The Five Integrations

For each: what it is → how it's wired here → the trade-off → the gotcha.

## Integration 1: Stripe — payments

**Plain words.** You must never touch a raw card number — the compliance burden (**PCI-DSS**) is
enormous. So Stripe gives you a JavaScript widget that collects the card *inside an iframe hosted by
Stripe*. The card data goes browser → Stripe directly. Your server never sees it. You get back a
token that means "a card was collected."

**The flow Stripe intends** (the `PaymentIntent` pattern):

```
1. Browser: "I want to pay for cart X"
2. YOUR SERVER: computes the price ITSELF, creates a PaymentIntent, returns client_secret
3. Browser: stripe.confirmCardPayment(client_secret, card)  → talks straight to Stripe
4. STRIPE → YOUR SERVER via WEBHOOK: "payment_intent.succeeded"   ← the source of truth
5. Your server marks the order paid
```

**How it's wired here.**

```js
// controller/payment.js:9
const myPayment = await stripe.paymentIntents.create({
  amount: req.body.amount,     // 🚨 step 2 is done wrong
  currency: "usd",
});
```

And **step 4 does not exist at all.** There is no webhook endpoint anywhere in the repo. Instead the
browser reports its own success:

```js
// frontend/.../Payment.jsx — the browser tells the server the payment worked
order.paymentInfo = { id: result.paymentIntent.id, status: result.paymentIntent.status, type: "Credit Card" };
await axios.post(`${server}/order/create-order`, order, config);
```

**The trade-off you took.** Skipping webhooks makes local development *much* easier — webhooks need a
public URL, so you'd need `stripe listen` or ngrok. That is a real cost and it's why tutorials skip it.
But you traded away the only trustworthy signal in the entire payment flow.

**The gotchas.**

- 🚨 **Client-controlled amount.** Finding #1. Charge what *you* compute, from product IDs and
  quantities, looked up in your own database. Never trust a number that came over the network.
- 🚨 **No webhook = no truth.** The browser can lie, and it can also simply *vanish*. If the user
  closes the tab after Stripe succeeds but before `create-order` fires, **you have taken their money
  and there is no order.** That is not an attack — that's a flaky wifi connection, and it will happen.
- ⚠️ **No idempotency key.** Double-click "Pay" → two charges. Stripe supports an
  `idempotencyKey` on create calls precisely for this.
- ⚠️ **Amounts are in the smallest currency unit.** `Math.round(totalPrice * 100)` in `Payment.jsx`
  is correct for USD cents — good. But note the price it multiplies came from `.toFixed(2)`, i.e. a
  *string*. Float arithmetic on money is a classic source of off-by-one-cent bugs. Real systems keep
  money as integer cents from end to end, never as floats.

📚 https://docs.stripe.com/payments/payment-intents · https://docs.stripe.com/webhooks

## Integration 2: Cloudinary — image hosting

**Plain words.** Storing uploaded images on your server's disk breaks the moment you have two
servers, and breaks harder on platforms like Heroku/Vercel where the disk is wiped on every deploy
(an **ephemeral filesystem**). Cloudinary stores them instead and hands you a URL on a **CDN**
(servers worldwide, so the image loads from near the user).

**How it's wired here.** This is **the best-engineered part of your codebase** and I want to say so
clearly.

```js
// multer.js — memoryStorage: hold the file in RAM, never write to disk
const storage = multer.memoryStorage();
limits: { fileSize: 5 * 1024 * 1024 },
fileFilter: (req, file, cb) => file.mimetype.startsWith('image/') ? cb(null,true) : cb(new Error(...), false)
```

Genuinely good things here:
- ✅ A **size limit**. Without it, a 4GB upload is a free denial-of-service.
- ✅ A **type filter**.
- ✅ **Lazy config** in `utils/cloudinary.js` with a clear error listing exactly which env var is
  missing. That's thoughtful.
- ✅ `publicIdFromUrl` handles legacy local filenames by returning `null` instead of crashing.
- ✅ `deleteImagesByUrl` is explicitly **best-effort** and never throws — an orphaned image is not a
  reason to fail the user's delete. That comment shows real judgement.

**The trade-off.** `memoryStorage` means a 5MB file occupies 5MB of RAM. With 100 concurrent
uploads that's 500MB. The alternative — **signed direct uploads**, where the browser uploads
straight to Cloudinary using a signature from your server — removes your server from the data path
entirely. That's what you'd do at scale.

**The gotchas.**

- ⚠️ **`mimetype` is client-supplied and trivially forged.** `file.mimetype` comes from the browser's
  `Content-Type` header. A malicious file can claim `image/png`. Real validation reads the file's
  **magic bytes** (the first few bytes of actual content). Cloudinary re-encodes images, which
  incidentally defuses most of this — but you should know your check is cosmetic.
- ⚠️ **Orphaned images on failure.** In `create-product`, if image 3 of 4 fails, images 1–2 are
  already uploaded and are never cleaned up. You pay for them forever.
- 🐛 **Dead legacy code.** `app.js:15` still has `app.use("/", express.static("uploads"))`, serving
  `backend/uploads/` — which currently contains **your personal desktop screenshots, committed to
  git**. Delete both the line and the directory.

📚 https://cloudinary.com/documentation/upload_images

## Integration 3: Nodemailer / SMTP — transactional email

**Plain words.** **SMTP** is the ancient protocol for sending mail. Nodemailer speaks it. You give it
a host, port, username and password and it hands your message to a mail server.

**How it's wired here.** `utils/sendMail.js` — a clean, minimal wrapper. Note `secure: true`, which
means implicit TLS on port 465. Correct.

**The trade-off.** Sending via a personal Gmail/SMTP account is free and takes five minutes. But
**deliverability** — whether the mail lands in the inbox instead of spam — is a genuinely hard
problem involving SPF, DKIM and DMARC records. Providers like SendGrid, Postmark, Resend or AWS SES
exist almost entirely to solve deliverability, plus they give you retries, bounce tracking and
templates.

**The gotchas.**

- 🚨 **The activation link contains the plaintext password.** Finding #9. Email is not confidential —
  treat it as a postcard.
- 🚨 **A failed email loses the signup entirely.** Because no DB row exists yet, if SMTP is down the
  user gets a 500 and their account simply never existed. Nothing to retry, nothing to resend.
- ⚠️ **A new SMTP connection per email.** `createTransport` runs on every call. Under load you want
  a pooled transport, or better, a background queue — sending mail inline makes your API response
  time depend on a third party's.
- ⚠️ **5-minute expiry is aggressive.** People do not check email in 5 minutes. Expect support
  tickets. 24 hours is typical.
- 🐛 **Hardcoded, mismatched URLs.** `user.js:44` points at `https://eShop.vercel.app` while
  `shop.js:57` points at `http://localhost:3000`. One of them is always wrong. This belongs in an
  env var (`FRONTEND_URL`).
- ℹ️ Note the env vars are spelled `SMPT_HOST`, `SMPT_MAIL` — that's a typo for SMTP, carried
  consistently. Harmless, but it will confuse the next person.

## Integration 4: Socket.IO — the realtime layer

**Plain words.** HTTP is a request-response protocol: the client asks, the server answers. The server
cannot start a conversation. For chat you need the server to push. **WebSocket** is a persistent
two-way pipe that stays open. **Socket.IO** is a library on top that adds automatic reconnection,
rooms, and a fallback to HTTP long-polling when WebSocket is blocked.

**How it's wired here.** A separate process on `:4000`, holding connected users in an array:

```js
// socket/index.js:29
let users = [];
const addUser = (userId, socketId) => { ... };   // called from the client
```

**The trade-off.** In-memory is fast, simple, and zero-dependency. It also means: **restart the
server and every user is disconnected with no memory of who was online**, and **you can never run
two instances**, because instance A doesn't know about instance B's users. The standard fix is the
**Redis adapter** (`@socket.io/redis-adapter`), which lets instances broadcast to each other.

**The gotchas.**

- 🚨 **Zero authentication.** `socket.on("addUser", (userId) => addUser(userId, socket.id))` —
  the client declares who it is and the server believes it. Emit `addUser` with a victim's ID and
  **you receive their incoming messages.** Socket.IO supports auth on the handshake
  (`io.use((socket, next) => ...)`) — verify the same JWT there.
- 🚨 **`io.emit("getUsers", users)` broadcasts every online user's ID to everybody.**
- 🐛 **The `messages` object is in the wrong scope.** `socket/index.js:57` declares
  `const messages = {}` **inside** the `io.on("connection")` callback — so every connected socket
  gets its own private, empty copy. `messageSeen` looks up messages in a map that will essentially
  always be empty. The read-receipt feature is broken by scope. Move it outside the callback (and
  really, put it in the database).
- ⚠️ **`io.to(user?.socketId)`** — the `?.` avoids a crash when the recipient is offline, but the
  message is then silently dropped. Offline users never get it, because the socket layer and the
  database layer don't talk.
- ⚠️ **Two sources of truth.** The API persists messages; the socket delivers them. Nothing
  reconciles the two. A message can be saved but never delivered, or delivered but never saved.

📚 https://socket.io/docs/v4/middlewares/ · https://socket.io/docs/v4/redis-adapter/

## Integration 5: MongoDB Atlas + Mongoose

**Plain words.** MongoDB stores JSON-like documents instead of rows and columns. **Atlas** is the
hosted version. **Mongoose** sits on top and adds schemas, validation and hooks — it puts some of
the structure back that MongoDB deliberately removed.

**How it's wired here.** `db/Database.js` is thoughtful — explicit timeouts, `maxPoolSize`, retry
with a cap, and reconnection event handlers. And `server.js` gets the startup order right and says why:

```js
// server.js — connect FIRST, then listen. The comment explains the reasoning.
await connectDatabase();
const server = app.listen(process.env.PORT, ...);
```

✅ That is genuinely correct and many tutorials get it wrong. Good.

**The trade-off — and this is the big architectural one.** Look at your schemas:

```js
// model/product.js
shop: { type: Object, required: true },   // the ENTIRE shop document, copied in

// model/order.js
cart: { type: Array },        // entire product documents, copied in
user: { type: Object },       // entire user document, copied in
```

This is **denormalisation** — deliberately duplicating data instead of storing a reference.

**When it's right:** an order *should* snapshot the price and address at purchase time. If the seller
raises the price tomorrow, the old order must not change. That's not a bug — that's correct
accounting, and it's the single best argument for document databases.

**When it's wrong:** `product.shop` embeds the whole shop. A seller renames their shop → every
product still shows the old name, forever. There is no update path. That data is now **permanently
stale**, and this is a real bug users will report.

**The rule:** snapshot things that must be frozen in time (order line items, prices, addresses).
Reference things that must stay current (the shop's display name). Right now you snapshot both.

**The gotchas.**

- 🚨 **`type: Object` and `type: Array` mean zero validation.** Mongoose will accept literally
  anything. Combined with `Product.create(req.body)` in `product.js:50` — where `req.body` is
  spread in wholesale — a client can write arbitrary fields into your documents. That's
  **mass assignment**, and it's Finding #10.
- 🚨 **`default: Date.now()` instead of `default: Date.now`.** Look carefully — with parentheses,
  the function runs **once, at server start**, and every document ever created gets that same
  frozen timestamp. Without parentheses, Mongoose calls it per-document. This appears in
  `model/shop.js`, `model/order.js` and `model/product.js`. `model/user.js:42` gets it **right**
  (`default: Date.now`). It's an easy fix and a wonderful interview anecdote.
- ⚠️ **NoSQL injection.** `User.findOne({ email })` where `email` is `req.body.email`. If a client
  sends `{"email": {"$ne": null}}` as JSON, that becomes `findOne({ email: { $ne: null } })` —
  which matches the first user in the collection. Mongoose's schema casting to `String` blocks this
  in most cases here, but the pattern is dangerous and you should know the shape of the attack.
- ⚠️ **No indexes** beyond the `unique: true` on email. `Product.find({ shopId })` does a full
  collection scan. Fine at 50 products, fatal at 500,000.
- ⚠️ **No pagination anywhere.** `GET /get-all-products` returns *everything*.
- ⚠️ **No transactions.** Creating orders for 3 shops = 3 separate `Order.create()` calls. If the
  second fails, the first is already committed. MongoDB supports multi-document transactions on
  replica sets (Atlas gives you one) — this is the textbook case for them.

📚 https://mongoosejs.com/docs/guide.html

---
---

# Part 6: Security Audit — What I Actually Found

**Ground rules for this section.** Every finding below was read out of your source, and I give you the
file and line so you can check me. I am not going to soften them. This is the section that will make
you a better engineer, and it is also the section a good interviewer will spend the most time on.

**Severity key:** 🔴 Critical (money or mass data loss) · 🟠 High (data breach or tampering) ·
🟡 Medium (weakens defences)

---

### 🔴 Finding #1 — Price tampering: buy anything for one cent

**Where:** `backend/controller/payment.js:11`

```js
const myPayment = await stripe.paymentIntents.create({
    amount: req.body.amount,     // ← comes straight from the browser
    currency: "usd",
});
```

**The attack.** No login needed. This endpoint is completely public.

```bash
curl -X POST http://localhost:8000/api/v2/payment/process \
     -H "Content-Type: application/json" \
     -d '{"amount": 50}'          # 50 cents. Cart could be worth $10,000.
```

Stripe charges 50¢, returns a genuinely-succeeded PaymentIntent, and `create-order` accepts it
because it also trusts the body. The order is real. The money is not.

**Why it exists.** The price is computed in `Checkout.jsx:100`, written to `localStorage`, and read
back in `Payment.jsx:31`. `localStorage` is a text file the user owns. Editing it is a two-second
job in DevTools.

**The fix — the principle, not just the patch:**

```js
router.post("/process", isAuthenticated, catchAsyncErrors(async (req, res, next) => {
    const { cartItems } = req.body;              // ONLY ids + quantities from the client

    let amount = 0;
    for (const line of cartItems) {
        const product = await Product.findById(line.productId);   // price from OUR database
        if (!product) return next(new ErrorHandler("Product not found", 404));
        if (product.stock < line.qty) return next(new ErrorHandler("Insufficient stock", 400));
        amount += product.discountPrice * line.qty;
    }
    // shipping and coupon discount also recomputed server-side

    const payment = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: "usd",
        metadata: { userId: req.user.id },        // so the webhook knows who paid
    }, { idempotencyKey: req.body.clientRequestId });
    ...
}));
```

**The rule to internalise:** *the client may say **what** it wants to buy. Only the server decides
**what it costs**.*

---

### 🔴 Finding #2 — Fake orders: get products without paying at all

**Where:** `backend/controller/order.js:13`

```js
router.post("/create-order", catchAsyncErrors(async (req, res, next) => {
    const { cart, shippingAddress, user, totalPrice, paymentInfo } = req.body;
```

No `isAuthenticated`. And **`paymentInfo` is supplied by the client.**

**The attack.** Skip Stripe entirely.

```bash
curl -X POST http://localhost:8000/api/v2/order/create-order \
  -H "Content-Type: application/json" \
  -d '{"cart":[...], "user":{"_id":"<any id>"}, "totalPrice": 0,
       "paymentInfo": {"id":"totally_fake","status":"succeeded","type":"Credit Card"}}'
```

An order appears in the seller's dashboard marked paid. They ship it. Nobody was ever charged.

Note also that `user` comes from the body — so you can place orders **as another person**, which
means you can also read them back via Finding #5.

**The fix.** Two changes, both non-negotiable:
1. Add `isAuthenticated` and take the buyer from `req.user`, never from the body.
2. **Verify the payment with Stripe server-side.** Either implement the webhook (correct), or at
   minimum `stripe.paymentIntents.retrieve(paymentInfo.id)` and check that `status === "succeeded"`
   **and** `amount` matches what you computed **and** that this PaymentIntent hasn't already been
   used for another order.

---

### 🟠 Finding #3 — Anyone can create products in anyone's shop

**Where:** `backend/controller/product.js:14` — `POST /create-product` has **no guard at all**.
It reads `req.body.shopId`, checks that the shop *exists*, and never checks that it's *yours*.

**The attack.** Post obscene or illegal listings under a competitor's shop. Or list a Rolex for $1
under a legitimate shop's name. `event.js:13` has the same flaw with a thinner disguise: it *does*
have `isSeller`, but still trusts `req.body.shopId` rather than `req.seller._id`.

**The fix.** `isSeller`, then **ignore the body's shopId entirely**:
`productData.shopId = req.seller._id;`

---

### 🟠 Finding #4 — BOLA: sellers can destroy each other's shops

**Where:** everywhere `isSeller` appears without an ownership check.

```js
// product.js:83
router.delete("/delete-shop-product/:id", isSeller, async (req, res, next) => {
    const productData = await Product.findById(req.params.id);
    // ← "is this product MINE?" is never asked
    await deleteImagesByUrl(productData.images);
    await Product.findByIdAndDelete(req.params.id);
```

**The attack.** Register as a seller (free, self-service). Read a competitor's product IDs from the
public `GET /get-all-products`. Delete every one of them — **including permanently destroying their
images in Cloudinary.** Repeat for events, coupons, and order statuses.

**Affected routes:** `delete-shop-product`, `delete-shop-event`, `delete-coupon`, `get-coupon/:id`,
`update-order-status`, `order-refund-success`, `get-all-conversation-seller/:id`,
`get-all-conversation-user/:id`.

**The fix — one line, everywhere:**

```js
if (product.shopId.toString() !== req.seller._id.toString()) {
    return next(new ErrorHandler("Not authorized", 403));
}
```

Better still, make it impossible to forget by making the query itself scoped:
`Product.findOneAndDelete({ _id: req.params.id, shopId: req.seller._id })`.

> **Big word alert — BOLA (Broken Object Level Authorization).** *"You're logged in, but is this
> particular object yours?"* **#1 on the OWASP API Security Top 10.** Also called **IDOR**
> (Insecure Direct Object Reference). It is the single most common serious API vulnerability in the
> world, and it is invisible in testing because you only ever test with your own data.
> 📚 https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/

---

### 🟠 Finding #5 — Read anyone's orders and any shop's revenue

**Where:** `order.js:61` and `order.js:82` — both fully public.

```
GET /api/v2/order/get-all-orders/:userId        → anyone's full purchase history + address
GET /api/v2/order/get-seller-all-orders/:shopId → any shop's complete sales figures
```

MongoDB ObjectIds are *not* secret — they're returned all over your public API. So this is trivially
exploitable, and it exposes **shipping addresses and phone numbers** (real-world safety issue) plus
**competitor revenue** (commercial harm).

**Also here:** `PUT /order-refund/:id` is public and does `order.status = req.body.status` with **no
validation of the string**. Anyone can set any order to any status, including nonsense values.
Status should be a Mongoose `enum`.

---

### 🟠 Finding #6 — Full PII disclosure on a public endpoint

**Where:** `backend/controller/user.js:378`

```js
router.get("/user-info/:id", catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    res.status(201).json({ success: true, user });   // the entire document
```

Returns name, email, phone, **and every saved shipping address**. The password is excluded only
because `select: false` in the schema — that's the schema saving you, not this code.

**The fix.** Require auth and return only what a public profile needs:
`User.findById(id).select("name avatar")`.

> **Big word alert — PII (Personally Identifiable Information).** Data that identifies a real person.
> Under GDPR/CCPA, leaking it is a *reportable* event with real fines. "It's just a side project"
> stops being a defence the moment a real person's real address is in the database.

---

### 🟠 Finding #7 — Coupon enumeration

**Where:** `couponCode.js:76` — `GET /get-coupon-value/:name`, public, unlimited.

A script can guess `SAVE10`, `SAVE20`, `WELCOME50`… at thousands of requests per second and harvest
every working discount code. Combine with Finding #1 and discounts stop mattering anyway, but fix
both. Needs rate limiting, and ideally coupons validated only at checkout against the actual cart.

---

### 🟠 Finding #8 — Plaintext passwords written to server logs

**Where:** `backend/controller/shop.js:19`

```js
console.log("[DEBUG] /create-shop hit — body:", req.body);   // req.body.password is plaintext
```

Logs get shipped to CloudWatch/Datadog/Papertrail, are readable by anyone on the team, are retained
for months, and are frequently the *least* protected system you own. Because people reuse passwords,
a leaked signup log is a credential-stuffing kit for other sites.

**Fix:** delete every `[DEBUG]` line in `shop.js`. Then use a real logger (`pino`, `winston`) with
field redaction so this can't happen by accident.

---

### 🟠 Finding #9 — Plaintext passwords inside the activation email link

**Where:** `controller/user.js:63` and `controller/shop.js:81`

```js
jwt.sign(user, process.env.ACTIVATION_SECRET, { expiresIn: "5m" });
// `user` still contains the raw password — hashing happens later, at User.create()
```

**A JWT payload is base64, not encryption.** Anyone who sees the link can read the password:
the mail sits in the mailbox forever, passes through relays in the clear, lands in browser history,
and leaks via the `Referer` header to any third-party script on your activation page.

**The fix — the clean version:** hash the password *before* signing the token.
`const hashed = await bcrypt.hash(password, 10);` then put `hashed` in the token and set it on the
model with `isModified` guarding the re-hash. Or better: store a pending record and put only a
random opaque ID in the link.

---

### 🟡 Finding #10 — Mass assignment

**Where:** `product.js:50` (`Product.create(productData)` where `productData = req.body`),
`event.js:45`, `couponCode.js:24` (`CoupounCode.create(req.body)`).

The client's whole JSON body is handed to the model. With `type: Object` fields accepting anything,
a crafted request can set `sold_out`, `ratings`, or inject arbitrary keys. Explicitly pick the fields
you accept — **allowlist, never blocklist.**

---

### 🟡 Finding #11 — No rate limiting anywhere

`POST /login-user` and `POST /login-shop` accept unlimited attempts. Combined with `minLength: 4` on
user passwords (`model/user.js:22`), a 4-character password is brute-forced in seconds.

**Fix:** `express-rate-limit` globally, tighter on auth routes. Raise the minimum to 8–12 and check
against a breached-password list (the "Have I Been Pwned" range API is free and doesn't send the
password). And note: **bcrypt cost 10 is the thing protecting you if the DB leaks** — that part
you got right.

---

### 🟡 Finding #12 — CSRF exposure from `SameSite=None`

`utils/jwtToken.js` sets `sameSite: "none"`, which tells the browser to attach your session cookie to
requests originating from *any* website. That's the setting that makes cross-origin cookies work in
dev — and it's also exactly what CSRF needs.

Your `cors()` config limits which origins can *read* responses, but a **simple request** (a form
POST, an `<img>` tag) still *reaches* your server with the cookie attached, even if the attacker
can't read the reply. For state-changing endpoints, that's enough.

**Fixes, in order of preference:** put frontend and API on the same site in production (then
`SameSite=Lax` works and the problem evaporates); or add a CSRF token; or require a custom header
(which forces a preflight your CORS config will reject).

> **Big word alert — CSRF (Cross-Site Request Forgery).** You're logged into your bank. You visit a
> malicious site. It silently submits a form to the bank. Your browser helpfully attaches your
> cookie. The bank sees a valid, authenticated request. The defence is proving the request came from
> *your* page — via a token the attacker cannot read, or via `SameSite`.

---

### 🟡 Finding #13 — Socket server has no authentication

Covered in [Integration 4](#integration-4-socketio--the-realtime-layer). `addUser` trusts a
client-declared ID; impersonation is a one-line change in the browser console. There's no origin
check on the HTTP side either (`app.use(cors())` with no options = allow everything).

---

### 🟡 Finding #14 — Missing baseline hardening

| Missing | Why it matters | Fix |
|---|---|---|
| `helmet` | No security headers (HSTS, X-Frame-Options, nosniff…) | `app.use(helmet())` |
| Input validation | Nothing validates types or shapes | `zod` or `express-validator` |
| Body size limit | `express.json()` has a 100kb default; `bodyParser.urlencoded` is set to **50mb** | Lower it |
| `mongo-sanitize` | `$`-prefixed keys reach queries | strip them |
| Stack trace hygiene | `middleware/error.js` returns `err.message` raw — Mongo errors can leak schema details | Generic message in production |
| Duplicate deps | **both `bcrypt` and `bcryptjs` installed**; only `bcryptjs` is used | Remove `bcrypt` |
| `node_modules` in git | **6,073 tracked files** — bloats the repo, and a compromised dependency is now permanent history | Add to `.gitignore`, `git rm -r --cached` |

✅ **Credit where due:** `backend/config/.env` **is** correctly gitignored. That's the one that
would have been genuinely unrecoverable, and you got it right.

---
---

# Part 7: Correctness Bugs Found While Reading

These aren't security holes — they're just *wrong*. Several will produce support tickets.

### 🐛 Bug #1 — Split orders each charge the full cart total

**Where:** `order.js:35`

```js
for (const [shopId, items] of shopItemsMap) {
    const order = await Order.create({
        cart: items,            // ← only this shop's items
        totalPrice,             // ← but the WHOLE cart's price
    });
}
```

Buy $50 from shop A and $50 from shop B. You get two orders, each recording `totalPrice: 100`.
Your books now say $200. And since the 10% commission is computed from `order.totalPrice`, **you pay
both sellers commission on money you never collected.** This is a direct financial bug.

**Fix:** compute a per-shop subtotal inside the loop and apportion shipping and discount across shops.

### 🐛 Bug #2 — Seller balance is overwritten, not accumulated

**Where:** `order.js:206`

```js
seller.availableBalance = amount;    // should be += amount
```

Every delivered order **replaces** the seller's balance instead of adding to it. Ten sales, and the
seller's balance is whatever the tenth one was.

The deeper fix: a running mutable balance is the wrong model for money. Real systems keep an
**append-only ledger** of transactions and *derive* the balance by summing it. Then you can audit,
reconcile and correct. `model/shop.js` already has a `transections` array — that's the right
instinct, but nothing writes to it.

### 🐛 Bug #3 — `forEach` with `async` doesn't wait for anything

**Where:** `order.js:158`, `order.js:189`, `order.js:255`

```js
order.cart.forEach(async (o) => {
    await updateOrder(o._id, o.qty);   // this await is meaningless to forEach
});
await order.save({ validateBeforeSave: false });   // runs BEFORE the updates finish
```

`Array.prototype.forEach` **ignores the promise its callback returns.** The loop fires all the
callbacks and moves on immediately. Consequences: the response is sent before stock is updated;
errors become unhandled rejections; and in `order-refund-success` the updates are kicked off
*after* `res.json()` has already been sent.

**Fix:** `for (const o of order.cart) { await updateOrder(o._id, o.qty); }` — or `Promise.all(map(...))`
for concurrency. This is one of the most common async mistakes in JavaScript and a frequent
interview question.

**Also here:** when status is `"Delivered"`, `updateOrder` runs **twice** (once via the
`"Transferred to delivery partner"` branch on a previous transition, once in the Delivered branch),
so stock can be double-decremented.

### 🐛 Bug #4 — Address editing is dead code

**Where:** `user.js:273`

```js
const exsistAddress = user.addresses.find((address) => address._id === req.body.id);
```

`address._id` is a Mongoose **ObjectId object**; `req.body.id` is a **string**. `===` on an object
and a string is *always* false. The edit branch never runs — every "edit" pushes a new address.

Except it usually doesn't even get there, because the check above it rejects any address whose
`addressType` already exists. So editing your "Home" address returns *"Address type already exists"*.

**Fix:** `address._id.toString() === req.body.id`, and move the duplicate-type check so it doesn't
block edits.

### 🐛 Bug #5 — Duplicate reviews (same ObjectId/string bug)

**Where:** `product.js:143` — `rev.user._id === req.user._id`. Same comparison mistake. The
"already reviewed?" check always says no, so a user can review the same product unlimited times,
each one dragging the average rating.

There's also no check that the reviewer **actually bought the product** — the `orderId` is accepted
from the body and never verified against the user.

### 🐛 Bug #6 — Shop activation issues a *user* cookie

**Where:** `shop.js:124` — `sendToken(seller, 201, res)` should be `sendShopToken(...)`.

Sets a cookie named `token` (the user cookie) containing a Shop ID. `isAuthenticated` then does
`User.findById(shopId)` → `null` → mysterious 500s. Full explanation in
[Part 4's token confusion section](#-the-token-confusion-bug).

### 🐛 Bug #7 — `findOne` given an ObjectId instead of a filter

**Where:** `shop.js:226` — `const shop = await Shop.findOne(req.seller._id);`

`findOne` expects a **filter object** (`{ _id: ... }`), not a bare ObjectId. This should be
`findById(req.seller._id)`. Depending on how Mongoose casts it, this either throws or returns the
wrong document — and this handler then **overwrites that document's name, address and phone.**
Worth testing immediately.

### 🐛 Bug #8 — `default: Date.now()` freezes the clock

**Where:** `model/shop.js`, `model/order.js`, `model/product.js` (multiple fields).

With the parentheses, `Date.now()` is evaluated **once when the file is loaded**, and every document
created for the lifetime of that process gets the same timestamp. Drop the parentheses:
`default: Date.now`. (`model/user.js:42` already does it correctly.)

---
---

# Part 8: Alternatives To Every Choice You Made

Knowing alternatives is what turns "I used MERN" into "I chose MERN, and here's what I gave up."

| You chose | Alternatives | The real trade-off |
|---|---|---|
| **MongoDB** | PostgreSQL, MySQL | Honestly? **Postgres was the better fit here.** E-commerce is deeply relational — orders→users→products→shops — and money needs transactions. Mongo's win is flexible schemas and easy snapshotting; you're using the snapshotting well, but paying for the missing joins and constraints. |
| **Mongoose** | Prisma, TypeORM, Drizzle, raw driver | Mongoose is the default and fine. Prisma gives generated types and would have caught several of the bugs above at compile time. |
| **Express** | Fastify, NestJS, Hono, Koa | Express is the lingua franca — max tutorials, max hireability. Fastify is ~2x faster with built-in schema validation. **NestJS would have forced structure**, and structure is what this codebase lacks — routes are defined inside controllers, and there's no service layer. |
| **JWT in cookies** | Server sessions + Redis; Auth0/Clerk/Supabase Auth | You built auth yourself, which is *great for learning* and **usually wrong in production**. Managed auth gives you MFA, OAuth logins, breach detection and password reset for free. Sessions would have given you real logout. |
| **Stripe** | PayPal, Razorpay, Paddle, Lemon Squeezy | Stripe has the best developer experience. **Paddle/Lemon Squeezy act as merchant of record** — they handle global sales tax/VAT for you, which is a genuinely huge deal for a marketplace and a thing most people don't know exists. |
| **Cloudinary** | S3 + CloudFront, Vercel Blob, UploadThing, imgix | Cloudinary bundles storage + CDN + transformation. S3 is far cheaper at volume but you assemble the pieces yourself. |
| **Socket.IO** | Raw WebSocket, SSE, Pusher, Ably, Supabase Realtime | **Server-Sent Events (SSE) deserve a look** — simpler, plain HTTP, auto-reconnect built in. They're one-directional, which is fine when clients send via normal POSTs. Pusher/Ably remove the scaling problem entirely. |
| **Redux Toolkit** | Zustand, Jotai, TanStack Query + `useState` | **This is the choice I'd most push back on.** Most of your Redux state is *server* data — products, events, orders. **TanStack Query** is purpose-built for that: caching, refetching, loading/error states, deduping — and it would delete most of `redux/actions/`. Redux is for genuine *client* state, like the cart. |
| **Create React App** | Vite, Next.js, Remix | **CRA is deprecated** — the React team no longer recommends it. Vite is dramatically faster. Next.js would give SSR, which for e-commerce means **SEO**, and SEO is how a shop gets customers. For a real store, Next.js is close to mandatory. |
| **Separate socket server** | Same process as the API | Splitting is right *eventually* (WebSockets and HTTP scale differently), but here it means the socket server has no access to your auth or DB — which is exactly why it has none. |
| **Plain JavaScript** | TypeScript | TypeScript would have caught Bugs #4, #5 and arguably #6 **at compile time**, for free. The ObjectId-vs-string comparison is precisely what a type system exists to prevent. |

---
---

# Part 9: Big Word Alerts — The Jargon Decoder

The rule: if you can't say it in one plain sentence, you don't own it yet.

| Term | Plain words | In your code |
|---|---|---|
| **Middleware** | A function that sees the request before the real handler and can stop it | `isAuthenticated`, `cors`, `express.json` |
| **Authentication** | Who are you? | `login-user` |
| **Authorization** | Are you allowed to touch *this*? | ❌ mostly absent |
| **BOLA / IDOR** | Logged in, but is this object yours? | Finding #4 |
| **CORS** | Browser rule: which *other* sites may call this API | `app.js:12` |
| **Preflight** | A silent `OPTIONS` request the browser sends first, asking permission | Fires on every PUT/DELETE you make |
| **CSRF** | Another site making your browser send an authenticated request | Finding #12 |
| **XSS** | Attacker's JavaScript running on your page | `httpOnly` is your defence |
| **httpOnly** | JavaScript can't read this cookie | `utils/jwtToken.js` |
| **SameSite** | Should the browser send this cookie on cross-site requests? | Set to `none` ⚠️ |
| **JWT** | Signed JSON. Tamper-proof, **not secret** | Both cookies |
| **Claim** | One field inside a JWT | `{ id: ... }` |
| **Stateless** | Server remembers nothing between requests | Why you can't log out |
| **Salt** | Random data mixed into a hash so identical passwords hash differently | bcrypt does it automatically |
| **Hashing vs Encryption** | Hashing is one-way (passwords). Encryption is reversible (secrets) | `bcrypt.hash` |
| **Rainbow table** | Precomputed hash lookup table — defeated by salting | — |
| **Idempotent** | Doing it twice has the same effect as once | ❌ your payment isn't |
| **Denormalisation** | Copying data instead of linking to it | `order.cart`, `product.shop` |
| **Mass assignment** | Letting the client set fields it shouldn't | Finding #10 |
| **Race condition** | Two things happen at once and the order matters | Coupon uniqueness check |
| **Optimistic UI** | Show success before the server confirms | Cart updates |
| **PII** | Data identifying a real person | Finding #6 |
| **PCI-DSS** | Card-industry security rules — why you use Stripe's iframe | `@stripe/react-stripe-js` |
| **Webhook** | *They* call *you* when something happens | ❌ missing — Finding #1 |
| **Ephemeral filesystem** | Server disk is wiped on redeploy | Why Cloudinary exists |
| **CDN** | Copies of files served from near the user | Cloudinary URLs |
| **Connection pool** | Reused DB connections | `maxPoolSize: 10` |
| **N+1 query** | One query, then one more per result | Watch for it as you add joins |
| **Merchant of record** | The company legally selling — handles tax | Paddle/Lemon Squeezy |
| **12-Factor App** | A checklist for cloud-friendly apps (config in env, etc.) | You follow ~4 of 12 |

---
---

# Part 10: The Honest Scorecard

## ✅ What is genuinely good

I'm not padding this list. These are real.

1. **`server.js` startup ordering.** Awaiting the DB before `listen()`, with a comment explaining
   *why* (Mongoose buffering vs. Atlas cold start). Many production apps get this wrong.
2. **`utils/cloudinary.js` is well-engineered.** Lazy configuration, an error message naming the
   exact missing variables, `publicIdFromUrl` gracefully handling legacy data, and `deleteImagesByUrl`
   explicitly never throwing because an orphaned image shouldn't fail a user's delete. That's
   professional judgement.
3. **Upload limits and type filtering exist** (`multer.js`). Most tutorials skip both.
4. **`bcrypt` with cost 10 and `select: false` on passwords.** The two things that matter most if
   your database ever leaks — and you got both right.
5. **`httpOnly` cookies.** The right instinct on session storage.
6. **Centralised error handling** with a custom `ErrorHandler` class and Mongoose-specific mappings
   (CastError, duplicate key, JWT errors). Clean.
7. **`.env` is correctly gitignored.** The one unrecoverable mistake, avoided.
8. **The order snapshot pattern** — freezing cart contents and price into the order — is genuinely
   correct design, whether or not it was deliberate.
9. **`bugLearnings.md`.** 25 chapters of systematic debugging. This is a stronger signal of
   engineering ability than the code itself, and you should link it in job applications.

## ❌ What is genuinely bad

1. **The trust boundary doesn't exist.** 19 of 41 routes are unauthenticated; 9 more check login but
   never ownership. This is one root cause, not 28 separate mistakes.
2. **Money is not verified.** No webhook, client-controlled amount, client-asserted payment status.
3. **Zero tests.** `npm test` literally exits 1. Every one of the bugs in Part 7 would have been
   caught by a modest test suite.
4. **Zero input validation.** No library, no schemas, `type: Object` everywhere.
5. **Debug code in committed source.** `[DEBUG]` logs printing passwords; a `// 3:33:47` video
   timestamp; `debug.txt`; ~35 orphaned files in `backend/tmp/`; personal screenshots in
   `backend/uploads/`; **6,073 `node_modules` files tracked in git.**
6. **No structure.** Routes are declared inside controllers, so there's no separation between
   routing, business logic and data access. At 250 lines per file it's manageable; at 1,000 it isn't.
7. **Hardcoded URLs** (`localhost:3000` in one place, a Vercel domain in another). It cannot deploy
   as-is.
8. **No pagination or indexes.** Works at demo scale, dies at real scale.

## ⚖️ The trade-offs you made (whether you knew it or not)

| You gained | You paid |
|---|---|
| Fast development | No validation, no tests |
| Stateless auth | No logout, no revocation |
| Client-side price calculation (snappy UI) | Anyone can pay $0.50 for anything |
| Denormalised documents (fast reads, correct order history) | Stale shop names, no way to update embedded copies |
| No webhooks (easy local dev) | No trustworthy record that payment happened |
| In-memory socket state (simple) | Cannot scale past one process; restart loses everything |
| Separate socket service | It has no access to auth or the database |
| Plain JavaScript (no build step) | Three real bugs a type system would have caught for free |

---
---

# Part 11: The Reading List

> ⚠️ **Verify these links.** I've given canonical URLs for stable, well-known resources, but URLs
> move. If one 404s, search the title — the *resources* are real even when a path changes.

### Read these first (in this order)

1. **OWASP API Security Top 10 (2023)** — https://owasp.org/API-Security/editions/2023/en/0x11-t10/
   Your codebase is a live specimen of #1 (BOLA), #2 (Broken Authentication), #3 (Broken Object
   Property Level Authorization) and #5 (Broken Function Level Authorization). Read it with your
   controllers open beside it. **This is the single highest-value item on this list.**

2. **PortSwigger Web Security Academy — Access Control** —
   https://portswigger.net/web-security/access-control
   Free, interactive, with labs you actually exploit. The fastest way to make Finding #4 *stick*.

3. **Stripe — Payment Intents & Webhooks** — https://docs.stripe.com/payments/payment-intents
   and https://docs.stripe.com/webhooks
   Read the webhook page and then re-read your `payment.js`. The gap will be obvious.

4. **"Stop using JWT for sessions"** — Sven Slootweg —
   http://cryto.net/~joepie91/blog/2016/06/13/stop-using-jwt-for-sessions/
   Deliberately contrarian, widely cited, and it names exactly your revocation problem. Read it
   *and* a rebuttal so you can argue both sides — which is what a senior engineer does.

5. **OWASP Cheat Sheet Series** — https://cheatsheetseries.owasp.org/
   Start with *Authentication*, *Session Management*, and *Cross-Site Request Forgery Prevention*.

### On the technologies you used

- **Express** — https://expressjs.com/en/guide/error-handling.html
  (the four-argument error handler rule, from the horse's mouth)
- **Mongoose** — https://mongoosejs.com/docs/guide.html and
  https://mongoosejs.com/docs/middleware.html
- **MongoDB data modelling** — https://www.mongodb.com/docs/manual/data-modeling/
  (embed vs. reference — directly relevant to your `product.shop` staleness bug)
- **Socket.IO middlewares & scaling** — https://socket.io/docs/v4/middlewares/ and
  https://socket.io/docs/v4/redis-adapter/
- **Redux Style Guide** — https://redux.js.org/style-guide/
- **TanStack Query** — https://tanstack.com/query/latest — read the "motivation" page and ask
  yourself how much of `redux/actions/` it would delete
- **MDN on cookies** — https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies
- **MDN on CORS** — https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
- **The Twelve-Factor App** — https://12factor.net/ — short, and it explains why hardcoded URLs hurt

### Specifications (read these when you want to be certain)

- **RFC 7519 — JSON Web Token** — https://datatracker.ietf.org/doc/html/rfc7519
- **RFC 6265 — HTTP Cookies** — https://datatracker.ietf.org/doc/html/rfc6265
- **RFC 9110 — HTTP Semantics** — https://datatracker.ietf.org/doc/html/rfc9110
  (this is where "GET must be safe" actually comes from — relevant to your `GET /shop/logout`)

### Books, ordered by when they'll help you

1. **"API Security in Action"** — Neil Madden (Manning). The single most relevant book to the
   problems in Part 6. If you read one, read this.
2. **"Web Application Security"** — Andrew Hoffman (O'Reilly). Gentler entry point.
3. **"Designing Data-Intensive Applications"** — Martin Kleppmann. The best systems book of the last
   decade. Chapters on replication, transactions and consistency will reframe how you see your
   order-splitting bug. Dense — read it slowly, over months.
4. **"Release It!"** — Michael Nygard. What actually breaks in production: timeouts, retries,
   cascading failures. Your `db/Database.js` retry loop is a beginner's version of this book.
5. **"The Pragmatic Programmer"** — Hunt & Thomas. On craft and habits.
6. **"Refactoring"** — Martin Fowler. When your controllers outgrow 300 lines.

### To go deeper on the concepts you're weakest on

- **Idempotency** — https://docs.stripe.com/api/idempotent_requests
- **Rate limiting algorithms** (token bucket vs. leaky bucket) — search those exact terms
- **Ledgers & double-entry bookkeeping for software** — search *"double-entry accounting for
  software engineers"*. This is the correct fix for Bug #2 and almost nobody in web dev knows it.

---
---

# Part 12: The Interview Gauntlet

Answer out loud. If you hesitate, that's your study list. Every answer references *your* code, so
crammed answers won't survive the follow-ups.

---

## 🟢 Level 1 — Basic (you should answer instantly)

**Q1. Walk me through what happens when a user logs in.**
> Browser POSTs email+password → `login-shop`/`login-user` → `User.findOne({email}).select("+password")`
> (the `+` is needed because the schema has `select: false`) → `bcrypt.compare` → `getJwtToken()` signs
> `{id}` with `JWT_SECRET` → `sendToken` sets an httpOnly cookie and returns the user.
>
> **Follow-up:** *Why `.select("+password")`?* Because `select: false` in the schema excludes it by
> default, so without the `+` your compare runs against `undefined`.
> **Follow-up:** *Why compare hashes instead of storing the password?* If the DB leaks, hashes can't
> be reversed. bcrypt is deliberately slow, so brute-forcing the leak is expensive.
> **Follow-up:** *What's a salt and where is yours?* Random bytes mixed in so identical passwords get
> different hashes, defeating rainbow tables. bcrypt embeds it in the hash string automatically —
> you never handle it.

**Q2. What is middleware? Name three in your app.**
> A function running between request and handler, with the power to stop the chain.
> `express.json()` (parses the body), `cookieParser()` (parses the Cookie header),
> `isAuthenticated` (verifies the JWT).
>
> **Follow-up:** *What happens if middleware doesn't call `next()` or send a response?* The request
> hangs until the client times out. Silent and nasty.
> **Follow-up:** *How does Express know `ErrorHandler` is an error handler?* **It takes four
> arguments.** Express inspects `fn.length`. Three = normal, four = error. Drop the unused `next`
> and your error handling silently dies.

**Q3. Why is `password` in the schema `select: false`?**
> So every query excludes it by default. It's fail-safe: a new endpoint that returns a user won't
> leak the hash because someone forgot. It's the reason Finding #6 leaks *only* email and addresses
> instead of the hash too.

**Q4. What does `withCredentials: true` do in your axios calls?**
> Tells the browser to attach cookies to a cross-origin request and to accept `Set-Cookie` back.
> Without it, your cookie is never sent and every protected route 401s. It also requires the server
> to send `Access-Control-Allow-Credentials: true` — that's the `credentials: true` in your `cors()`.
>
> **Follow-up:** *Why can't the server just use `origin: "*"` with credentials?* The spec forbids it.
> Wildcard origin and credentials are mutually exclusive — you must name the exact origin.

**Q5. What's the difference between `PUT` and `PATCH`? Which do you use?**
> `PUT` replaces the whole resource; `PATCH` updates part. You use `PUT` everywhere, including for
> partial updates like `update-user-password` — technically `PATCH` is more correct. Also
> `GET /shop/logout` is wrong: GET must be **safe** (no state change), because browsers and proxies
> prefetch GETs freely.

---

## 🟡 Level 2 — Intermediate

**Q6. Your JWT lives 5 days. A user's laptop is stolen. Log them out.**
> **I can't.** That's the honest answer, and it's the point of the question. The token is
> self-contained; the server holds no session record to delete. My options are to rotate
> `JWT_SECRET` (logging out *every* user) or wait 5 days.
>
> **Follow-up:** *So how do real systems do it?* Short-lived access token (5–15 min) plus a
> long-lived refresh token stored server-side. Logout deletes the refresh token; the access token
> expires on its own within minutes. You accept a small revocation window in exchange for keeping
> the common path stateless.
> **Follow-up:** *What else could you do?* A denylist of revoked token IDs (`jti` claim) in Redis —
> but that reintroduces a lookup per request, which was the reason to use JWTs in the first place.
> **That tension is the whole answer.**

**Q7. Explain `catchAsyncErrors`. Do you still need it?**
> It wraps a handler in `Promise.resolve(fn(...)).catch(next)` so a rejected async handler reaches
> Express's error middleware instead of becoming an unhandled rejection and a hung request.
>
> **Follow-up:** *Your `package.json` says Express 5. Does that change things?* Yes — **Express 5
> forwards rejected promises automatically**, so the wrapper is now largely redundant. It's harmless
> and keeps the code portable to v4, but I should know it's optional rather than magic.

**Q8. `order.cart.forEach(async (o) => { await updateOrder(...) })` — what's wrong?**
> `forEach` ignores the returned promise. It fires all callbacks and returns immediately, so the
> `await` doesn't hold anything up. The response is sent before stock updates land, and any error
> becomes an unhandled rejection.
>
> **Follow-up:** *Fix it two ways.* `for...of` with `await` (sequential, ordered);
> `await Promise.all(cart.map(o => updateOrder(...)))` (concurrent, faster, no ordering guarantee).
> **Follow-up:** *Which is right here?* `Promise.all` — the updates are independent. But if partial
> failure is unacceptable, neither is right and you need a transaction.

**Q9. What's denormalisation? Where does yours help and where does it hurt?**
> Copying data instead of referencing it. **Helps:** `order.cart` snapshots price and product at
> purchase time — if the seller raises the price tomorrow, the historical order is still correct.
> That's proper accounting. **Hurts:** `product.shop` embeds the whole shop document, so a shop
> rename leaves every product showing the old name forever, with no update path.
>
> **Follow-up:** *What's the rule?* Snapshot what must be frozen in time. Reference what must stay
> current. I currently snapshot both, which is the bug.

**Q10. Why doesn't your server ever see a credit card number?**
> Stripe's React components render the card fields inside an **iframe served by Stripe**. Same-origin
> policy means my JavaScript can't read inside it. The card goes browser → Stripe directly. I only
> handle a `client_secret` and a PaymentIntent ID.
>
> **Follow-up:** *Why does that matter commercially?* **PCI-DSS.** If card data touches my servers I
> inherit an enormous audit burden. The iframe keeps me in the lightest compliance tier. That's the
> actual product Stripe sells.

**Q11. Walk me through a CORS preflight.**
> For anything beyond a "simple" request — a `PUT`, or `Content-Type: application/json` — the
> browser first sends `OPTIONS` with `Access-Control-Request-Method`. My server replies with allowed
> origin/methods/headers and `Access-Control-Allow-Credentials`. Only then does the real request go.
>
> **Follow-up:** *Is CORS a security feature protecting my server?* **No — and this is the most
> misunderstood thing about CORS.** It protects *users*, and it's enforced *by the browser*. `curl`
> and Postman ignore it completely. CORS is not access control; it never was.

---

## 🔴 Level 3 — Hard (where the real signal is)

**Q12. I'm a hostile user. I want a $10,000 laptop for 50 cents. Walk me through it.**
> ```bash
> curl -X POST http://localhost:8000/api/v2/payment/process \
>      -H "Content-Type: application/json" -d '{"amount": 50}'
> ```
> No auth needed — `payment.js:11` charges `req.body.amount`. Stripe genuinely succeeds. Then I POST
> to `/order/create-order` — also unauthenticated — with the real cart and the real PaymentIntent ID.
> The order is created and looks perfectly legitimate.
>
> **Follow-up:** *Fix it.* The server recomputes the price from product IDs against its own database.
> The client only ever sends IDs and quantities.
> **Follow-up:** *That's still not enough. Why?* Because `create-order` trusts client-asserted
> `paymentInfo.status`. I need the **webhook**: Stripe tells my server directly that
> `payment_intent.succeeded`, and the order is created from *that*, not from the browser's word.
> **Follow-up:** *What if the user closes the tab after paying but before create-order?* Today: money
> taken, no order — an actual bug, no attacker needed. With webhooks it's fine, because Stripe's
> call doesn't depend on the browser still existing.
> **Follow-up:** *How do you make the webhook safe?* Verify the Stripe signature header (otherwise
> anyone can POST fake success events), and make the handler idempotent, because Stripe retries and
> may deliver the same event more than once.

**Q13. Two sellers. Can seller A hurt seller B?**
> Yes, badly. `isSeller` proves *a* seller is logged in and never checks *which*. From
> `product.js:83` I can delete any product by ID — and `deleteImagesByUrl` **permanently destroys
> their images in Cloudinary**. Product IDs are public via `GET /get-all-products`. I can also read
> and delete their coupons, read their conversation list, and change their order statuses.
>
> **Follow-up:** *What's this called?* **BOLA / IDOR** — #1 on the OWASP API Security Top 10.
> **Follow-up:** *Why is it so common?* Because it's invisible in testing. Developers only ever test
> with their own data, where ownership always happens to match.
> **Follow-up:** *How would you stop it structurally, not case by case?* Make the query itself
> scoped: `Product.findOneAndDelete({ _id: req.params.id, shopId: req.seller._id })`. Then forgetting
> the check is impossible because there's no unscoped path. Better still, a repository layer that
> takes the tenant ID as a required argument — so a developer *cannot* express an unscoped query.

**Q14. `jwt.verify(seller_token, JWT_SECRET)` succeeds. Are you sure it's a seller?**
> **No.** User and shop tokens use the *same secret* and the *same payload shape* (`{id}`). Nothing
> in the token says which it is. A user token pasted into a `seller_token` cookie verifies fine.
>
> **Follow-up:** *So why aren't you compromised?* Luck. `Shop.findById(userId)` returns `null`
> because no Shop shares an ObjectId with a User, and the request 500s. **I'm protected by an
> accident of ID allocation, not a security control.**
> **Follow-up:** *Show me where it already bites you.* `shop.js:124` calls `sendToken` instead of
> `sendShopToken`, so shop activation sets the *user* cookie containing a *shop* ID.
> **Follow-up:** *Fix it.* Put `role` in the token payload and check it in the guard. Or use separate
> secrets per token type. Ideally both, plus an `aud` (audience) claim — which is exactly what
> RFC 7519 defines audience claims for.

**Q15. Design the order flow properly. Cart spans three shops.**
> 1. Client POSTs cart **IDs and quantities only**.
> 2. Server loads each product, **verifies stock**, computes per-shop subtotals, shipping and any
>    coupon — all server-side.
> 3. Create a `PaymentIntent` for the true total, with an **idempotency key**, and `metadata`
>    carrying my internal order-group ID.
> 4. Persist a **pending** order group (status `awaiting_payment`), reserving stock.
> 5. Client confirms the card directly with Stripe.
> 6. **Stripe's webhook** hits my server → verify signature → find the order group by metadata →
>    mark paid → decrement stock → notify sellers.
> 7. Each shop's order carries **its own subtotal**, not the cart total, so commission is correct.
>
> **Follow-up:** *Where are the race conditions?* Two buyers, one last item. Stock check and stock
> decrement must be atomic — `findOneAndUpdate({_id, stock: {$gte: qty}}, {$inc: {stock: -qty}})`,
> which succeeds or matches nothing. A read-then-write loses.
> **Follow-up:** *What if step 6 partially fails?* This is why you want a MongoDB transaction across
> the order documents — or, if you can't, an idempotent webhook that can safely re-run.
> **Follow-up:** *What's wrong with your current split?* `order.js:35` writes the **full cart total**
> into each shop's order, so the books over-count and I pay commission on money I never collected.

**Q16. You have no logout, no revocation, and a 5-day token. Your `JWT_SECRET` leaks. What now?**
> Anyone can forge a token for any user or shop ID. Every account is compromised, including sellers.
> **Immediate:** rotate the secret — which force-logs-out every user, and is the correct call.
> **The deeper problem:** I have no way to detect this happened, because there's no session store,
> no audit log, and no anomaly detection. I'd only learn from the damage.
>
> **Follow-up:** *How would you have limited the blast radius?* Separate secrets per token type;
> short access tokens plus revocable refresh tokens; secrets in a managed secret store with rotation
> support rather than a `.env` file; and audit logging on privileged actions.

**Q17. Sell me on Postgres over MongoDB for this app.**
> E-commerce is relational: orders reference users, products reference shops, reviews reference both.
> I'm currently *embedding* those, which gives me the stale-shop-name bug with no fix.
> Postgres gives me **foreign keys** (an order can't reference a deleted product),
> **ACID transactions** across the order split (the exact thing Bug #1 and #3 need), **check
> constraints** (`stock >= 0` enforced by the database, not hopeful application code), and it's
> excellent with money via `NUMERIC` — no float rounding.
>
> **Follow-up:** *What would you lose?* Genuinely easy snapshotting of order line items — though
> Postgres has `JSONB`, so I'd keep it. And a bit of schema flexibility.
> **Follow-up:** *So was Mongo the wrong choice?* For a learning project, no — it removes friction so
> I could focus on the full stack. For a real marketplace handling money, **I'd choose Postgres**,
> and I can now say precisely why.

**Q18. Nothing here is tested. Where do you start, and why there?**
> Not with unit tests for `ErrorHandler`. I'd start with **integration tests on the money path**,
> because that's where the cost of a bug is highest: place an order end-to-end; assert the server
> ignores a tampered amount; assert seller A cannot delete seller B's product.
>
> **Follow-up:** *Those are security tests, not feature tests.* Deliberately. Every finding in Part 6
> converts directly into a regression test, and a security bug that comes back is far worse than a
> UI bug that comes back.
> **Follow-up:** *Tooling?* Jest or Vitest + Supertest against the Express app, with
> `mongodb-memory-server` so tests are hermetic and fast.
> **Follow-up:** *What percentage coverage?* Wrong question. Coverage measures lines executed, not
> behaviours verified. I'd rather have 20% coverage concentrated on payments and authorization than
> 90% spread evenly over getters.

---

## 🎯 The five questions I'd actually ask you

If I were interviewing you on this project, these are the ones I'd use — because they can't be
crammed.

1. **"Show me a place in this codebase where you made a trade-off, and tell me what you gave up."**
   *(Tests whether you know the difference between a decision and a default.)*
2. **"What's the worst bug in here? Not the one you fixed — the one still there."**
   *(Tests honesty and self-assessment. The right answer is Finding #1 or #2.)*
3. **"Something you did is genuinely good. What, and why?"**
   *(Tests calibration. `utils/cloudinary.js` and the `server.js` startup ordering are the answers.)*
4. **"Pick one thing you'd redo from scratch."**
   *(Tests growth. Good answers: TypeScript; TanStack Query instead of hand-rolled Redux thunks;
   drawing the trust boundary before writing a single route.)*
5. **"Teach me `catchAsyncErrors` as though I've never seen a promise."**
   *(The Feynman test. If you reach for jargon, you don't own it yet.)*

---
---

# Part 13: Fact-Check & Confidence Log

You asked me to fact-check myself. Here is where I'm certain, where I'm inferring, and where you
should verify before repeating anything.

### ✅ Verified directly from your source — high confidence

Every Finding in Part 6 and every Bug in Part 7 was read out of the files, at the line numbers cited.
The route inventory in Part 3 was built by reading all nine controllers. The claim that
**6,073 `node_modules` files are tracked in git** came from `git ls-files | grep -c node_modules`.
The claim that `backend/config/.env` **is** correctly ignored came from reading `.gitignore`.

### ⚠️ Verified logic, but **not executed** — please test

I read your code carefully; I did **not** run the server or exploit anything. Specifically:

- **The `curl` attacks in Findings #1, #2 and #5 are derived from reading the handlers.** They should
  work exactly as written, but **test them yourself against your own local instance** — that's both
  the responsible way to confirm a vulnerability and by far the best way to make the lesson stick.
- **Bug #7** (`Shop.findOne(req.seller._id)`) — I'm confident this is incorrect usage; I'm *not*
  certain whether Mongoose throws or silently returns a wrong document, since that depends on
  version-specific casting. Test it, because if it silently returns the wrong document this handler
  **overwrites a stranger's shop details.** Treat as urgent until you know.
- **The token confusion in Q14** — I reasoned that `Shop.findById(userId)` returns `null` because
  ObjectIds won't collide across collections. Correct in practice, but it's reasoning, not a test.

### 🤔 Inference, clearly labelled

- **"This is a learning project."** An inference from `bugLearnings.md`, the `// 3:33:47` timestamp,
  the `[DEBUG]` logs and `techdebt.txt`. Strongly supported, but it is a reading of evidence, not a
  fact you told me.
- **Which specific tutorial this follows** — I deliberately did not guess. The pattern is common to
  many MERN marketplace courses.

### 📌 Things I chose *not* to assert

- **I did not read `backend/config/.env`,** and I have not seen your keys. If any real credential
  was ever committed in earlier history, gitignoring it now does **not** remove it from history —
  check with `git log --all -- backend/config/.env` and rotate anything exposed.
- **Exact library version behaviours.** Your `package.json` pins Express 5.x, Mongoose 9.x,
  Stripe 22.x, React 19.x. My statements about Express 5 auto-handling async errors are drawn from
  Express 5's documented behaviour — verify against the docs for your exact installed version rather
  than taking my word.
- **Whether `sameSite: "none"; secure: true` works on your `http://localhost`.** Chrome treats
  localhost as a secure context and generally allows this; other browsers vary. I flagged it as a
  gotcha rather than asserting it breaks, because it evidently works for you today.

### ✏️ Where I may be wrong, and how you'd catch me

Read the file. Every claim has a line number precisely so you can check it in ten seconds. If you
find something in here that's wrong, **that's a good outcome** — it means you read the code more
carefully than I did, and that's the entire objective of this document.

---
---

# Part 14: What To Fix First

Ordered by *damage prevented per hour spent*. Don't jump to the fun refactors.

### 🔥 Before this touches the public internet

| # | Fix | Where | Effort |
|---|---|---|---|
| 1 | Recompute price server-side | `payment.js` | 1h |
| 2 | Add `isAuthenticated` to `create-order`; take user from `req.user` | `order.js:13` | 15m |
| 3 | Verify payment with Stripe (webhook, or at minimum `paymentIntents.retrieve`) | new file | 3h |
| 4 | Add ownership checks to all 9 BOLA routes | Finding #4 list | 2h |
| 5 | Auth + ownership on `get-all-orders`, `get-seller-all-orders`, `order-refund` | `order.js` | 30m |
| 6 | Delete the `[DEBUG]` logs printing passwords | `shop.js` | 5m |
| 7 | Hash the password before signing the activation token | `user.js`, `shop.js` | 30m |
| 8 | Auth on `/message/get-all-messages/:id` and `create-new-message` | `message.js` | 30m |
| 9 | Lock down `user-info/:id` | `user.js:378` | 5m |
| 10 | `git rm -r --cached node_modules`, add to `.gitignore` | root | 10m |

### ⚡ Next — correctness

| # | Fix | Where |
|---|---|---|
| 11 | Per-shop subtotal in split orders | `order.js:35` |
| 12 | `availableBalance += amount` — then move to a ledger | `order.js:206` |
| 13 | Replace `forEach(async)` with `for...of` / `Promise.all` | `order.js` ×3 |
| 14 | `.toString()` on the ObjectId comparisons | `user.js:273`, `product.js:143` |
| 15 | `sendShopToken` on shop activation | `shop.js:124` |
| 16 | `findById` not `findOne` | `shop.js:226` |
| 17 | `default: Date.now` (drop the parentheses) | 3 models |
| 18 | Role claim in JWT payload + check it in the guards | `model/*.js`, `middleware/auth.js` |
| 19 | Null check on `req.user` / `req.seller` after lookup | `middleware/auth.js` |

### 🛡️ Then — hardening

`helmet` · `express-rate-limit` (tight on auth) · `zod` validation on every route ·
raise the password minimum · `enum` on order status · pagination on list endpoints ·
indexes on `shopId` / `user._id` / `conversationId` · `FRONTEND_URL` env var replacing hardcoded
URLs · delete `backend/tmp/`, `backend/uploads/`, `debug.txt` · remove the unused `bcrypt` dependency.

### 🧪 Then — the thing that keeps it fixed

Integration tests on the money path and the authorization checks. **Every finding above becomes a
test.** That's how they stay fixed after you've forgotten why you wrote them.

### 🏗️ Only then — the refactors

Split routes out of controllers into a service layer · TypeScript · TanStack Query for server state ·
Socket.IO handshake auth + Redis adapter · migrate CRA → Vite (or Next.js if SEO matters).

---
---

## Closing note

The gap between this codebase and a production one is **not** knowledge of React or Express. You
clearly have that. It's a single habit:

> **Draw the trust boundary first. Everything from the far side is input, never fact.**

Internalise that one sentence and you re-read all nine controllers with different eyes — and you'll
find the holes in Part 6 yourself, before anyone else does.

The 25 chapters in [`bugLearnings.md`](bugLearnings.md) prove you can debug systematically, which is
the harder skill and the rarer one. This document is the other half: **auditing something that
appears to work.**

> *"Debugging is finding where the story went wrong. Auditing is noticing the story was never
> true to begin with."*

---

*Written by reading every controller, model, middleware and integration in this repository.
Line numbers were accurate at the time of writing — re-verify after refactoring.*
