/**
 * S8 — what is included, in two groups: the takedown, and the ground afterwards.
 *
 * removal-a lists twenty services in three photo-headed columns. This splits the
 * same territory into the only two questions a homeowner is actually weighing —
 * can you get it down, and what state do you leave my yard in — which is a
 * different claim about what matters, not a different arrangement of the same one.
 *
 * No photographs in this section by design: the imagery has already made its case
 * in the mosaic above, and a third photo block here would cost weight and add
 * nothing.
 */

import type { ResolvedClient } from '../../../schema/resolve';
import { SafeText } from '../../../components/Safe';
import { DeferredImage } from '../../../components/DeferredImage';
import { altFor, withAlt } from '../support';
import { partitionMedia, photosFor } from '../../../lib/photos';
import { CheckIcon, Eyebrow, Heading, Section, type Copy } from './shared';

const GROUPS = [1, 2];
const ITEMS = [1, 2, 3, 4, 5, 6, 7];

/**
 * Premium Reorder v2 (2026-08-13): the services blurb is two-column on desktop
 * with a photograph of the CLIENT'S OWN work on the right (stacked below on
 * mobile). Second removal still — the hero backdrop leads with the first.
 * No photo on the record → the type-only layout returns (R5).
 */
export function Scope({ client, copy }: { client: ResolvedClient; copy: Copy }) {
  const groups = GROUPS.map((g) => ({
    heading: copy(`scope.group${g}.h`),
    items: ITEMS.map((n) => copy(`scope.group${g}.item${n}`)).filter((text) => text.trim()),
  })).filter((group) => group.heading.trim() || group.items.length > 0);

  if (groups.length === 0) return null;

  const { stills } = partitionMedia(photosFor(client, 'removal'));
  const photo = stills[1] ?? stills[0] ?? null;

  return (
    <Section tone="tint" className="rb-scope">
      <div className="rb-head rb-rise">
        <Eyebrow>{copy('scope.eyebrow')}</Eyebrow>
        <Heading as="h2" className="rb-h2" parts={[copy('scope.h2a'), copy('scope.h2b')]} />
        <SafeText as="p" className="rb-lede" value={copy('scope.lede')} />
      </div>

      <div className="rb-scope-body">
        <div className="rb-scope-grid">
        {groups.map((group, g) => (
          <div className="rb-scope-panel rb-rise" key={g}>
            <SafeText as="h3" className="rb-scope-h" value={group.heading} />
            <ul className="rb-scope-list">
              {group.items.map((text, i) => (
                <li key={i}>
                  <span className="rb-scope-check" aria-hidden="true">
                    <CheckIcon />
                  </span>
                  <SafeText as="span" value={text} />
                </li>
              ))}
            </ul>
          </div>
        ))}
        </div>

        {photo && (
          <div className="rb-scope-photo rb-rise">
            <DeferredImage
              photo={photo.alt ? photo : withAlt(photo, altFor(client.name, 2))}
              className="rb-scope-photo-img"
              wrapperClassName="rb-scope-photo-box"
              sizes="(max-width: 979px) 92vw, 38vw"
            />
          </div>
        )}
      </div>
    </Section>
  );
}
