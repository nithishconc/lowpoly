import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader";
import html2canvas from "html2canvas"; // Import html2canvas
import "./style/RotatingModel.css";

const RotatingModel = ({ image }) => {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("");
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    preserveDrawingBuffer: true,
  });
  renderer.setClearColor("red");
  const lod = new THREE.LOD();
  const rotationInput = useRef();
  const directionalPositionInput = useRef();
  const canvasContainer = useRef();
  const directionalLight = new THREE.DirectionalLight("white", 5);
  const ambientLight = new THREE.AmbientLight(0xffffff, 2);
  scene.add(ambientLight);
  camera.position.z = 5;
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = false;
  controls.autoRotate = false;
  controls.maxPolarAngle = Math.PI / 2;
  controls.minPolarAngle = Math.PI / 2;
  const updateRotation = () => {
    if (lod) {
      const rotationValue = parseFloat(rotationInput.current.value);
      const euler = new THREE.Euler(0, rotationValue, 0, "YXZ");
      lod.setRotationFromEuler(euler);

      const lightPosition = new THREE.Vector3(5, 5, 5);
      lightPosition.applyEuler(euler);
      directionalLight.position.copy(lightPosition);
    }
  };
  const updateLightPosition = () => {
    if (directionalLight) {
      const positionValue = parseFloat(directionalPositionInput.current.value);
      const positionInRadians = THREE.MathUtils.degToRad(positionValue);
      directionalLight.position.setFromSphericalCoords(1, positionInRadians, 0);
    }
  };
  const loader = new GLTFLoader();
  loader.load(
    image,
    (gltf) => {
      const model = gltf.scene;
      const scaleFactor = 1;
      model.scale.set(scaleFactor, scaleFactor, scaleFactor);
      lod.addLevel(model, 0);
      if (canvasContainer.current) {
        canvasContainer.current.appendChild(renderer.domElement);
        scene.add(lod);
        scene.add(directionalLight);
        const animate = () => {
          requestAnimationFrame(animate);
          updateRotation();
          updateLightPosition();
          const newAspectRatio = window.innerWidth / window.innerHeight;
          if (camera.aspect !== newAspectRatio) {
            camera.aspect = newAspectRatio;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
          }
          renderer.render(scene, camera);
        };
        animate();
      }
    },
    undefined,
    (error) => {
      console.error("Error loading GLB model:", error);
    }
  );

  const handleDownloadImage = () => {
    // Set the clear color to transparent
    renderer.setClearColor(0x000000, 0);

    // Render the scene to ensure proper capture
    renderer.render(scene, camera);

    // Use PNG format for transparency
    const dataUrl = renderer.domElement.toDataURL("image/png");

    // Convert to blob and download
    fetch(dataUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "screenshot.png";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Reset the clear color to its original value
        renderer.setClearColor("red");
      })
      .catch((error) => {
        console.error("Error creating Blob:", error);

        // Reset the clear color to its original value even if an error occurs
        renderer.setClearColor("red");
      });
  };

  const saveAsImage = (strData, filename) => {
    const link = document.createElement("a");
    if (typeof link.download === "string") {
      document.body.appendChild(link);
      link.download = filename;
      link.href = strData;
      link.click();
      document.body.removeChild(link);
    } else {
      location.replace(uri);
    }
  };

  const handleUnmount = () => {
    renderer.dispose();
    controls.dispose();
    if (canvasContainer.current) {
      canvasContainer.current.removeChild(renderer.domElement);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [camera, renderer]);

  useEffect(() => {
    rotationInput.current.value = 0;
    directionalPositionInput.current.value = 0;

    updateRotation();
    updateLightPosition();
  }, []);

  return (
    <div>
      <div style={{}} ref={canvasContainer}></div>
      <label>
        Rotation Y:
        <input
          type="range"
          min={0}
          max={Math.PI * 2}
          step={0.01}
          ref={rotationInput}
          onChange={updateRotation}
        />
      </label>
      <br />
      <label>
        Directional Light Position:
        <input
          type="range"
          min={0}
          max={360}
          step={0.1}
          ref={directionalPositionInput}
          onChange={updateLightPosition}
        />
      </label>
      <br />
      <button onClick={handleDownloadImage}>Download Image</button>
    </div>
  );
};

function App() {
  return (
    <>
      <RotatingModel image={"/Cube.glb"} />
    </>
  );
}

export default App;
