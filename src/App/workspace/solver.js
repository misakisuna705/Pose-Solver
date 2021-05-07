import * as THREE from "three/build/three.module.js";

import { JointHelper, LimbHelper } from "App/workspace/helper";

class EDWSolver {
  constructor({ ref, cmp }) {
    const bufBones = ref.clipBones;
    const bonesNum = bufBones.length;
    const refClip = ref.animations[0];
    const cmpClip = cmp.animations[0];
    const refFramesNum = refClip.tracks[0].times.length;
    const cmpFramesNum = cmpClip.tracks[0].times.length;
    const framesNum = Math.min(refFramesNum, cmpFramesNum);
    const posDiff = [];
    const refColorsMap = [];
    const cmpColorsMap = [];

    for (const i of Array(bonesNum).keys()) posDiff[i] = [];
    for (const i of Array(bonesNum).keys()) refColorsMap[i] = [];
    for (const i of Array(bonesNum).keys()) cmpColorsMap[i] = []; /// ?

    for (const i of Array(framesNum).keys()) {
      const refPos = this.getGlobalPosition(i, bufBones, refClip);
      const cmpPos = this.getGlobalPosition(i, bufBones, cmpClip);

      for (const j of Array(bonesNum).keys()) posDiff[j][i] = cmpPos[j].distanceTo(refPos[j]);
    }

    const maxDiff = Math.max(...Array().concat.apply([], posDiff));

    for (const i of Array(bonesNum).keys()) {
      for (const j of Array(framesNum).keys()) {
        const score = Math.min(Math.round((posDiff[i][j] / maxDiff) * 511), 511);

        cmpColorsMap[i][j * 3 + 0] = 0 <= score && score <= 255 ? score / 255 : 1;
        cmpColorsMap[i][j * 3 + 1] = 0 <= score && score <= 255 ? 1 : (255 - (score - 256)) / 255;
        cmpColorsMap[i][j * 3 + 2] = 0;
        refColorsMap[i][j * 3 + 0] = 0;
        refColorsMap[i][j * 3 + 1] = 1;
        refColorsMap[i][j * 3 + 2] = 0;
      }
    }

    if (refFramesNum < cmpFramesNum) {
      for (const i of Array(bonesNum).keys()) {
        for (let j = refFramesNum; j < cmpFramesNum; j++) {
          cmpColorsMap[i][j * 3 + 0] = 1;
          cmpColorsMap[i][j * 3 + 1] = 1;
          cmpColorsMap[i][j * 3 + 2] = 1;
        }
      }
    }

    if (cmpFramesNum < refFramesNum) {
      for (const i of Array(bonesNum).keys()) {
        for (let j = cmpFramesNum; j < refFramesNum; j++) {
          refColorsMap[i][j * 3 + 0] = 1;
          refColorsMap[i][j * 3 + 1] = 1;
          refColorsMap[i][j * 3 + 2] = 1;
        }
      }
    }

    ref.jointHelper.insertAction(refColorsMap);
    cmp.jointHelper.insertAction(cmpColorsMap);

    //const framesNum = Math.min(refClip.tracks[0].times.length, cmpClip.tracks[0].times.length);
    //const degree = (refQuaternion.angleTo(cmpQuaternion) * 180) / Math.PI;
  }

  getGlobalPosition(frameID, bufBones, clip) {
    const bonesNum = bufBones.length;
    const pos = [];

    for (const i of Array(bonesNum).keys()) {
      const vectorKeyframeTrack = clip.tracks[i * 2 + 0];
      const quaternionKeyframeTrack = clip.tracks[i * 2 + 1];

      bufBones[i].position.copy(
        new THREE.Vector3(
          vectorKeyframeTrack.values[frameID * 3 + 0],
          vectorKeyframeTrack.values[frameID * 3 + 1],
          vectorKeyframeTrack.values[frameID * 3 + 2]
        )
      );

      bufBones[i].setRotationFromQuaternion(
        new THREE.Quaternion(
          quaternionKeyframeTrack.values[frameID * 4 + 0],
          quaternionKeyframeTrack.values[frameID * 4 + 1],
          quaternionKeyframeTrack.values[frameID * 4 + 2],
          quaternionKeyframeTrack.values[frameID * 4 + 3]
        )
      );
    }

    for (const i of Array(bonesNum).keys()) {
      pos[i] = new THREE.Vector3();

      bufBones[i].getWorldPosition(pos[i]);
    }

    return pos;
  }
}

