import puppeteer from "puppeteer";
import chromium from "@sparticuz/chromium";

export async function exportResumePDF(resumeId) {
  let browser;
  try {
    console.log("Generating PDF for resume ID:", resumeId);
    
    // Use sparticuz chromium for better compatibility on Render
    const isProduction = process.env.NODE_ENV === "production";
    
    if (isProduction) {
      browser = await puppeteer.launch({
        args: [...chromium.args, "--no-sandbox", "--disable-setuid-sandbox"],
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      });
    } else {
      browser = await puppeteer.launch();
    }

    const page = await browser.newPage();

    await page.goto(`${process.env.URL}/view/document/${resumeId}`, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    // Wait for the document content to render (adjust selector as needed)
    await page.waitForSelector("body", { timeout: 5000 }).catch(() => {
      console.log("Document selector not found, proceeding anyway");
    });

    // Additional wait to ensure all content is rendered
    await page.evaluate(() => {
      return new Promise((resolve) => {
        setTimeout(resolve, 2000);
      });
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
    });

    await browser.close();
    return pdfBuffer;
  } catch (error) {
    console.log("PDF Export Error:", error);
    return null;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
