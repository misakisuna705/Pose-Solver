import * as THREE from "three/build/three.module.js";

class JointHelper extends THREE.Group {
  constructor({ bones, clip }) {
    super();

    const joints = (this.joints = []);
    const actions = (this.actions = []);
    const geometry = new THREE.SphereBufferGeometry(3, 10, 10);

    this.clip = clip;
    this.mixer = new THREE.AnimationMixer(this);

    for (const bone of bones) joints.push(this.createJoint(geometry, bone));
    for (const joint of joints) this.add(joint);

    this.createJointTree(bones[0], joints[0], "clip");
    this.insertAction(this.createColorsMap(1, 1, 1));

    const curAction = (this.curAction = actions[0]);

    curAction.play();
  }

  update(actionID, frame) {
    const actions = this.actions;
    const preAction = this.curAction;
    const times = this.clip.tracks[0].times;
    const framesNum = times.length;

    if (actions[actionID] !== preAction) {
      preAction.stop();

      const curAction = (this.curAction = actions[actionID]);

      curAction.play();
    }

    const keyframe = frame < framesNum ? frame : framesNum - 1;
    //const keyframe = frame < framesNum ? frame : frame;
    //const keyframe = frame < framesNum ? framesNum - 1 : framesNum - 1;

    //console.log(frame);
    //console.log(keyframe);

    //if (frame >= framesNum) {
    //console.log(frame);
    //console.log(keyframe);
    //}

    this.mixer.setTime(this.clip.tracks[0].times[keyframe]);
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

  createAnimation(colorsMap) {
    const joints = this.joints;
    const jointsNum = joints.length;
    const clipTracks = this.clip.tracks;
    const clipTimes = clipTracks[0].times;
    const tracks = [];

    for (const i of Array(jointsNum).keys()) {
      tracks[i * 3 + 0] = new THREE.VectorKeyframeTrack(joints[i].name + ".position", clipTimes, clipTracks[i * 2 + 0].values);
      tracks[i * 3 + 1] = new THREE.QuaternionKeyframeTrack(
        joints[i].name + ".quaternion",
        clipTimes,
        clipTracks[i * 2 + 1].values
      );
      tracks[i * 3 + 2] = new THREE.ColorKeyframeTrack(this.joints[i].name + ".material.color", clipTimes, colorsMap[i]);
    }

    return new THREE.AnimationClip("jointsAnimation", -1, tracks);
  }

  insertAction(colorsMap) {
    this.actions.push(this.mixer.clipAction(this.createAnimation(colorsMap)));
  }
}

class LimbHelper extends THREE.LineSegments {
  constructor({ geometry, material }, { bones, color }) {
    super(geometry, material);

    const vertices = [];
    const cols = [];
    const limbs = (this.limbs = []);
    const colors = (this.colors = []);

    for (const bone of bones) {
      if (bone.parent) {
        limbs.push(bone);
        limbs.push(bone.parent);
      }
    }

    for (let i = 0; i < limbs.length; i++) {
      const col = new THREE.Color(color);

      vertices.push(0, 0, 0);
      cols.push(col.r, col.g, col.b);

      colors.push(col);
    }

    this.geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    this.geometry.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));
  }

  update(colors) {
    const limbs = this.limbs;
    const geometry = this.geometry;
    const endPos = geometry.getAttribute("position");
    const endCol = geometry.getAttribute("color");

    endPos.needsUpdate = true;
    endCol.needsUpdate = true;

    for (const i of Array(limbs.length / 2).keys()) {
      const globalPos = new THREE.Vector3();

      limbs[i * 2 + 0].getWorldPosition(globalPos);

      endPos.setXYZ(i * 2 + 0, globalPos.x, globalPos.y, globalPos.z);
      endCol.setXYZ(i * 2 + 0, colors[i * 2 + 0].r, colors[i * 2 + 0].g, colors[i * 2 + 0].b);

      limbs[i * 2 + 1].getWorldPosition(globalPos);

      endPos.setXYZ(i * 2 + 1, globalPos.x, globalPos.y, globalPos.z);
      endCol.setXYZ(i * 2 + 1, colors[i * 2 + 1].r, colors[i * 2 + 1].g, colors[i * 2 + 1].b);
    }
  }
}

export { JointHelper, LimbHelper };
