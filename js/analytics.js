/**
 * analytics.js — Kodai Hills Spot
 *
 * Tracks: site visits, product views, add-to-cart,
 *         buy-button clicks, Instagram clicks.
 *
 * Firestore collections used:
 *   analytics_visits        { timestamp, sessionId, page }
 *   analytics_product_views { timestamp, productId, productName, userId? }
 *   analytics_cart_adds     { timestamp, productId, productName, userId? }
 *   analytics_buy_clicks    { timestamp, productId, productName, userId? }
 *   analytics_insta         { timestamp, userId? }
 *
 * Usage — import in any page's <script type="module">:
 *
 *   import { trackVisit, trackProductView,
 *            trackCartAdd, trackBuyClick,
 *            trackInstaClick } from "./analytics.js";
 *
 *   // On page load:
 *   trackVisit();
 *
 *   // When user views a product:
 *   trackProductView(product.id, product.name);
 *
 *   // When user taps "Add to Cart":
 *   trackCartAdd(product.id, product.name, user?.uid);
 *
 *   // When user taps "Buy Now":
 *   trackBuyClick(product.id, product.name, user?.uid);
 *
 *   // When user taps Instagram link:
 *   trackInstaClick(user?.uid);
 */

import { db } from "./firebase.js";
import { collection, addDoc, serverTimestamp } from
  "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

/* ── Silently fire-and-forget — never breaks the page ── */
async function track(col, data) {
  try {
    await addDoc(collection(db, col), {
      timestamp: serverTimestamp(),
      ...data,
    });
  } catch (e) {
    // Analytics errors must never disrupt user flow
    console.warn("[analytics] failed to track:", col, e.message);
  }
}

/* ── Session ID (persists per browser tab session) ── */
function getSessionId() {
  if (!sessionStorage.getItem("khs_sid")) {
    sessionStorage.setItem("khs_sid", Math.random().toString(36).slice(2));
  }
  return sessionStorage.getItem("khs_sid");
}

/* ── Deduplicate visits: only 1 per session per page ── */
const _trackedVisit = new Set();

/**
 * trackVisit(page?)
 * Call once on every customer-facing page load.
 * Only records one visit per browser session per page.
 */
export function trackVisit(page = location.pathname) {
  const key = `visit:${page}:${getSessionId()}`;
  if (_trackedVisit.has(key)) return;
  _trackedVisit.add(key);
  track("analytics_visits", { sessionId: getSessionId(), page });
}

/**
 * trackProductView(productId, productName, userId?)
 * Call when a product card becomes visible or product detail opens.
 */
const _trackedViews = new Set();
export function trackProductView(productId, productName, userId = null) {
  const key = `view:${productId}:${getSessionId()}`;
  if (_trackedViews.has(key)) return; // once per session per product
  _trackedViews.add(key);
  track("analytics_product_views", {
    productId,
    productName: productName || productId,
    ...(userId ? { userId } : {}),
  });
}

/**
 * trackCartAdd(productId, productName, userId?)
 * Call when user taps "Add to Cart".
 * NOT deduplicated — every add is counted.
 */
export function trackCartAdd(productId, productName, userId = null) {
  track("analytics_cart_adds", {
    productId,
    productName: productName || productId,
    ...(userId ? { userId } : {}),
  });
}

/**
 * trackBuyClick(productId, productName, userId?)
 * Call when user taps "Buy Now" button.
 */
export function trackBuyClick(productId, productName, userId = null) {
  track("analytics_buy_clicks", {
    productId,
    productName: productName || productId,
    ...(userId ? { userId } : {}),
  });
}

/**
 * trackInstaClick(userId?)
 * Call when user taps any Instagram link.
 */
export function trackInstaClick(userId = null) {
  track("analytics_insta", {
    ...(userId ? { userId } : {}),
  });
}
