# 🔄 Redux, Explained — Your Setup Specifically

### Why this file exists, in one sentence

Your Redux setup is **unusual**, anyone who knows modern Redux Toolkit will notice within ten seconds,
and a piecemeal answer will sound like you copied a tutorial. This file makes it sound like a choice
you can defend — and then lands on the three bugs it caused, which is the part that actually impresses.

---

## §B.0 The orientation paragraph — memorise this verbatim

> *"It's Redux Toolkit's `configureStore` with seven `createReducer` slices, but written in a
> pre-`createSlice` style: the reducers match on **raw string literals**, and the async work lives in
> **hand-written thunks** in `redux/actions/`, each dispatching a Request → Success → Fail triple. No
> `createSlice`, no `createAsyncThunk`. It works, I can explain every line of it — and I can tell you
> the three bugs that this exact style caused."*

Lead with the description. **Land on the bugs.** The bugs are the payload, because anyone can describe
their own code; only someone who read it critically can tell you how its style hurt them.

---

## §B.1 What Redux is — one action, traced end to end

**Kernel** — a single store holding immutable state, changed only by dispatching plain action objects,
reduced by pure functions. One direction, no exceptions:

```
Component → dispatch(action) → middleware → reducer(state, action) → new state → useSelector re-renders
```

**Now trace it through Add to Cart. Rehearse this until it's 60 seconds flat — it is the single most
likely question you will get.**

| # | File:line | What happens |
|---|---|---|
| 1 | `components/Route/ProductCard/ProductCard.jsx:27` | `const dispatch = useDispatch()` |
| 2 | `:55-56` | `const cartData = { ...data, qty: 1 }` then `dispatch(addToCart(cartData))` |
| 3 | `redux/actions/cart.js:5` | The thunk. It's a **function**, not an object — so the thunk middleware intercepts it instead of handing it to the reducers |
| 4 | `redux/actions/cart.js:6-9` | The thunk dispatches the plain object `{ type: "addToCart", payload: data }` |
| 5 | `redux/reducers/cart.js:18-28` | The matching `addCase` runs; `state.cart.push(item)` at `:27` |
| 6 | `redux/store.js:16` | The new slice state lands under the `cart` key |
| 7 | `redux/actions/cart.js:11-14` | **Back in the thunk**, `getState().cart.cart` reads the *already-updated* store and mirrors it to `localStorage` |
| 8 | `components/cart/Cart.jsx:14` | `useSelector((state) => state.cart)` fires and the drawer re-renders |

**Emphasise step 7.** It works because **dispatch is synchronous** — by the time `dispatch()` returns,
the reducer has already run, so `getState()` sees the new value. That's a real insight about Redux's
execution model, not a recitation of its glossary.

**Follow-up** — *"Why must reducers be pure?"* So the same action always produces the same state: that
enables time-travel debugging, replay, and trivially testable state logic. It's also why I/O can't live
in a reducer — which is exactly why thunks exist (§B.6).

---

## §B.2 Why this app needs Redux — and where it doesn't

**Kernel** — Redux earns its place when state is (a) needed by distant, unrelated components and
(b) fetched once but read many times.

**Where it's genuinely justified** — auth state is read at five wildly different tree depths:

| Reader | File:line |
|---|---|
| The global loading gate | `App.jsx:37-38` |
| The header (avatar, cart badge) | `components/Layout/Header.jsx:23-24` |
| The user route guard | `routes/ProtectedRoute.js:8` |
| The seller route guard | `routes/SellerProtectedRoute.js:6` |
| The profile screen | `components/Profile/ProfileContent.jsx:29` |

Prop-drilling that through `BrowserRouter` → `Routes` → `Route` → page → component is not viable. Same
argument for `cart` and `wishlist`: written in `ProductCard`, read in `Header`, `Cart`, `Checkout` and
`Payment`.

**Where it is *not* justified — and saying this is what makes you stand out.**

