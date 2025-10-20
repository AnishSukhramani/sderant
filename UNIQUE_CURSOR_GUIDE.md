# 🚀 The World's Most Unique Cursor

## Overview
This is not your typical cursor. This is a **morphing, trail-leaving, particle-exploding, scroll-reactive terminal cursor** that changes based on context and scroll position.

---

## 🎨 What Makes It Unique

### 1. **Terminal Character Cursor**
Instead of a dot or circle, your cursor is a **literal terminal character**:
- Default: █ (full block) that blinks to ▓ (medium shade)
- Over buttons: [ ] (brackets)
- Over links: → (arrow)
- Over text inputs: | (blinking pipe)

### 2. **Character Trail Effect**
As you move, it leaves a trail of random terminal characters:
- Characters: `0`, `1`, `>`, `_`, `|`, `/`, `\`, `-`, `+`, `*`, `#`, `@`
- Each character fades out over 600ms
- Last 12 characters visible at once
- Creates a "hacking in progress" effect

### 3. **Scroll-Based Rotation**
- Cursor rotates 360° as you scroll down the page
- At 0% scroll: 0° rotation
- At 50% scroll: 180° rotation
- At 100% scroll: 360° rotation
- **Exception**: Doesn't rotate over links (keeps arrow pointing right)

### 4. **Hexagon Grid Overlay**
- Appears between 25% and 75% scroll
- Rotating hexagonal grid pattern
- Pulsing scale animation
- Gives "targeting system" vibe

### 5. **Particle Explosion on Click**
- 8 particles explode outward in all directions
- Each particle travels 50px from click point
- Forms a perfect circle of particles
- Green glowing dots with shadows

### 6. **Matrix Rain on Click**
- 6 random characters fall downward
- Appear instantly, fade as they fall
- Staggered timing for wave effect
- Pure Matrix movie aesthetic

### 7. **CRT Scan Line**
- Horizontal scan line follows cursor
- Subtle in default state
- Expands and brightens on click
- Creates old-school monitor feel

### 8. **Glitch Effect on Click**
- Cursor character duplicates
- Red and cyan copies offset randomly
- Rapid glitching animation
- Classic cyberpunk aesthetic

### 9. **Animated Brackets for Buttons**
- Appears as `< [ ] >`
- Brackets pulse inward/outward
- Animated with 0.5s offset between sides
- Indicates "this is clickable"

### 10. **Ambient Glow**
- Soft green glow follows cursor
- Grows larger as you scroll (120px max)
- Gets brighter as you scroll
- Blurred to perfection

---

## 🎮 Cursor Modes

### Default Mode
```
Character: █ (blinking to ▓)
Rotation: Based on scroll
Glow: Active
Trail: Active
```

### Button Mode (hovering over buttons)
```
Character: [ ]
Brackets: < >
Scale: 1.3x larger
Rotation: Based on scroll
Pulsing animation: Active
```

### Link Mode (hovering over links)
```
Character: →
Rotation: Fixed (0°) - arrow stays horizontal
Scale: Normal
Trail: Active
```

### Text Input Mode (in input fields)
```
Character: | (blinking pipe)
Rotation: Based on scroll
Standard text cursor appearance
```

---

## 📊 Scroll-Based Animations

### 0-25% Scroll
- Normal cursor
- Starting rotation
- Standard glow size

### 25-75% Scroll
- Hexagon grid appears
- Grid rotates 2x speed (720° total)
- Pulsing scale animation
- Increased glow intensity

### 75-100% Scroll
- Maximum glow size (1.5x)
- Maximum glow brightness (0.7 opacity)
- Full 360° rotation completed
- Hexagon grid fades out

---

## 🎯 Click Effects

**When you click anywhere:**

1. **Particle Explosion** (instant)
   - 8 particles shoot out
   - Perfect radial distribution
   - 500ms animation

2. **Matrix Rain** (instant)
   - 6 characters fall
   - Random ASCII characters
   - 400ms fade out

3. **Glitch Effect** (instant)
   - Red ghost cursor offset
   - Cyan ghost cursor offset
   - 300ms rapid glitch

4. **Scan Line Expansion** (instant)
   - Width doubles
   - Opacity increases
   - Returns to normal on release

---

## 🌟 Visual Effects

### Blinking Animation
- Blinks every 530ms (classic terminal timing)
- Full block █ → Medium shade ▓
- In text mode: | → (hidden)

### Trail Characters
- Spawn every 15px of movement
- Random character selection
- 600ms fade out
- Maximum 12 visible at once

### Glow Effects
- Main cursor: Double text shadow (10px + 20px)
- Trail: Single text shadow (5px)
- Particles: Box shadow (5px)
- Ambient: Radial gradient (25px blur)

---

## 🎨 Color Palette

