export class RoomParameters {
    static RoomSeed(baseSeed: number, dX: number, dY: number): number {
        return baseSeed + 1000000000 + 10000 * dY + dX;
    }
    static difficultyLevel(dX: number, dY: number): number {
        return Math.abs(dY) + Math.abs(dX);
    }
}