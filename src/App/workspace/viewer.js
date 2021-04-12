import * as THREE from "three/build/three.module.js";
import { GUI } from "three/examples/jsm/libs/dat.gui.module.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { BVHLoader } from "three/examples/jsm/loaders/BVHLoader.js";

import { XNectLoader } from "App/workspace/loader";
import { EDWSolver } from "App/workspace/solver";
import { JointHelper, LimbHelper } from "App/workspace/helper";

import BVHURL1 from "assets/bvh/data_3d1.bvh";
import BVHURL2 from "assets/bvh/data_3d2.bvh";
import XNECTURL from "assets/xnect/post_raw3D.txt";

class Viewer {
  constructor({ container }) {
    const canvas = document.createElement("canvas");
    const bvhsLoaded = [this.load(new BVHLoader(), BVHURL1), this.load(new BVHLoader(), BVHURL2)];
    //const xnectLoaded = this.load(new XNectLoader(), XNECTURL);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    container.appendChild(canvas);

    Promise.all(bvhsLoaded).then((results) => {
      this.renderer = new Renderer({ canvas: canvas }, { bvhs: results });

      this.render(0);
    });
  }

  load(loader, url) {
    return new Promise((resolve) => {
      loader.load(url, resolve);
    });
  }

  render(frame) {
    this.renderer.update(frame);
  }
}

class Renderer extends THREE.WebGLRenderer {
  constructor(parameters, { bvhs }) {
    super(parameters);

    const refScene = (this.refScene = new Scene({ bvh: bvhs[0] }));
    const cmpScene = (this.cmpScene = new Scene({ bvh: bvhs[1] }));
    this.camera = new Camera({ fov: 60, aspect: 640 / 360, near: 0.1, far: 50000 }, { canvas: this.domElement });
    this.clock = new THREE.Clock();
    const control = new OrbitControls(this.camera, this.domElement);

    //this.antialias = true;
    //this.alpha = true;
    //this.setPixelRatio(window.devicePixelRatio);
    //this.autoClear = false;
    this.setScissorTest(true);

    //this.control.keyPanSpeed = 60000;
    //this.control.rotateSpeed = Math.PI / 20;
    //this.control.minDistance = 300;
    //this.control.maxDistance = 700;

    const refModel = refScene.model;
    const cmpModel = cmpScene.model;

    this.edwSolver = new EDWSolver({ ref: refModel, cmp: cmpModel });
    this.refScene.add(this.edwSolver.refJointHelper);
    this.cmpScene.add(this.edwSolver.cmpJointHelper);

    const refMixer = refModel.mixer;
    const cmpMixer = cmpModel.mixer;
    //bvhModels[1].mixer.clipAction(bvhModels[1].animations[0]).syncWith(bvhModels[0].mixer.clipAction(bvhModels[0].animations[0]));

    const player = {
      curFrame: 0,
    };

    const panel = new GUI();
    const player1 = panel.addFolder("EDW Comparing Player");
    const curFrame = player1.add(player, "curFrame", 0, 173, 1);
    const player2 = panel.addFolder("DTW Comparing  player");

    window.addEventListener("resize", () => this.update(curFrame.getValue()), false);
    control.addEventListener("change", () => this.update(curFrame.getValue()), false);
    curFrame.onChange((frame) => this.update(frame));
  }

  update(frame) {
    const canvas = this.domElement;
    const camera = this.camera;
    const refScene = this.refScene;
    const cmpScene = this.cmpScene;

    refScene.update(frame);
    cmpScene.update(frame);
    this.edwSolver.update(frame);
    camera.update(canvas);

    this.setSize(window.innerWidth, window.innerHeight);

    const { left, right, top, bottom, width, height } = canvas.getBoundingClientRect();

    this.setScissor(left, top, width / 2, height);
    this.setViewport(left, top, width / 2, height);
    this.render(this.refScene, camera);

    this.setScissor(left + width / 2, top, width / 2, height);
    this.setViewport(left + width / 2, top, width / 2, height);
    this.render(this.cmpScene, camera);

    //requestAnimationFrame(() => this.update());
  }
}

class Camera extends THREE.PerspectiveCamera {
  constructor({ fov, aspect, near, far }, { canvas }) {
    super(fov, aspect, near, far);

    this.position.set(0, 0, -1);
    this.lookAt(new THREE.Vector3(0, 0, 1));

    this.layers.enable(0); // enabled by default
    this.layers.enable(1);
    //this.layers.toggle(1); // this
  }

  update(canvas) {
    this.aspect = canvas.clientWidth / canvas.clientHeight;

    this.updateProjectionMatrix();
  }
}

class Scene extends THREE.Scene {
  constructor({ bvh }) {
    super();

    const model = (this.model = new Model(
      { geometry: new THREE.BufferGeometry(), material: new THREE.MeshNormalMaterial({ skinning: true }) },
      { skeleton: bvh.skeleton, clip: bvh.clip }
    ));

    //add
    //this.add(model);
    this.add(model.limbHelper);
    //this.add(model.jointHelper);
    //this.add(model.getRootBone()); // ???

    //const light = new THREE.DirectionalLight(0xffffff, 1.0);
    //this.add(light);

    this.add(new THREE.GridHelper(10000, 10));
    //this.background = new THREE.Color(0xeeeeee);
  }

  update(frame) {
    this.model.update(frame);
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

    //this.jointHelper = new JointHelper({ bones: this.clipBones, clip: this.animations[0] });

    this.mixer = new THREE.AnimationMixer(this);

    this.mixer.clipAction(this.animations[0]).play();
  }

  update(frame) {
    this.mixer.setTime(this.animations[0].tracks[0].times[frame]);
    this.limbHelper.update(this.limbHelper.colors);
    //this.jointHelper.update(frame);
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
