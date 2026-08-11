/**
 * RESTRAINT — four things we won't do.
 *
 * The emotional lever of the whole variant. trimming-a sells urgency: a discount and
 * a date. This section sells judgment by naming refusals, which is the one kind of
 * claim a competitor cannot match by discounting harder, and the one a nervous
 * homeowner is actually shopping for when the tree is healthy and the work is
 * discretionary.
 *
 * The two arboricultural claims here are true independent of any client: topping
 * provokes weak, densely-crowded regrowth, and climbing spikes wound the trunk of a
 * tree that is being kept. The other two are commitments about conduct. None of them
 * asserts a certification, an insurance figure or a rating on a client's behalf.
 *
 * Set as an unnumbered list against a hairline: the numbered ledger belongs to the
 * standard, and repeating that device here would flatten both.
 */

import { SafeText } from '../../../components/Safe';
import { Display, Eyebrow, Section, type Copy } from './shared';

export function Restraint({ copy }: { copy: Copy }) {
  const items = [1, 2, 3, 4]
    .map((n) => ({ h: copy(`restraint.item${n}.h`), body: copy(`restraint.item${n}.body`) }))
    .filter((item) => item.h.trim() || item.body.trim());

  if (items.length === 0) return null;

  return (
    <Section tone="paper" className="tb-restraint">
      <div className="tb-head">
        <Eyebrow value={copy('restraint.eyebrow')} />
        <Display lines={[copy('restraint.h2a'), copy('restraint.h2b')]} />
      </div>

      <ul className="tb-refusals">
        {items.map((item, i) => (
          <li className="tb-refusal" key={i}>
            <SafeText as="h3" className="tb-refusal-h" value={item.h} />
            <SafeText as="p" className="tb-body" value={item.body} />
          </li>
        ))}
      </ul>
    </Section>
  );
}
