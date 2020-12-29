import * as THREE from "three/build/three.module.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { BVHLoader } from "three/examples/jsm/loaders/BVHLoader.js";

import { XNectLoader } from "App/workspace/loader";
import { PoseComparedSolver } from "App/workspace/solver";
import { JointHelper, LimbHelper } from "App/workspace/helper";

import BVHURL1 from "assets/bvh/data_3d1.bvh";
import BVHURL2 from "assets/bvh/data_3d2.bvh";
import XNECTURL from "assets/xnect/post_raw3D.txt";

export default class Renderer extends THREE.WebGLRenderer {
  constructor(parameters) {
    super(parameters);

    //this.antialias = true;
    //this.alpha = true;
    //this.setSize(640, 360);
    this.setSize(window.innerWidth, window.innerHeight);
    //this.setPixelRatio(window.devicePixelRatio);
    //this.autoClear = false;

    this.camera = new Camera({ fov: 60, aspect: 640 / 360, near: 0.1, far: 50000 });
    this.scene = new Scene();
    this.control = new OrbitControls(this.camera, this.domElement);
    this.clock = new THREE.Clock();

    //this.control.keyPanSpeed = 60000;
    //this.control.rotateSpeed = Math.PI / 20;
    //this.control.minDistance = 300;
    //this.control.maxDistance = 700;

    this.update();

    window.addEventListener("resize", () => this.setSize(window.innerWidth, window.innerHeight), false);
  }

  update() {
    const timeStamp = this.clock.getDelta();

    this.scene.update(timeStamp);

    this.render(this.scene, this.camera);

    requestAnimationFrame(() => this.update());
  }
}

class Camera extends THREE.PerspectiveCamera {
  constructor({ fov, aspect, near, far }) {
    super(fov, aspect, near, far);

    this.position.set(0, 0, -1);
    this.lookAt(new THREE.Vector3(0, 0, 1));

    this.update();

    this.layers.enable(0); // enabled by default
    this.layers.enable(1);

    //this.layers.toggle(1); // this

    //window.addEventListener("resize", () => this.update(), false);
  }

  update() {
    this.aspect = window.innerWidth / window.innerHeight;

    this.updateProjectionMatrix();
  }
}

class Scene extends THREE.Scene {
  constructor() {
    super();

    // load data
    const xnectLoaded = this.load(new XNectLoader(), XNECTURL);
    const bvhsLoaded = [this.load(new BVHLoader(), BVHURL1), this.load(new BVHLoader(), BVHURL2)];

    xnectLoaded.then(results => {
      const xnectModels = (this.xnectModels = []);

      //new
      for (const result of results) {
        xnectModels.push(new Model({ skeleton: result[1].skeleton, clip: result[1].clip, fps: 29.97 }));
      }

      //add
      for (const model of xnectModels) {
        //this.add(model.skeletonHelper);
        this.add(model.limbHelper);
        this.add(model.jointHelper);
        //this.add(model.getRootBone()); // ???
      }
    });

    Promise.all(bvhsLoaded).then(results => {
      const bvhModels = (this.bvhModels = []);

      //new
      for (const result of results) bvhModels.push(new Model({ skeleton: result.skeleton, clip: result.clip, fps: 30 }));
      this.poseComparedSolver = new PoseComparedSolver({ ref: bvhModels[0], cmp: bvhModels[1] });

      //add
      for (const model of bvhModels) {
        //this.add(model.skeletonHelper);
        this.add(model.limbHelper);
        this.add(model.jointHelper);
        //this.add(model.getRootBone()); // ???
      }

      this.add(this.poseComparedSolver.refJointHelper);
      this.add(this.poseComparedSolver.cmpJointHelper);
      this.add(this.poseComparedSolver.refLimbHelper);
      this.add(this.poseComparedSolver.cmpLimbHelper);
    });

    //const light = new THREE.DirectionalLight(0xffffff, 1.0);
    //this.add(light);

    this.add(new THREE.GridHelper(10000, 10));
    //this.background = new THREE.Color(0xeeeeee);
  }

  load(loader, url) {
    return new Promise(resolve => {
      loader.load(url, resolve);
    });
  }

  update(timeStamp) {
    const xnectModels = this.xnectModels;
    const bvhModels = this.bvhModels;
    const poseComparedSolver = this.poseComparedSolver;

    if (xnectModels) for (const model of xnectModels) model.update(timeStamp);
    if (bvhModels) for (const model of bvhModels) model.update(timeStamp);
    if (poseComparedSolver) poseComparedSolver.update();
  }
}

class Model {
  constructor({ skeleton, clip, fps }) {
    this.skeleton = skeleton;
    this.animations = [clip];
    //this.skeletonHelper = new THREE.SkeletonHelper(this.getRootBone());
    this.limbHelper = new LimbHelper(
      { geometry: new THREE.BufferGeometry(), material: new THREE.LineBasicMaterial({ vertexColors: true }) },
      { bones: this.skeleton.bones, color: "white" }
    );
    this.jointHelper = new JointHelper({ bones: this.skeleton.bones, color: "white" });
    this.mixer = new THREE.AnimationMixer(this);
    this.counter = 0;
    this.fps = fps;

    this.mixer.clipAction(this.animations[0]).play();
  }

  update(timeStamp) {
    this.counter = this.counter + timeStamp;

    if (this.counter > 1 / this.fps) {
      this.mixer.update(timeStamp);

      this.counter = 0;
    }

    this.limbHelper.update(this.limbHelper.colors);
    this.jointHelper.update(this.jointHelper.colors);
  }

  getRootBone() {
    let root = this.skeleton.bones[0];

    while (root.parent) root = root.parent;

    return root;
  }
}
