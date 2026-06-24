import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  computeServerOffset,
  fetchPickState,
  formatCountdown,
  getCountdownState,
  getSyncedRemainingMs,
  type CountdownState,
  type FetchStatus,
  type PickState,
} from '@/constants/CountDownInterfaces';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const TICK_MS = 250;

type CountdownTheme = {
  border: string;
  timer: string;
  background: string;
  label: string;
};

type PickerCountDownCardProps = {
  onCycleEnd: () => void;
};

const COUNTDOWN_THEMES: Record<
  CountdownState,
  { light: CountdownTheme; dark: CountdownTheme }
> = {
  active: {
    light: {
      border: '#CBD5E1',
      timer: '#11181C',
      background: '#F8FAFC',
      label: '#475569',
    },
    dark: {
      border: '#334155',
      timer: '#ECEDEE',
      background: '#1E293B',
      label: '#94A3B8',
    },
  },
  warning: {
    light: {
      border: '#D97706',
      timer: '#B45309',
      background: '#FFFBEB',
      label: '#B45309',
    },
    dark: {
      border: '#F59E0B',
      timer: '#FBBF24',
      background: '#422006',
      label: '#FBBF24',
    },
  },
  expired: {
    light: {
      border: '#DC2626',
      timer: '#B91C1C',
      background: '#FEF2F2',
      label: '#B91C1C',
    },
    dark: {
      border: '#EF4444',
      timer: '#F87171',
      background: '#450A0A',
      label: '#F87171',
    },
  },
};

function getCountdownLabel(state: CountdownState): string {
  switch (state) {
    case 'active':
      return 'On the clock';
    case 'warning':
      return 'Final 10 seconds';
    case 'expired':
      return "Time's up";
  }
}

function PickerCountDownCard({ onCycleEnd }: PickerCountDownCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const [pick, setPick] = useState<PickState | null>(null);
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const serverOffsetRef = useRef(0);
  const hasReportedCycleEndRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    fetchPickState()
      .then((response) => {
        if (!isMounted) {
          return;
        }

        serverOffsetRef.current = computeServerOffset(response.serverTime);
        setPick(response.currentPick);
        setRemainingMs(
          getSyncedRemainingMs(response.currentPick.deadline, serverOffsetRef.current),
        );
        setFetchStatus('success');
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setErrorMessage('Unable to load pick state. Please try again.');
        setFetchStatus('error');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (fetchStatus === 'error' && !hasReportedCycleEndRef.current) {
      hasReportedCycleEndRef.current = true;
      onCycleEnd();
    }
  }, [fetchStatus, onCycleEnd]);

  useEffect(() => {
    if (fetchStatus !== 'success' || !pick) {
      return;
    }

    const intervalId = setInterval(() => {
      const nextRemainingMs = getSyncedRemainingMs(pick.deadline, serverOffsetRef.current);
      setRemainingMs(nextRemainingMs);

      if (nextRemainingMs <= 0 && !hasReportedCycleEndRef.current) {
        hasReportedCycleEndRef.current = true;
        onCycleEnd();
      }
    }, TICK_MS);

    return () => {
      clearInterval(intervalId);
    };
  }, [fetchStatus, onCycleEnd, pick]);

  if (fetchStatus === 'loading') {
    return (
      <ThemedView style={styles.card} accessibilityRole="progressbar">
        <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
        <ThemedText type="defaultSemiBold" style={styles.centeredText}>
          Fetching pick state...
        </ThemedText>
        <ThemedText style={styles.centeredText}>Syncing with server time</ThemedText>
      </ThemedView>
    );
  }

  if (fetchStatus === 'error') {
    const errorTheme = COUNTDOWN_THEMES.expired[colorScheme];

    return (
      <ThemedView
        style={[
          styles.card,
          {
            borderColor: errorTheme.border,
            backgroundColor: errorTheme.background,
          },
        ]}
        accessibilityRole="alert"
        accessibilityLabel="Error loading pick state">
        <ThemedText type="subtitle" style={[styles.errorTitle, { color: errorTheme.label }]}>
          Something went wrong
        </ThemedText>
        <ThemedText style={styles.centeredText}>
          {errorMessage ?? 'Unable to load pick state.'}
        </ThemedText>
      </ThemedView>
    );
  }

  if (!pick || remainingMs === null) {
    return null;
  }

  const countdownState = getCountdownState(remainingMs);
  const theme = COUNTDOWN_THEMES[countdownState][colorScheme];
  const isWarning = countdownState === 'warning';
  const isExpired = countdownState === 'expired';

  return (
    <ThemedView
      style={[
        styles.card,
        {
          borderColor: theme.border,
          backgroundColor: theme.background,
        },
        isWarning && styles.warningCard,
        isExpired && styles.expiredCard,
      ]}
      accessibilityLabel={`Round ${pick.round}, pick ${pick.pickNumber}, ${pick.managerName}, ${formatCountdown(remainingMs)} remaining`}>
      <ThemedText type="subtitle" style={styles.heading}>
        {getCountdownLabel(countdownState)}
      </ThemedText>

      <ThemedView style={styles.pickDetails}>
        <ThemedText type="defaultSemiBold">
          Round {pick.round} · Pick {pick.pickNumber}
        </ThemedText>
        <ThemedText style={styles.managerName}>{pick.managerName}</ThemedText>
      </ThemedView>

      <ThemedView style={styles.timerSection}>
        <ThemedText
          style={[
            styles.timer,
            { color: theme.timer },
            isWarning && styles.warningTimer,
            isExpired && styles.expiredTimer,
          ]}>
          {formatCountdown(remainingMs)}
        </ThemedText>
        {isExpired ? (
          <ThemedText style={[styles.expiredMessage, { color: theme.label }]}>
            The pick window has closed.
          </ThemedText>
        ) : isWarning ? (
          <ThemedText style={[styles.warningMessage, { color: theme.label }]}>
            Make your pick now!
          </ThemedText>
        ) : null}
      </ThemedView>
    </ThemedView>
  );
}

