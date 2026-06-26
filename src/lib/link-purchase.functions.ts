import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  type StripeEnv,
  createStripeClient,
  getStripeErrorMessage,
} from "@/lib/stripe.server";

/**
 * After a user creates their account post-checkout, link the Stripe session's
 * purchase/subscription record to their new user_id. The webhook may have run
 * before the account existed (so no row), or may have run with no userId
 * metadata; either way, we backfill here using service-role writes.
 */
export const linkCheckoutToUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { sessionId: string; environment: StripeEnv }) => {
    if (!/^[a-zA-Z0-9_]+$/.test(data.sessionId)) throw new Error("Invalid sessionId");
    if (data.environment !== "sandbox" && data.environment !== "live") {
      throw new Error("Invalid environment");
    }
    return data;
  })
  .handler(async ({ data, context }) => {
    const { userId } = context;
    try {
      const stripe = createStripeClient(data.environment);
      const session = await stripe.checkout.sessions.retrieve(data.sessionId, {
        expand: ["line_items.data.price", "subscription"],
      });

      const customerId =
        typeof session.customer === "string"
          ? session.customer
          : session.customer?.id;

      // Tag the Stripe customer with the userId so future events carry it.
      if (customerId) {
        try {
          await stripe.customers.update(customerId, {
            metadata: { userId },
          });
        } catch {
          // non-fatal
        }
      }

      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      if (session.mode === "subscription") {
        const subId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;
        if (!subId) return { ok: true };

        const subscription = await stripe.subscriptions.retrieve(subId);
        // Stamp userId on the subscription too so webhook updates carry it.
        try {
          await stripe.subscriptions.update(subId, {
            metadata: { ...(subscription.metadata ?? {}), userId },
          });
        } catch {}

        const item = subscription.items?.data?.[0];
        const priceId =
          item?.price?.lookup_key ||
          (item?.price?.metadata as Record<string, string> | undefined)?.lovable_external_id ||
          item?.price?.id;
        const productId =
          typeof item?.price?.product === "string"
            ? item?.price?.product
            : item?.price?.product?.id;
        const periodStart =
          (item as { current_period_start?: number } | undefined)?.current_period_start ??
          (subscription as { current_period_start?: number }).current_period_start;
        const periodEnd =
          (item as { current_period_end?: number } | undefined)?.current_period_end ??
          (subscription as { current_period_end?: number }).current_period_end;

        await supabaseAdmin.from("subscriptions").upsert(
          {
            user_id: userId,
            stripe_subscription_id: subscription.id,
            stripe_customer_id: customerId ?? "",
            product_id: productId ?? "unknown",
            price_id: priceId ?? "unknown",
            status: subscription.status,
            current_period_start: periodStart
              ? new Date(periodStart * 1000).toISOString()
              : null,
            current_period_end: periodEnd
              ? new Date(periodEnd * 1000).toISOString()
              : null,
            environment: data.environment,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "stripe_subscription_id" },
        );
      } else if (session.mode === "payment") {
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
          limit: 1,
          expand: ["data.price"],
        });
        const lineItem = lineItems.data[0];
        const priceId =
          lineItem?.price?.lookup_key ||
          (lineItem?.price?.metadata as Record<string, string> | undefined)
            ?.lovable_external_id ||
          lineItem?.price?.id;
        const productId =
          typeof lineItem?.price?.product === "string"
            ? lineItem?.price?.product
            : lineItem?.price?.product?.id;

        await supabaseAdmin.from("one_time_purchases").upsert(
          {
            user_id: userId,
            stripe_session_id: session.id,
            stripe_customer_id: customerId ?? "",
            product_id: productId ?? "unknown",
            price_id: priceId ?? "unknown",
            amount_cents: session.amount_total ?? 0,
            currency: session.currency ?? "usd",
            environment: data.environment,
            grants_lifetime_access: priceId === "single_onetime",
          },
          { onConflict: "stripe_session_id" },
        );
      }

      // Add to mailing list
      const email =
        session.customer_details?.email ?? session.customer_email ?? null;
      if (email) {
        await supabaseAdmin.from("mailing_list").upsert(
          {
            user_id: userId,
            email,
            source: session.mode === "subscription" ? "subscription" : "purchase",
            subscribed: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "email" },
        );
      }

      return { ok: true };
    } catch (error) {
      return { ok: false, error: getStripeErrorMessage(error) };
    }
  });
