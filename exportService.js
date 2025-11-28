import puppeteer from "puppeteer-core";

export async function exportResumePDF(resumeId) {
  // Path to Chrome installed inside Docker
  const executablePath =
    process.env.CHROME_PATH || "/usr/bin/google-chrome-stable";

  const browser = await puppeteer.launch({
    executablePath,
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--no-zygote",
      "--no-first-run",
    ],
    defaultViewport: { width: 1240, height: 1754 },
  });

  const page = await browser.newPage();

  // Log browser console for debugging inside Docker
  page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));
  page.on("pageerror", (err) => console.error("PAGE ERROR:", err));

  const url = `${process.env.URL}/view/document/${resumeId}`;
  console.log("Rendering resume from:", url);

  // Load your resume page
  await page.goto(url, {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });

  // 👉 Prevent "Navigating frame was detached"
  await waitForStableRender(page);

  // 👉 Ensure all fonts load (Google fonts often need time)
  await page.evaluate(async () => {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
  });

  // Export PDF
  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "0px", right: "0px", bottom: "0px", left: "0px" },
    preferCSSPageSize: true,
  });

  await browser.close();
  return pdfBuffer;
}

/**
 * Wait until DOM stops changing for 500ms.
 * (Fixes: "Navigating frame was detached")
 */
async function waitForStableRender(page, timeout = 30000) {
  await page.waitForFunction(
    () =>
      new Promise((resolve) => {
        let last = document.body.innerHTML.length;
        let stableMs = 0;
        const interval = 50;
        const requiredStable = 500;

        const check = () => {
          const now = document.body.innerHTML.length;
          if (now === last) stableMs += interval;
          else {
            last = now;
            stableMs = 0;
          }
          if (stableMs >= requiredStable) resolve(true);
          else setTimeout(check, interval);
        };

        check();
      }),
    { timeout }
  );
}
