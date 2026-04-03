import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  try {
    const { userId, email } = await request.json();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: email,
      metadata: { user_id: userId },
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: "SimInvest Premium",
              description: "Salve simulacoes, compare cenarios e exporte relatorios em PDF",
            },
            unit_amount: 1990,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `https://app-investimento.vercel.app/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://app-investimento.vercel.app/`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe error:", error);
    return NextResponse.json({ error: "Erro ao criar sessao de pagamento" }, { status: 500 });
  }
}
