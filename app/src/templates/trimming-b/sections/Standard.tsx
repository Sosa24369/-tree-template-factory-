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

import type { ResolvedClient } from '../../../schema/resolve';
import { SafeText } from '../../../components/Safe';
import { DeferredImage } from '../../../components/DeferredImage';
import { partitionMedia, photosFor } from '../../../lib/photos';
import { altFor, Display, Eyebrow, Section, type Copy } from './shared';

/**
 * Premium Reorder v2 (2026-08-13): the what-is-included blurb is two-column on
 * desktop with a photograph of the CLIENT'S OWN trimming work on the right,
 * stacked below on mobile. No photo on the record → type-only layout (R5).
 */
export function Standard({ client, copy }: { client: ResolvedClient; copy: Copy }) {
  const items = [1, 2, 3]
    .map((n) => ({ h: copy(`standard.item${n}.h`), body: copy(`standard.item${n}.body`) }))
    .filter((item) => item.h.trim() || item.body.trim());

  const heading = `${copy('standard.h2a')}${copy('standard.h2b')}`.trim();
  if (!heading && items.length === 0) return null;

  const { stills } = partitionMedia(photosFor(client, 'trimming'));
  const photo = stills[1] ?? stills[0] ?? null;

  return (
    <Section tone="paper" className="tb-standard">
      <div className="tb-head">
        <Eyebrow value={copy('standard.eyebrow')} />
        <Display lines={[copy('standard.h2a'), copy('standard.h2b')]} />
        <SafeText as="p" className="tb-body tb-measure" value={copy('standard.body')} />
      </div>

      <div className="tb-standard-body">
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

      {photo && (
        <div className="tb-standard-photo">
          <DeferredImage
            photo={photo.alt?.trim() ? photo : { ...photo, alt: altFor(client.name, 2) }}
            className="tb-standard-photo-img"
            wrapperClassName="tb-standard-photo-box"
            sizes="(max-width: 979px) 92vw, 38vw"
          />
        </div>
      )}
      </div>

      <SafeText as="p" className="tb-note tb-measure" value={copy('standard.close')} />
    </Section>
  );
}
