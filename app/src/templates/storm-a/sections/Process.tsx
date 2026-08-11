/**
 * How storm response works — four steps on one timeline. The connector is a
 * pseudo-element gradient, so it costs no markup, no image and no request. Blank
 * steps drop out; an all-blank section hides itself (R5).
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
    <Section tone="tint" className="st-process">
      <div className="st-head">
        <Eyebrow>{copy('process.eyebrow')}</Eyebrow>
        <Heading as="h2" className="st-h2" parts={[copy('process.h2a'), copy('process.h2b')]} />
      </div>

      <ol className="st-steps">
        {steps.map((step, i) => (
          <li className="st-step" key={i}>
            <span className="st-step-dot" aria-hidden="true">
              {i + 1}
            </span>
            <SafeText as="span" className="st-step-label" value={step.label} />
            <SafeText as="h3" className="st-step-h" value={step.heading} />
            <SafeText as="p" className="st-step-body" value={step.body} />
          </li>
        ))}
      </ol>
    </Section>
  );
}
