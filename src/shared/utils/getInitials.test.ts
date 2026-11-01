import { getInitials } from './getInitials';

describe('getInitials', () => {
  it('toma la primera letra de nombre y apellido', () => {
    expect(getInitials('Carlos Méndez')).toBe('CM');
    expect(getInitials('  andrea   ruiz pineda ')).toBe('AR');
  });

  it('usa dos letras si solo hay una palabra y "?" si está vacío', () => {
    expect(getInitials('Sofía')).toBe('SO');
    expect(getInitials('   ')).toBe('?');
  });
});
