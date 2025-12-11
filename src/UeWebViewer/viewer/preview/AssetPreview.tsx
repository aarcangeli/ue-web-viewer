import type { Asset } from "../../../unreal-engine/serialization/Asset";
import { Box, Text } from "@chakra-ui/react";
import React, { useEffect, useRef } from "react";
import { UStaticMesh } from "../../../unreal-engine/modules/Engine/objects/StaticMesh";
import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";

export function AssetPreview(props: { asset: Asset }) {
  const exportedObjects = props.asset.mainObject;
  if (!exportedObjects) {
    return <Placeholder>No objects to preview</Placeholder>;
  }

  if (exportedObjects instanceof UStaticMesh) {
    return <MeshViewer mesh={exportedObjects} />;
  }

  return <Placeholder>No preview available for this asset</Placeholder>;
}

function MeshViewer(props: { mesh: UStaticMesh }) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const mesh = props.mesh;

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    // Create the scene, camera, and renderer
    const env = makeEnv();

    const scene = env.scene;
    const renderer = env.renderer;

    const camera = new THREE.PerspectiveCamera(90, 1, 0.01);

    const resizeHandler = () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      renderer.setSize(newWidth, newHeight, false);
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
    };

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshMatcapMaterial({ color: 0xffffff });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    const controls = new PointerLockControls(camera, renderer.domElement);
    // Approx 1.1 per scroll step
    //controls.zoomSpeed = 2;

    camera.position.z = 5;

    renderer.setAnimationLoop(() => {
      controls.update();
      renderer.render(scene, camera);
    });

    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";

    container.appendChild(renderer.domElement);
    window.addEventListener("resize", resizeHandler);
    resizeHandler();

    return () => {
      container.removeChild(renderer.domElement);
      window.removeEventListener("resize", resizeHandler);
      returnEnv(env);
    };
  });

  return <Box className={"mesh-viewer"} overflow={"hidden"} ref={containerRef} w="100%" h="100%" />;
}

function Placeholder(pros: { children: string }) {
  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      borderStyle={"dashed"}
      borderColor="rgba(255, 255, 255, 0.2)"
      p={6}
      textAlign="center"
      color="gray.500"
      bg="gray.800"
      height="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
      m={10}
    >
      <Text fontSize="lg" fontWeight="medium">
        {pros.children}
      </Text>
    </Box>
  );
}

interface ThreeEnv {
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
}

const pool: Array<ThreeEnv> = [];

function makeEnv(): ThreeEnv {
  if (pool.length > 0) {
    console.log("Reusing scene from pool");
    return pool.pop()!;
  }

  console.log("Creating new scene");
  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer();
  return { scene, renderer };
}

function returnEnv(scene: ThreeEnv) {
  console.log("Returning scene to pool");
  pool.push(scene);
  scene.renderer.dispose();
  scene.scene.clear();
  scene.renderer.setAnimationLoop(null);
}
