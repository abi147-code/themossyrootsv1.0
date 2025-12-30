export interface CrackProps {
  isVisible: boolean;
  variant: 1 | 2 | 3 | 4;
}

export interface GameState {
  clicks: number;
  isBroken: boolean;
  isShaking: boolean;
}
