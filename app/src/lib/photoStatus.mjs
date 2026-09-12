/**
 * ONE STATUS PER PHOTOGRAPH, in the owner's words rather than the contract's.
 *
 *   OK          meets the slot minimum, in 4:3
 *   Under spec  it will render, and it will look soft — with the number
 *   Replace     it cannot be fixed by framing — a video in a photo set, or so far under
 *               the minimum that no crop saves it
 *
 * Stage 1 classified both live clients this way and found not one Texas Tree Tops
 * photograph meeting the 1200 px tile minimum in 4:3 (docs/BUILD-LOG.md, Phase 1b, H5).
 *
 * The design puts the status on the record at upload time; until the pipeline writes it,
 * this computes the same answer from what the record already knows, so the studio and the
 * guard can agree today. A stored `status` always wins.
 */

/** @typedef {import('../schema/client').PhotoSet} PhotoSet */


/** Below this fraction of the minimum, framing cannot save it — ask for another file. */
const REPLACE_AT = 0.6;

export function photoStatus(photo, needWidth) {
  if (!photo) return null;
  if (photo.kind === 'video') {
    return { kind: 'replace', label: 'Replace', reason: 'A video in a photo set. Photo slots render <img>, so it shows as a broken box.' };
  }
  const stored = photo.status;
  const w = photo.width, h = photo.height;

  if (w == null || h == null) {
    return stored
      ? withLabel(stored, 'No dimensions on record; status was set at upload.')
      : { kind: 'under', label: 'Under spec', reason: 'No dimensions on record, so it cannot be checked. Re-upload it through the studio.' };
  }
  if (stored) return withLabel(stored, `Set at upload. ${w} × ${h}.`);

  const ratio = w / h;
  const isFourThree = Math.abs(ratio - 4 / 3) < 0.02;
  const shape = isFourThree ? '4:3'
    : Math.abs(ratio - 1) < 0.02 ? 'square'
      : Math.abs(ratio - 0.75) < 0.02 ? '3:4 portrait'
        : `${ratio >= 1 ? `${ratio.toFixed(2)}:1` : `1:${(1 / ratio).toFixed(2)}`}`;

  if (w < needWidth * REPLACE_AT) {
    return { kind: 'replace', label: 'Replace', reason: `${w} px wide against a ${needWidth} px slot — ${(needWidth / w).toFixed(1)}× upscaled on a retina screen. No focal point fixes this; ask for the original.` };
  }
  if (w < needWidth) {
    return { kind: 'under', label: 'Under spec', reason: `${w} px wide, the slot wants ${needWidth} — ${(needWidth / w).toFixed(1)}× upscaled on a retina screen. It renders, and it looks soft.` };
  }
  if (!isFourThree) {
    return { kind: 'under', label: 'Under spec', reason: `${w} × ${h} is ${shape}, not 4:3 — uneven in a grid of whole photos, and heavily cropped in a fixed box.` };
  }
  return { kind: 'ok', label: 'OK', reason: `${w} × ${h}, 4:3, meets the ${needWidth} px minimum.` };
}

function withLabel(kind, reason) {
  return { kind, label: kind === 'ok' ? 'OK' : kind === 'under' ? 'Under spec' : 'Replace', reason };
}
