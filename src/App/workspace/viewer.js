import * as THREE from "three/build/three.module.js";
import { GUI } from "three/examples/jsm/libs/dat.gui.module.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { BVHLoader } from "three/examples/jsm/loaders/BVHLoader.js";

//import { XNectLoader } from "App/workspace/loader";
import { EDWSolver, DTWSolver } from "App/workspace/solver";
import { JointHelper, LimbHelper } from "App/workspace/helper";

import BVHURL1 from "assets/bvh/data_3d1.bvh";
import BVHURL2 from "assets/bvh/data_3d2.bvh";
//import XNECTURL from "assets/xnect/post_raw3D.txt";

class Viewer {
  constructor({ container }) {
    const canvas = document.createElement("canvas");
    const bvhsLoaded = [this.load(new BVHLoader(), BVHURL1), this.load(new BVHLoader(), BVHURL2)];
    //const xnectLoaded = this.load(new XNectLoader(), XNECTURL);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    container.appendChild(canvas);

    Promise.all(bvhsLoaded).then((results) => {
      const controller = (this.controller = new Controller({ canvas: canvas, bvhs: results }));

      controller.init(0, "lapScene", "freeCam", "EDW", "all");
    });
  }

  load(loader, url) {
    return new Promise((resolve) => {
      loader.load(url, resolve);
    });
  }
}

class Controller extends GUI {
  constructor({ canvas, bvhs }) {
    super();

    // renderer
    const renderer = (this.renderer = new Renderer({ canvas: canvas }));

    // camera
    const camera = (this.camera = new Camera({ fov: 60, aspect: 640 / 360, near: 0.1, far: 50000 }));

    // orbit
    const orbit = (this.orbit = new OrbitControls(camera, canvas));

    // model
    const refModel = (this.refModel = new Model(
      { geometry: new THREE.BufferGeometry(), material: new THREE.MeshNormalMaterial({ skinning: true }) },
      { skeleton: bvhs[0].skeleton, clip: bvhs[0].clip }
    ));
    const cmpModel = (this.cmpModel = new Model(
      { geometry: new THREE.BufferGeometry(), material: new THREE.MeshNormalMaterial({ skinning: true }) },
      { skeleton: bvhs[1].skeleton, clip: bvhs[1].clip }
    ));

    // solver
    this.edwSolver = new EDWSolver({ ref: refModel, cmp: cmpModel });
    this.dtwSolver = new DTWSolver({ ref: refModel, cmp: cmpModel });

    // scene
    const lapScene = (this.lapScene = new Scene());
    const refScene = (this.refScene = new Scene());
    const cmpScene = (this.cmpScene = new Scene());

    // controller
    const playerConfs = { edwFrame: 0, dtwFrame: 0 };
    const sceneConfs = (this.sceneConfs = { lapScene: true, sepScene: false });
    const cameraConfs = (this.cameraConfs = {
      freeCam: true,
      frontCam: false,
      backCam: false,
      topCam: false,
      downCam: false,
      leftCam: false,
      rightCam: false,
    });
    const solverConfs = (this.solverConfs = { EDW: true, DTW: false });
    const selectConfs = (this.selectConfs = { all: true, part: false });
    const btnConfs = {
      resolve: () => {
        console.log("clicked");
      },
    };
    const panel = this.addFolder("Panel");

    const sceneFolder = panel.addFolder("Scene Mode");
    const cameraFolder = panel.addFolder("Camera Mode");
    //const solverFolder = panel.addFolder("Solver Mode");
    const selectFolder = panel.addFolder("Select Mode");
    const playerFolder = panel.addFolder("Player");

    const edwFrame = playerFolder.add(playerConfs, "edwFrame", 0, 300, 1);
    const dtwFrame = playerFolder.add(playerConfs, "dtwFrame", 0, this.dtwSolver.path.length - 1, 1);
    playerFolder.add(btnConfs, "resolve").name("recalculate");

    const sceneModes = [
      sceneFolder.add(sceneConfs, "lapScene").name("overlap scene"),
      sceneFolder.add(sceneConfs, "sepScene").name("seperate scene"),
    ];
    const cameraModes = [
      cameraFolder.add(cameraConfs, "freeCam").name("free camera"),
      cameraFolder.add(cameraConfs, "frontCam").name("front camera"),
      cameraFolder.add(cameraConfs, "backCam").name("back camera"),
      cameraFolder.add(cameraConfs, "leftCam").name("left camera"),
      cameraFolder.add(cameraConfs, "rightCam").name("right camera"),
      cameraFolder.add(cameraConfs, "topCam").name("top camera"),
      cameraFolder.add(cameraConfs, "downCam").name("down camera"),
    ];
    //const solverModes = [
    //solverFolder.add(solverConfs, "EDW").name("Euclidean Distance Warping"),
    //solverFolder.add(solverConfs, "DTW").name("Dynamic Time Warping"),
    //];
    const selectModes = [
      selectFolder.add(selectConfs, "all").name("full skeleton"),
      selectFolder.add(selectConfs, "part").name("partial bones"),
    ];

    panel.open();
    sceneFolder.open();
    cameraFolder.open();
    //solverFolder.open();
    selectFolder.open();
    playerFolder.open();

    // listener
    edwFrame.listen().onChange((frame) => this.updateModel(1, "EDW", frame));
    dtwFrame.listen().onChange((frame) => this.updateModel(1, "DTW", frame));
    for (const mode of sceneModes) mode.listen().onChange(() => this.updateScene(mode.property));
    for (const mode of cameraModes) mode.listen().onChange(() => this.updateCamera(mode.property));

    //for (const mode of solverModes)
    //mode.listen().onChange(() => this.update(frame.getValue(), undefined, undefined, mode.property, undefined));

    //for (const mode of selectModes)
    //mode.listen().onChange(() => this.update(frame.getValue(), undefined, undefined, undefined, mode.property));

    orbit.addEventListener("change", () => renderer.update(lapScene, refScene, cmpScene, camera), false);
    window.addEventListener("resize", () => this.updateCamera(), false);
  }

