import { useState } from "react";
import usage from "../../tokens/motion-usage.json";
import { duration, easing, motionMs } from "../tokens/generated";

type Beat = {
  beat: string;
  what: string;
  property: string;
  duration: string;
  easing: string;
  delay: (string | number)[][];
  stagger?: string;
  sequence?: boolean;
};

const beatsOf = (component: (typeof usage.components)[number]) => component.beats as Beat[];
const startOf = (b: Beat) => b.delay.reduce((t, [token, factor]) => t + motionMs[token as string] * (factor as number), 0);
const curveCss = (name: string) =>
  name === "linear" ? "linear" : `cubic-bezier(${easing[name as keyof typeof easing].join(", ")})`;
const short = (token: string) => token.replace("motion.", "");

const DURATIONS = Object.entries(duration) as [string, number][];
const LONGEST = Math.max(...DURATIONS.map(([, ms]) => ms));
const CURVES = Object.entries(easing) as [string, readonly number[]][];

/** One easing curve drawn in a 100 x 100 box; time runs right, progress runs up. */
function CurvePlot({ curve }: { curve: readonly number[] }) {
  const [x1, y1, x2, y2] = curve;
  const y = (v: number) => 100 - v * 100;
  return (
    <svg className="curve__plot" viewBox="-8 -40 116 156" aria-hidden="true">
      <path className="curve__frame" d="M0 0 V100 H100" />
      <path className="curve__guide" d="M0 100 L100 0" />
      <path className="curve__line" d={`M0 100 C${x1 * 100} ${y(y1)} ${x2 * 100} ${y(y2)} 100 0`} />
    </svg>
  );
}

function Timeline({ beats }: { beats: Beat[] }) {
  const end = Math.max(...beats.map((b) => startOf(b) + motionMs[b.duration]));
  const ticks = Array.from({ length: Math.floor(end / 400) + 1 }, (_, i) => i * 400);
  const pct = (ms: number) => `${(ms / end) * 100}%`;
  return (
    <div className="timeline">
      <div className="timeline__rows">
        {beats.map((b) => (
          <div className="timeline__row" key={b.beat}>
            <span className="timeline__name">{b.beat}</span>
            <div className="timeline__track">
              <div
                className="timeline__bar"
                style={{ left: pct(startOf(b)), width: pct(motionMs[b.duration]) }}
                title={`${b.beat}: starts ${Math.round(startOf(b))} ms, lasts ${motionMs[b.duration]} ms`}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="timeline__axis" aria-hidden="true">
        <span className="timeline__name" />
        <div className="timeline__track">
          {ticks.map((t) => (
            <span key={t} className="timeline__tick" style={{ left: pct(t) }}>
              {t} ms
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MotionSpec() {
  const [played, setPlayed] = useState(false);

  return (
    <>
      <section aria-labelledby="motion-title">
        <h2 id="motion-title">Motion spec</h2>
        <p className="muted">
          Every value below is read from the motion tokens, and the build fails if this page and the code disagree. Brands cannot change
          any of it. The same spec is written to <code>docs/MOTION.md</code> for engineers.
        </p>
        <p className="muted">
          With reduced motion switched on in the system settings, every animation here is off and each element shows its end state at
          once.
        </p>
      </section>

      <section aria-labelledby="dur-title">
        <h3 id="dur-title">Durations</h3>
        <p className="muted">Interface feedback uses the three short ones. Reward moments use slow, celebrate and count.</p>
        <div className="durations">
          {DURATIONS.map(([name, ms]) => (
            <div className="durations__row" key={name}>
              <code>duration.{name}</code>
              <div className="durations__track">
                <div className="durations__bar" style={{ width: `${(ms / LONGEST) * 100}%` }} />
              </div>
              <span className="num">{ms} ms</span>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="curve-title">
        <div className="trio__head">
          <div>
            <h3 id="curve-title">Curves</h3>
            <p className="muted">Time runs left to right, progress bottom to top. The dotted line is constant speed.</p>
          </div>
          <button className="rk-button" onClick={() => setPlayed((p) => !p)}>
            Play all four
          </button>
        </div>
        <div className="curves">
          {CURVES.map(([name, curve]) => (
            <div className="curve" key={name}>
              <CurvePlot curve={curve} />
              <div className="curve__body">
                <h4>{name}</h4>
                <code>{curveCss(name)}</code>
                <div className="curve__runway">
                  <span
                    className="curve__dot"
                    data-played={played}
                    style={{ transitionTimingFunction: curveCss(name) }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {usage.components.map((component) => {
        const beats = beatsOf(component);
        const sequence = beats.filter((b) => b.sequence);
        return (
          <section key={component.name} aria-label={component.name}>
            <h3>{component.name}</h3>
            <p className="muted">
              Trigger: {component.trigger}. Source: <code>{component.file}</code>
            </p>
            {sequence.length > 1 && <Timeline beats={sequence} />}
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Beat</th>
                    <th>What happens</th>
                    <th>Property</th>
                    <th>Starts at</th>
                    <th>Duration</th>
                    <th>Curve</th>
                    <th>Token</th>
                  </tr>
                </thead>
                <tbody>
                  {beats.map((b) => (
                    <tr key={b.beat}>
                      <th scope="row">{b.beat}</th>
                      <td>{b.what}</td>
                      <td>{b.property}</td>
                      <td className="num">
                        {Math.round(startOf(b))} ms
                        {b.stagger && ` +${motionMs[b.stagger]} ms each`}
                      </td>
                      <td className="num">{motionMs[b.duration]} ms</td>
                      <td>{b.easing}</td>
                      <td>
                        <code>{short(b.duration)}</code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </>
  );
}
