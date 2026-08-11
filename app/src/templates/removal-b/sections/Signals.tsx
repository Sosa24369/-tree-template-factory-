/**
 * S3 — the diagnostic. This section has no equivalent in removal-a and it is where
 * the variant earns its keep.
 *
 * The control's second move is a benefit strip: four things the COMPANY does. This
 * variant's second move hands the homeowner a way to judge their own tree, which is
 * the thing they are actually standing in the yard trying to work out. Everything
 * that follows — the reviews, the process, the offer — is answering a question this
 * section has already made them ask.
 *
 * Five cards, no photographs: the claim is diagnostic, and a stock photograph of
 * somebody else's tree would weaken it rather than support it. The visual weight
 * comes from the ghost numeral, the risk marker and the card's gradient edge.
 */

import { SafeText } from '../../../components/Safe';
import { AlertIcon, Eyebrow, Heading, Section, type Copy } from './shared';

const ITEMS = [1, 2, 3, 4, 5];

export function Signals({ copy }: { copy: Copy }) {
  const items = ITEMS.map((n) => ({
    heading: copy(`signals.item${n}.h`),
    body: copy(`signals.item${n}.body`),
  })).filter((item) => (item.heading + item.body).trim());

  return (
    <Section tone="paper" className="rb-signals">
      <div className="rb-head rb-rise">
        <Eyebrow>{copy('signals.eyebrow')}</Eyebrow>
        <Heading as="h2" className="rb-h2" parts={[copy('signals.h2a'), copy('signals.h2b')]} />
        <SafeText as="p" className="rb-lede" value={copy('signals.lede')} />
      </div>

      {items.length > 0 && (
        <ol className="rb-signal-grid">
          {items.map((item, i) => (
            <li className="rb-signal rb-rise" key={i}>
              <span className="rb-signal-num" aria-hidden="true">
                {i + 1}
              </span>
              <span className="rb-signal-mark" aria-hidden="true">
                <AlertIcon />
              </span>
              <SafeText as="h3" className="rb-signal-h" value={item.heading} />
              <SafeText as="p" className="rb-signal-body" value={item.body} />
            </li>
          ))}
        </ol>
      )}

      <SafeText as="p" className="rb-signal-foot rb-rise" value={copy('signals.footnote')} />
    </Section>
  );
}
