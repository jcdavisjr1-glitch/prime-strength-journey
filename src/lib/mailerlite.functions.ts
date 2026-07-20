import { createServerFn } from "@tanstack/react-start";

export const subscribeToFreePlan = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string }) => {
    const email = String(data?.email ?? "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      throw new Error("Please enter a valid email address.");
    }
    return { email };
  })
  .handler(async ({ data }) => {
    const apiKey = process.env.MAILERLITE_API_KEY;
    const groupId = process.env.MAILERLITE_FREE_PLAN_GROUP_ID;
    if (!apiKey || !groupId) {
      return { ok: false as const, error: "Email signup is temporarily unavailable." };
    }

    try {
      const res = await fetch("https://connect.mailerlite.com/api/subscribers", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          groups: [groupId],
          status: "active",
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        console.error(`MailerLite subscribe failed [${res.status}]: ${body}`);
        return { ok: false as const, error: "Something went wrong. Please try again." };
      }
      return { ok: true as const };
    } catch (err) {
      console.error("MailerLite subscribe error", err);
      return { ok: false as const, error: "Something went wrong. Please try again." };
    }
  });