  init(frame, sceneMode, cameraMode, solverMode, selectMode) {
    this.updateMode(solverMode, this.solverConfs);
    this.updateMode(selectMode, this.selectConfs);

    this.updateCamera(cameraMode);
    this.updateModel(1, "EDW", frame);
    this.updateScene(sceneMode);
  }

  updateCamera(cameraMode) {
    this.updateMode(cameraMode, this.cameraConfs);

    this.camera.update(this.renderer.domElement, cameraMode);
    this.orbit.update();

    this.renderer.update(this.lapScene, this.refScene, this.cmpScene, this.camera);
  }

  updateModel(actionID, solver, frame) {
    const refFrame = solver === "DTW" ? this.dtwSolver.path[frame][0] : frame;
    const cmpFrame = solver === "DTW" ? this.dtwSolver.path[frame][1] : frame;

    this.refModel.update(actionID, refFrame);
    this.cmpModel.update(actionID, cmpFrame);

    this.renderer.update(this.lapScene, this.refScene, this.cmpScene, this.camera);
  }

  updateScene(sceneMode) {
    const refModel = this.refModel;
    const cmpModel = this.cmpModel;
    const lapScene = this.lapScene;
    const refScene = this.refScene;
    const cmpScene = this.cmpScene;

    this.updateMode(sceneMode, this.sceneConfs);

    if (sceneMode === "lapScene") {
      //this.add(model); // ???
      //this.add(model.getRootBone()); // ???
      lapScene.update(refModel);
      lapScene.update(cmpModel);

      refScene.visible = false;
      cmpScene.visible = false;
    } else if (sceneMode === "sepScene") {
      refScene.update(refModel);
      cmpScene.update(cmpModel);

      lapScene.visible = false;
    }

    this.renderer.update(this.lapScene, this.refScene, this.cmpScene, this.camera);
  }

  updateMode(mode, confs) {
    for (const conf in confs) confs[conf] = conf === mode ? true : false;
  }
}

class Renderer extends THREE.WebGLRenderer {
  constructor(parameters) {
    super(parameters);

    this.setScissorTest(true);
    this.autoClear = false;

    // syncWith
  }

  update(lapScene, refScene, cmpScene, camera) {
    const canvas = this.domElement;

    this.setSize(window.innerWidth, window.innerHeight);

    const { left, right, top, bottom, width, height } = canvas.getBoundingClientRect();

    this.updateView(lapScene, camera, left, top, width, height);
    this.updateView(refScene, camera, left, top, width / 2, height);
    this.updateView(cmpScene, camera, left + width / 2, top, width / 2, height);

    //requestAnimationFrame(() => this.update());
  }

  updateView(scene, camera, left, top, right, bottom) {
    this.setScissor(left, top, right, bottom);
    this.setViewport(left, top, right, bottom);
    this.render(scene, camera);
  }
}

class Camera extends THREE.PerspectiveCamera {
  constructor({ fov, aspect, near, far }) {
    super(fov, aspect, near, far);

    this.position.set(0, 100, 300);

    //this.layers.enable(0); // enabled by default

    //this.layers.disable(1);

    //this.layers.toggle(1); // this
  }

  update(canvas, mode) {
    const position = this.position;

    if (mode === "freeCam") position.set(0, 100, 300);
    if (mode === "frontCam") position.set(0, 100, 300);
    if (mode === "backCam") position.set(0, 100, -300);
    if (mode === "leftCam") position.set(-300, 100, 0);
    if (mode === "rightCam") position.set(300, 100, 0);
    if (mode === "topCam") position.set(0, 300, 0);
    if (mode === "downCam") position.set(0, -300, 0);

    this.aspect = canvas.clientWidth / canvas.clientHeight;

    this.updateProjectionMatrix();
  }
}

class Scene extends THREE.Scene {
  constructor() {
    super();

    this.add(new THREE.GridHelper(10000, 10));
  }

  update(model) {
    this.add(model.jointHelper);
    this.add(model.limbHelper);

    this.visible = true;
  }
}

class Model extends THREE.SkinnedMesh {
  constructor({ geometry, material }, { skeleton, clip }) {
    super(geometry, material);

    this.skeleton = skeleton;
    this.clipBones = this.getBoneList(this.skeleton.bones[0].clone(), "clip");

    this.animations = [clip];

    this.limbHelper = new LimbHelper(
      { geometry: new THREE.BufferGeometry(), material: new THREE.LineBasicMaterial({ vertexColors: true }) },
      { bones: this.skeleton.bones, color: "white" }
    );

    this.jointHelper = new JointHelper({ bones: this.clipBones, clip: this.animations[0] });

    this.mixer = new THREE.AnimationMixer(this);

    this.mixer.clipAction(this.animations[0]).play();
  }

  update(actionID, frame) {
    this.mixer.setTime(this.animations[0].tracks[0].times[frame]);
    this.jointHelper.update(actionID, frame);
    this.limbHelper.update(this.limbHelper.colors);
  }

  //getRootBone() {
  //let root = this.skeleton.bones[0];

  //while (root.parent) root = root.parent;

  //return root;
  //}

  getBoneList(node, type) {
    const list = [];

    if (type !== "clip" || node.name !== "ENDSITE") list.push(node);

    for (const bone of node.children) list.push.apply(list, this.getBoneList(bone, type));

    return list;
  }
}

export { Viewer };
