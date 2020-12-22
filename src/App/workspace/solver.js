import * as THREE from "three/build/three.module.js";

import { JointHelper } from "App/workspace/helper";

class PoseComparedSolver {
  constructor({ ref, cmp }) {
    const refModel = (this.refModel = ref);
    const cmpModel = (this.cmpModel = cmp);
    const refBones = this.getBoneList(refModel.skeleton.bones[0].clone());
    const cmpBones = this.getBoneList(cmpModel.skeleton.bones[0].clone());
    const bonesNum = (this.bonesNum = refBones.length);
    const refAnimation = refModel.animations[0];
    const cmpAnimation = cmpModel.animations[0];
    const framesNum = Math.min(refAnimation.tracks[0].times.length, cmpAnimation.tracks[0].times.length);
    const initGlobalPosDiffs = [];
    const colors = [];

    for (const i of Array(framesNum).keys()) initGlobalPosDiffs[i] = [];
    for (const i of Array(bonesNum).keys()) colors[i] = [];

    for (const i of Array(framesNum).keys()) {
      this.parseInitLocalTrans(refAnimation, refBones, i);
      this.parseInitLocalTrans(cmpAnimation, cmpBones, i);

      const refGlobalPos = this.parseInitGlobalPos(refBones);
      const cmpGlobalPos = this.parseInitGlobalPos(cmpBones);

      initGlobalPosDiffs[i] = this.parseInitGlobalPosDiff(refGlobalPos, cmpGlobalPos);
    }

    this.maxGlobalPosDiff = Math.max(...Array().concat.apply([], initGlobalPosDiffs));

    this.refJointHelper = new JointHelper({ bones: refModel.skeleton.bones, color: "lime" });
    this.cmpJointHelper = new JointHelper({ bones: cmpModel.skeleton.bones, color: "lime" });

    //const degree = (refQuaternion.angleTo(cmpQuaternion) * 180) / Math.PI;
  }

  update() {
    const globalPosDiffs = this.parseGlobalPosDiffs();
    const colors = this.parseJointColor(globalPosDiffs, this.maxGlobalPosDiff);

    this.refJointHelper.update(this.refJointHelper.colors);
    this.cmpJointHelper.update(colors);
  }

  getBoneList(root) {
    const boneList = [];

    if (root.name !== "ENDSITE") boneList.push(root);

    for (const bone of root.children) boneList.push.apply(boneList, this.getBoneList(bone));

    return boneList;
  }

  parseInitLocalTrans(animation, bones, frameID) {
    for (const i of Array(this.bonesNum).keys()) {
      const trackVector = animation.tracks[i * 2 + 0];
      const trackQuaternion = animation.tracks[i * 2 + 1];

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

    for (const i of Array(this.bonesNum).keys()) {
      globalPos[i] = new THREE.Vector3();

      bones[i].getWorldPosition(globalPos[i]);
    }

    return globalPos;
  }

  parseInitGlobalPosDiff(refGlobalPos, cmpGlobalPos) {
    const globalPosDiffs = [];

    for (const i of Array(this.bonesNum).keys()) globalPosDiffs[i] = cmpGlobalPos[i].distanceTo(refGlobalPos[i]);

    return globalPosDiffs;
  }

  parseGlobalPosDiffs() {
    const bonesNum = this.refModel.skeleton.bones.length;
    const globalPosDiffs = [];

    for (const i of Array(bonesNum).keys()) {
      const refGlobalPos = new THREE.Vector3();
      const cmpGlobalPos = new THREE.Vector3();

      this.refModel.skeleton.bones[i].getWorldPosition(refGlobalPos);
      this.cmpModel.skeleton.bones[i].getWorldPosition(cmpGlobalPos);

      globalPosDiffs[i] = cmpGlobalPos.distanceTo(refGlobalPos);
    }

    return globalPosDiffs;
  }

  parseJointColor(globalPosDiffs) {
    const colors = [];

    for (const i of Array(this.refModel.skeleton.bones.length).keys()) {
      const count = Math.min(Math.round((globalPosDiffs[i] / this.maxGlobalPosDiff) * 511), 511);

      let color;

      if (0 <= count && count <= 255) color = new THREE.Color("rgb(" + count + ", 255, 0)");
      if (255 < count && count <= 511) color = new THREE.Color("rgb(255, " + (255 - (count - 256)) + ", 0)");

      colors[i] = color;
    }

    return colors;
  }
}

export { PoseComparedSolver };