`products`, `event` and `order` are just **cached server responses**, re-fetched globally on every mount
at `App.jsx:51-52`. That is RTK Query's or React Query's job. Redux is being used here as a bad HTTP
cache with no staleness policy, no request de-duplication and no invalidation — which is precisely why
`components/Shop/AllProducts.jsx:25` calls `window.location.reload()` after deleting a product. **A full
page reload is standing in for cache invalidation.**

**What you got right** — local UI state was correctly kept **out** of the store: all seven `useState`
calls in `components/Layout/Header.jsx:28-34` stay local, where they belong.

**The framing** — *"The answer they want is the boundary, not the enthusiasm."* A junior who says
**"I'd put less in Redux, not more"** sounds like someone who has maintained an app, not just built one.

**Follow-up** — *"Why not Context instead?"* Context is a dependency-injection mechanism, not a state
manager: every consumer re-renders on any change, there's no middleware layer for async, and no
devtools. It's right for a theme or a locale, wrong for a cart.

---

## §B.3 What Redux Toolkit adds over classic Redux

Four things, each with what you'd have had to write without it:

| RTK gives you | Without it you'd write | In this repo |
|---|---|---|
| `configureStore` | `createStore(combineReducers({...}), applyMiddleware(thunk), composeWithDevTools())` | `redux/store.js:10-20` — 11 lines |
| `createReducer` / `createSlice` | a `switch (action.type)` returning hand-spread state | `redux/reducers/product.js:13-71` — 20 cases, zero `switch`, zero spreads |
| **Immer** | `{ ...state, cart: [...state.cart, item] }` | `redux/reducers/cart.js:27` — `state.cart.push(item)` |
| `createAsyncThunk` | the Request/Success/Fail triple by hand | 🔴 **not used** — see §B.6 |

**Say this explicitly, because it's the question behind the question:** `configureStore` **bundles
`redux-thunk` by default**. That is the only reason the thunks in `redux/actions/*.js` work despite
`store.js` configuring no middleware at all. It also gives you Redux DevTools and, in development,
automatic immutability and serializability checks.

It's also why `redux-thunk` was a redundant dependency in `package.json` — now removed, along with a
package literally named `redux-toolkit`, which is a name-squat on the real `@reduxjs/toolkit`.

---

## §B.4 Immer — why `state.cart.push()` is legal here

**Kernel** — Immer hands your reducer a **Proxy draft**. You write mutations; the proxy records them
and produces a brand-new immutable object using **structural sharing** — untouched subtrees keep the
same reference, so `useSelector`'s reference comparisons stay cheap. **You are not mutating the store.
You are mutating a scratch copy.**

**In this repo** — `redux/reducers/cart.js:27` (`state.cart.push(item)`) and
`redux/reducers/wishlist.js:19`. Both would be **illegal** in a plain Redux reducer and are correct here.

**Three rules, because they are the follow-ups:**

1. **Mutate or return — never both.** Every case in this repo mutates and returns nothing. Correct. If
   you mutate the draft *and* return a new object, Immer throws.
2. **Immer only drafts what `createReducer`/`createSlice` hands you.** Outside a reducer, store objects
   are genuinely frozen — which is why `components/Route/FeaturedProduct/FeaturedProduct.jsx:8` spreads
   into `[...array]` before shuffling in place at `:11`. Same codebase, opposite rule, both right.
3. **You cannot write through optional chaining.** `state?.x = v` is a **syntax error**.

**And rule 3 is already documented in your own words.** `redux/reducers/product.js:7-11`:

> ```
> // 🧠 Why no state?.property here?
> // Redux Toolkit uses Immer under the hood — it GUARANTEES state is never null/undefined.
> // Optional chaining (?.) is for READING: "if this exists, read from it"
> // You cannot WRITE through optional chaining: state?.x = value is INVALID syntax.
> ```

**Quote that comment in the interview.** Nothing sounds more lived-in than citing a note you left for
your past self.

