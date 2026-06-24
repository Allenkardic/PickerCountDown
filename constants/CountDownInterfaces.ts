export type PickState = {
  round: number;
  pickNumber: number;
  managerName: string;
  deadline: string;
};

export type PickStateResponse = {
  serverTime: string;
  currentPick: PickState;
};

export type CountdownState = "active" | "warning" | "expired";

export type FetchStatus = "loading" | "error" | "success";

export const WARNING_THRESHOLD_MS = 10_000;

const MOCK_FETCH_DELAY_MS = 500;
const DEADLINE_OFFSET_MS = 45_000;

const MOCK_CURRENT_PICK = {
  round: 3,
  pickNumber: 25,
  managerName: "Taylor Morgan",
} as const;

export function fetchPickState(): Promise<PickStateResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const serverTime = new Date();
      const deadline = new Date(serverTime.getTime() + DEADLINE_OFFSET_MS);

      resolve({
        serverTime: serverTime.toISOString(),
        currentPick: {
          ...MOCK_CURRENT_PICK,
          deadline: deadline.toISOString(),
        },
      });
    }, MOCK_FETCH_DELAY_MS);
  });
}

export function getCountdownState(remainingMs: number): CountdownState {
  if (remainingMs <= 0) {
    return "expired";
  }

  if (remainingMs <= WARNING_THRESHOLD_MS) {
    return "warning";
  }

  return "active";
}

export function formatCountdown(remainingMs: number): string {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export function computeServerOffset(serverTime: string): number {
  return new Date(serverTime).getTime() - Date.now();
}

export function getSyncedRemainingMs(
  deadline: string,
  serverOffset: number,
): number {
  const deadlineMs = new Date(deadline).getTime();
  const syncedNow = Date.now() + serverOffset;

  return deadlineMs - syncedNow;
}