class DTWSolver {
  constructor({ ref, cmp }) {
    const bufBones = ref.clipBones;
    const bonesNum = bufBones.length;
    const refClip = ref.animations[0];
    const cmpClip = cmp.animations[0];
    const refFramesNum = refClip.tracks[0].times.length;
    const cmpFramesNum = cmpClip.tracks[0].times.length;
    const refFramesMap = this.getGlobalPosesMap(refFramesNum, bufBones, refClip);
    const cmpFramesMap = this.getGlobalPosesMap(cmpFramesNum, bufBones, cmpClip);
    const refFramesSum = this.getFramesSum(bonesNum, refFramesNum, refFramesMap);
    const cmpFramesSum = this.getFramesSum(bonesNum, cmpFramesNum, cmpFramesMap);
    const matrix = this.getMatrix(refFramesNum, cmpFramesNum, refFramesSum, cmpFramesSum);
    const path = (this.path = this.getPath(refFramesNum, cmpFramesNum, matrix));
  }

  getGlobalPosesMap(framesNum, bufBones, clip) {
    const bonesNum = bufBones.length;
    const framesMap = [];

    for (const i of Array(bonesNum).keys()) framesMap[i] = [];

    for (const i of Array(framesNum).keys()) {
      for (const j of Array(bonesNum).keys()) {
        const vectorKeyframeTrack = clip.tracks[j * 2 + 0];
        const quaternionKeyframeTrack = clip.tracks[j * 2 + 1];

        bufBones[j].position.copy(
          new THREE.Vector3(
            vectorKeyframeTrack.values[i * 3 + 0],
            vectorKeyframeTrack.values[i * 3 + 1],
            vectorKeyframeTrack.values[i * 3 + 2]
          )
        );

        bufBones[j].setRotationFromQuaternion(
          new THREE.Quaternion(
            quaternionKeyframeTrack.values[i * 4 + 0],
            quaternionKeyframeTrack.values[i * 4 + 1],
            quaternionKeyframeTrack.values[i * 4 + 2],
            quaternionKeyframeTrack.values[i * 4 + 3]
          )
        );
      }

      for (const j of Array(bonesNum).keys()) {
        framesMap[j][i] = new THREE.Vector3();

        bufBones[j].getWorldPosition(framesMap[j][i]);
      }
    }

    return framesMap;
  }

  getFramesSum(bonesNum, framesNum, framesMap) {
    const framesSum = [];

    for (const i of Array(framesNum).keys()) {
      for (const j of Array(bonesNum).keys()) {
        framesSum[i] = new THREE.Vector3();

        framesSum[i].add(framesMap[j][i]);
      }
    }

    return framesSum;
  }

  getMatrix(refFramesNum, cmpFramesNum, refFramesSum, cmpFramesSum) {
    const matrix = [];

    for (const i of Array(refFramesNum).keys()) {
      matrix[i] = [];

      for (const j of Array(cmpFramesNum).keys()) {
        let cost = Infinity;

        if (i > 0) {
          cost = Math.min(cost, matrix[i - 1][j]);
          if (j > 0) cost = Math.min(cost, Math.min(matrix[i - 1][j - 1], matrix[i][j - 1]));
        } else {
          if (j > 0) cost = Math.min(cost, matrix[i][j - 1]);
          else cost = 0;
        }

        matrix[i][j] = cost + cmpFramesSum[j].distanceTo(refFramesSum[i]);
      }
    }

    return matrix;
  }

  getPath(refFramesNum, cmpFramesNum, matrix) {
    let i = refFramesNum - 1;
    let j = cmpFramesNum - 1;

    let path = (this.path = [[i, j]]);

    while (i > 0 || j > 0) {
      if (i > 0) {
        if (j > 0) {
          if (matrix[i - 1][j] < matrix[i - 1][j - 1]) {
            if (matrix[i - 1][j] < matrix[i][j - 1]) {
              path.push([i - 1, j]);
              i--;
            } else {
              path.push([i, j - 1]);
              j--;
            }
          } else {
            if (matrix[i - 1][j - 1] < matrix[i][j - 1]) {
              path.push([i - 1, j - 1]);
              i--;
              j--;
            } else {
              path.push([i, j - 1]);
              j--;
            }
          }
        } else {
          path.push([i - 1, j]);
          i--;
        }
      } else {
        path.push([i, j - 1]);
        j--;
      }
    }

    return path.reverse();
  }
}

export { EDWSolver, DTWSolver };
