import { AppText, Avatar, Card, Column, Row } from '@/shared/ui';

type ProfileCardProps = {
  initials: string;
  name: string;
  email: string;
  place: string;
  levelLine: string;
};

/** Tarjeta navy del alumno: iniciales, nombre, correo, ubicación y nivel. */
export function ProfileCard({ initials, name, email, place, levelLine }: ProfileCardProps) {
  return (
    <Card tone="navy">
      <Row gap="lg">
        <Avatar label={initials} tone="amber" size="lg" />
        <Column grow>
          <AppText variant="heading" tone="onNavy" accessibilityRole="header">
            {name}
          </AppText>
          <AppText variant="caption" tone="onNavyMuted" numberOfLines={1}>
            {email}
          </AppText>
          {place !== '' && (
            <AppText variant="caption" tone="onNavyMuted">
              {place}
            </AppText>
          )}
          <AppText variant="caption" tone="onNavyAmber" weight="bold">
            {levelLine}
          </AppText>
        </Column>
      </Row>
    </Card>
  );
}
