
export class AmmoSystem {
  private maxAmmo = 3;
  private ammo = 3;

  private reloadTime = 1500;
  private reloadTimer = 0;

  get currentAmmo(): number {
    return this.ammo;
  }

  consumeAmmo(): boolean | null {
    if (this.ammo <= 0) return null;

    const wasLastAmmo = this.ammo === 1;
    this.ammo--;

    return wasLastAmmo;
  }

  recoverOnKill(wasLastAmmo: boolean): void {
    if (wasLastAmmo) {
      this.ammo = this.maxAmmo;
    } else {
      this.ammo = Math.min(this.ammo + 1, this.maxAmmo);
    }

    this.reloadTimer = 0;
  }

  update(elapsedMs: number, isCharging: boolean): void {
    if (this.ammo >= this.maxAmmo || isCharging) return;

    this.reloadTimer += elapsedMs;

    if (this.reloadTimer >= this.reloadTime) {
      this.ammo++;
      this.reloadTimer -= this.reloadTime;
    }

    if (this.ammo >= this.maxAmmo) {
      this.ammo = this.maxAmmo;
      this.reloadTimer = 0;
    }
  }
}
