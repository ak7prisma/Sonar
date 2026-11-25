import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  FormattedMathText,
  renderInlineMathAndMarkdown,
} from "@/components/document/FormattedMathText";

describe("FormattedMathText & KaTeX rendering", () => {
  it("renders headings from markdown hashes", () => {
    const text = "### Pertanyaan 1: Definisi Probabilitas";
    render(<FormattedMathText text={text} as="div" />);
    const heading = screen.getByRole("heading", { level: 3 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("Pertanyaan 1: Definisi Probabilitas");
  });

  it("renders bold, italic, and inline code properly", () => {
    const text = "Ini teks **tebal**, teks *miring*, dan `kode inline`.";
    render(<FormattedMathText text={text} as="div" />);
    expect(screen.getByText("tebal").tagName.toLowerCase()).toBe("strong");
    expect(screen.getByText("miring").tagName.toLowerCase()).toBe("em");
    expect(screen.getByText("kode inline").tagName.toLowerCase()).toBe("code");
  });

  it("renders inline LaTeX equations with KaTeX HTML", () => {
    const text = "Diberikan probabilitas $P(E)$ dan kejadian $A \\cap B$.";
    const { container } = render(<FormattedMathText text={text} as="div" />);
    const mathSpans = container.querySelectorAll(".inline-math-container");
    expect(mathSpans.length).toBe(2);
    expect(container.querySelector(".katex")).toBeInTheDocument();
  });

  it("renders display math equations ($$ ... $$) cleanly", () => {
    const text = "$$(A \\cap B) \\cup (A \\cap \\bar{B}) = A$$";
    const { container } = render(<FormattedMathText text={text} as="div" />);
    const displayMath = container.querySelector(".katex-display");
    expect(displayMath).toBeInTheDocument();
  });

  it("renders LaTeX environments such as \\begin{aligned} in display mode without error", () => {
    const text = "\\begin{aligned} x &= 1 \\\\ y &= 2 \\end{aligned}";
    const { container } = render(<FormattedMathText text={text} as="div" />);
    expect(container.querySelector(".katex-display")).toBeInTheDocument();
    expect(container.querySelector(".katex-error")).toBeNull();
  });

  it("separates glued horizontal rules and headings defensively", () => {
    const text =
      "melalui pembaca layar (*screen reader*). --- ### Pertanyaan 1: Definisi\n**Soal:** Apa itu $P$?";
    const { container } = render(<FormattedMathText text={text} as="div" />);
    expect(container.querySelector("hr")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
      "Pertanyaan 1: Definisi"
    );
    expect(screen.getByText("Soal:")).toBeInTheDocument();
  });

  it("renders bullet and numbered lists properly", () => {
    const text = "* Butir pertama\n* Butir kedua dengan $x = 10$\n* Butir ketiga";
    const { container } = render(<FormattedMathText text={text} as="div" />);
    const list = container.querySelector("ul");
    expect(list).toBeInTheDocument();
    const items = container.querySelectorAll("li");
    expect(items.length).toBe(3);
  });

  it("does not mistake ordinary currency for math", () => {
    const text = "Biaya langganan adalah $100 per tahun.";
    const { container } = render(<FormattedMathText text={text} as="div" />);
    expect(container.querySelector(".inline-math-container")).toBeNull();
    expect(screen.getByText(/Biaya langganan adalah/)).toBeInTheDocument();
  });
});
