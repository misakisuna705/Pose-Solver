import * as THREE from "three/build/three.module.js";

class EDWSolver {
  constructor({ ref, cmp }) {
    const refFramesNum = ref.animations[0].tracks[0].times.length;
    const cmpFramesNum = cmp.animations[0].tracks[0].times.length;
    const minFramesNum = (this.minFramesNum = Math.min(refFramesNum, cmpFramesNum));
    const refPosMap = ref.getPosMap(minFramesNum);
    const cmpPosMap = cmp.getPosMap(minFramesNum);
    const diffPosMap = getPosDiffMap(cmpPosMap, refPosMap, minFramesNum);
    const maxDiff = getArrayMax(diffPosMap);
    const { refColorMap, cmpColorMap } = this.getColorMap(refFramesNum, cmpFramesNum, diffPosMap, maxDiff);

    this.maxFramesNum = Math.max(refFramesNum, cmpFramesNum);

    ref.createAction(refColorMap, "edw animation");
    cmp.createAction(cmpColorMap, "edw animation");
    //ref.createSkinAction("edw animation");
    //cmp.createSkinAction("edw animation");
    ref.jointHelper.createAction(refColorMap, "edw jointsAnimation");
    cmp.jointHelper.createAction(cmpColorMap, "edw jointsAnimation");

    //const framesNum = Math.min(refClip.tracks[0].times.length, cmpClip.tracks[0].times.length);
    //const degree = (refQuaternion.angleTo(cmpQuaternion) * 180) / Math.PI;
  }

  update() {}

  getColorMap(refFramesNum, cmpFramesNum, diffPosMap, maxDiff) {
    const minFramesNum = this.minFramesNum;
    const bonesNum = diffPosMap.length;
    const refColorMap = [];
    const cmpColorMap = [];

    for (const i of Array(bonesNum).keys()) {
      refColorMap[i] = [];
      cmpColorMap[i] = [];

      for (const j of Array(minFramesNum).keys()) {
        const score = Math.min(Math.round((diffPosMap[i][j] / maxDiff) * 511), 511);

        cmpColorMap[i][j * 3 + 0] = 0 <= score && score <= 255 ? score / 255 : 1;
        cmpColorMap[i][j * 3 + 1] = 0 <= score && score <= 255 ? 1 : (255 - (score - 256)) / 255;
        cmpColorMap[i][j * 3 + 2] = 0;
        refColorMap[i][j * 3 + 0] = 0;
        refColorMap[i][j * 3 + 1] = 1;
        refColorMap[i][j * 3 + 2] = 0;
      }
    }

    if (refFramesNum < cmpFramesNum) {
      for (const i of Array(bonesNum).keys()) {
        for (let j = refFramesNum; j < cmpFramesNum; j++) {
          cmpColorMap[i][j * 3 + 0] = 1;
          cmpColorMap[i][j * 3 + 1] = 1;
          cmpColorMap[i][j * 3 + 2] = 1;
        }
      }
    }

    if (cmpFramesNum < refFramesNum) {
      for (const i of Array(bonesNum).keys()) {
        for (let j = cmpFramesNum; j < refFramesNum; j++) {
          refColorMap[i][j * 3 + 0] = 1;
          refColorMap[i][j * 3 + 1] = 1;
          refColorMap[i][j * 3 + 2] = 1;
        }
      }
    }

    return { refColorMap, cmpColorMap };
  }
}

class DTWSolver {
  constructor({ ref, cmp }) {
    const refFramesNum = ref.animations[0].tracks[0].times.length;
    const cmpFramesNum = cmp.animations[0].tracks[0].times.length;
    const refPosMap = ref.getPosMap(refFramesNum);
    const cmpPosMap = cmp.getPosMap(cmpFramesNum);
    const refPosSum = this.getPosSums(refFramesNum, refPosMap);
    const cmpPosSum = this.getPosSums(cmpFramesNum, cmpPosMap);
    const dtwMap = this.getDtwMap(refFramesNum, cmpFramesNum, refPosSum, cmpPosSum);
    const path = this.getDtwPath(refFramesNum, cmpFramesNum, dtwMap);

    const posterizedPath = this.getPosterizedPath(path);

    const dtwFramesNum = (this.dtwFramesNum = posterizedPath.length);
    const diffPosMap = getPosDiffMap(cmpPosMap, refPosMap, dtwFramesNum, posterizedPath);
    const { refColorMap, cmpColorMap } = this.getColorMap(diffPosMap);
    const poseDiffArray = this.getPoseDiffArray(refPosSum, cmpPosSum, posterizedPath);

    this.poseColorArray = this.getPoseColorArray(poseDiffArray);

    const refPath = [];
    const cmpPath = [];

    for (const i of Array(cmpFramesNum).keys()) refPath.push(posterizedPath[i][0]);
    for (const i of Array(cmpFramesNum).keys()) cmpPath.push(posterizedPath[i][1]);

    ref.createAction(refColorMap, "dtw animation", refPath);
    cmp.createAction(cmpColorMap, "dtw animation", cmpPath);
    //ref.createSkinAction("dtw animation", refPath);
    //cmp.createSkinAction("dtw animation", cmpPath);
    ref.jointHelper.createAction(refColorMap, "dtw jointsAnimation", refPath);
    cmp.jointHelper.createAction(cmpColorMap, "dtw jointsAnimation", cmpPath);
  }

