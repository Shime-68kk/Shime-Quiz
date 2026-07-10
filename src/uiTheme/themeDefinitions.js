import { REQUIRED_THEME_ROLES } from './themeRuntime.js';

function createRoleMap(overrides) {
  const roles = Object.fromEntries(REQUIRED_THEME_ROLES.map(role => [role, `var(--theme-${role})`]));
  return Object.freeze({ ...roles, ...overrides });
}

export const UI_THEME_DEFINITIONS = Object.freeze({
  light: Object.freeze({
    id: 'light',
    roles: createRoleMap({
      canvas: '#f7f3ea', 'text-primary': '#172033', 'text-muted': '#69647a',
      'brand-primary': '#6d4bb8', 'text-on-accent': '#ffffff',
      'status-safe': '#216650', 'status-safe-background': '#e2f4ec',
      'status-warning': '#8a4d05', 'status-warning-background': '#fff1d9'
    })
  }),
  dark: Object.freeze({
    id: 'dark',
    roles: createRoleMap({
      canvas: '#11131a', 'text-primary': '#f1eef6', 'text-muted': '#aaa4b7',
      'brand-primary': '#c3a8ef', 'text-on-accent': '#17131e',
      'status-safe': '#9ce0c3', 'status-safe-background': '#263f37',
      'status-warning': '#f0bf70', 'status-warning-background': '#49361f'
    })
  }),
  ocean: Object.freeze({
    id: 'ocean',
    roles: createRoleMap({
      canvas: '#eef3f8', 'text-primary': '#172033', 'text-muted': '#5f6b7e',
      'brand-primary': '#315f9d', 'text-on-accent': '#ffffff',
      'status-safe': '#216650', 'status-safe-background': '#e2f4ec',
      'status-warning': '#8a4d05', 'status-warning-background': '#fff1d9'
    })
  }),
  sunset: Object.freeze({
    id: 'sunset',
    roles: createRoleMap({
      canvas: '#faf4ee', 'text-primary': '#271a0c', 'text-muted': '#6f5d4b',
      'brand-primary': '#9b500b', 'text-on-accent': '#ffffff',
      'status-safe': '#216650', 'status-safe-background': '#e2f4ec',
      'status-warning': '#854600', 'status-warning-background': '#fff0d8'
    })
  }),
  lavender: Object.freeze({
    id: 'lavender',
    roles: createRoleMap({
      canvas: '#f4edf9', 'text-primary': '#1d0f30', 'text-muted': '#625373',
      'brand-primary': '#7041a5', 'text-on-accent': '#ffffff',
      'status-safe': '#216650', 'status-safe-background': '#e2f4ec',
      'status-warning': '#8a4d05', 'status-warning-background': '#fff1d9'
    })
  })
});

