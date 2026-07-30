import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export interface ExtractedDocument {
  filename: string;
  title: string;
  text: string;
  pageCount: number;
  pages: string[];
}

export async function extractPdf(file: File): Promise<ExtractedDocument> {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

  let text = "";
  const pages: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item: any) => item.str).join(" ");
    pages.push(pageText);
    text += pageText + "\n";
  }

  return {
    filename: file.name,
    title: file.name.replace(/\.pdf$/i, ""),
    text,
    pageCount: pdf.numPages,
    pages,
  };
}