/**
 * S10 — "How Our Tree Removal Service Works", the four steps.
 *
 * The source holds the four steps TWICE with byte-identical text but different
 * order: desktop reads 1,2,3,4 and mobile reads 1,3,2,4 with a graphic wedged
 * between. Order is layout, so this renders them once, in order, at every width.
 *
 * process.h1a is 'How Our Tree' with NO trailing space, so the two heading parts
 * only make sense as separate lines — hence `stacked`.
 */

import { SafeText } from '../../../components/Safe';
import { Section, SplitHeading, type Copy } from './shared';

const STEPS = [1, 2, 3, 4];

export function Process({ copy }: { copy: Copy }) {
  const steps = STEPS.map((n) => ({
    label: copy(`process.step${n}.label`),
    heading: copy(`process.step${n}.h2`),
    body: copy(`process.step${n}.body`),
  })).filter((step) => (step.label + step.heading + step.body).trim());

  return (
    <Section tone="tint" className="ra-process">
      <div className="ra-measure ra-measure--center">
        <SplitHeading as="h2" className="ra-h2" parts={[copy('process.h1a'), copy('process.h1b')]} stacked />
      </div>

      {steps.length > 0 && (
        <ol className="ra-steps">
          {steps.map((step, i) => (
            <li className="ra-step" key={i}>
              <SafeText as="span" className="ra-step-label" value={step.label} />
              <SafeText as="h3" className="ra-step-h" value={step.heading} />
              <SafeText as="p" className="ra-step-body" value={step.body} />
            </li>
          ))}
        </ol>
      )}
    </Section>
  );
}
