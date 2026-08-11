/**
 * THE STANDARD — three clearances, numbered, set as a typographic ledger.
 *
 * This is the variant's answer to trimming-a's twenty-item service list. The claim
 * being tested: three specifics a homeowner can walk outside and verify after the
 * crew leaves are more persuasive than twenty service names they cannot.
 *
 * All three items are the offer's own substance — roof line and gutter line are the
 * "roof & gutter branch clearance" that ships with the trim, and the deadwood is
 * what every trim starts with — so nothing here promises anything the `offer`
 * section does not also state plainly.
 *
 * Each item drops out on its own if its copy is blanked, and the whole section
 * disappears if every item is empty (R5).
 */

import { SafeText } from '../../../components/Safe';
import { Display, Eyebrow, Section, type Copy } from './shared';

export function Standard({ copy }: { copy: Copy }) {
  const items = [1, 2, 3]
    .map((n) => ({ h: copy(`standard.item${n}.h`), body: copy(`standard.item${n}.body`) }))
    .filter((item) => item.h.trim() || item.body.trim());

  const heading = `${copy('standard.h2a')}${copy('standard.h2b')}`.trim();
  if (!heading && items.length === 0) return null;

  return (
    <Section tone="paper" className="tb-standard">
      <div className="tb-head">
        <Eyebrow value={copy('standard.eyebrow')} />
        <Display lines={[copy('standard.h2a'), copy('standard.h2b')]} />
        <SafeText as="p" className="tb-body tb-measure" value={copy('standard.body')} />
      </div>

      {items.length > 0 && (
        <ol className="tb-ledger">
          {items.map((item, i) => (
            <li className="tb-ledger-item" key={i}>
              {/* The numeral is decorative — the <ol> already carries the ordering
                  for assistive tech, so this must not be announced twice. */}
              <span className="tb-ledger-num" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="tb-ledger-text">
                <SafeText as="h3" className="tb-ledger-h" value={item.h} />
                <SafeText as="p" className="tb-body" value={item.body} />
              </div>
            </li>
          ))}
        </ol>
      )}

      <SafeText as="p" className="tb-note tb-measure" value={copy('standard.close')} />
    </Section>
  );
}