- **Primary**: #00ff41 (Matrix green)
- **Glitch Red**: #ff0000
- **Glitch Cyan**: #00ffff
- **Glow**: rgba(0, 255, 65, 0.15-0.8)
- **Shadows**: rgba(0, 255, 65, 0.4-0.8)

---

## ⚡ Performance

### Optimizations
- Uses `requestAnimationFrame` for smooth updates
- Trail limited to 12 items (auto-cleanup)
- Particles auto-remove after 500ms
- Matrix chars auto-remove after 400ms
- Spring physics for smooth following
- GPU-accelerated transforms

### Frame Rate
- **Cursor movement**: 60fps
- **Trail animation**: 60fps
- **Particle explosions**: 60fps
- **Rotation**: Smooth interpolation

### Memory Management
- Automatic cleanup of old trail items
- Automatic cleanup of particles
- Automatic cleanup of matrix characters
- No memory leaks

---

## 🎭 Context-Aware Behavior

### Detects:
- Buttons (`<button>` tags)
- Links (`<a>` tags)
- Text inputs (`<input>`, `<textarea>`)
- Nested elements (checks parent elements)

### Responds by:
- Changing character
- Adding/removing brackets
- Adjusting rotation
- Scaling size
- Triggering animations

---

## 🌐 Browser Support

✅ Chrome/Edge (full support)  
✅ Firefox (full support)  
✅ Safari (full support)  
✅ Brave (full support)  
⚠️ Mobile (cursor hidden - native touch)

---

## 🎮 Try These Interactions

1. **Move your mouse normally**
   - Watch the character trail
   - See the smooth spring physics
   - Notice the ambient glow

2. **Scroll down slowly**
   - Watch cursor rotate
   - See hexagon grid appear at 25%
   - Notice glow intensity increase

3. **Hover over a button**
   - Brackets appear: `< [ ] >`
   - Cursor scales up
   - Brackets pulse inward

4. **Hover over a link**
   - Arrow appears: →
   - Rotation stops (stays horizontal)
   - Trail continues

5. **Click anywhere**
   - 8 particles explode outward
   - Matrix characters fall
   - Glitch effect triggers
   - Scan line expands

6. **Move fast**
   - More trail characters
   - Faster updates
   - Smooth spring catch-up

7. **Click a button**
   - All click effects PLUS
   - Button press animation
   - Bracket pulse intensifies

---

## 🔮 Advanced Features

### Dynamic Trail
- Speed-based generation
- Random character selection
- Fade-out animation
- Position tracking

### Smart Rotation
- Disabled for links (UX consideration)
- Smooth interpolation
- Based on global scroll
- 0-360° range

### Context Switching
- Instant mode changes
- Smooth transitions
- Priority hierarchy
- Nested element support

### Particle System
- Radial distribution
- Distance calculation
- Timed cleanup
- Smooth animations

---

## 🎨 Unique Aspects

**What makes this cursor unlike anything else:**

1. **Terminal Characters** - Not shapes, actual text
2. **Scroll Rotation** - Cursor reacts to page position
3. **Character Trail** - Leaves code behind
4. **Multi-Mode** - Changes form based on context
5. **Particle Explosion** - Click creates star burst
6. **Matrix Rain** - Click spawns falling chars
7. **Glitch Effect** - RGB split on click
8. **Hexagon Grid** - Targeting system overlay
9. **CRT Scan Line** - Retro monitor effect
10. **Pulsing Brackets** - Animated UI indicators

---

## 💡 The Philosophy

This cursor isn't just a pointer - it's an **interactive character** in your interface. It:

- **Leaves traces** of where you've been
- **Reacts to** your actions and scroll position
- **Communicates** what's clickable through shape-shifting
- **Creates ambience** with glows and trails
- **Adds personality** to every interaction
- **Feels alive** with constant subtle animations

---

## 🎯 Technical Implementation

### State Management
- `cursorMode`: Tracks current context
- `isClicking`: Click state for effects
- `scrollProgress`: 0-1 scroll position
- `trail`: Array of trail characters
- `particles`: Array of explosion particles
- `blinkState`: Blink animation toggle

### Motion Values
- `cursorX`/`cursorY`: Raw cursor position
- `cursorXSpring`/`cursorYSpring`: Smooth following
- Spring config: damping 20, stiffness 200

### Effects Layer
1. Trail (z-index: 9999)
2. Particles (z-index: 9998)
3. Scan line (z-index: 9997)
4. Main cursor (z-index: 10000)
5. Brackets (z-index: 9996)
6. Ambient glow (z-index: 9995)
7. Matrix chars (z-index: 9994)
8. Hex grid (z-index: 9993)

---

## 🚀 Result

You now have a cursor that:
- Nobody has ever seen before ✨
- Changes as you scroll 📜
- Morphs based on context 🔄
- Leaves trails of code 💻
- Explodes on click 💥
- Feels like hacking 👨‍💻
- Matches your theme perfectly 💚

**It's not just a cursor. It's an experience.** 🎯

