import * as THREE from "three/build/three.module.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

//import { XNectLoader } from "App/workspace/loader";
import { EDWSolver, DTWSolver } from "App/workspace/view/solver";
import { JointHelper, LimbHelper } from "App/workspace/view/helper";

// syncWith

class Viewer extends THREE.WebGLRenderer {
  constructor({ container, raws }) {
    super();

    // raws
    const refPose = raws[0];
    const cmpPose = raws[1];
    //const refSkin = raws[2];
    //const cmpSkin = raws[3];
    //const refRacket = raws[4];
    //const cmpRacket = raw[5];
    // camera
    const camera = (this.camera = new Camera({ fov: 60, aspect: 640 / 360, near: 0.1, far: 50000 }));
    // orbit
    const orbit = (this.orbit = new OrbitControls(camera, this.domElement));
    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    // model
    const refModel = (this.refModel = new Model({
      opacity: 0.45,
      jointColor: 0x7192a5,
      limbColor: 0x9dbaca,
      pose: refPose,
      skin: undefined,
      racket: undefined,
    }));
    const cmpModel = (this.cmpModel = new Model({
      opacity: 1,
      jointColor: 0x7192a5,
      limbColor: 0x7c8b8f,
      pose: cmpPose,
      skin: undefined,
      racket: undefined,
    }));
    // solver
    this.edwSolver = new EDWSolver({ ref: refModel, cmp: cmpModel });
    this.dtwSolver = new DTWSolver({ ref: refModel, cmp: cmpModel });
    // scene
    this.lapScene = new Scene();
    const refScene = (this.refScene = new Scene());
    this.cmpScene = new Scene();

    this.container = container;
    this.curSceneMode = 0;
    this.curCameraMode = 0;
    this.curIntersected = null;

    this.autoClear = false;
    this.setScissorTest(true);

    //test
    //

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
    hemiLight.position.set(0, 200, 0);
    refScene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff);
    dirLight.position.set(0, 200, 100);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 180;
    dirLight.shadow.camera.bottom = -100;
    dirLight.shadow.camera.left = -120;
    dirLight.shadow.camera.right = 120;
    refScene.add(dirLight);

    orbit.addEventListener("change", () => this.updateRenderer(this.curSceneMode, camera), false);
    window.addEventListener("resize", () => this.updateCamera(this.curCameraMode), false);
    //container.addEventListener(
    //"mousemove",
    //(event) =>
    //this.update(this.curFrame, this.getMode(sceneConfs), this.getMode(cameraConfs), undefined, undefined, event),
    //false
    //);
  }

  init(frame, sceneMode, cameraMode, event) {
    const camera = this.camera;

    this.updateModel(frame);
    this.updateScene(sceneMode);
    this.updateCamera(cameraMode);
    this.updateIntersected(event, camera);
    this.updateRenderer(sceneMode, camera);
  }

  updateModel(frame) {
    this.refModel.update(frame);
    this.cmpModel.update(frame);

    this.updateRenderer(this.curSceneMode, this.camera);
  }

  updateScene(sceneMode) {
    const container = this.container;
    const refModel = this.refModel;
    const cmpModel = this.cmpModel;
    const lapScene = this.lapScene;
    const refScene = this.refScene;
    const cmpScene = this.cmpScene;

    this.setSize(container.clientWidth, container.clientHeight);
    this.curSceneMode = sceneMode;

    if (sceneMode === 0) {
      lapScene.update(refModel);
      lapScene.update(cmpModel);

      refScene.visible = false;
      cmpScene.visible = false;
    } else if (sceneMode === 1) {
      refScene.update(refModel);
      cmpScene.update(cmpModel);

      lapScene.visible = false;
    }

    this.updateCamera(this.curCameraMode);
    this.updateRenderer(sceneMode, this.camera);
  }

  updateCamera(cameraMode) {
    const container = this.container;
    const canvas = this.domElement;

    this.setSize(container.clientWidth, container.clientHeight);

    const canvasWidth = canvas.clientWidth;
    const canvasHeight = canvas.clientHeight;
    const canvasAspect = canvas.clientWidth / canvas.clientHeight;
    const sceneAspect = this.curSceneMode === 0 ? canvasAspect : canvasAspect / 2;

    this.curCameraMode = cameraMode;

    this.camera.update(sceneAspect, cameraMode);
    this.orbit.update();

    this.updateRenderer(this.curSceneMode, this.camera);
  }

  updateIntersected(event, camera) {
    const mouse = this.mouse;
    const raycaster = this.raycaster;
    const { left, right, top, bottom, width, height } = this.domElement.getBoundingClientRect();

    mouse.x = event ? ((event.clientX - left) / (right - left)) * 2 - 1 : -1;
    mouse.y = event ? -((event.clientY - top) / (bottom - top)) * 2 + 1 : -1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(this.cmpModel.jointHelper.joints);

    if (intersects.length > 0) {
      if (this.curIntersected !== intersects[0].object) {
        if (this.curIntersected) this.curIntersected.material.color.setHex(this.curIntersected.currentHex);

        this.curIntersected = intersects[0].object;
        this.curIntersected.currentHex = this.curIntersected.material.color.getHex();
        this.curIntersected.material.color.setHex(0xff0000);
      }
    } else {
      if (this.curIntersected) this.curIntersected.material.color.setHex(this.curIntersected.currentHex);

      this.curIntersected = null;
    }
  }

  updateRenderer(sceneMode, camera) {
    const canvas = this.domElement;
    const width = canvas.width;
    const height = canvas.height;

    if (sceneMode === 0) {
      this.updateViewport(this.lapScene, camera, 0, width, height);
    } else if (sceneMode === 1) {
      this.updateViewport(this.refScene, camera, 0, width / 2, height);
      this.updateViewport(this.cmpScene, camera, 0 + width / 2, width / 2, height);
    }
  }

  updateViewport(scene, camera, left, width, height) {
    this.setScissor(left, 0, width, height);
    this.setViewport(left, 0, width, height);

    this.render(scene, camera);
  }
}

