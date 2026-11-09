
import { Random, Vector, vec } from "excalibur";

export class EnemySpawner {
  static getSpawnPositions(
    level: string[][],
    count: number,
    playerPosition: Vector,
    seed: number
  ): Vector[] {
    const random = new Random(seed);
    const tileSize = 16;
    const minPlayerDistance = 130;
    const minEnemyDistance = 48;

    const candidates: Vector[] = [];

    // Uma margem de um tile livre ao redor do centro
    // evita que o collider nasça dentro de uma parede.
    for (let y = 1; y < level.length - 1; y++) {
      for (let x = 1; x < level[y].length - 1; x++) {
        let valid = true;

        for (let dy = -1; dy <= 1 && valid; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (level[y + dy][x + dx] !== " ") {
              valid = false;
              break;
            }
          }
        }

        if (!valid) continue;

        const position = vec(
          x * tileSize + tileSize / 2,
          y * tileSize + tileSize / 2
        );

        if (
          position.sub(playerPosition).magnitude <
          minPlayerDistance
        ) {
          continue;
        }

        candidates.push(position);
      }
    }

    // Embaralhamento de Fisher-Yates.
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = random.integer(0, i);

      [candidates[i], candidates[j]] =
        [candidates[j], candidates[i]];
    }

    const positions: Vector[] = [];

    for (const candidate of candidates) {
      const tooClose = positions.some(
        position =>
          position.sub(candidate).magnitude <
          minEnemyDistance
      );

      if (tooClose) continue;

      positions.push(candidate);

      if (positions.length >= count) {
        break;
      }
    }

    return positions;
  }
}
