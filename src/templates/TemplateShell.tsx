import { useId } from "react";
import type { ReactNode } from "react";
import "./templates.css";

type Props = {
  title: string;
  /** one sentence under the title: what the player does here */
  intro: string;
  children: ReactNode;
};

// The frame every template sits in: a titled panel that stacks its children
// with even gaps. Templates put primitives inside and nothing else.
export function TemplateShell({ title, intro, children }: Props) {
  const id = useId();
  return (
    <section className="rk-template" aria-labelledby={id}>
      <header className="rk-template__head">
        <h3 id={id}>{title}</h3>
        <p>{intro}</p>
      </header>
      {children}
    </section>
  );
}