---

## §B.5 `createReducer` vs `createSlice`

| | `createReducer(initialState, builder)` | `createSlice({ name, initialState, reducers })` |
|---|---|---|
| Produces | a reducer function | reducer **+ auto-generated action creators + the type strings** |
| Action types | you supply them | derived as `"sliceName/reducerName"` |
| Matching | `.addCase`, `.addMatcher`, `.addDefaultCase` | keys of `reducers`; `extraReducers` for foreign actions |
| Best for | reacting to actions owned elsewhere | owning a slice of state end to end |

**This repo uses `createReducer` in all seven reducers**, matched on bare strings —
`reducers/user.js:9`, `reducers/product.js:16`, `reducers/event.js:16`, `reducers/order.js:12`, `reducers/seller.js:13`, `reducers/wishlist.js:11`.

### The one exception, and it's fascinating — have this ready

`redux/reducers/cart.js:2,5,6` imports **`createAction`** and creates `addToCart` / `removeFromCart`,
then passes those *creators* to `addCase` at `:18` and `:30`.

It works. But **those exported creators are never imported anywhere.** `components/cart/Cart.jsx:8` and
`ProductCard.jsx:16` both import `addToCart` from `redux/actions/cart` — the **thunk** — not from the
reducer.

**So why does it work at all?** Because `createAction("addToCart")` produces a creator whose `.type` is
the literal string `"addToCart"`; `addCase(creator, ...)` registers under `creator.type`; and the thunk
at `redux/actions/cart.js:7` hand-writes `type: "addToCart"`.

**Say this sentence out loud in the interview:**

> *"The two agree by coincidence of spelling, not by shared reference."*

It demonstrates you understand that `addCase` keys on **strings** underneath, and it sets up §B.7
perfectly. Also name the hazard: there are two different exported symbols called `addToCart` in two
files — one a thunk, one an action creator — and nothing stops you importing the wrong one.

---

## §B.6 Thunks — what they are, and why async needs middleware

**Kernel** — a reducer must be pure and synchronous, so it cannot do I/O. And `dispatch` only accepts
plain objects. The thunk middleware widens that contract: **if you dispatch a function, the middleware
calls it with `(dispatch, getState)` instead of forwarding it to the reducers.** That gives you a place
to `await`, then dispatch real actions with the results.

