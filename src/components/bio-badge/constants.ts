/**
 * Toutes les dimensions de la scene 3D (unites Three.js) et leur equivalent en
 * pixels CSS pour la face HTML de la carte sont derivees ICI, a partir d'une
 * seule source de verite (taille du canvas + camera). Ca evite que la zone de
 * glisser-deposer (collider physique, en unites 3D) et le rendu visuel de la
 * carte (drei <Html>, en pixels CSS) se desynchronisent.
 */

// Taille du conteneur <Canvas> en pixels CSS.
export const CANVAS_WIDTH_PX = 360
export const CANVAS_HEIGHT_PX = 560

// Camera : distance et champ de vision (degres).
export const CAMERA_DISTANCE = 13
export const CAMERA_FOV = 25

// Hauteur du monde (unites Three.js) visible verticalement a CAMERA_DISTANCE.
const VISIBLE_WORLD_HEIGHT =
  2 * CAMERA_DISTANCE * Math.tan((CAMERA_FOV * Math.PI) / 180 / 2)

// Pixels CSS par unite Three.js, a la distance de la camera.
export const PX_PER_UNIT = CANVAS_HEIGHT_PX / VISIBLE_WORLD_HEIGHT

// Carte : taille physique (unites Three.js), choisie pour donner ~150x200px.
export const CARD_WIDTH = 1.55
export const CARD_HEIGHT = 2.1

// Equivalent en pixels CSS, pour le style inline de BadgeCardFace.
export const CARD_WIDTH_PX = Math.round(CARD_WIDTH * PX_PER_UNIT)
export const CARD_HEIGHT_PX = Math.round(CARD_HEIGHT * PX_PER_UNIT)

// Lanyard : longueur de chaque segment de corde et hauteur du point d'ancrage fixe.
export const SEGMENT_LENGTH = 0.85
export const ANCHOR_Y = 2.2
