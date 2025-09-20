import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { message, planName, price } = await request.json()

    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.error("Telegram credentials not configured")
      return NextResponse.json({ error: "Telegram integration not configured" }, { status: 500 })
    }

    const telegramMessage = `🛒 *নতুন অর্ডার রিকুয়েস্ট*

📦 *প্যাকেজ:* ${planName}
💰 *মূল্য:* ${price}
⏰ *সময়:* ${new Date().toLocaleString("bn-BD", { timeZone: "Asia/Dhaka" })}

📋 *বিস্তারিত:*
${message}

✅ গ্রাহকের সাথে যোগাযোগ করুন এবং পেমেন্ট প্রসেস করুন।`

    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`

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

    if (!response.ok) {
      const errorData = await response.text()
      console.error("Telegram API error:", errorData)
      throw new Error(`Telegram API error: ${response.status}`)
    }

    const result = await response.json()

    return NextResponse.json({
      success: true,
      message: "Order notification sent successfully",
      telegramResponse: result,
    })
  } catch (error) {
    console.error("Error sending to Telegram:", error)
    return NextResponse.json(
      {
        error: "Failed to send notification",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
