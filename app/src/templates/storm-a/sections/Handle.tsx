/**
 * What we handle — three groups: Trees, Fences, Cleanup.
 *
 * Fence repair is a FIRST-CLASS group, not a footnote: storms flatten fences as
 * often as they drop limbs, and a homeowner searching after a storm is often
 * searching for exactly that.
 *
 * Each group renders up to six items and drops the blanks; a group with no heading
 * and no items disappears, and the whole section hides when all three are empty (R5).
 */

import { SafeText } from '../../../components/Safe';
import { CheckIcon, Eyebrow, FenceIcon, Heading, Section, TreeIcon, BroomIcon, type Copy } from './shared';

const GROUP_ICONS = [TreeIcon, FenceIcon, BroomIcon] as const;
const GROUPS = [1, 2, 3];
const ITEMS = [1, 2, 3, 4, 5, 6];

export function Handle({ copy }: { copy: Copy }) {
  const groups = GROUPS.map((g, gi) => ({
    Icon: GROUP_ICONS[gi],
    heading: copy(`handle.group${g}.h`),
    items: ITEMS.map((n) => copy(`handle.group${g}.item${n}`)).filter((text) => text.trim()),
  })).filter((group) => group.heading.trim() || group.items.length > 0);

  if (groups.length === 0) return null;

  return (
    <Section tone="paper" className="st-handle">
      <div className="st-head">
        <Eyebrow>{copy('handle.eyebrow')}</Eyebrow>
        <Heading as="h2" className="st-h2" parts={[copy('handle.h2a'), copy('handle.h2b')]} />
        <SafeText as="p" className="st-lede" value={copy('handle.lede')} />
      </div>

      <div className="st-handle-grid">
        {groups.map(({ Icon, heading, items }, g) => (
          <div className="st-handle-panel" key={g}>
            <div className="st-handle-panel-head">
              <span className="st-handle-icon" aria-hidden="true">
                <Icon />
              </span>
              <SafeText as="h3" className="st-handle-h" value={heading} />
            </div>
            <ul className="st-handle-list">
              {items.map((text, i) => (
                <li key={i}>
                  <span className="st-handle-check" aria-hidden="true">
                    <CheckIcon />
                  </span>
                  <SafeText as="span" value={text} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}
