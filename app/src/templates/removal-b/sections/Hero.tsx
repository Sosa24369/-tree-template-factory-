/**
 * S1 — the hero. THE VARIANT'S WHOLE ARGUMENT IS IN THIS SECTION.
 *
 * removal-a opens with "$300 Off Your Tree Removal" and a form. This opens with the
 * consequence of leaving the tree standing, asks for a phone call, and does not
 * mention the discount at all — the offer is held back until the estimate section
 * two thirds down the page. The form is still one tap away through the secondary
 * link and the mobile action bar.
 *
 * PERFORMANCE — why there is no photograph here on a phone:
 *   The mobile LCP element is the H1, which is text and paints as soon as the CSS
 *   lands. The hero photograph is desktop-only, and it is NOT an <img> that a phone
 *   would download and then hide: the file path is handed to CSS as the custom
 *   property --rb-art, and the only rule that consumes it lives inside the
 *   (min-width: 980px) query. A non-matching media query never fetches its
 *   backgrounds, so on a phone the image is not merely hidden — it is never
 *   requested. Everything else in the hero is gradient, type and inline SVG.
 *
 * The photograph is the CLIENT's own (photosFor), never bundled artwork and never
 * another client's job. A client with no photography gets a hero with no art panel
 * and a wider copy column, which is a perfectly good hero.
 */

import type { CSSProperties, ReactNode } from 'react';
import type { ResolvedClient } from '../../../schema/resolve';
import { SafeText } from '../../../components/Safe';
import { partitionMedia, photosFor } from '../../../lib/photos';
import { cssUrl } from '../support';
import { BoltIcon, BroomIcon, CallCta, Eyebrow, FORM_ANCHOR, Heading, PinIcon, ShieldIcon, StarIcon, type Copy } from './shared';

/** One icon per credential chip, in copy order: insured, rated, fast, clean. */
const CHIP_ICONS = [ShieldIcon, StarIcon, BoltIcon, BroomIcon] as const;

export function Hero({
  client,
  copy,
  formPanel,
}: {
  client: ResolvedClient;
  copy: Copy;
  formPanel?: ReactNode;
}) {
  // Stills only: a client's removal set can contain an .mp4 (the control's does),
  // and a video path in a CSS background paints nothing.
  const { stills } = partitionMedia(photosFor(client, 'removal'));
  const art = stills[0] ?? null;

  const chips = [1, 2, 3, 4]
    .map((n) => copy(`hero.chip${n}`))
    .map((text, i) => ({ text, Icon: CHIP_ICONS[i] }))
    .filter((chip) => chip.text.trim());

  const area = (client.serviceArea ?? '').trim();
  const areaPrefix = copy('hero.areaPrefix');
  const secondary = copy('hero.secondary');

  const artStyle = art?.src ? ({ '--rb-art': cssUrl(art.src) } as CSSProperties) : undefined;

  return (
    <section
      className={['rb-hero', art?.src ? null : 'rb-hero--noart'].filter(Boolean).join(' ')}
      style={artStyle}
    >
      <div className="rb-container rb-hero-inner">
        <div className="rb-hero-copy">
          <Eyebrow>{copy('hero.eyebrow')}</Eyebrow>

          <Heading as="h1" className="rb-h1" parts={[copy('hero.h1a'), copy('hero.h1b')]} />

          <SafeText as="p" className="rb-hero-sub" value={copy('hero.sub')} />

          {/* The service area is client DATA. No record, no line — never the word
              "undefined" and never a dangling "Crews working in ." (R5). */}
          {area && (
            <p className="rb-hero-area">
              <PinIcon />
              <span>
                {areaPrefix}
                {area}
              </span>
            </p>
          )}

          <div className="rb-hero-actions">
            <CallCta client={client} copy={copy} placement="hero" prefix tone="accent" size="lg" />

            {secondary.trim() && (
              <a className="rb-ghost" href={`#${FORM_ANCHOR}`}>
                <span>{secondary}</span>
              </a>
            )}
          </div>

          {chips.length > 0 && (
            <ul className="rb-chips">
              {chips.map(({ text, Icon }, i) => (
                <li className="rb-chip" key={i}>
                  <span className="rb-chip-icon" aria-hidden="true">
                    <Icon />
                  </span>
                  <SafeText as="span" value={text} />
                </li>
              ))}
            </ul>
          )}

          {/* The rating chip that used to float on the desktop art panel —
              the art panel gave its grid slot to the form (canonical
              structure), so the chip's copy renders here, still in the hero. */}
          <p className="rb-hero-badge rb-hero-badge--inline">
            <span className="rb-hero-badge-stars">{copy('hero.artBadgeStars')}</span>
            <strong className="rb-hero-badge-value">{copy('hero.artBadgeValue')}</strong>
            <span className="rb-hero-badge-label">{copy('hero.artBadgeLabel')}</span>
          </p>
        </div>

        {/* CANONICAL STRUCTURE (2026-08-12): the estimate panel — offer copy
            and the form, every estimate.* line word-for-word — sits IN the
            hero. The desktop photograph became the section's masked backdrop
            (still desktop-only CSS; phones never fetch it). */}
        {formPanel}
      </div>
    </section>
  );
}
