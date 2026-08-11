/**
 * S9 — "How Our Tree / Trimming Service Works", the four steps.
 *
 * The source authors the four steps TWICE, with byte-identical strings and a
 * different DOM order: the mobile row reads 1,2,3,4 and the desktop row reads
 * 1,3,(connector image),2,4 because it splits them either side of a tall vertical
 * graphic. One of those two copies of the connector graphic sits in a
 * breakpoint-contradictory container and never renders at all.
 *
 * Order is layout, so this renders the steps ONCE, in order, at every width, and
 * draws the connector in CSS rather than shipping a 312x3832 PNG for it.
 *
 * process.h1a is 'How Our Tree' with NO trailing space, so the two heading parts
 * only make sense as separate lines — hence `stacked`.
 */

import { SafeText } from '../../../components/Safe';
import { Rule, Section, SplitHeading, type Copy } from './shared';

const STEPS = [1, 2, 3, 4];

export function Process({ copy }: { copy: Copy }) {
  const steps = STEPS.map((n) => ({
    label: copy(`process.step${n}.label`),
    heading: copy(`process.step${n}.h2`),
    body: copy(`process.step${n}.body`),
  })).filter((step) => (step.label + step.heading + step.body).trim());

  return (
    <Section tone="paper" className="ta-process">
      <div className="ta-head">
        <Rule />
        <SplitHeading as="h2" className="ta-h2" parts={[copy('process.h1a'), copy('process.h1b')]} stacked />
      </div>

      {steps.length > 0 && (
        <ol className="ta-steps">
          {steps.map((step, i) => (
            <li className="ta-step" key={i}>
              <SafeText as="span" className="ta-step-label" value={step.label} />
              <SafeText as="h3" className="ta-step-h" value={step.heading} />
              <SafeText as="p" className="ta-step-body" value={step.body} />
            </li>
          ))}
        </ol>
      )}
    </Section>
  );
}
