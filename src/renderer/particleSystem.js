import { randomBetween, perpendicularVector } from "../utils/geometry.js";
import {
  activePortalPlane,
  convergenceFlow,
  convergePoint,
  effectFocus,
  effectScale,
  particleAlpha,
  particleDepth,
  portalOutDirection,
  pruneParticles,
  randomPortalPoint,
  scaledParticleCount,
  steadyParticleAlpha
} from "./effects/effectUtils.js";

/**
 * Updates and draws the particle system for a spell.
 * @param {CanvasRenderingContext2D} ctx 
 * @param {Object} state 
 * @param {Object} spellIR 
 * @param {Object} ring 
 * @param {import('./elementProfiles').ElementProfile} profile 
 * @param {number} dt 
 * @param {Object} config 
 */
export function updateAndDrawParticles(ctx, state, spellIR, ring, profile, dt, config) {
  state.frame = (state.frame ?? 0) + dt;
  const portal = activePortalPlane(ctx.canvas, ring);
  const direction = portalOutDirection(spellIR);
  const side = perpendicularVector(direction);
  const scale = effectScale(spellIR);
  const focus = effectFocus(spellIR);
  const convergence = convergenceFlow(spellIR, portal, state.frame);
  
  // 1. SPAWN
  const isSuspended = spellIR.gravity < 0.45 && !!profile.suspension;
  const baseCount = profile.emission.countBase + (spellIR.force * profile.emission.countForceScale * 50);
  const targetCount = scaledParticleCount(baseCount * scale, spellIR, config);

  while (state.particles.length < targetCount) {
    const p = spawnParticle(spellIR, ring, portal, direction, side, profile, isSuspended, convergence);
    state.particles.push(p);
  }

  // 2. UPDATE & DRAW
  ctx.save();
  if (profile.shape.type === 'line' || profile.shape.type === 'wisp') {
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }

  for (const p of state.particles) {
    updateParticle(p, spellIR, profile, isSuspended, dt);
    drawParticle(ctx, p, spellIR, ring, profile, scale, convergence);
  }
  ctx.restore();

  // 3. PRUNE
  pruneParticles(state);
}

function spawnParticle(spellIR, ring, portal, direction, side, profile, isSuspended, convergence) {
  const scale = effectScale(spellIR);
  const focus = effectFocus(spellIR);
  
  let x, y, vx, vy, homeX, homeY;
  const phase = randomBetween(0, Math.PI * 2);
  const life = convergence.active ? convergence.life : randomBetween(40, 80) * (0.8 + spellIR.stability * 0.4);

  if (isSuspended) {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.sqrt(Math.random());
    const suspendedHeight = ring.radius * (0.35 + spellIR.force * 0.2);
    const radiusX = ring.radius * (0.2 + spellIR.spread * 0.2) * (1 - focus * 0.3) * (1 - convergence.strength * 0.4);
    const radiusY = ring.radius * (0.15 + spellIR.spread * 0.15) * (1 - focus * 0.3) * (1 - convergence.strength * 0.4);
    
    homeX = portal.center.x + Math.cos(angle) * radiusX * radius;
    homeY = portal.center.y - suspendedHeight + Math.sin(angle) * radiusY * radius;
    
    x = homeX + randomBetween(-5, 5);
    y = homeY + randomBetween(-5, 5);
    vx = randomBetween(-0.5, 0.5);
    vy = randomBetween(-0.5, 0.5);
  } else {
    const source = randomPortalPoint(
      portal, 
      profile.emission.sourceRadiusScale * (1 - focus * 0.5) * (1 - convergence.strength * 0.3),
      profile.emission.sourceRadiusScale * (1 - focus * 0.5) * (1 - convergence.strength * 0.3)
    );
    x = source.x;
    y = source.y;
    
    const speed = profile.physics.speedBase * (1 + spellIR.force) * randomBetween(1 - profile.physics.speedVariance, 1 + profile.physics.speedVariance) * (1 - convergence.strength * 0.2);
    const surfaceJitter = profile.emission.surfaceJitter * spellIR.spread * ring.radius * 0.2 * (1 - focus * 0.4);
    
    x += side.x * randomBetween(-surfaceJitter, surfaceJitter);
    y += side.y * randomBetween(-surfaceJitter, surfaceJitter);
    
    vx = direction.x * speed + side.x * randomBetween(-profile.physics.jitter, profile.physics.jitter) * 5;
    vy = direction.y * speed + side.y * randomBetween(-profile.physics.jitter, profile.physics.jitter) * 5;
  }

  const radius = profile.shape.baseRadius * (1 + randomBetween(-profile.shape.radiusVariance, profile.shape.radiusVariance)) * (0.8 + spellIR.force * 0.4);

  return {
    x, y, vx, vy, homeX, homeY,
    age: 0,
    life,
    phase,
    radius,
    trail: profile.shape.trailLength > 0 ? [] : null
  };
}

