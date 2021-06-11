import * as THREE from "three/build/three.module.js";
import { GUI } from "three/examples/jsm/libs/dat.gui.module.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { BVHLoader } from "three/examples/jsm/loaders/BVHLoader.js";
import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";

//import { XNectLoader } from "App/workspace/loader";
import { EDWSolver, DTWSolver } from "App/workspace/solver";
import { JointHelper, LimbHelper } from "App/workspace/helper";

import BVHURL1 from "assets/bvh/data_3d1.bvh";
import BVHURL2 from "assets/bvh/data_3d2.bvh";
//import XNECTURL from "assets/xnect/post_raw3D.txt";

// syncWith

class Viewer {
  constructor({ container }) {
    const canvas = document.createElement("canvas");
    const bvhsLoaded = [this.load(new BVHLoader(), BVHURL1), this.load(new BVHLoader(), BVHURL2)];
    //const xnectLoaded = this.load(new XNectLoader(), XNECTURL);

    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;

    container.appendChild(canvas);

    Promise.all(bvhsLoaded).then((results) => {
      const controller = (this.controller = new Controller({ container: container, canvas: canvas, bvhs: results }));

      controller.update(controller.defaultFrame, "lapScene", "freeCam", "EDW", "all");
    });
  }

  load(loader, url) {
    return new Promise((resolve) => {
      loader.load(url, resolve);
    });
  }
}

class Controller extends GUI {
  constructor({ container, canvas, bvhs }) {
    super();

    // renderer
    const renderer = (this.renderer = new Renderer({ canvas: canvas }, { container: container, bvhs: bvhs }));

    // controller
    const playerConfs = { defaultFrame: 0, edwFrame: 0, dtwFrame: 0 };
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
    //const solverConfs = (this.solverConfs = { default: true, EDW: false, DTW: false });
    const selectConfs = (this.selectConfs = { all: true, part: false });
    const btnConfs = {
      resolve: () => {
        console.log("clicked");
      },
    };
    const panel = this.addFolder("Panel");

    const sceneFolder = panel.addFolder("Scene Mode");
    const cameraFolder = panel.addFolder("Camera Mode");
    const selectFolder = panel.addFolder("Select Mode");
    //const solverFolder = panel.addFolder("Solver Mode");
    const playerFolder = panel.addFolder("Player");

    const defaultFrame = (this.defaultFrame = playerFolder.add(
      playerConfs,
      "defaultFrame",
      0,
      renderer.edwSolver.maxFramesNum - 1,
      1
    ));
    const edwFrame = (this.edwFrame = playerFolder.add(playerConfs, "edwFrame", 0, renderer.edwSolver.maxFramesNum - 1, 1));
    const dtwFrame = (this.dtwFrame = playerFolder.add(playerConfs, "dtwFrame", 0, renderer.dtwSolver.dtwFramesNum - 1, 1));

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
    const selectModes = [
      selectFolder.add(selectConfs, "all").name("full skeleton"),
      selectFolder.add(selectConfs, "part").name("partial bones"),
    ];
    //const solverModes = [
    //solverFolder.add(solverConfs, "default").name("Default View"),
    //solverFolder.add(solverConfs, "EDW").name("Euclidean Distance Warping"),
    //solverFolder.add(solverConfs, "DTW").name("Dynamic Time Warping"),
    //];

    this.curPlayerMode = undefined;

    panel.open();
    sceneFolder.open();
    cameraFolder.open();
    selectFolder.open();
    playerFolder.open();

    // listener
    defaultFrame
      .listen()
      .onChange((frame) => this.update(defaultFrame, this.getMode(sceneConfs), this.getMode(cameraConfs), undefined, undefined));
    edwFrame
      .listen()
      .onChange((frame) => this.update(edwFrame, this.getMode(sceneConfs), this.getMode(cameraConfs), undefined, undefined));
    dtwFrame
      .listen()
      .onChange((frame) => this.update(dtwFrame, this.getMode(sceneConfs), this.getMode(cameraConfs), undefined, undefined));

    for (const mode of sceneModes)
      mode
        .listen()
        .onChange(() => this.update(this.curPlayerMode, mode.property, this.getMode(cameraConfs), undefined, undefined));
    for (const mode of cameraModes)
      mode
        .listen()
        .onChange(() => this.update(this.curPlayerMode, this.getMode(sceneConfs), mode.property, undefined, undefined));
    //for (const mode of selectModes)
    //mode.listen().onChange(() => this.update(frame.getValue(), undefined, undefined, undefined, mode.property));

    renderer.orbit.addEventListener("change", () => this.renderer.update(undefined, this.getMode(sceneConfs)), false);

    container.addEventListener(
      "resize",
      () => this.update(this.curPlayerMode, this.getMode(sceneConfs), this.getMode(cameraConfs), undefined, undefined),
      false
    );
    container.addEventListener(
      "mousemove",
      (event) =>
        this.update(this.curPlayerMode, this.getMode(sceneConfs), this.getMode(cameraConfs), undefined, undefined, event),
      false
    );
  }

