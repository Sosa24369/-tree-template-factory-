/**
 * S6 — "Tree Trimming Done Clean, Done Right": a heading, one supporting line, the
 * five-photo work grid, then a call CTA.
 *
 * The photographs are the client's third and last slot (see slots.ts) and are
 * deferred — they are a long way below the fold. A client without enough
 * photographs to fill this slot still gets the copy and the CTA; only the grid
 * disappears, so the section never becomes an empty framed box (R5).
 */

import type { ResolvedClient } from '../../../schema/resolve';
import { SafeText } from '../../../components/Safe';
import { DeferredImage } from '../../../components/DeferredImage';
import { altFor, photoSlots, withAlt } from '../slots';
import { CallRow, Rule, Section, SplitHeading, type Copy } from './shared';

export function DoneRight({ client, copy }: { client: ResolvedClient; copy: Copy }) {
  const { grid } = photoSlots(client);

  return (
    <Section tone="paper" className="ta-doneright">
      <div className="ta-head">
        <Rule />
        <SplitHeading as="h2" className="ta-h2" parts={[copy('doneRight.h1a'), copy('doneRight.h1b')]} />
        <SafeText as="p" className="ta-lede" value={copy('doneRight.body')} />
      </div>

      {grid.length > 0 && (
        <ul className="ta-mosaic">
          {grid.map((shot, i) => (
            <li key={shot?.src ?? i}>
              <DeferredImage
                photo={withAlt(shot, altFor(client.name, i + 1))}
                className="ta-shot-img"
                wrapperClassName="ta-shot"
                sizes="(max-width: 767px) 92vw, 33vw"
              />
            </li>
          ))}
        </ul>
      )}

      <CallRow client={client} copy={copy} placement="done-right" tone="solid" />
    </Section>
  );
}
