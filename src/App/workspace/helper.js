import * as THREE from "three/build/three.module.js";

class JointHelper extends THREE.Group {
  constructor({ bones, clip, colorsMap }) {
    super();

    const clipTracks = clip.tracks;
    const bonesNum = clipTracks.length / 2;
    const clipTimes = clipTracks[0].times;
    const framesNum = clipTimes.length;

    const joints = (this.joints = []);
    const tracks = [];
    const geometry = new THREE.SphereBufferGeometry(3, 10, 10);

    for (let i = 0; i < bonesNum; i++) {
      joints[i] = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial());
      joints[i].name = bones[i].name;
    }

    for (const joint of joints) this.add(joint);

    this.makeJointTree(bones[0], this.joints[0], "clip");

    let colors = [];

    for (const i of Array(bonesNum).keys()) colors[i] = [];

    if (!colorsMap) {
      for (const i of Array(bonesNum).keys()) {
        for (const j of Array(framesNum).keys()) {
          colors[i][j * 3 + 0] = 1;
          colors[i][j * 3 + 1] = 1;
          colors[i][j * 3 + 2] = 0;
        }
      }
    } else {
      colors = colorsMap;
    }

    for (const i of Array(bonesNum).keys()) {
      tracks[i * 3 + 0] = new THREE.VectorKeyframeTrack(
        this.joints[i].name + ".position",
        clipTimes,
        clipTracks[i * 2 + 0].values
      );
      tracks[i * 3 + 1] = new THREE.QuaternionKeyframeTrack(
        this.joints[i].name + ".quaternion",
        clipTimes,
        clipTracks[i * 2 + 1].values
      );
      tracks[i * 3 + 2] = new THREE.ColorKeyframeTrack(this.joints[i].name + ".material.color", clipTimes, colors[i]);
    }

    console.log(tracks);

    this.animations = [new THREE.AnimationClip("jointsAnimation", -1, tracks)];

    this.mixer = new THREE.AnimationMixer(this);

    this.mixer.clipAction(this.animations[0]).play();
  }

  update(frame) {
    this.mixer.setTime(this.animations[0].tracks[0].times[frame]);
  }

  makeJointTree(bone, joint, type) {
    const boneChildren = bone.children;
    const joints = this.joints;

    for (const boneChild of boneChildren)
      for (const jointChild of joints)
        if (boneChild.name === jointChild.name) joint.add(this.makeJointTree(boneChild, jointChild));

    return joint;
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

//class JointHelper extends THREE.Group {
//constructor({ bones, color }) {
//super();

//const joints = (this.joints = []);
//const colors = (this.colors = []);
//const geometry = new THREE.SphereBufferGeometry(3, 10, 10);

//for (const bone of bones) {
//const material = new THREE.MeshBasicMaterial();

//colors.push(new THREE.Color(color));
//joints.push(new Joint({ geometry: geometry, material: material }, { bone: bone, color: color }));
//}

//for (const joint of joints) this.add(joint);
//}

//update(colors) {
//for (const i of Array(this.joints.length).keys()) this.children[i].update(colors[i]);
//}
//}

//class Joint extends THREE.Mesh {
//constructor({ geometry, material }, { bone, color }) {
//super(geometry, material);

//this.bone = bone;
//this.bone.getWorldPosition(this.position);
//this.quaternion.copy(this.bone.quaternion);
//this.material.color.setStyle(color);
//}

//update(color) {
//const bone = this.bone;

//bone.getWorldPosition(this.position);

//this.quaternion.copy(bone.quaternion);
//this.material.color.setRGB(color.r, color.g, color.b);
//}
//}

export { JointHelper, LimbHelper };
