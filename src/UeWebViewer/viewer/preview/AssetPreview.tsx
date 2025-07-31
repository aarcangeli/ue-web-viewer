import type { Asset } from "../../../unreal-engine/serialization/Asset";
import { Box, Text } from "@chakra-ui/react";
import React, { useEffect, useRef } from "react";
import { UStaticMesh } from "../../../unreal-engine/modules/Engine/objects/StaticMesh";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

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
    const width = container.clientWidth;
    const height = container.clientHeight;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(90, width / height, 0.01);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    const controls = new OrbitControls(camera, renderer.domElement);
    // Approx 1.1 per scroll step
    controls.zoomSpeed = 2;

    camera.position.z = 5;

    renderer.setAnimationLoop(() => {
      controls.update();
      renderer.render(scene, camera);
    });

    const resizeHandler = () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      renderer.setSize(newWidth, newHeight, false);
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      console.log("Resized to", newWidth, newHeight);
    };

    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";

    container.appendChild(renderer.domElement);
    window.addEventListener("resize", resizeHandler);
    return () => {
      container.removeChild(renderer.domElement);
      window.removeEventListener("resize", resizeHandler);
      renderer.dispose();
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
