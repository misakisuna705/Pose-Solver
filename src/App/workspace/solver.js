import * as THREE from "three/build/three.module.js";

import { JointHelper, LimbHelper } from "App/workspace/helper";

class PoseComparedSolver {
  constructor({ ref, cmp }) {
    const refBones = (this.refBones = ref.skeleton.bones);
    const cmpBones = (this.cmpBones = cmp.skeleton.bones);
    const bufBones = (this.bufBones = this.getBoneList(refBones[0].clone(), "buf"));
    const clipBones = this.getBoneList(bufBones[0].clone(), "clip");
    const refClip = ref.animations[0];
    const cmpClip = cmp.animations[0];
    const framesNum = Math.min(refClip.tracks[0].times.length, cmpClip.tracks[0].times.length);
    const initGlobalPosDiffs = [];
    const colors = [];

    for (const i of Array(framesNum).keys()) initGlobalPosDiffs[i] = [];
    for (const i of Array(clipBones.length).keys()) colors[i] = [];

    for (const i of Array(framesNum).keys()) {
      this.parseInitLocalTrans(refClip, clipBones, i);

      const refGlobalPos = this.parseInitGlobalPos(clipBones);

      this.parseInitLocalTrans(cmpClip, clipBones, i);

      const cmpGlobalPos = this.parseInitGlobalPos(clipBones);

      initGlobalPosDiffs[i] = this.parseInitGlobalPosDiff(refGlobalPos, cmpGlobalPos);
    }

    this.maxGlobalPosDiff = Math.max(...Array().concat.apply([], initGlobalPosDiffs));

    this.refJointHelper = new JointHelper({ bones: refBones, color: "blue" });
    this.cmpJointHelper = new JointHelper({ bones: cmpBones, color: "lime" });

    this.refLimbHelper = new LimbHelper(
      { geometry: new THREE.BufferGeometry(), material: new THREE.LineBasicMaterial({ vertexColors: true }) },
      { bones: refBones, color: "blue" }
    );
    this.cmpLimbHelper = new LimbHelper(
      { geometry: new THREE.BufferGeometry(), material: new THREE.LineBasicMaterial({ vertexColors: true }) },
      { bones: cmpBones, color: "lime" }
    );

    //const degree = (refQuaternion.angleTo(cmpQuaternion) * 180) / Math.PI;
  }

  update() {
    const globalPosDiffs = this.parseGlobalPosDiffs();
    const jointColors = this.parseJointColor(globalPosDiffs);
    const limbColors = this.parseLimbColor(globalPosDiffs);

    this.refJointHelper.update(this.refJointHelper.colors);
    this.cmpJointHelper.update(jointColors);

    this.refLimbHelper.update(this.refLimbHelper.colors);
    this.cmpLimbHelper.update(limbColors);
  }

  getBoneList(node, type) {
    const list = [];

    if (type !== "clip" || node.name !== "ENDSITE") list.push(node);

    for (const bone of node.children) list.push.apply(list, this.getBoneList(bone, type));

    return list;
  }

  parseInitLocalTrans(clipion, bones, frameID) {
    for (const i of Array(bones.length).keys()) {
      const trackVector = clipion.tracks[i * 2 + 0];
      const trackQuaternion = clipion.tracks[i * 2 + 1];

      bones[i].position.copy(
        new THREE.Vector3(
          trackVector.values[frameID * 3 + 0],
          trackVector.values[frameID * 3 + 1],
          trackVector.values[frameID * 3 + 2]
        )
      );

      bones[i].setRotationFromQuaternion(
        new THREE.Quaternion(
          trackQuaternion.values[frameID * 4 + 0],
          trackQuaternion.values[frameID * 4 + 1],
          trackQuaternion.values[frameID * 4 + 2],
          trackQuaternion.values[frameID * 4 + 3]
        )
      );
    }
  }

  parseInitGlobalPos(bones) {
    const globalPos = [];

    for (const i of Array(bones.length).keys()) {
      globalPos[i] = new THREE.Vector3();

      bones[i].getWorldPosition(globalPos[i]);
    }

    return globalPos;
  }

  parseInitGlobalPosDiff(refGlobalPos, cmpGlobalPos) {
    const globalPosDiffs = [];

    for (const i of Array(refGlobalPos.length).keys()) globalPosDiffs[i] = cmpGlobalPos[i].distanceTo(refGlobalPos[i]);

    return globalPosDiffs;
  }

  parseGlobalPosDiffs() {
    const globalPosDiffs = [];

    for (const i of Array(this.bufBones.length).keys()) {
      const refGlobalPos = new THREE.Vector3();
      const cmpGlobalPos = new THREE.Vector3();

      this.refBones[i].getWorldPosition(refGlobalPos);
      this.cmpBones[i].getWorldPosition(cmpGlobalPos);

      globalPosDiffs[i] = cmpGlobalPos.distanceTo(refGlobalPos);
    }

    return globalPosDiffs;
  }

  parseJointColor(globalPosDiffs) {
    const colors = [];

    for (const i of Array(this.bufBones.length).keys()) {
      const count = Math.min(Math.round((globalPosDiffs[i] / this.maxGlobalPosDiff) * 511), 511);

      let color;

      if (0 <= count && count <= 255) color = new THREE.Color("rgb(" + count + ", 255, 0)");
      if (255 < count && count <= 511) color = new THREE.Color("rgb(255, " + (255 - (count - 256)) + ", 0)");

      colors[i] = color;
    }

    return colors;
  }

  parseLimbColor(globalPosDiffs) {
    const bones = this.bufBones;
    const colors = [];

    for (const i of Array(bones.length).keys()) {
      const count = Math.min(Math.round((globalPosDiffs[i] / this.maxGlobalPosDiff) * 511), 511);

      let rgb;

      if (0 <= count && count <= 255) rgb = new THREE.Vector3(count, 255, 0);
      if (255 < count && count <= 511) rgb = new THREE.Vector3(255, 255 - (count - 256), 0);

      bones[i].position.copy(rgb);
    }

    for (const bone of bones) {
      const parent = bone.parent;

      if (parent) {
        colors.push(new THREE.Color("rgb(" + bone.position.x + ", " + bone.position.y + ", " + bone.position.z + ")"));
        colors.push(new THREE.Color("rgb(" + parent.position.x + ", " + parent.position.y + ", " + parent.position.z + ")"));
      }
    }

    return colors;
  }
}

export { PoseComparedSolver };
