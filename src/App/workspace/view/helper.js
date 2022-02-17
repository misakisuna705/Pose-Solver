import * as THREE from "three/build/three.module.js";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2";

class JointHelper extends THREE.Group {
  constructor({ opacity, color, bones, clip }) {
    super();

    const joints = (this.joints = []);
    const geometry = new THREE.SphereBufferGeometry(8);

    for (const bone of bones) joints.push(this.createJoint(geometry, bone, opacity));

    //for (const joint of joints) for if (child instanceof CSS2DObject) child.visible = false;

    this.createJointTree(bones[0], joints[0]);

    this.add(joints[0]);

    this.clip = clip;
    this.mixer = new THREE.AnimationMixer(this);
    this.animations = [];

    const actions = (this.actions = []);

    //test
    const threeColor = new THREE.Color(color);

    this.createAction(this.createColorsMap(threeColor.r, threeColor.g, threeColor.b), "default jointsAnimation");

    actions[0].play();
  }

  update(frame) {
    //const actionID = mode === "edwFrame" ? 1 : mode === "dtwFrame" ? 2 : 0;
    const actionID = 2;
    const mixer = this.mixer;
    const curAction = this.actions[actionID];

    mixer.stopAllAction();

    curAction.play();

    mixer.setTime(curAction.getClip().tracks[0].times[frame]);
  }

  createJoint(geometry, bone, opacity) {
    const joint = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ transparent: true, opacity: opacity }));

    joint.name = bone.name;

    const jointDiv = document.createElement("div");
    jointDiv.className = "label";
    jointDiv.textContent = bone.name;
    jointDiv.style.marginTop = "-1em";

    const jointLabel = new CSS2DObject(jointDiv);
    jointLabel.position.set(0, 1, 0);
    //jointLabel.visible = false;
    joint.add(jointLabel);

    return joint;
  }

  createJointTree(bone, joint) {
    const boneChildren = bone.children;
    const joints = this.joints;

    for (const boneChild of boneChildren) for (const jointChild of joints) if (boneChild.name === jointChild.name) joint.add(this.createJointTree(boneChild, jointChild));

    return joint;
  }

  createColorsMap(r, g, b) {
    const jointsNum = this.joints.length;
    const framesNum = this.clip.tracks[0].times.length;
    const colorsMap = [];

    for (const i of Array(jointsNum).keys()) {
      colorsMap[i] = [];

      for (const j of Array(framesNum).keys()) {
        colorsMap[i][j * 3 + 0] = r;
        colorsMap[i][j * 3 + 1] = g;
        colorsMap[i][j * 3 + 2] = b;
      }
    }

    return colorsMap;
  }

  createAction(colorsMap, name, path) {
    const animation = this.createAnimation(colorsMap, name, path);

    this.animations.push(animation);
    this.actions.push(this.mixer.clipAction(animation));
  }

  createAnimation(colorsMap, name, path) {
    const joints = this.joints;
    const jointsNum = joints.length;
    const clipTracks = this.clip.tracks;
    const clipTimes = clipTracks[0].times;
    const tracks = [];

    if (path) {
      const framesNum = path.length;
      const delta = clipTimes[1] - clipTimes[0];
      const times = [];
      const colors = [];

      for (const i of Array(framesNum).keys()) times[i] = !i ? 0 : times[i - 1] + delta;

      for (const i of Array(jointsNum).keys()) {
        const positions = [];
        const rotations = [];

        colors[i] = [];

        for (const j of Array(framesNum).keys()) {
          positions.push(clipTracks[i * 2 + 0].values[path[j] * 3 + 0]);
          positions.push(clipTracks[i * 2 + 0].values[path[j] * 3 + 1]);
          positions.push(clipTracks[i * 2 + 0].values[path[j] * 3 + 2]);

          rotations.push(clipTracks[i * 2 + 1].values[path[j] * 4 + 0]);
          rotations.push(clipTracks[i * 2 + 1].values[path[j] * 4 + 1]);
          rotations.push(clipTracks[i * 2 + 1].values[path[j] * 4 + 2]);
          rotations.push(clipTracks[i * 2 + 1].values[path[j] * 4 + 3]);

          //colors[i].push(colorsMap[i][path[j] * 3 + 0]);
          //colors[i].push(colorsMap[i][path[j] * 3 + 1]);
          //colors[i].push(colorsMap[i][path[j] * 3 + 2]);

          colors[i].push(colorsMap[i][j * 3 + 0]);
          colors[i].push(colorsMap[i][j * 3 + 1]);
          colors[i].push(colorsMap[i][j * 3 + 2]);
        }

        tracks[i * 3 + 0] = new THREE.VectorKeyframeTrack(joints[i].name + ".position", times, positions);
        tracks[i * 3 + 1] = new THREE.QuaternionKeyframeTrack(joints[i].name + ".quaternion", times, rotations);
        tracks[i * 3 + 2] = new THREE.ColorKeyframeTrack(joints[i].name + ".material.color", times, colors[i]);
      }
    } else {
      for (const i of Array(jointsNum).keys()) {
        tracks[i * 3 + 0] = new THREE.VectorKeyframeTrack(joints[i].name + ".position", clipTimes, clipTracks[i * 2 + 0].values);
        tracks[i * 3 + 1] = new THREE.QuaternionKeyframeTrack(joints[i].name + ".quaternion", clipTimes, clipTracks[i * 2 + 1].values);
        tracks[i * 3 + 2] = new THREE.ColorKeyframeTrack(joints[i].name + ".material.color", clipTimes, colorsMap[i]);
      }
    }

    return new THREE.AnimationClip(name, -1, tracks);
  }
}

class LimbHelper extends LineSegments2 {
  constructor({ geometry, material }, { opacity, color, bones }) {
    super(geometry, material);

    const limbs = (this.limbs = []);
    const positions = [];
    const colors = [];

    for (const bone of bones) {
      if (bone.parent) {
        limbs.push(bone.parent);
        limbs.push(bone);
      }
    }

    for (const i of Array(limbs.length).keys()) {
      //let color = undefined;

      //if (i < 8) color = new THREE.Color("purple");
      //else if (i < 16) color = new THREE.Color("dodgerblue");
      //else if (i < 24) color = new THREE.Color("mediumpurple");
      //else if (i < 32) color = new THREE.Color("deepskyblue");
      //else color = new THREE.Color("magenta");

      color = new THREE.Color(color);

      colors.push(color.r, color.g, color.b);

      positions.push(0, 0, 0);
    }

    geometry.setPositions(positions);
    geometry.setColors(colors);

    material.linewidth = 0.01;
    material.vertexColors = true;
    material.transparent = true;
    material.opacity = opacity;
  }

  update() {
    const limbs = this.limbs;
    const geometry = this.geometry;
    const positions = [];

    for (const i of Array(limbs.length).keys()) {
      const pos = new THREE.Vector3();

      limbs[i].getWorldPosition(pos);

      positions.push(pos.x, pos.y, pos.z);
    }

    geometry.setPositions(positions);
  }
}

export { JointHelper, LimbHelper };
