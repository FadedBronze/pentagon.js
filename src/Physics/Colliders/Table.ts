import { GameObject } from "../GameObject";
import { CircleCircleCollision, CircleCollider } from "./CircleCollider";
import { Collision } from "./Collision";
import {
  ConvexPolygonCollider,
  PolygonCircleCollision,
  PolygonPolygonCollision,
} from "./ConvexPolygonCollider";

const CirclePolygonCollision = (a: GameObject, b: GameObject) => {
  const collision = PolygonCircleCollision(b, a);
  collision.normal = collision.normal.neg();
  return collision;
};

export type Collider = ConvexPolygonCollider | CircleCollider;

//---------------------------------------------------------------------------

// prettier-ignore
const collisionMapping = createMapping([
  [null                 , CircleCollider         , ConvexPolygonCollider   ],
  [CircleCollider       , CircleCircleCollision  , CirclePolygonCollision  ],
  [ConvexPolygonCollider, PolygonCircleCollision , PolygonPolygonCollision ], 
])

//---------------------------------------------------------------------------

function createMapping(inputMatrix: any[][]) {
  const output = [];

  for (let i = 1; i < inputMatrix.length; i++) {
    const target1 = inputMatrix[0][i];

    for (let j = 1; j < inputMatrix[0].length; j++) {
      const target2 = inputMatrix[j][0];
      const func = inputMatrix[i][j];

      output.push([target1, target2, func]);
    }
  }

  return output as unknown as [any, any, (a: GameObject, b: GameObject) => Collision][];
}

export function handleCollision(a: GameObject, b: GameObject) {
  for (const [type1, type2, func] of collisionMapping) {
    if (a.collider instanceof type1 && b.collider instanceof type2) {
      return func(a, b);
    }
  }

  throw new Error("mapping not found");
}