export function PickerCountDown() {
  const colorScheme = useColorScheme() ?? 'light';
  const [sessionKey, setSessionKey] = useState(0);
  const [canRestart, setCanRestart] = useState(false);

  const handleCycleEnd = () => {
    setCanRestart(true);
  };

  const handleStart = () => {
    setCanRestart(false);
    setSessionKey((current) => current + 1);
  };

  return (
    <ThemedView style={styles.wrapper}>
      <PickerCountDownCard key={sessionKey} onCycleEnd={handleCycleEnd} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Start countdown"
        accessibilityState={{ disabled: !canRestart }}
        disabled={!canRestart}
        onPress={handleStart}
        style={({ pressed }) => [
          styles.startButton,
          { backgroundColor: Colors[colorScheme].tint },
          !canRestart && styles.startButtonDisabled,
          pressed && canRestart && styles.startButtonPressed,
        ]}>
        <ThemedText style={styles.startButtonText}>Start</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 16,
  },
  startButton: {
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  startButtonDisabled: {
    opacity: 0.45,
  },
  startButtonPressed: {
    opacity: 0.85,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  card: {
    borderRadius: 16,
    borderWidth: 2,
    gap: 16,
    padding: 20,
  },
  warningCard: {
    borderWidth: 3,
  },
  expiredCard: {
    borderWidth: 3,
  },
  heading: {
    textAlign: 'center',
  },
  pickDetails: {
    alignItems: 'center',
    gap: 4,
  },
  managerName: {
    fontSize: 18,
  },
  timerSection: {
    alignItems: 'center',
    gap: 8,
  },
  timer: {
    fontSize: 48,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
    lineHeight: 52,
  },
  warningTimer: {
    fontSize: 56,
    lineHeight: 60,
  },
  expiredTimer: {
    fontSize: 56,
    lineHeight: 60,
  },
  warningMessage: {
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  expiredMessage: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  errorTitle: {
    textAlign: 'center',
  },
  centeredText: {
    textAlign: 'center',
  },
});

export default PickerCountDown;
