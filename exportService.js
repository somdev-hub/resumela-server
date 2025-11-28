import puppeteer from "puppeteer-core";

export async function exportResumePDF(resumeId) {
  const executablePath = await chromium.executablePath();

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
  });

  const page = await browser.newPage();

  await page.goto(`${process.env.URL}/view/document/${resumeId}`, {
    waitUntil: "domcontentloaded",
  });

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
}