  update(playerMode, sceneMode, cameraMode, solverMode, selectMode, event) {
    this.curPlayerMode = playerMode;

    this.updateMode(cameraMode, this.cameraConfs);
    this.updateMode(sceneMode, this.sceneConfs);
    //this.updateMode(solverMode, this.solverConfs);
    //this.updateMode(selectMode, this.selectConfs);

    this.renderer.updateModel(playerMode);
    this.renderer.updateScene(sceneMode);
    this.renderer.updateCamera(cameraMode);
    this.renderer.update(event, sceneMode);
  }

  getMode(confs) {
    for (const conf in confs) if (confs[conf]) return conf;
  }

  updateMode(mode, confs) {
    for (const conf in confs) confs[conf] = conf === mode ? true : false;
  }
}

class Renderer extends THREE.WebGLRenderer {
  constructor(parameters, { container, bvhs }) {
    super(parameters);

    // camera
    const camera = (this.camera = new Camera({ fov: 60, aspect: 640 / 360, near: 0.1, far: 50000 }));
    // orbit
    const orbit = (this.orbit = new OrbitControls(camera, this.domElement));
    const mouse = (this.mouse = new THREE.Vector2());
    const raycaster = (this.raycaster = new THREE.Raycaster());
    // model
    const refModel = (this.refModel = new Model(
      { geometry: new THREE.BufferGeometry(), material: new THREE.MeshNormalMaterial({ skinning: true, opacity: 0.3 }) },
      { skeleton: bvhs[0].skeleton, clip: bvhs[0].clip }
    ));
    const cmpModel = (this.cmpModel = new Model(
      { geometry: new THREE.BufferGeometry(), material: new THREE.MeshNormalMaterial({ skinning: true, opacity: 1 }) },
      { skeleton: bvhs[1].skeleton, clip: bvhs[1].clip }
    ));
    // solver
    const edwSolver = (this.edwSolver = new EDWSolver({ ref: refModel, cmp: cmpModel }));
    const dtwSolver = (this.dtwSolver = new DTWSolver({ ref: refModel, cmp: cmpModel }));
    // scene
    const lapScene = (this.lapScene = new Scene());
    const refScene = (this.refScene = new Scene());
    const cmpScene = (this.cmpScene = new Scene());

    this.container = container;
    this.curIntersected = null;
    this.setScissorTest(true);
    this.autoClear = false;
  }

  updateCamera(cameraMode) {
    this.camera.update(this.domElement, cameraMode);
    this.orbit.update();
  }

  updateModel(playerMode) {
    this.refModel.update(playerMode);
    this.cmpModel.update(playerMode);
  }

  updateScene(sceneMode) {
    const refModel = this.refModel;
    const cmpModel = this.cmpModel;
    const lapScene = this.lapScene;
    const refScene = this.refScene;
    const cmpScene = this.cmpScene;

    if (sceneMode === "lapScene") {
      lapScene.update(refModel);
      lapScene.update(cmpModel);

      refScene.visible = false;
      cmpScene.visible = false;
    } else if (sceneMode === "sepScene") {
      refScene.update(refModel);
      cmpScene.update(cmpModel);

      lapScene.visible = false;
    }
  }

  update(event, sceneMode) {
    const container = this.container;
    const camera = this.camera;
    const raycaster = this.raycaster;
    const mouse = this.mouse;

    this.setSize(container.offsetWidth, container.offsetHeight);

    const { left, right, top, bottom, width, height } = this.domElement.getBoundingClientRect();

    if (sceneMode === "lapScene") {
      this.updateView(this.lapScene, camera, left, top, width, height, raycaster, mouse, event);
    } else if (sceneMode == "sepScene") {
      this.updateView(this.refScene, camera, left, top, width / 2, height, raycaster, mouse, event);
      this.updateView(this.cmpScene, camera, left + width / 2, top, width / 2, height, raycaster, mouse, event);
    }

    //requestAnimationFrame(() => this.update());
  }

  updateView(scene, camera, left, top, width, height, raycaster, mouse, event) {
    const right = left + width;
    const bottom = top + height;

    mouse.x = event ? ((event.clientX - left) / (right - left)) * 2 - 1 : -1;
    mouse.y = event ? -((event.clientY - top) / (bottom - top)) * 2 + 1 : -1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
      if (this.curIntersected != intersects[0].object) {
        if (this.curIntersected) this.curIntersected.material.color.setHex(this.curIntersected.currentHex);

        this.curIntersected = intersects[0].object;
        this.curIntersected.currentHex = this.curIntersected.material.color.getHex();
        this.curIntersected.material.color.setHex(0xff0000);
      }
    } else {
      if (this.curIntersected) this.curIntersected.material.color.setHex(this.curIntersected.currentHex);

      this.curIntersected = null;
    }

    this.setScissor(left, top, width, height);
    this.setViewport(left, top, width, height);

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

    this.background = new THREE.Color("black");

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

    const opacity = this.material.opacity;
    const mixer = (this.mixer = new THREE.AnimationMixer(this));
    const animations = (this.animations = [clip]);
    const actions = (this.actions = [mixer.clipAction(animations[0])]);
    const clipBones = (this.clipBones = this.getBones(skeleton.bones[0].clone(), "clip"));

