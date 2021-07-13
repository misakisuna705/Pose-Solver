import * as THREE from "three/build/three.module.js";

class XNectLoader extends THREE.Loader {
  constructor(manager) {
    super();

    THREE.Loader.call(this, manager); // ???
  }

  load(url, onLoad, onProgress, onError) {
    const loader = new THREE.FileLoader(this.manager);

    loader.setPath(this.path);
    loader.setRequestHeader(this.requestHeader);
    loader.setWithCredentials(this.withCredentials);

    loader.load(
      url,
      txt => {
        try {
          onLoad(this.parse(txt));
        } catch (err) {
          if (onError) onError(err);
          else console.error(err);

          this.manager.itemError(url);
        }
      },
      onProgress,
      onError
    );
  }

  parse(txt) {
    const poses = new Map();
    const humans = this.parseHumans(txt);

    for (const humanPair of humans) {
      const skeleton = this.parseSkeleton(humanPair);
      const clip = this.parseClip(humanPair, skeleton.bones);

      if (!poses.has(humanPair[0])) poses.set(humanPair[0], { skeleton: skeleton, clip: clip });
    }

    return poses;
  }

  parseHumans(txt) {
    const humans = new Map();
    const lines = txt.split("\n");

    for (const line of lines) {
      const tokens = line.split(/\s+/);

      if (tokens[0] && tokens[1]) {
        const humanID = Number(tokens[1]);
        const frameID = Number(tokens[0]);

        if (!humans.has(humanID)) humans.set(humanID, new Map());

        const human = humans.get(humanID);

        if (!human.has(frameID)) human.set(frameID, []);

        const frame = human.get(frameID);

        for (const j of Array(21).keys()) {
          frame[j] = new THREE.Vector3(
            parseFloat(tokens[j * 3 + 2]),
            parseFloat(tokens[j * 3 + 3]),
            parseFloat(tokens[j * 3 + 4])
          );
        }
      }
    }

    return humans;
  }

  parseSkeleton(humanPair) {
    const ENUM = Object.freeze({
      top: 0,
      neck: 1,
      rShoulder: 2,
      rElbow: 3,
      rWrist: 4,
      lShoulder: 5,
      lElbow: 6,
      lWrist: 7,
      rHip: 8,
      rKnee: 9,
      rAnkle: 10,
      lHip: 11,
      lKnee: 12,
      lAnkle: 13,
      root: 14,
      spine: 15,
      head: 16,
      rHand: 17,
      lHand: 18,
      rFoot: 19,
      lFoot: 20
    });

    const bones = [];
    const bonesNum = 21;

    for (const i of Array(bonesNum).keys()) {
      bones[i] = new THREE.Bone();

      if (i === ENUM.top) bones[i].name = "top";
      if (i === ENUM.neck) bones[i].name = "neck";
      if (i === ENUM.rShoulder) bones[i].name = "rShoulder";
      if (i === ENUM.rElbow) bones[i].name = "rElbow";
      if (i === ENUM.rWrist) bones[i].name = "rWrist";
      if (i === ENUM.lShoulder) bones[i].name = "lShoulder";
      if (i === ENUM.lElbow) bones[i].name = "lElbow";
      if (i === ENUM.lWrist) bones[i].name = "lWrist";
      if (i === ENUM.rHip) bones[i].name = "rHip";
      if (i === ENUM.rKnee) bones[i].name = "rKnee";
      if (i === ENUM.rAnkle) bones[i].name = "rAnkle";
      if (i === ENUM.lHip) bones[i].name = "lHip";
      if (i === ENUM.lKnee) bones[i].name = "lKnee";
      if (i === ENUM.lAnkle) bones[i].name = "lAnkle";
      if (i === ENUM.root) bones[i].name = "root";
      if (i === ENUM.spine) bones[i].name = "spine";
      if (i === ENUM.head) bones[i].name = "head";
      if (i === ENUM.rHand) bones[i].name = "rHand";
      if (i === ENUM.lHand) bones[i].name = "lHand";
      if (i === ENUM.rFoot) bones[i].name = "rFoot";
      if (i === ENUM.lFoot) bones[i].name = "lFoot";
    }

    // root -> spine -> neck -> head -> top
    bones[ENUM.root].add(bones[ENUM.spine]);
    bones[ENUM.spine].add(bones[ENUM.neck]);
    bones[ENUM.neck].add(bones[ENUM.head]);
    bones[ENUM.head].add(bones[ENUM.top]);
    // root -> rHip -> rKnee -> rAnkle -> rFoot
    bones[ENUM.root].add(bones[ENUM.rHip]);
    bones[ENUM.rHip].add(bones[ENUM.rKnee]);
    bones[ENUM.rKnee].add(bones[ENUM.rAnkle]);
    bones[ENUM.rAnkle].add(bones[ENUM.rFoot]);
    // root -> lHip -> lKnee -> lAnkle -> lFoot
    bones[ENUM.root].add(bones[ENUM.lHip]);
    bones[ENUM.lHip].add(bones[ENUM.lKnee]);
    bones[ENUM.lKnee].add(bones[ENUM.lAnkle]);
    bones[ENUM.lAnkle].add(bones[ENUM.lFoot]);
    // neck -> rShoulder -> rElbow -> rWrist -> rHand
    bones[ENUM.neck].add(bones[ENUM.rShoulder]);
    bones[ENUM.rShoulder].add(bones[ENUM.rElbow]);
    bones[ENUM.rElbow].add(bones[ENUM.rWrist]);
    bones[ENUM.rWrist].add(bones[ENUM.rHand]);
    // neck -> lShoulder -> lElbow -> lWrist -> lHand
    bones[ENUM.neck].add(bones[ENUM.lShoulder]);
    bones[ENUM.lShoulder].add(bones[ENUM.lElbow]);
    bones[ENUM.lElbow].add(bones[ENUM.lWrist]);
    bones[ENUM.lWrist].add(bones[ENUM.lHand]);

    for (const framePair of humanPair[1]) {
      const localPositions = [];

      for (const i of Array(bonesNum).keys()) bones[i].position.copy(framePair[1][i]);

      for (const i of Array(bonesNum).keys()) {
        const parent = bones[i].parent;

        localPositions[i] = parent ? framePair[1][i].clone().sub(parent.position) : framePair[1][i];
      }

      for (const i of Array(bonesNum).keys()) {
        bones[i].position.copy(localPositions[i]);
        framePair[1][i].copy(localPositions[i]);
      }
    }

    for (const i of Array(bonesNum).keys()) bones[i].position.copy(humanPair[1].values().next().value[i]);

    return new THREE.Skeleton(bones);
  }

  parseClip(humanPair, bones) {
    const tracks = [];

    for (const i of Array(21).keys()) {
      const times = [];
      const positions = [];

      for (const framePair of humanPair[1]) {
        times.push(framePair[0] / 29.97);

        positions.push(framePair[1][i].x);
        positions.push(framePair[1][i].y);
        positions.push(framePair[1][i].z);
      }

      tracks.push(new THREE.VectorKeyframeTrack(".bones[" + bones[i].name + "].position", times, positions));
    }

    return new THREE.AnimationClip("animation", -1, tracks);
  }
}

export { XNectLoader };
