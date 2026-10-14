import { Wizard } from "@/components/wizard/Wizard";

// The wizard lives in the layout so its state survives step changes.
// Each step is its own URL (/build/county) for titles and the Back button.
// /build itself shows the first step, so links to it start the questions.
export default function BuildLayout({ children }: LayoutProps<"/build">) {
  return (
    <>
      <Wizard />
      {children}
    </>
  );
}