function updateParticle(p, spellIR, profile, isSuspended, dt) {
  p.age += dt;
  
  if (isSuspended && profile.suspension) {
    const targetX = p.homeX + Math.sin(p.phase + p.age * 0.04) * profile.suspension.wanderAmount * 100;
    const targetY = p.homeY + Math.sin(p.phase * 1.5 + p.age * 0.05) * profile.suspension.bobAmount * 100;
    
    p.vx += (targetX - p.x) * profile.suspension.homeSpring * dt;
    p.vy += (targetY - p.y) * profile.suspension.homeSpring * dt;
    p.vx *= profile.suspension.homeDamping;
    p.vy *= profile.suspension.homeDamping;
  } else {
    // Apply curl
    if (profile.physics.curl > 0) {
      const cos = Math.cos(profile.physics.curl * dt);
      const sin = Math.sin(profile.physics.curl * dt);
      const nx = p.vx * cos - p.vy * sin;
      const ny = p.vx * sin + p.vy * cos;
      p.vx = nx;
      p.vy = ny;
    }
    
    // Apply gravity
    p.vy += profile.physics.gravity * spellIR.gravity * 2 * dt;
    
    // Apply jitter
    p.vx += randomBetween(-1, 1) * profile.physics.jitter * dt;
    p.vy += randomBetween(-1, 1) * profile.physics.jitter * dt;
    
    // Apply drag
    p.vx *= (1 - profile.physics.drag * dt);
    p.vy *= (1 - profile.physics.drag * dt);
  }

  const oldX = p.x;
  const oldY = p.y;
  p.x += p.vx * dt;
  p.y += p.vy * dt;

  if (p.trail) {
    p.trail.unshift({ x: oldX, y: oldY });
    if (p.trail.length > 20 * profile.shape.trailLength) {
      p.trail.pop();
    }
  }
}

function drawParticle(ctx, p, spellIR, ring, profile, scale, convergence) {
  const depth = particleDepth(p);
  const alpha = steadyParticleAlpha(p, spellIR, 10) * profile.color.alpha;
  const displayRadius = p.radius * (0.8 + depth * 0.6) * scale * (1 - convergence.progress * 0.2);
  
  const currentPoint = { x: p.x, y: p.y };
  const cp = convergePoint(currentPoint, convergence, p.phase);

  const coreColor = `rgba(${profile.color.core.join(',')}, ${alpha})`;
  const midColor = `rgba(${profile.color.mid.join(',')}, ${alpha * 0.8})`;
  const edgeColor = `rgba(${profile.color.edge.join(',')}, 0)`;

  switch (profile.shape.type) {
    case 'sphere':
      const grad = ctx.createRadialGradient(cp.x, cp.y, 0, cp.x, cp.y, displayRadius);
      grad.addColorStop(0, coreColor);
      grad.addColorStop(0.4, midColor);
      grad.addColorStop(1, edgeColor);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cp.x, cp.y, displayRadius, 0, Math.PI * 2);
      ctx.fill();
      break;
      
    case 'line':
      if (p.trail && p.trail.length > 0) {
        const last = p.trail[0];
        const lp = convergePoint(last, convergence, p.phase);
        ctx.strokeStyle = midColor;
        ctx.lineWidth = displayRadius;
        ctx.beginPath();
        ctx.moveTo(lp.x, lp.y);
        ctx.lineTo(cp.x, cp.y);
        ctx.stroke();
        
        ctx.strokeStyle = coreColor;
        ctx.lineWidth = displayRadius * 0.4;
        ctx.beginPath();
        ctx.moveTo(lp.x, lp.y);
        ctx.lineTo(cp.x, cp.y);
        ctx.stroke();
      }
      break;
      
    case 'square':
      ctx.fillStyle = midColor;
      ctx.save();
      ctx.translate(cp.x, cp.y);
      ctx.rotate(p.phase + p.age * 0.05);
      ctx.fillRect(-displayRadius/2, -displayRadius/2, displayRadius, displayRadius);
      ctx.restore();
      break;
      
    case 'wisp':
      if (p.trail && p.trail.length > 1) {
        ctx.lineWidth = displayRadius * 2;
        ctx.strokeStyle = midColor;
        drawWispTrail(ctx, p.trail, convergence, p.phase);
        
        ctx.lineWidth = displayRadius * 0.6;
        ctx.strokeStyle = coreColor;
        drawWispTrail(ctx, p.trail, convergence, p.phase);
      }
      break;
  }
}

function drawWispTrail(ctx, trail, convergence, phase) {
  ctx.beginPath();
  const start = convergePoint(trail[0], convergence, phase);
  ctx.moveTo(start.x, start.y);
  
  for (let i = 1; i < trail.length - 1; i++) {
    const p1 = convergePoint(trail[i], convergence, phase + i * 0.1);
    const p2 = convergePoint(trail[i+1], convergence, phase + (i+1) * 0.1);
    const mx = (p1.x + p2.x) / 2;
    const my = (p1.y + p2.y) / 2;
    ctx.quadraticCurveTo(p1.x, p1.y, mx, my);
  }
  ctx.stroke();
}
