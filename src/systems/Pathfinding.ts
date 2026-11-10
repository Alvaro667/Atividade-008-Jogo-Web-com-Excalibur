
import { Vector, vec } from "excalibur";

type Cell = {
  x: number;
  y: number;
};

type Node = Cell & {
  g: number;
  f: number;
  parent: Node | null;
};

export class Pathfinding {
  private readonly tileSize = 16;

  private readonly directions = [
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: -1, y: -1 },
    { x: 1, y: -1 },
    { x: 1, y: 1 },
    { x: -1, y: 1 }
  ];

  constructor(private readonly level: string[][]) {}

  private worldToCell(position: Vector): Cell {
    return {
      x: Math.floor(position.x / this.tileSize),
      y: Math.floor(position.y / this.tileSize)
    };
  }

  private cellToWorld(cell: Cell): Vector {
    return vec(
      cell.x * this.tileSize + this.tileSize / 2,
      cell.y * this.tileSize + this.tileSize / 2
    );
  }

  private key(cell: Cell): string {
    return `${cell.x},${cell.y}`;
  }

  private isFloor(x: number, y: number): boolean {
    return this.level[y]?.[x] === " ";
  }

  private heuristic(a: Cell, b: Cell): number {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  isPositionWalkable(
    position: Vector,
    radius = 0
  ): boolean {
    if (radius < 0) return false;

    const minX = Math.floor(
      (position.x - radius) / this.tileSize
    );

    const maxX = Math.floor(
      (position.x + radius) / this.tileSize
    );

    const minY = Math.floor(
      (position.y - radius) / this.tileSize
    );

    const maxY = Math.floor(
      (position.y + radius) / this.tileSize
    );

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        if (this.isFloor(x, y)) continue;

        const left = x * this.tileSize;
        const top = y * this.tileSize;

        const closestX = Math.max(
          left,
          Math.min(position.x, left + this.tileSize)
        );

        const closestY = Math.max(
          top,
          Math.min(position.y, top + this.tileSize)
        );

        const dx = position.x - closestX;
        const dy = position.y - closestY;

        if (dx * dx + dy * dy <= radius * radius) {
          return false;
        }
      }
    }

    return true;
  }

  hasLineOfSight(
    start: Vector,
    target: Vector,
    radius = 0
  ): boolean {
    const difference = target.sub(start);
    const distance = difference.magnitude;
    const steps = Math.max(1, Math.ceil(distance / 2));

    for (let i = 0; i <= steps; i++) {
      const point = start.add(
        difference.scale(i / steps)
      );

      if (!this.isPositionWalkable(point, radius)) {
        return false;
      }
    }

    return true;
  }

  private reconstructPath(node: Node): Vector[] {
    const path: Vector[] = [];
    let current: Node | null = node;

    while (current) {
      path.push(this.cellToWorld(current));
      current = current.parent;
    }

    return path.reverse();
  }

  private smoothPath(
    start: Vector,
    path: Vector[],
    radius: number
  ): Vector[] {
    const result: Vector[] = [];
    let origin = start;
    let index = 0;

    while (index < path.length) {
      let farthest = -1;

      for (let i = index; i < path.length; i++) {
        if (
          this.hasLineOfSight(origin, path[i], radius)
        ) {
          farthest = i;
        } else {
          break;
        }
      }

      if (farthest === -1) {
        return [];
      }

      const next = path[farthest];

      if (next.sub(origin).magnitude > 1) {
        result.push(next);
      }

      origin = next;
      index = farthest + 1;
    }

    return result;
  }

  findPath(
    start: Vector,
    target: Vector,
    radius = 0,
    blockedCell: string | null = null
  ): Vector[] {
    if (!this.isPositionWalkable(start, radius)) {
      return [];
    }

    if (
      this.hasLineOfSight(start, target, radius)
    ) {
      return [target];
    }

    const startCell = this.worldToCell(start);
    const targetCell = this.worldToCell(target);

    const startNode: Node = {
      ...startCell,
      g: 0,
      f: this.heuristic(startCell, targetCell),
      parent: null
    };

    const open: Node[] = [startNode];
    const costs = new Map<string, number>();
    const closed = new Set<string>();

    costs.set(this.key(startCell), 0);

    let closestNode: Node = startNode;
    let closestDistance = start.sub(target).magnitude;

    let foundTarget = false;

    while (open.length > 0) {
      open.sort((a, b) => a.f - b.f);
      const current = open.shift()!;

      const currentKey = this.key(current);

      if (closed.has(currentKey)) continue;
      closed.add(currentKey);

      const currentWorld = this.cellToWorld(current);

      const origin = current.parent
        ? currentWorld
        : start;

      const distanceToTarget =
        currentWorld.sub(target).magnitude;

      if (
        distanceToTarget < closestDistance &&
        this.isPositionWalkable(currentWorld, radius)
      ) {
        closestDistance = distanceToTarget;
        closestNode = current;
      }

      if (
        current.x === targetCell.x &&
        current.y === targetCell.y &&
        this.hasLineOfSight(origin, target, radius)
      ) {
        closestNode = current;
        foundTarget = true;
        break;
      }

      for (const direction of this.directions) {
        const next: Cell = {
          x: current.x + direction.x,
          y: current.y + direction.y
        };

        const nextKey = this.key(next);

        if (
          nextKey === blockedCell ||
          closed.has(nextKey)
        ) {
          continue;
        }

        const nextWorld = this.cellToWorld(next);

        if (
          !this.hasLineOfSight(
            origin,
            nextWorld,
            radius
          )
        ) {
          continue;
        }

        const stepCost = Math.hypot(
          direction.x,
          direction.y
        );

        const g = current.g + stepCost;

        if (g >= (costs.get(nextKey) ?? Infinity)) {
          continue;
        }

        costs.set(nextKey, g);

        open.push({
          ...next,
          g,
          f: g + this.heuristic(next, targetCell),
          parent: current
        });
      }
    }

    const path = this.reconstructPath(closestNode);

    if (path.length > 0) {
      path.shift();
    }

    const smoothed = this.smoothPath(
      start,
      path,
      radius
    );

    if (foundTarget) {
      const last = smoothed[smoothed.length - 1] ?? start;

      if (this.hasLineOfSight(last, target, radius)) {
        smoothed.push(target);
      }
    }

    return smoothed;
  }
}
