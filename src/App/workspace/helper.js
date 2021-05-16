import * as THREE from "three/build/three.module.js";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2";

class JointHelper extends THREE.Group {
  constructor({ bones, clip }) {
    super();

    const joints = (this.joints = []);
    const geometry = new THREE.SphereBufferGeometry(3, 10, 10);

    this.clip = clip;

    for (const bone of bones) joints.push(this.createJoint(geometry, bone));
    for (const joint of joints) this.add(joint);

    this.createJointTree(bones[0], joints[0], "clip");

    this.mixer = new THREE.AnimationMixer(this);
    this.animations = [];

    const actions = (this.actions = []);

    this.createAction(this.createColorsMap(1, 1, 1), "default jointsAnimation");

    actions[0].play();
  }

  update(actionID, frame) {
    const mixer = this.mixer;
    const curAction = this.actions[actionID];

    mixer.stopAllAction();

    curAction.play();

    mixer.setTime(curAction.getClip().tracks[0].times[frame]);
  }

  createJoint(geometry, bone) {
    const joint = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial());

    joint.name = bone.name;

    return joint;
  }

  createJointTree(bone, joint) {
    const boneChildren = bone.children;
    const joints = this.joints;

    for (const boneChild of boneChildren)
      for (const jointChild of joints)
        if (boneChild.name === jointChild.name) joint.add(this.createJointTree(boneChild, jointChild));

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

      for (const i of Array(framesNum).keys()) times[i] = !i ? 0 : times[i - 1] + delta;

      for (const i of Array(jointsNum).keys()) {
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

        tracks[i * 3 + 0] = new THREE.VectorKeyframeTrack(joints[i].name + ".position", times, positions);
        tracks[i * 3 + 1] = new THREE.QuaternionKeyframeTrack(joints[i].name + ".quaternion", times, rotations);
        tracks[i * 3 + 2] = new THREE.ColorKeyframeTrack(joints[i].name + ".material.color", times, colorsMap[i]);
      }
    } else {
      for (const i of Array(jointsNum).keys()) {
        tracks[i * 3 + 0] = new THREE.VectorKeyframeTrack(joints[i].name + ".position", clipTimes, clipTracks[i * 2 + 0].values);
        tracks[i * 3 + 1] = new THREE.QuaternionKeyframeTrack(
          joints[i].name + ".quaternion",
          clipTimes,
          clipTracks[i * 2 + 1].values
        );
        tracks[i * 3 + 2] = new THREE.ColorKeyframeTrack(joints[i].name + ".material.color", clipTimes, colorsMap[i]);
      }
    }

    return new THREE.AnimationClip(name, -1, tracks);
  }
}

class LimbHelper extends LineSegments2 {
  constructor({ geometry, material }, { bones }) {
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
      if (i < 8) {
        const color = new THREE.Color("purple");

        colors.push(color.r, color.g, color.b);
      } else if (i < 16) {
        const color = new THREE.Color("dodgerblue");

        colors.push(color.r, color.g, color.b);
      } else if (i < 24) {
        const color = new THREE.Color("mediumpurple");

        colors.push(color.r, color.g, color.b);
      } else if (i < 32) {
        const color = new THREE.Color("deepskyblue");

        colors.push(color.r, color.g, color.b);
      } else {
        const color = new THREE.Color("magenta");

        colors.push(color.r, color.g, color.b);
      }

      positions.push(0, 0, 0);
    }

    geometry.setPositions(positions);
    geometry.setColors(colors);

    material.linewidth = 0.01;
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
