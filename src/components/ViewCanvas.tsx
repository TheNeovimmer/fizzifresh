"use client";

import { Canvas } from "@react-three/fiber";
import { View } from "@react-three/drei";
import { Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";

function isWebGLAvailable() {
  try {
    if (typeof document === "undefined") return false;
    const c = document.createElement("canvas");
    return !!(
      c.getContext("webgl2") ||
      c.getContext("webgl") ||
      c.getContext("experimental-webgl")
    );
  } catch {
    return false;
  }
}

const Loader = dynamic(
  () => import("@react-three/drei").then((mod) => mod.Loader),
  { ssr: false },
);

type Props = {};

export default function ViewCanvas({}: Props) {
  const [webglOk, setWebglOk] = useState(false);

  useEffect(() => {
    setWebglOk(isWebGLAvailable());
  }, []);

  // ponytail: skip 3D when GPU is unavailable (VM/headless/--disable-gpu), page still works without it
  if (!webglOk) return null;

  return (
    <>
      <Canvas
        style={{
          position: "fixed",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          overflow: "hidden",
          pointerEvents: "none",
          zIndex: 30,
        }}
        shadows
        dpr={[1, 1.5]}
        gl={{ antialias: true }}
        camera={{
          fov: 30,
        }}
      >
        <Suspense fallback={null}>
          <View.Port />
        </Suspense>
      </Canvas>
      <Loader />
    </>
  );
}
