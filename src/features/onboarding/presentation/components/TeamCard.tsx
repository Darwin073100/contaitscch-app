import { getInitials } from '@/shared/utils';
import { AppText, Avatar, Card, Column, Divider, IconBox, ListItem } from '@/shared/ui';

import type { aboutContent } from '../content/aboutContent';

type TeamCardProps = {
  institution: (typeof aboutContent)['institution'];
  team: (typeof aboutContent)['team'];
};

/** Institución de respaldo y colaboradores agrupados por rol (docencia, alumnos, desarrollo). */
export function TeamCard({ institution, team }: TeamCardProps) {
  return (
    <Card padding="md">
      <Column gap="md">
        <Card tone="raised" padding="sm">
          <ListItem
            overline={institution.overline}
            title={institution.name}
            subtitle={institution.detail}
            leading={<IconBox icon="domain" tone="primary" shape="circle" />}
          />
        </Card>
        {team.map((group, i) => (
          <Column key={group.role} gap="xs">
            {i > 0 && <Divider />}
            <AppText variant="overline" tone="accent" accessibilityRole="header">
              {group.role}
            </AppText>
            {group.members.map((member) => (
              <ListItem
                key={member.name}
                title={member.name}
                subtitle={member.detail}
                leading={<Avatar label={getInitials(member.name)} />}
              />
            ))}
          </Column>
        ))}
      </Column>
    </Card>
  );
}
