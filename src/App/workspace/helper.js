import * as THREE from "three/build/three.module.js";

class JointHelper extends THREE.Group {
  constructor({ bones, color }) {
    super();

    const joints = [];
    const colors = (this.colors = []);
    const geometry = new THREE.SphereBufferGeometry(3, 10, 10);

    this.bones = bones;

    for (const bone of bones) {
      const material = new THREE.MeshBasicMaterial();

      colors.push(new THREE.Color(color));
      joints.push(new Joint({ geometry: geometry, material: material }, { bone: bone, color: color }));
    }

    for (const joint of joints) this.add(joint);
  }

  update(colors) {
    for (const i of Array(this.bones.length).keys()) this.children[i].update(colors[i]);
  }
}

class Joint extends THREE.Mesh {
  constructor({ geometry, material }, { bone, color }) {
    super(geometry, material);

    this.bone = bone;
    this.name = bone.name;
    this.bone.getWorldPosition(this.position);
    this.quaternion.copy(this.bone.quaternion);
    this.material.color.setStyle(color);
  }

  update(color) {
    this.bone.getWorldPosition(this.position);
    this.quaternion.copy(this.bone.quaternion);
    this.material.color.setRGB(color.r, color.g, color.b);
  }
}

export { JointHelper };
