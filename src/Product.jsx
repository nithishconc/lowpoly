import TuneIcon from "@mui/icons-material/Tune";
import SouthIcon from "@mui/icons-material/South";
import "./style/Product.css";
import React, { useEffect, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader";

function Product({ image, model }) {
  const [custom, setCustom] = useState(false);
  const [renderImage, setRenderImage] = useState(false);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("");

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setClearColor("red");

  const lod = new THREE.LOD();
  const rotationInput = React.createRef();
  const directionalPositionInput = React.createRef();
  const canvasContainer = React.createRef();
  const directionalLight = new THREE.DirectionalLight("white", 5);
  const ambientLight = new THREE.AmbientLight(0xffffff, 7);
  scene.add(ambientLight);
  camera.position.z = 5;
  camera.position.y = 0; // Center the camera vertically

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
      const scaleFactor = 5;
      model.scale.set(scaleFactor, scaleFactor, scaleFactor);
      lod.addLevel(model, 0);
      if (canvasContainer.current) {
        canvasContainer.current.appendChild(renderer.domElement);
        scene.add(lod);
        scene.add(directionalLight);

        // Center the mesh
        const boundingBox = new THREE.Box3().setFromObject(model);
        const center = boundingBox.getCenter(new THREE.Vector3());
        model.position.sub(center);

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
    setRenderImage(true);
    const canvas = renderer.domElement;
    const originalSize = {
      width: canvas.width,
      height: canvas.height,
    };
    const higherPixelRatio = 2.0;
    renderer.setPixelRatio(window.devicePixelRatio * higherPixelRatio);
    renderer.setSize(
      originalSize.width * higherPixelRatio,
      originalSize.height * higherPixelRatio
    );
    const animate = () => {
      renderer.render(scene, camera);
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "screenshot.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setRenderImage(false);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(originalSize.width, originalSize.height);
    };
    if (scene.children.length === 0) {
      console.error("No 3D model loaded.");
      setRenderImage(false);
      return;
    }
    animate();
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
    <div className="lowpoly_container_child">
      <div
        className="canvas"
        style={{ width: "90%", height: "90%" }}
        ref={canvasContainer}
      ></div>
      <div className="name_edit_download">
        <div className="name">Blow</div>
        <div className="edit_download">
          <span
            onClick={() => {
              setCustom((prev) => !prev);
            }}
          >
            <TuneIcon style={{ fontSize: "25px", color: "rgb(40, 40, 40)" }} />
          </span>
          <span onClick={handleDownloadImage}>
            <SouthIcon />
          </span>
        </div>
      </div>
      <div className="description">
        <p>It's time to dive into the creative process. Use the benefits</p>
      </div>

      {true ? (
        <div>
          {console.log(custom)}
          <div
            className="border"
            style={custom ? { display: "flex" } : { display: "none" }}
          ></div>

          <div
            className="edit_drop_down"
            style={custom ? {} : { display: "none" }}
          >
            <label>
              Rotation
              <input
                type="range"
                min={0}
                max={Math.PI * 2}
                step={0.01}
                id="test1"
                ref={rotationInput}
                onChange={updateRotation}
              />
            </label>
            <br />
            <label>
              Lighting
              <input
                type="range"
                id="test2"
                min={0}
                max={360}
                step={0.1}
                ref={directionalPositionInput}
                onChange={updateLightPosition}
              />
            </label>
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}

export default Product;
