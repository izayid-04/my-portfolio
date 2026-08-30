"use client"

import { useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
  type RapierRigidBody,
} from "@react-three/rapier"
import * as THREE from "three"
import { BadgeCardFace, type BadgeCardContent } from "./badge-card-face"
import {
  ANCHOR_Y,
  CAMERA_DISTANCE,
  CAMERA_FOV,
  CARD_HEIGHT,
  CARD_WIDTH,
  SEGMENT_LENGTH,
} from "./constants"

const CORD_RADIUS = 0.045

function Band({ content }: { content: BadgeCardContent }) {
  const cord = useRef<THREE.Mesh>(null)
  const cardGroup = useRef<THREE.Group>(null)

  const fixed = useRef<RapierRigidBody>(null!)
  const j1 = useRef<RapierRigidBody>(null!)
  const j2 = useRef<RapierRigidBody>(null!)
  const j3 = useRef<RapierRigidBody>(null!)
  const card = useRef<RapierRigidBody>(null!)

  const vec = new THREE.Vector3()
  const [dragged, setDragged] = useState<THREE.Vector3 | false>(false)

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], SEGMENT_LENGTH])
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], SEGMENT_LENGTH])
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], SEGMENT_LENGTH])
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, CARD_HEIGHT / 2 + 0.15, 0],
  ])

  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
      ])
  )

  useFrame((state) => {
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera)
      const dir = vec.sub(state.camera.position).normalize()
      const distance = -state.camera.position.z / dir.z
      const pos = state.camera.position.clone().add(dir.multiplyScalar(distance))
      card.current?.setNextKinematicTranslation({
        x: pos.x - dragged.x,
        y: pos.y - dragged.y,
        z: pos.z - dragged.z,
      })
    }

    if (fixed.current && j1.current && j2.current && j3.current && cord.current) {
      curve.points[0].copy(j3.current.translation())
      curve.points[1].copy(j2.current.translation())
      curve.points[2].copy(j1.current.translation())
      curve.points[3].copy(fixed.current.translation())
      const oldGeometry = cord.current.geometry
      cord.current.geometry = new THREE.TubeGeometry(curve, 24, CORD_RADIUS, 8, false)
      oldGeometry.dispose()
    }

    if (card.current && cardGroup.current) {
      const t = card.current.translation()
      const r = card.current.rotation()
      cardGroup.current.position.set(t.x, t.y, t.z)
      cardGroup.current.quaternion.set(r.x, r.y, r.z, r.w)
    }
  })

  return (
    <>
      <RigidBody ref={fixed} position={[0, ANCHOR_Y, 0]} type="fixed" />
      <RigidBody ref={j1} position={[0, ANCHOR_Y - SEGMENT_LENGTH, 0]} type="dynamic">
        <BallCollider args={[0.08]} />
      </RigidBody>
      <RigidBody ref={j2} position={[0, ANCHOR_Y - SEGMENT_LENGTH * 2, 0]} type="dynamic">
        <BallCollider args={[0.08]} />
      </RigidBody>
      <RigidBody ref={j3} position={[0, ANCHOR_Y - SEGMENT_LENGTH * 3, 0]} type="dynamic">
        <BallCollider args={[0.08]} />
      </RigidBody>

      <RigidBody
        ref={card}
        position={[0, ANCHOR_Y - SEGMENT_LENGTH * 3 - (CARD_HEIGHT / 2 + 0.15), 0]}
        type={dragged ? "kinematicPosition" : "dynamic"}
        colliders={false}
        angularDamping={3}
        linearDamping={2.2}
      >
        <CuboidCollider args={[CARD_WIDTH / 2, CARD_HEIGHT / 2, 0.02]} />
        <mesh
          onPointerDown={(e) => {
            e.stopPropagation()
            ;(e.nativeEvent.target as Element | null)?.setPointerCapture?.(e.pointerId)
            const t = card.current.translation()
            setDragged(new THREE.Vector3(e.point.x - t.x, e.point.y - t.y, e.point.z - t.z))
          }}
          onPointerUp={(e) => {
            ;(e.nativeEvent.target as Element | null)?.releasePointerCapture?.(e.pointerId)
            setDragged(false)
          }}
        >
          <planeGeometry args={[CARD_WIDTH, CARD_HEIGHT]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </RigidBody>

      {/* Groupe visuel suivant la carte physique, avec la vraie face HTML */}
      <group ref={cardGroup}>
        <Html transform occlude={false} style={{ pointerEvents: "none" }} center>
          <BadgeCardFace content={content} />
        </Html>
      </group>

      {/* Corde : vrai tube 3D rond et eclaire, pas un ruban plat */}
      <mesh ref={cord} castShadow>
        <bufferGeometry />
        <meshStandardMaterial color="#2b2f36" roughness={0.45} metalness={0.25} />
      </mesh>
    </>
  )
}

export function LanyardScene({ content }: { content: BadgeCardContent }) {
  return (
    <Canvas
      camera={{ position: [0, 0, CAMERA_DISTANCE], fov: CAMERA_FOV }}
      gl={{ alpha: true, antialias: true }}
      style={{ background: "transparent" }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.75} />
      <directionalLight position={[3, 6, 5]} intensity={1.5} />
      <directionalLight position={[-3, -2, 4]} intensity={0.4} />
      <Physics gravity={[0, -32, 0]} interpolate>
        <Band content={content} />
      </Physics>
    </Canvas>
  )
}