**The shape** — `redux/actions/user.js:6`:
```js
export const loadUser = () => async (dispatch) => { ... }
```
Outer function takes your arguments, inner takes `(dispatch, getState)`. Two arrows, and that is the
entire mechanism. (It's also the closure answer — `fundamentals.md` Q4. One prepared answer, two questions.)

### The Request/Success/Fail triple — and what each one is actually for

- `actions/user.js:8` dispatches `"LoadUserRequest"` → `reducers/user.js:9-11` sets `loading = true`
  → `App.jsx:55` shows `<Loader/>` and `routes/ProtectedRoute.js:10` **refuses to redirect while loading**.

**This is why the triple exists.** Without a `loading` flag, `ProtectedRoute` would see
`isAuthenticated === false` on first paint — before `loadUser()` has resolved — and **bounce every
logged-in user to `/login`**. Your own comment at `reducers/seller.js:6` names this exact race:

> `loading: true, // Start with loading true to prevent premature redirects`

- `:14-17` Success → `reducers/user.js:12-16` sets the user and `isAuthenticated = true`
- `:18-23` Fail → `reducers/user.js:17-21` sets the error

`getState` is used by only the cart and wishlist thunks (`actions/cart.js:13`, `actions/wishlist.js:10`), for
the localStorage mirror. Note the odd parameter name `dispatchEvent` at `actions/cart.js:5` — it
shadows the DOM global. It's just a positional argument so it works, but it's confusing and worth
flagging as a cleanup.

### What `createAsyncThunk` would replace — all of it

It generates `pending`/`fulfilled`/`rejected` types for you, handles the try/catch, gives you
`rejectWithValue`, and — the part that matters most here — **derives the type strings so they cannot
drift**. Which is §B.7.

Roughly 151 lines in `actions/user.js` plus 66 in `reducers/user.js` collapse to about half, with the
string-matching failure mode eliminated **by construction**.

---

## §B.7 The three bugs raw-string matching caused — *the payoff*

All three verified by grep. Present them as a numbered list: this is the strongest sixty seconds
available to you on this topic.

### 1. A one-character typo that silently swallows an error

```
actions/product.js:49   dispatch({ type: "getAllProductsShopFailed", ... })
reducers/product.js:41  .addCase("getAllProductShopFailed", ...)
```

**One `s`.** Nothing matches. And crucially, **nothing throws** — because in RTK an unhandled action is
a perfectly legal no-op. So `isLoading` stays `true` forever and the shop's product page spins with no
error message, no console warning, nothing to debug.

`createSlice` makes this **unrepresentable**, because it generates both sides from one name.

### 2. An action nobody handles

`components/Profile/ProfileContent.jsx:44` dispatches `{ type: "clearMessages" }`. Grep the entire
frontend for `"clearMessages"`: **exactly one hit — that line.** No reducer anywhere handles it. A dead
dispatch that looks like working code.

### 3. A state key that doesn't exist

`ProfileContent.jsx:29` selects `successMessage` from `state.user`:
```js
const { user, error, successMessage } = useSelector((state) => state.user);
```
But `reducers/user.js:43` and `:56` write **`state.message`**:
```js
state.message = action.payload.successMessage;
```
The store has `message`; the component reads `successMessage`. So `:42`'s `if (successMessage)` is
**always false** and the "address updated successfully" toast **never fires** — even though the thunk at
`actions/user.js:115` dutifully sends the string. Three files agreeing on a concept and disagreeing on
a name.

### Bonus: two dead reducer branches

`reducers/seller.js:31` and `:38` handle `"LoginSellerSuccess"` / `"LoginSellerFail"`. Grep confirms
**nothing dispatches either.** Because `components/Shop/ShopLogin.jsx:21-31` bypasses Redux entirely:
raw `axios.post`, then `navigate("/dashboard")` and `window.location.reload(true)` at `:28`. The full
reload remounts `App`, which re-runs `loadSeller()` at `App.jsx:50`, which dispatches
`LoadSellerSuccess` instead. Identical story in `components/Login/Login.jsx:27`.

**The reload is doing Redux's job.** That's the thread connecting §B.7 to §B.8.

---

## §B.8 localStorage mirroring — and exactly why it desyncs

> **This is the sharpest thing in your entire prep. It's a bug, its own workaround, and the reason
> nobody noticed — all in three lines of code.**

### How it's supposed to work — a three-legged loop

1. **Read on boot** — `reducers/cart.js:10-13`: `initialState` is computed by reading
   `localStorage.getItem("cartItems")` **at module evaluation time** — once, when `store.js:3` imports
   the reducer. Same at `reducers/wishlist.js:4-7`.
2. **Write on change** — `actions/cart.js:11-14`: after dispatching, the thunk reads
   `getState().cart.cart` and writes it back.
3. **Result** — refresh the page and your cart survives.

### Why it breaks

`components/Payment/Payment.jsx:93`, `:143` and `:173` all do this:

```js
localStorage.setItem("cartItems", JSON.stringify([]));
```

**They write to localStorage without dispatching anything.** Leg 2 is run in reverse and leg 1 is
skipped entirely. At that instant:

| | Value |
|---|---|
| `localStorage.cartItems` | `[]` |
| `store.getState().cart.cart` | **still the full cart** |
| `components/Layout/Header.jsx:26` badge | **still shows items** |

Redux is the source of truth for the UI. localStorage is read **once, on boot**. Writing to the mirror
never propagates back.

### Why nobody noticed

The very next line — `Payment.jsx:95`, `:145`, `:175` — is:

```js
window.location.reload();
```

The full page reload destroys the store, re-imports `reducers/cart.js`, and re-runs its `initialState`
read, which now finds the empty array. **The bug is masked by a page refresh that throws away the
entire single-page app.** Delete that one line and the cart badge stays populated after checkout.

### The fix, stated plainly

Dispatch a `"clearCart"` action, add the `addCase` to `reducers/cart.js`, and let the existing
thunk-side mirror write `[]` to localStorage **as a consequence**. Then delete all three
`window.location.reload()` calls.

> **Data flows one way: store first, mirror second, never the reverse.**

Same class of bug at `Payment.jsx:94,144,174` for `latestOrder` — which is written at
`components/Checkout/Checkout.jsx:53` and read back at `Payment.jsx:29`. An entire checkout step is
passed between routes through localStorage instead of through the store or router state, which also
means the price is editable in devtools before you click Pay (see `project_understanding.md` Finding #1).

---

## §B.9 "What I'd do differently" — the honest close

Ordered by impact. Each one is a single sentence you can deliver without hedging.

1. **Convert all seven reducers to `createSlice`.** Kills the entire class of typo bugs in §B.7 by
   generating the type strings instead of hand-writing them twice.
2. **Convert the 13 thunks to `createAsyncThunk`.** Deletes the hand-rolled triple and every duplicated
   try/catch, and standardises error extraction — fixing the `error.response.data.message` crash
   (`fundamentals.md` Q12) in **one** place instead of eighteen.
3. **Move `products` / `event` / `order` to RTK Query.** They're server cache, not client state. That
   also deletes the `window.location.reload()` calls by giving me real cache invalidation.
4. **One `clearCart` action; delete the direct localStorage writes.** Fixes §B.8 properly.
5. **Replace the manual mirroring with a single store subscriber or `redux-persist`**, so persistence is
   one concern in one place instead of scattered across four thunks and three components.
6. **Rename `state.message` → `successMessage`** (or fix the selector), and delete the dead
   `clearMessages` dispatch and the two dead `LoginSeller*` cases.
7. **Add memoised selectors only after measuring.** The store is small and the app has one `useMemo`
   total; memoising now would be cargo cult.

### The sentence to end on

> *"The style I used is basically Redux circa 2019 wearing RTK's clothes. It taught me what
> `createSlice` is actually doing for me, which is why I can tell you exactly which bugs it would have
> prevented."*

That reframes the whole unusual setup as **deliberate learning** rather than ignorance — and unlike most
things a candidate says about their own growth, you can prove it by pointing at three specific bugs.

---

## 📇 Quick reference

| Concept | File:line |
|---|---|
| Store config, 7 reducers | `redux/store.js:10-20` |
| A reducer (string-matched) | `redux/reducers/user.js:9` |
| The `createAction` exception | `redux/reducers/cart.js:2,5,6,18,30` |
| Immer mutation | `redux/reducers/cart.js:27` |
| Your own Immer comment | `redux/reducers/product.js:7-11` |
| A thunk (two arrows) | `redux/actions/user.js:6` |
| `getState` for the mirror | `redux/actions/cart.js:13` |
| The `loading`-race comment | `redux/reducers/seller.js:6` |
| 🔴 The typo bug | `actions/product.js:49` vs `reducers/product.js:41` |
| 🔴 Dead dispatch | `ProfileContent.jsx:44` |
| 🔴 `message` vs `successMessage` | `ProfileContent.jsx:29` vs `reducers/user.js:43` |
| 🔴 The localStorage desync | `Payment.jsx:93,143,173` + `:95,145,175` |

---

*Companion volumes: `fundamentals.md` (JS/React/Node/Mongo) · `project_understanding.md` (architecture
and security audit) · `bugLearnings.md` (25 bug post-mortems) · `README.md` (the product tour).*
