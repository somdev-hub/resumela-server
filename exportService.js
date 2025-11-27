import puppeteer from "puppeteer";

export async function exportResumePDF(resumeId) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox"],
  });

  const page = await browser.newPage();

  // Set A4 viewport (96 DPI)
  await page.setViewport({
    width: 1240, // A4 width at 96 DPI
    height: 1754, // A4 height
    deviceScaleFactor: 1,
  });

  try {
    // Pass resume JSON into the page
    await page.goto(`${process.env.URL}/${resumeId}`, {
      waitUntil: "domcontentloaded",
    });

    page.on("console", (msg) => console.log("PAGE LOG:", msg));
    page.on("pageerror", (err) => console.log("PAGE ERROR:", err));
    page.on("requestfailed", (req) =>
      console.log("REQUEST FAILED:", req.url(), req.failure())
    );

    // Wait for a specific element to ensure the page is fully rendered
    // await page.waitForSelector(".resume-preview", { timeout: 30000 });

    // Export PDF using Chrome's native engine
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "0px",
        right: "0px",
        bottom: "0px",
        left: "0px",
      },
      preferCSSPageSize: true,
    });

    await browser.close();

    return pdfBuffer;
  } catch (error) {
    console.error("PDF export failed:", error);
    await browser.close();
    throw error;
  }
}
