import React from 'react';
import { AppButton, ButtonRow, Card, CardTitle } from './primitives';

interface SettingsAccountActionsProps {
  availableRoles: string[];
  pickRole: (role: 'user' | 'handyman') => void;
  logout: () => void;
}

export function SettingsAccountActions({
  availableRoles,
  pickRole,
  logout,
}: SettingsAccountActionsProps) {
  return (
    <>
      {availableRoles.length > 1 ? (
        <Card>
          <CardTitle title="Switch role" />
          <ButtonRow>
            <AppButton
              label="User"
              onPress={() => pickRole('user')}
              tone="secondary"
              style={{ flex: 1 }}
            />
            <AppButton
              label="Handyman"
              onPress={() => pickRole('handyman')}
              tone="secondary"
              style={{ flex: 1 }}
            />
          </ButtonRow>
        </Card>
      ) : null}

      <AppButton label="Logout" onPress={logout} />
    </>
  );
}