    this.skeleton = skeleton;
    this.jointHelper = new JointHelper({ bones: this.clipBones, clip: this.animations[0], opacity: opacity });
    this.limbHelper = new LimbHelper(
      { geometry: new LineSegmentsGeometry(), material: new LineMaterial() },
      { bones: skeleton.bones, opacity }
    );

    actions[0].play();
  }

  update(playerMode) {
    this.updateMixer(playerMode);

    this.jointHelper.update(playerMode);
    this.limbHelper.update();
  }

  updateMixer(playerMode) {
    const mode = playerMode.property;
    const frame = playerMode.getValue();
    const actionID = mode === "edwFrame" ? 1 : mode === "dtwFrame" ? 2 : 0;
    const mixer = this.mixer;
    const curAction = this.actions[actionID];

    mixer.stopAllAction();

    curAction.play();

    mixer.setTime(curAction.getClip().tracks[0].times[frame]);
  }

  //getRootBone() {
  //let root = this.skeleton.bones[0];

  //while (root.parent) root = root.parent;

  //return root;
  //}

  getBones(node, type) {
    const list = [];

    if (type !== "clip" || node.name !== "ENDSITE") list.push(node);

    for (const bone of node.children) list.push.apply(list, this.getBones(bone, type));

    return list;
  }

  getPosMap(framesNum) {
    const bufBones = this.clipBones;
    const bonesNum = bufBones.length;
    const clip = this.animations[0];
    const posMap = [];

    for (const i of Array(bonesNum).keys()) posMap[i] = [];

    for (const i of Array(framesNum).keys()) {
      for (const j of Array(bonesNum).keys()) {
        const vectorKeyframeTrack = clip.tracks[j * 2 + 0];
        const quaternionKeyframeTrack = clip.tracks[j * 2 + 1];

        bufBones[j].position.copy(
          new THREE.Vector3(
            vectorKeyframeTrack.values[i * 3 + 0],
            vectorKeyframeTrack.values[i * 3 + 1],
            vectorKeyframeTrack.values[i * 3 + 2]
          )
        );

        bufBones[j].setRotationFromQuaternion(
          new THREE.Quaternion(
            quaternionKeyframeTrack.values[i * 4 + 0],
            quaternionKeyframeTrack.values[i * 4 + 1],
            quaternionKeyframeTrack.values[i * 4 + 2],
            quaternionKeyframeTrack.values[i * 4 + 3]
          )
        );
      }

      for (const j of Array(bonesNum).keys()) {
        posMap[j][i] = new THREE.Vector3();

        bufBones[j].getWorldPosition(posMap[j][i]);
      }
    }

    return posMap;
  }

  createAction(colorsMap, name, path) {
    const animation = this.createAnimation(colorsMap, name, path);

    this.animations.push(animation);
    this.actions.push(this.mixer.clipAction(animation));
  }

  createAnimation(colorsMap, name, path) {
    const bones = this.clipBones;
    const bonesNum = bones.length;
    const clipTracks = this.animations[0].tracks;
    const clipTimes = clipTracks[0].times;
    const tracks = [];

    if (path) {
      const framesNum = path.length;
      const delta = clipTimes[1] - clipTimes[0];
      const times = [];

      for (const i of Array(framesNum).keys()) times[i] = !i ? 0 : times[i - 1] + delta;

      for (const i of Array(bonesNum).keys()) {
        const positions = [];
        const rotations = [];

        for (const j of Array(framesNum).keys()) {
          positions.push(clipTracks[i * 2 + 0].values[path[j] * 3 + 0]);
          positions.push(clipTracks[i * 2 + 0].values[path[j] * 3 + 1]);
          positions.push(clipTracks[i * 2 + 0].values[path[j] * 3 + 2]);

          rotations.push(clipTracks[i * 2 + 1].values[path[j] * 4 + 0]);
          rotations.push(clipTracks[i * 2 + 1].values[path[j] * 4 + 1]);
          rotations.push(clipTracks[i * 2 + 1].values[path[j] * 4 + 2]);
          rotations.push(clipTracks[i * 2 + 1].values[path[j] * 4 + 3]);
        }

        tracks[i * 2 + 0] = new THREE.VectorKeyframeTrack(bones[i].name + ".position", times, positions);
        tracks[i * 2 + 1] = new THREE.QuaternionKeyframeTrack(bones[i].name + ".quaternion", times, rotations);
      }
    } else {
      for (const i of Array(bonesNum).keys()) {
        tracks[i * 2 + 0] = new THREE.VectorKeyframeTrack(bones[i].name + ".position", clipTimes, clipTracks[i * 2 + 0].values);
        tracks[i * 2 + 1] = new THREE.QuaternionKeyframeTrack(
          bones[i].name + ".quaternion",
          clipTimes,
          clipTracks[i * 2 + 1].values
        );
      }
    }

    return new THREE.AnimationClip(name, -1, tracks);
  }
}

export { Viewer };
