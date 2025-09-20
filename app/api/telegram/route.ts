import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Telegram API called")
    const { message, planName, price } = await request.json()
    console.log("[v0] Request data:", { message, planName, price })

    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

    console.log("[v0] Environment check:", {
      hasToken: !!TELEGRAM_BOT_TOKEN,
      hasChatId: !!TELEGRAM_CHAT_ID,
    })

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.error("[v0] Telegram credentials not configured")
      return NextResponse.json(
        {
          error:
            "Telegram integration not configured. Please set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID environment variables.",
        },
        { status: 500 },
      )
    }

    const telegramMessage = `🛒 *নতুন অর্ডার রিকুয়েস্ট*

📦 *প্যাকেজ:* ${planName}
💰 *মূল্য:* ${price}
⏰ *সময়:* ${new Date().toLocaleString("bn-BD", { timeZone: "Asia/Dhaka" })}

📋 *বিস্তারিত:*
${message}

✅ গ্রাহকের সাথে যোগাযোগ করুন এবং পেমেন্ট প্রসেস করুন।`

    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`
    console.log("[v0] Sending to Telegram URL:", telegramUrl.replace(TELEGRAM_BOT_TOKEN, "***"))

    const response = await fetch(telegramUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: telegramMessage,
        parse_mode: "Markdown",
      }),
    })

    console.log("[v0] Telegram response status:", response.status)

    if (!response.ok) {
      const errorData = await response.text()
      console.error("[v0] Telegram API error:", errorData)
      return NextResponse.json(
        {
          error: `Telegram API error: ${response.status}. ${errorData}`,
        },
        { status: 500 },
      )
    }

    const result = await response.json()
    console.log("[v0] Telegram success:", result)

    return NextResponse.json({
      success: true,
      message: "Order notification sent successfully",
      telegramResponse: result,
    })
  } catch (error) {
    console.error("[v0] Error sending to Telegram:", error)
    return NextResponse.json(
      {
        error: "Failed to send notification",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