class Camera extends THREE.PerspectiveCamera {
  constructor({ fov, aspect, near, far }) {
    super(fov, aspect, near, far);

    this.position.set(0, 100, -300);

    //this.layers.enable(0); // enabled by default

    //this.layers.disable(1);

    //this.layers.toggle(1); // this
  }

  update(aspect, mode) {
    const position = this.position;

    if (mode === 1) position.set(0, 100, -300);
    if (mode === 2) position.set(0, 100, 300);
    if (mode === 3) position.set(300, 100, 0);
    if (mode === 4) position.set(-300, 100, 0);
    if (mode === 5) position.set(0, 300, 0);

    this.aspect = aspect;

    this.updateProjectionMatrix();
  }
}

class Scene extends THREE.Scene {
  constructor() {
    super();

    this.background = new THREE.Color(0xededed);

    this.add(new THREE.GridHelper(10000, 10));
  }

  update(model) {
    this.add(model);

    this.visible = true;
  }
}

class Model extends THREE.Group {
  constructor({ opacity, jointColor, limbColor, pose, skin, racket }) {
    super();

    const clip = pose.clip;
    const skeleton = pose.skeleton;

    //if (skin.animations[0].tracks.length === 215) for (let j = 0; j < 72; j++) skin.animations[0].tracks.shift(); // tricky

    this.normalizePose(clip.tracks);
    //this.normalizeSkin(skin.animations[0].tracks);

    const poseMixer = (this.poseMixer = new THREE.AnimationMixer(this));
    const animations = (this.animations = [clip]);
    const actions = (this.actions = [poseMixer.clipAction(animations[0])]);
    //const skinMixer = (this.skinMixer = new THREE.AnimationMixer(skin));
    //const skinActions = (this.skinActions = [skinMixer.clipAction(skin.animations[0])]);
    //const racketMixer = new THREE.AnimationMixer(racket);
    //const racketActions = this.racketActions = [racketMixer.clipAction(racket.animations[0])];

    //this.skin = skin;
    this.clipBones = this.getBones(skeleton.bones[0].clone(), "clip");
    this.skeleton = skeleton;
    this.jointHelper = new JointHelper({ opacity: opacity, color: jointColor, bones: this.clipBones, clip: this.animations[0] });
    this.limbHelper = new LimbHelper(
      { geometry: new LineSegmentsGeometry(), material: new LineMaterial() },
      { opacity: opacity, color: limbColor, bones: skeleton.bones }
    );

    this.add(this.jointHelper);
    this.add(this.limbHelper);
    //this.add(skin);
    //this.add(racket);

    actions[0].play();
    //skinActions[0].play();
    //racketAction.play();
  }

