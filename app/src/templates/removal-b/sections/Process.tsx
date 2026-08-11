/**
 * S7 — how it works, as a connected timeline.
 *
 * removal-a renders the same four beats as four equal cards in a row. Here they are
 * a single line the eye travels along — a rail on desktop, a spine on a phone —
 * because this variant's argument is that nothing surprising happens in the middle,
 * and a continuous line says that better than four separate boxes do.
 *
 * The connector is drawn with a pseudo-element and a gradient, so it costs no
 * markup, no image and no request.
 */

import { SafeText } from '../../../components/Safe';
import { Eyebrow, Heading, Section, type Copy } from './shared';

const STEPS = [1, 2, 3, 4];

export function Process({ copy }: { copy: Copy }) {
  const steps = STEPS.map((n) => ({
    label: copy(`process.step${n}.label`),
    heading: copy(`process.step${n}.h`),
    body: copy(`process.step${n}.body`),
  })).filter((step) => (step.label + step.heading + step.body).trim());

  if (steps.length === 0) return null;

  return (
    <Section tone="paper" className="rb-process">
      <div className="rb-head rb-rise">
        <Eyebrow>{copy('process.eyebrow')}</Eyebrow>
        <Heading as="h2" className="rb-h2" parts={[copy('process.h2a'), copy('process.h2b')]} />
      </div>

      <ol className="rb-steps">
        {steps.map((step, i) => (
          <li className="rb-step rb-rise" key={i}>
            <span className="rb-step-dot" aria-hidden="true">
              {i + 1}
            </span>
            <SafeText as="span" className="rb-step-label" value={step.label} />
            <SafeText as="h3" className="rb-step-h" value={step.heading} />
            <SafeText as="p" className="rb-step-body" value={step.body} />
          </li>
        ))}
      </ol>
    </Section>
  );
}
