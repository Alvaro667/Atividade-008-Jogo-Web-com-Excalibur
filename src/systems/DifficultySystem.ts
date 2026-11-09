import { PLAYER_CONFIG } from "../config/PlayerConfig";
import { ZOMBIE_CONFIG } from "../config/ZombieConfig";

export interface PhaseDifficulty {
  enemyCount: number;
  enemySpeed: number;
  enemyDamage: number;
}

export class DifficultySystem {
  static getDifficulty(phase: number): PhaseDifficulty {
    const currentPhase = Math.max(1, Math.floor(phase));

    const enemyCount = Math.min(3 + (currentPhase - 1) * 2, 25);

    const enemySpeed = ZOMBIE_CONFIG.speed + (currentPhase - 1) * 10;

    const enemyDamage = Math.min(
      ZOMBIE_CONFIG.damage + Math.floor((currentPhase - 1) / 3),
      PLAYER_CONFIG.maxHealth,
    );

    return {
      enemyCount,
      enemySpeed,
      enemyDamage,
    };
  }
}
