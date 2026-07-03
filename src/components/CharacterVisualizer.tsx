import React, { useRef, useEffect } from 'react';
import { PlayerClass, PlayerCustomization, Item } from '../types';

interface CharacterVisualizerProps {
  playerClass: PlayerClass;
  customization: PlayerCustomization;
  equippedWeapon?: Item | null;
  equippedArmor?: Item | null;
  width?: number;
  height?: number;
  scale?: number;
  isAnimated?: boolean;
  facing?: 'left' | 'right' | 'up' | 'down';
}

export default function CharacterVisualizer({
  playerClass,
  customization,
  equippedWeapon = null,
  equippedArmor = null,
  width = 160,
  height = 200,
  scale = 3.5,
  isAnimated = true,
  facing = 'down'
}: CharacterVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    let animationId: number;

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear Canvas
      ctx.clearRect(0, 0, width, height);

      // Center coordinates
      const cx = width / 2;
      const cy = height / 2 + 15;

      // Animating swing/breath wave
      const frame = frameRef.current;
      const breath = isAnimated ? Math.sin(frame * 0.08) * 1.5 : 0;
      const capeWave = isAnimated ? Math.sin(frame * 0.12) * 5 : 0;
      const swing = isAnimated ? Math.sin(frame * 0.05) * 0.05 : 0;

      ctx.save();
      ctx.scale(scale, scale);
      
      // Shift context to draw relative to 0,0 being character center
      const tx = cx / scale;
      const ty = cy / scale;
      ctx.translate(tx, ty);

      // 1. Shadow underneath
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.beginPath();
      ctx.ellipse(0, 20, 12, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Flowing Cape (Back layer)
      ctx.fillStyle = customization.capeColor;
      ctx.beginPath();
      ctx.moveTo(-6, -4 + breath * 0.2);
      ctx.quadraticCurveTo(-12 + capeWave * 0.3, 5, -10 + capeWave, 18);
      ctx.lineTo(10 + capeWave, 18);
      ctx.quadraticCurveTo(12 + capeWave * 0.3, 5, 6, -4 + breath * 0.2);
      ctx.closePath();
      ctx.fill();

      // Cape lining/depth
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath();
      ctx.moveTo(-6, -4 + breath * 0.2);
      ctx.lineTo(-8 + capeWave * 0.5, 18);
      ctx.lineTo(-4 + capeWave * 0.3, 18);
      ctx.closePath();
      ctx.fill();

      // 3. Legs and Boots
      ctx.fillStyle = '#1c1917'; // Leather boots
      // Left leg
      ctx.fillRect(-4, 10, 2.5, 10);
      // Right leg
      ctx.fillRect(1.5, 10, 2.5, 10);
      // Boot cuffs
      ctx.fillStyle = '#292524';
      ctx.fillRect(-5, 13, 3.5, 2);
      ctx.fillRect(1.5, 13, 3.5, 2);

      // 4. Torso & Armor Chestplate (Equipped item reactive!)
      const armorName = equippedArmor ? equippedArmor.name : (playerClass === 'VampireHunter' ? 'Vampire Hunter Garb' : playerClass === 'RenegadeVampire' ? 'Batwing Cloak' : 'Dragonscale Mail');
      
      let chestColor = '#3f3f46'; // Slate iron grey
      let trimColor = '#71717a';
      let symbolColor = 'transparent';

      if (armorName.includes('Hunter') || playerClass === 'VampireHunter') {
        chestColor = '#1e3a8a'; // Blue leather
        trimColor = '#3b82f6';
        symbolColor = '#cbd5e1'; // Silver cross/sigil
      } else if (armorName.includes('Batwing') || armorName.includes('Crimson') || playerClass === 'RenegadeVampire') {
        chestColor = '#450a0a'; // Blood dark red
        trimColor = '#ef4444';
        symbolColor = '#991b1b'; // Vampire crest
      } else if (armorName.includes('Dragon') || armorName.includes('Mail') || playerClass === 'DraconicKnight') {
        chestColor = '#78350f'; // Dragon copper/bronze
        trimColor = '#f59e0b';
        symbolColor = '#ea580c'; // Fire core
      }

      // Base coat
      ctx.fillStyle = chestColor;
      ctx.beginPath();
      ctx.moveTo(-6, -6 + breath * 0.5);
      ctx.lineTo(6, -6 + breath * 0.5);
      ctx.lineTo(5, 10);
      ctx.lineTo(-5, 10);
      ctx.closePath();
      ctx.fill();

      // Trim lines & belt
      ctx.fillStyle = trimColor;
      ctx.fillRect(-5, 8, 10, 2); // Belt
      ctx.fillRect(-1, -6 + breath * 0.5, 2, 10); // Center buckle lane

      // Pauldrons (Shoulders)
      ctx.fillStyle = trimColor;
      ctx.beginPath();
      ctx.arc(-6, -4 + breath * 0.5, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(6, -4 + breath * 0.5, 3, 0, Math.PI * 2);
      ctx.fill();

      // Custom symbols/sigil on chest
      if (symbolColor !== 'transparent') {
        ctx.fillStyle = symbolColor;
        ctx.fillRect(-1.5, -2 + breath * 0.5, 3, 3);
      }

      // 5. Head and Face
      ctx.fillStyle = customization.skinColor;
      ctx.beginPath();
      ctx.arc(0, -12 + breath * 0.6, 5.5, 0, Math.PI * 2);
      ctx.fill();

      // Ears
      ctx.fillStyle = customization.skinColor;
      ctx.beginPath();
      ctx.arc(-5.5, -12 + breath * 0.6, 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(5.5, -12 + breath * 0.6, 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Eye gaze glow pixels
      ctx.fillStyle = customization.eyeColor;
      if (facing === 'left') {
        ctx.fillRect(-4.5, -13 + breath * 0.6, 1.8, 1.8);
      } else if (facing === 'right') {
        ctx.fillRect(2.5, -13 + breath * 0.6, 1.8, 1.8);
      } else {
        // Front facing
        ctx.fillRect(-3, -13 + breath * 0.6, 1.8, 1.8);
        ctx.fillRect(1.2, -13 + breath * 0.6, 1.8, 1.8);
      }

      // 6. Hair style & Head Customization layer
      ctx.fillStyle = customization.hairColor;
      const hStyle = customization.hairStyle.toLowerCase();

      if (hStyle.includes('hood') || hStyle.includes('slayer')) {
        // Draw hooded cowl
        ctx.fillStyle = customization.capeColor; // matches cape
        ctx.beginPath();
        ctx.arc(0, -12.5 + breath * 0.6, 6.8, Math.PI, 0, false);
        ctx.lineTo(6, -7 + breath * 0.6);
        ctx.lineTo(-6, -7 + breath * 0.6);
        ctx.closePath();
        ctx.fill();

        // Inner shadow inside hood
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.beginPath();
        ctx.arc(0, -12.5 + breath * 0.6, 4.8, 0, Math.PI * 2);
        ctx.fill();

        // Redraw face inside hood
        ctx.fillStyle = customization.skinColor;
        ctx.beginPath();
        ctx.arc(0, -11.5 + breath * 0.6, 3.8, 0, Math.PI * 2);
        ctx.fill();

        // Redraw eye gaze glow pixels inside hood
        ctx.fillStyle = customization.eyeColor;
        ctx.fillRect(-2, -12 + breath * 0.6, 1.2, 1.2);
        ctx.fillRect(1, -12 + breath * 0.6, 1.2, 1.2);

      } else if (hStyle.includes('helmet') || hStyle.includes('knight')) {
        // Draw steel protective helm
        ctx.fillStyle = '#64748b'; // visor grey
        ctx.beginPath();
        ctx.arc(0, -13 + breath * 0.6, 6.2, 0, Math.PI * 2);
        ctx.fill();
        
        // visor slit
        ctx.fillStyle = customization.eyeColor; // glowing red or yellow inside visor
        ctx.fillRect(-3.5, -13 + breath * 0.6, 7, 2.2);

        // Helmet crest plume
        ctx.fillStyle = customization.hairColor; // Uses selected hair color for crest plume!
        ctx.beginPath();
        ctx.moveTo(-1, -19 + breath * 0.6);
        ctx.lineTo(3, -22 + breath * 0.6);
        ctx.lineTo(0, -18 + breath * 0.6);
        ctx.closePath();
        ctx.fill();

      } else if (hStyle.includes('braids')) {
        // Flowing long braids
        ctx.beginPath();
        ctx.arc(0, -14 + breath * 0.6, 6, Math.PI, 0, false);
        ctx.fill();
        // Left braid
        ctx.fillRect(-5.5, -12 + breath * 0.6, 2, 16);
        // Right braid
        ctx.fillRect(3.5, -12 + breath * 0.6, 2, 16);
        // Hair band tie
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-5.5, 0 + breath * 0.6, 2, 1.5);
        ctx.fillRect(3.5, 0 + breath * 0.6, 2, 1.5);

      } else if (hStyle.includes('mane') || hStyle.includes('draconic')) {
        // Spiked horned draconic locks
        ctx.beginPath();
        ctx.arc(0, -14 + breath * 0.6, 6, Math.PI, 0, false);
        ctx.fill();
        // Spikes/Horns
        ctx.fillStyle = '#cbd5e1'; // Silver horns
        ctx.beginPath();
        ctx.moveTo(-5, -15 + breath * 0.6);
        ctx.lineTo(-8, -21 + breath * 0.6);
        ctx.lineTo(-2, -16 + breath * 0.6);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(5, -15 + breath * 0.6);
        ctx.lineTo(8, -21 + breath * 0.6);
        ctx.lineTo(2, -16 + breath * 0.6);
        ctx.closePath();
        ctx.fill();

        // Shaggy hair back
        ctx.fillStyle = customization.hairColor;
        ctx.fillRect(-5.5, -11 + breath * 0.6, 2.5, 10);
        ctx.fillRect(3, -11 + breath * 0.6, 2.5, 10);

      } else if (hStyle.includes('locks') || hStyle.includes('renegade')) {
        // Elegant long gothic locks
        ctx.beginPath();
        ctx.arc(0, -14.5 + breath * 0.6, 6.2, 0, Math.PI, true);
        ctx.fill();
        // Hair flowing down shoulders
        ctx.fillRect(-6.2, -10 + breath * 0.6, 2.2, 14);
        ctx.fillRect(4.0, -10 + breath * 0.6, 2.2, 14);
        // Strands
        ctx.fillRect(-3, -15 + breath * 0.6, 1.2, 5);

      } else if (hStyle.includes('shaved') || hStyle.includes('messy')) {
        // Punkish rogue messy sides
        ctx.beginPath();
        ctx.arc(0, -14 + breath * 0.6, 5.8, Math.PI, 0, false);
        ctx.fill();
        // Spiked top locks
        ctx.fillRect(-1.5, -19 + breath * 0.6, 3, 5);
        ctx.fillRect(-3.5, -18 + breath * 0.6, 2, 4);
        ctx.fillRect(1.5, -18 + breath * 0.6, 2, 4);
      } else {
        // Generic haircut fallback
        ctx.beginPath();
        ctx.arc(0, -13.5 + breath * 0.6, 6, Math.PI, 0, false);
        ctx.fill();
        ctx.fillRect(-5.5, -11 + breath * 0.6, 1.5, 6);
        ctx.fillRect(4, -11 + breath * 0.6, 1.5, 6);
      }

      // 7. Arms and Weapon (Equipped item reactive!)
      const weaponName = equippedWeapon ? equippedWeapon.name : (playerClass === 'VampireHunter' ? 'Vampire Slayer Whip' : playerClass === 'RenegadeVampire' ? 'Crimson Scythe' : 'Draconic Greatsword');
      
      ctx.save();
      ctx.translate(6, 4 + breath * 0.5); // weapon hand joint
      ctx.rotate(swing);

      // Draw active holding weapon
      if (weaponName.includes('Whip') || weaponName.includes('Slayer')) {
        // Silver Chain Whip coiled
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(4, 5, 8, -5, 10, 10);
        ctx.bezierCurveTo(8, 14, 2, 8, 4, 18);
        ctx.stroke();

        // Glowing holy sparks/flair
        ctx.fillStyle = 'rgba(59, 130, 246, 0.7)';
        ctx.beginPath();
        ctx.arc(4, 18, 1.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(4, 18, 0.8, 0, Math.PI * 2);
        ctx.fill();

      } else if (weaponName.includes('Scythe') || weaponName.includes('Crimson')) {
        // Crimson Scythe
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#78350f'; // Wood staff shaft
        ctx.beginPath();
        ctx.moveTo(0, 4);
        ctx.lineTo(2, -26);
        ctx.stroke();

        // Scythe blade
        ctx.fillStyle = '#ef4444'; // Bloody crimson blade
        ctx.beginPath();
        ctx.moveTo(2, -26);
        ctx.quadraticCurveTo(14, -28, 18, -14);
        ctx.quadraticCurveTo(11, -19, 2, -22);
        ctx.closePath();
        ctx.fill();

        // Edge steel highlight
        ctx.fillStyle = '#fca5a5';
        ctx.beginPath();
        ctx.moveTo(18, -14);
        ctx.quadraticCurveTo(14, -28, 2, -26);
        ctx.lineTo(1.5, -24);
        ctx.quadraticCurveTo(13, -26, 16.5, -14);
        ctx.closePath();
        ctx.fill();

      } else if (weaponName.includes('Greatsword') || weaponName.includes('Blade') || weaponName.includes('sword')) {
        // Giant Greatsword
        ctx.lineWidth = 1.6;
        ctx.strokeStyle = '#d97706'; // Golden brass crossguard
        ctx.beginPath();
        ctx.moveTo(-2, -2);
        ctx.lineTo(4, -2);
        ctx.stroke();

        // Handle hilt
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = '#1c1917';
        ctx.beginPath();
        ctx.moveTo(1, 0);
        ctx.lineTo(1, 4);
        ctx.stroke();

        // Colossal Blade
        ctx.fillStyle = '#f59e0b'; // Molten dragun core
        ctx.beginPath();
        ctx.moveTo(-1, -2);
        ctx.lineTo(3, -2);
        ctx.lineTo(2, -25);
        ctx.lineTo(1, -28);
        ctx.lineTo(0, -25);
        ctx.closePath();
        ctx.fill();

        // Silver steel edge
        ctx.strokeStyle = '#fffbeb';
        ctx.lineWidth = 0.6;
        ctx.stroke();
      } else {
        // Simple starting sword
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(1, 0);
        ctx.lineTo(5, -12);
        ctx.stroke();
      }

      ctx.restore();

      // Left arm resting/moving
      ctx.fillStyle = chestColor;
      ctx.fillRect(-8, 0 + breath * 0.5, 2.5, 8);

      ctx.restore();
    };

    const animate = () => {
      frameRef.current += 1;
      draw();
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [playerClass, customization, equippedWeapon, equippedArmor, width, height, scale, isAnimated, facing]);

  return (
    <div className="flex flex-col items-center justify-center bg-zinc-950/40 border border-zinc-900 rounded-xl p-2.5 shadow-inner relative overflow-hidden group">
      {/* Visual lighting background glow behind figure */}
      <div 
        className="absolute w-24 h-24 rounded-full blur-2xl opacity-15 mix-blend-screen pointer-events-none transition-colors duration-500" 
        style={{ backgroundColor: customization.capeColor }}
      />
      
      <canvas 
        ref={canvasRef} 
        width={width} 
        height={height} 
        className="block relative z-10 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]"
      />

      <span className="text-[9px] uppercase font-mono tracking-widest text-zinc-500 absolute bottom-1.5 z-10 pointer-events-none">
        Class Figure Unit
      </span>
    </div>
  );
}
