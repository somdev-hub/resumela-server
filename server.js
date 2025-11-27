import express from "express";
import { exportResumePDF } from "./exportService.js";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Serve static files from the 'view' directory
app.use(express.static("view"));

app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "view" });
});

// PDF Export Endpoint
app.post("/export-pdf/:id", async (req, res) => {
  try {
    const resumeId = req.params.id;
    console.log(resumeId);

    const pdfBuffer = await exportResumePDF(resumeId);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=resume.pdf",
    });

    res.send(pdfBuffer);
  } catch (err) {
    console.error("PDF export failed:", err);
    res.status(500).send("PDF export failed");
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () =>
  console.log(`PDF export server running on port ${PORT}`)
);