  update(frame) {
    this.updateMixer(frame);
    //this.updateSkinMixer(frame);

    this.jointHelper.update(frame);
    this.limbHelper.update();
  }

  updateMixer(frame) {
    //const actionID = mode === "edwFrame" ? 1 : mode === "dtwFrame" ? 2 : 0;
    const actionID = 2;
    const mixer = this.poseMixer;
    const curAction = this.actions[actionID];

    mixer.stopAllAction();

    curAction.play();

    mixer.setTime(curAction.getClip().tracks[0].times[frame]);
  }

  updateSkinMixer(frame) {
    //const actionID = 2;
    //const mixer = this.skinMixer;
    //const curAction = this.skinActions[actionID];
    //mixer.stopAllAction();
    //curAction.play();
    //mixer.setTime(curAction.getClip().tracks[0].times[frame]);
  }

  normalizePose(tracks) {
    const tracksNum = tracks.length;

    for (const i of Array(tracksNum / 2).keys()) {
      tracks[i * 2 + 0].times = tracks[i * 2 + 0].times.reverse().subarray(2).reverse();
      tracks[i * 2 + 0].values = tracks[i * 2 + 0].values.subarray(3).reverse().subarray(3).reverse();

      tracks[i * 2 + 1].times = tracks[i * 2 + 1].times.reverse().subarray(2).reverse();
      tracks[i * 2 + 1].values = tracks[i * 2 + 1].values.subarray(4).reverse().subarray(4).reverse();
    }

    for (const track of tracks) {
      if (track.ValueTypeName === "vector") {
        const originValues = tracks[0].values;
        const num = originValues.length;

        for (let j = 0; j < num; j++) track.values[j] -= originValues[j];
      }
    }
  }

  normalizeSkin(tracks) {
    this.normalizePose(tracks);
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
    this.actions.push(this.poseMixer.clipAction(animation));
  }

  createSkinAction(name, path) {
    //const animation = this.createSkinAnimation(name, path);
    //this.skin.animations.push(animation);
    //this.skinActions.push(this.skinMixer.clipAction(animation));
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

  createSkinAnimation(name, path) {
    //const bones = this.clipBones;
    //const bonesNum = bones.length;
    //const clipTracks = this.skin.animations[0].tracks;
    //const clipTimes = clipTracks[0].times;
    //const tracks = [];
    //if (path) {
    //const framesNum = path.length;
    //const delta = clipTimes[1] - clipTimes[0];
    //const times = [];
    //for (const i of Array(framesNum).keys()) times[i] = !i ? 0 : times[i - 1] + delta;
    //for (const i of Array(bonesNum).keys()) {
    //const positions = [];
    //const rotations = [];
    //for (const j of Array(framesNum).keys()) {
    //positions.push(clipTracks[i * 2 + 0].values[path[j] * 3 + 0]);
    //positions.push(clipTracks[i * 2 + 0].values[path[j] * 3 + 1]);
    //positions.push(clipTracks[i * 2 + 0].values[path[j] * 3 + 2]);
    //rotations.push(clipTracks[i * 2 + 1].values[path[j] * 4 + 0]);
    //rotations.push(clipTracks[i * 2 + 1].values[path[j] * 4 + 1]);
    //rotations.push(clipTracks[i * 2 + 1].values[path[j] * 4 + 2]);
    //rotations.push(clipTracks[i * 2 + 1].values[path[j] * 4 + 3]);
    //}
    //tracks[i * 2 + 0] = new THREE.VectorKeyframeTrack(bones[i].name + ".position", times, positions);
    //tracks[i * 2 + 1] = new THREE.QuaternionKeyframeTrack(bones[i].name + ".quaternion", times, rotations);
    //}
    //} else {
    //for (const i of Array(bonesNum).keys()) {
    //tracks[i * 2 + 0] = new THREE.VectorKeyframeTrack(bones[i].name + ".position", clipTimes, clipTracks[i * 2 + 0].values);
    //tracks[i * 2 + 1] = new THREE.QuaternionKeyframeTrack(
    //bones[i].name + ".quaternion",
    //clipTimes,
    //clipTracks[i * 2 + 1].values
    //);
    //}
    //}
    //return new THREE.AnimationClip(name, -1, tracks);
  }
}

export { Viewer };