  getPosSums(framesNum, posMap) {
    const bonesNum = posMap.length;
    const framesSum = [];

    for (const i of Array(framesNum).keys()) {
      for (const j of Array(bonesNum).keys()) {
        framesSum[i] = new THREE.Vector3();

        framesSum[i].add(posMap[j][i]);
      }
    }

    return framesSum;
  }

  getDtwMap(refFramesNum, cmpFramesNum, refPosSum, cmpPosSum) {
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

        matrix[i][j] = cost + cmpPosSum[j].distanceTo(refPosSum[i]);
      }
    }

    return matrix;
  }

  getDtwPath(refFramesNum, cmpFramesNum, matrix) {
    let i = refFramesNum - 1;
    let j = cmpFramesNum - 1;

    let path = [[i, j]];

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

  getColorMap(diffPosMap) {
    const framesNum = this.dtwFramesNum;
    const bonesNum = diffPosMap.length;
    const base = getArrayMax(diffPosMap) - getArrayMin(diffPosMap);
    const refColorMap = [];
    const cmpColorMap = [];

    //for (const i of Array(bonesNum).keys()) {
    //refColorMap[i] = [];
    //cmpColorMap[i] = [];

    //for (const j of Array(framesNum).keys()) {
    //const score = Math.min(Math.round((diffPosMap[i][j] / base) * 511), 511);

    //cmpColorMap[i][j * 3 + 0] = 0 <= score && score <= 255 ? score / 255 : 1;
    //cmpColorMap[i][j * 3 + 1] = 0 <= score && score <= 255 ? 1 : (255 - (score - 256)) / 255;
    //cmpColorMap[i][j * 3 + 2] = 0;

    //refColorMap[i][j * 3 + 0] = 0;
    //refColorMap[i][j * 3 + 1] = 1;
    //refColorMap[i][j * 3 + 2] = 0;
    //}
    //}

    for (const i of Array(bonesNum).keys()) {
      refColorMap[i] = [];
      cmpColorMap[i] = [];

      let max = -Infinity;
      let min = Infinity;

      for (const element of diffPosMap[i]) max = element > max ? element : max;
      for (const element of diffPosMap[i]) min = element < min ? element : min;

      const threshold = 0.45;

      for (const j of Array(framesNum).keys()) {
        const diff = diffPosMap[i][j] / base;

        cmpColorMap[i][j * 3 + 0] = diff < threshold ? 0 : 1;
        cmpColorMap[i][j * 3 + 1] = diff < threshold ? 1 : 0;
        cmpColorMap[i][j * 3 + 2] = 0;

        refColorMap[i][j * 3 + 0] = 1;
        refColorMap[i][j * 3 + 1] = 1;
        refColorMap[i][j * 3 + 2] = 1;
      }
    }

    return { refColorMap, cmpColorMap };
  }

  getPosterizedPath(path) {
    const posterizedPath = [];

    path.forEach((element) => {
      if (
        !posterizedPath.some((newElement) => {
          return newElement[1] === element[1];
        })
      ) {
        posterizedPath.push(element);
      }
    });

    return posterizedPath;
  }

  getPoseDiffArray(refPosSum, cmpPosSum, path) {
    const framesNum = cmpPosSum.length;
    const poseDiffArray = [];

    for (const i of Array(framesNum).keys()) poseDiffArray[i] = cmpPosSum[path[i][1]].distanceTo(refPosSum[path[i][0]]);

    return poseDiffArray;
  }

  getPoseColorArray(poseDiffArray) {
    const num = poseDiffArray.length;
    const poseColorArray = [];

    let max = -Infinity;
    let min = Infinity;

    for (const element of poseDiffArray) max = element > max ? element : max;
    for (const element of poseDiffArray) min = element < min ? element : min;

    const base = max - min;
    const threshold = 0.45;

    for (const i of Array(num).keys())
      if (poseDiffArray[i] / base >= threshold)
        if (i === 0 || poseDiffArray[i + 1] / base < threshold || poseDiffArray[i - 1] / base < threshold || i + 1 === num)
          poseColorArray.push(i);

    return poseColorArray;
  }
}

function getPosDiffMap(cmpPosMap, refPosMap, framesNum, path) {
  const bonesNum = refPosMap.length;
  const diffPosMap = [];

  for (const i of Array(bonesNum).keys()) {
    diffPosMap[i] = [];

    for (const j of Array(framesNum).keys()) {
      diffPosMap[i][j] = path
        ? cmpPosMap[i][path[j][1]].distanceTo(refPosMap[i][path[j][0]])
        : cmpPosMap[i][j].distanceTo(refPosMap[i][j]);
    }
  }

  return diffPosMap;
}

function getArrayMax(arrays) {
  let max = -Infinity;

  for (const array of arrays) {
    let subMax = -Infinity;

    for (const element of array) subMax = element > subMax ? element : subMax;

    max = subMax > max ? subMax : max;
  }

  return max;
}

function getArrayMin(arrays) {
  let min = Infinity;

  for (const array of arrays) {
    let subMin = Infinity;

    for (const element of array) subMin = element < subMin ? element : subMin;

    min = subMin < min ? subMin : min;
  }

  return min;
}

export { EDWSolver, DTWSolver };
