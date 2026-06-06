/**
 * @typedef {Object} ElementProfile
 * @property {Object} color
 * @property {number[]} color.core - [r, g, b]
 * @property {number[]} color.mid - [r, g, b]
 * @property {number[]} color.edge - [r, g, b]
 * @property {number} color.alpha - base opacity multiplier
 * @property {Object} shape
 * @property {'sphere'|'line'|'square'|'wisp'} shape.type
 * @property {number} shape.baseRadius - canvas pixels at effectScale=1
 * @property {number} shape.radiusVariance - randomness in size
 * @property {number} shape.trailLength - 0=no trail, 1=long trail
 * @property {Object} physics
 * @property {number} physics.speedBase - pixels/frame base speed
 * @property {number} physics.speedVariance
 * @property {number} physics.drag - velocity damping per frame
 * @property {number} physics.curl - rotational drift
 * @property {number} physics.gravity - downward pull weight
 * @property {number} physics.jitter - per-frame random velocity nudge
 * @property {Object} emission
 * @property {'stream'|'cloud'|'beam'|'burst'} emission.pattern
 * @property {number} emission.sourceRadiusScale - fraction of portal radius
 * @property {number} emission.surfaceJitter
 * @property {number} emission.countBase - particles at base settings
 * @property {number} emission.countForceScale - force multiplier
 * @property {boolean} emission.burstOnActivation
 * @property {Object} [suspension]
 * @property {number} suspension.homeSpring
 * @property {number} suspension.homeDamping
 * @property {number} suspension.bobAmount
 * @property {number} suspension.wanderAmount
 */

export const elementProfiles = {
  fire: {
    color: {
      core: [255, 242, 160],
      mid: [243, 116, 43],
      edge: [176, 47, 32],
      alpha: 0.8
    },
    shape: {
      type: 'sphere',
      baseRadius: 10,
      radiusVariance: 0.5,
      trailLength: 0
    },
    physics: {
      speedBase: 3.0,
      speedVariance: 0.4,
      drag: 0.008,
      curl: 0,
      gravity: 0.05,
      jitter: 0.15
    },
    emission: {
      pattern: 'stream',
      sourceRadiusScale: 0.4,
      surfaceJitter: 0.2,
      countBase: 80,
      countForceScale: 1.2,
      burstOnActivation: false
    },
    suspension: {
      homeSpring: 0.02,
      homeDamping: 0.96,
      bobAmount: 0.015,
      wanderAmount: 0.02
    }
  },
  water: {
    color: {
      core: [128, 218, 255],
      mid: [55, 171, 238],
      edge: [8, 95, 202],
      alpha: 0.6
    },
    shape: {
      type: 'sphere',
      baseRadius: 11,
      radiusVariance: 0.4,
      trailLength: 0
    },
    physics: {
      speedBase: 2.2,
      speedVariance: 0.3,
      drag: 0.01,
      curl: 0,
      gravity: 0.08,
      jitter: 0.1
    },
    emission: {
      pattern: 'stream',
      sourceRadiusScale: 0.3,
      surfaceJitter: 0.15,
      countBase: 100,
      countForceScale: 1.5,
      burstOnActivation: false
    },
    suspension: {
      homeSpring: 0.015,
      homeDamping: 0.97,
      bobAmount: 0.02,
      wanderAmount: 0.08
    }
  },
  wind: {
    color: {
      core: [224, 248, 231],
      mid: [184, 232, 215],
      edge: [150, 210, 190],
      alpha: 0.7
    },
    shape: {
      type: 'line',
      baseRadius: 3,
      radiusVariance: 0.2,
      trailLength: 0.3
    },
    physics: {
      speedBase: 3.8,
      speedVariance: 0.5,
      drag: 0.002,
      curl: 0.025,
      gravity: 0.01,
      jitter: 0.05
    },
    emission: {
      pattern: 'stream',
      sourceRadiusScale: 0.6,
      surfaceJitter: 0.3,
      countBase: 90,
      countForceScale: 1.3,
      burstOnActivation: false
    },
    suspension: {
      homeSpring: 0.03,
      homeDamping: 0.94,
      bobAmount: 0.03,
      wanderAmount: 0.05
    }
  },
  earth: {
    color: {
      core: [150, 120, 80],
      mid: [111, 83, 45],
      edge: [70, 50, 30],
      alpha: 0.9
    },
    shape: {
      type: 'square',
      baseRadius: 7,
      radiusVariance: 0.4,
      trailLength: 0
    },
    physics: {
      speedBase: 1.8,
      speedVariance: 0.6,
      drag: 0.02,
      curl: 0,
      gravity: 0.15,
      jitter: 0.05
    },
    emission: {
      pattern: 'stream',
      sourceRadiusScale: 0.5,
      surfaceJitter: 0.1,
      countBase: 70,
      countForceScale: 1.1,
      burstOnActivation: false
    },
    suspension: {
      homeSpring: 0.01,
      homeDamping: 0.98,
      bobAmount: 0.01,
      wanderAmount: 0.01
    }
  },
  light: {
    color: {
      core: [255, 255, 240],
      mid: [255, 249, 180],
      edge: [255, 240, 150],
      alpha: 1.0
    },
    shape: {
      type: 'wisp',
      baseRadius: 6,
      radiusVariance: 0.3,
      trailLength: 0.8
    },
    physics: {
      speedBase: 5.0,
      speedVariance: 0.2,
      drag: 0.001,
      curl: 0.002,
      gravity: 0,
      jitter: 0.02
    },
    emission: {
      pattern: 'beam',
      sourceRadiusScale: 0.2,
      surfaceJitter: 0.05,
      countBase: 40,
      countForceScale: 1.8,
      burstOnActivation: true
    },
    suspension: {
      homeSpring: 0.05,
      homeDamping: 0.92,
      bobAmount: 0.005,
      wanderAmount: 0.005
    }
  }
};
