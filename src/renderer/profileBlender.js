/**
 * Linearly interpolates between two numbers.
 * @param {number} a 
 * @param {number} b 
 * @param {number} t 
 * @returns {number}
 */
function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Linearly interpolates between two RGB arrays.
 * @param {number[]} a 
 * @param {number[]} b 
 * @param {number} t 
 * @returns {number[]}
 */
function lerpColor(a, b, t) {
  return [
    Math.round(lerp(a[0], b[0], t)),
    Math.round(lerp(a[1], b[1], t)),
    Math.round(lerp(a[2], b[2], t))
  ];
}

/**
 * Blends two element profiles together.
 * @param {import('./elementProfiles').ElementProfile} profileA 
 * @param {import('./elementProfiles').ElementProfile} profileB 
 * @param {number} t 
 * @returns {import('./elementProfiles').ElementProfile}
 */
export function blendProfiles(profileA, profileB, t) {
  if (t <= 0) return profileA;
  if (t >= 1) return profileB;

  return {
    color: {
      core: lerpColor(profileA.color.core, profileB.color.core, t),
      mid: lerpColor(profileA.color.mid, profileB.color.mid, t),
      edge: lerpColor(profileA.color.edge, profileB.color.edge, t),
      alpha: lerp(profileA.color.alpha, profileB.color.alpha, t)
    },
    shape: {
      type: t < 0.5 ? profileA.shape.type : profileB.shape.type,
      baseRadius: lerp(profileA.shape.baseRadius, profileB.shape.baseRadius, t),
      radiusVariance: lerp(profileA.shape.radiusVariance, profileB.shape.radiusVariance, t),
      trailLength: lerp(profileA.shape.trailLength, profileB.shape.trailLength, t)
    },
    physics: {
      speedBase: lerp(profileA.physics.speedBase, profileB.physics.speedBase, t),
      speedVariance: lerp(profileA.physics.speedVariance, profileB.physics.speedVariance, t),
      drag: lerp(profileA.physics.drag, profileB.physics.drag, t),
      curl: lerp(profileA.physics.curl, profileB.physics.curl, t),
      gravity: lerp(profileA.physics.gravity, profileB.physics.gravity, t),
      jitter: lerp(profileA.physics.jitter, profileB.physics.jitter, t)
    },
    emission: {
      pattern: t < 0.5 ? profileA.emission.pattern : profileB.emission.pattern,
      sourceRadiusScale: lerp(profileA.emission.sourceRadiusScale, profileB.emission.sourceRadiusScale, t),
      surfaceJitter: lerp(profileA.emission.surfaceJitter, profileB.emission.surfaceJitter, t),
      countBase: lerp(profileA.emission.countBase, profileB.emission.countBase, t),
      countForceScale: lerp(profileA.emission.countForceScale, profileB.emission.countForceScale, t),
      burstOnActivation: t < 0.5 ? profileA.emission.burstOnActivation : profileB.emission.burstOnActivation
    },
    suspension: (profileA.suspension && profileB.suspension) ? {
      homeSpring: lerp(profileA.suspension.homeSpring, profileB.suspension.homeSpring, t),
      homeDamping: lerp(profileA.suspension.homeDamping, profileB.suspension.homeDamping, t),
      bobAmount: lerp(profileA.suspension.bobAmount, profileB.suspension.bobAmount, t),
      wanderAmount: lerp(profileA.suspension.wanderAmount, profileB.suspension.wanderAmount, t)
    } : (t < 0.5 ? profileA.suspension : profileB.suspension)
  };
}

/**
 * Resolves the final profile for a given spell.
 * @param {Object} spellIR 
 * @param {Object} elementProfiles 
 * @returns {import('./elementProfiles').ElementProfile|null}
 */
export function resolveProfile(spellIR, elementProfiles) {
  if (!spellIR || !spellIR.element) return null;

  /* 
     HOOK: MULTI-ELEMENT BLENDING
     When multi-ring compound spells are implemented, logic will be added here 
     to detect multiple elements and call blendProfiles().
     Example: 
     if (spellIR.elements && spellIR.elements.length > 1) {
       return blendProfiles(
         elementProfiles[spellIR.elements[0]], 
         elementProfiles[spellIR.elements[1]], 
         spellIR.elementRatio || 0.5
       );
     }
  */

  return elementProfiles[spellIR.element] || null;
}
