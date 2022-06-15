import { test } from "@playwright/test"
import axios from "axios"

// Get Webhook URL from Discord channel
const discordWebhookURL = process.env.DISCORD_WEBHOOK_URL

test("anya", async ({ page }) => {
  const url =
    "https://www.uniqlo.com/th/en/products/E451868-000?colorCode=COL41"

  // Go to https://www.uniqlo.com/th/en/spl/ut/spy-x-family
  await page.goto("https://www.uniqlo.com/th/en/spl/ut/spy-x-family")

  // Click text=see this item >> nth=3
  await Promise.all([
    page.waitForNavigation({
      url,
      timeout: 5000,
    }),
    page
      .locator(
        ':text("see this item"):below(.title:has-text("MEN Spy x Family UT (Short Sleeve Graphic T-Shirt)"))'
      )
      .nth(3)
      .click(),
  ])

  // if page includes "This product is temporarily unavailable. Please try again later."

  // Click text=This product is temporarily unavailable. Please try again later.
  const unavailable = await page.locator(
    "text=This product is temporarily unavailable. Please try again later."
  )

  await unavailable.waitFor({ timeout: 1000 })

  if (await unavailable.isVisible()) {
    await axios(discordWebhookURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify({
        username: "Anya Shirt Tracker",
        content: `[${new Date().toLocaleString()}] หน้าเว็บยังเข้าไม่ได้เลย NOT ELEGANTO ${url}`,
      }),
    })

    return
  }

  // await page.screenshot({ path: "screenshot.png" })

  const sizes = ["XS", "S", "M", "L", "XL", "XXL"]

  const sizesAvailable = await Promise.all(
    sizes.map(async (size) => {
      const sizeEl = await page.locator(
        `[data-test="${size}"] input[type="radio"]`
      )
      return { size, available: !(await sizeEl.isDisabled()) }
    })
  )

  await page.screenshot({ path: "screenshot.png" })

  // https://birdie0.github.io/discord-webhooks-guide/discord_webhook.html
  const content = [
    `[${new Date().toLocaleString()}]`,
    "ไซส์เสื้อที่มี:",
    ...sizesAvailable.map(({ size, available }) => {
      return `${size} ${available ? "มี" : "ไม่มี"}`
    }),
    `ไปตำ -> ${url}`,
  ].join("\n")

  axios(discordWebhookURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: JSON.stringify({ username: "Anya Shirt Tracker", content }),
  })
})

test.skip("debug", async ({ page }) => {
  const url =
    "https://www.uniqlo.com/th/en/products/E445594-000?colorCode=COL50"

  await page.goto(url)

  const sizes = ["XS", "S", "M", "L", "XL", "XXL"]

  const sizesAvailable = await Promise.all(
    sizes.map(async (size) => {
      const sizeEl = await page.locator(
        `[data-test="${size}"] input[type="radio"]`
      )
      return { size, available: !(await sizeEl.isDisabled()) }
    })
  )

  await page.screenshot({ path: "screenshot.png" })

  // https://birdie0.github.io/discord-webhooks-guide/discord_webhook.html
  const content = [
    "ไซส์เสื้อที่มี:",
    ...sizesAvailable.map(({ size, available }) => {
      return `${size} ${available ? "มี" : "ไม่มี"}`
    }),
    `ไปตำ -> ${url}`,
  ].join("\n")

  axios(discordWebhookURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: JSON.stringify({ username: "Anya Shirt Tracker", content }),
  })
})
