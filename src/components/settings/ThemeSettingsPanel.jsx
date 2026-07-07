import { useState, useEffect } from 'react';
import Card from '../Card.jsx';
import { setTheme } from '../../ui/theme.js';

const THEMES = [
  { id: 'light', label: 'Forest Calm', desc: 'Màu lục dịu mát (Mặc định)', color: '#315c4d', bg: '#f7f3ea' },
  { id: 'dark', label: 'Forest Dark', desc: 'Giao diện tối học đêm', color: '#8fc7ad', bg: '#111821' },
  { id: 'ocean', label: 'Ocean Calm', desc: 'Màu lam bình yên dạt dào', color: '#2f5f9f', bg: '#eef3f8' },
  { id: 'sunset', label: 'Sunset Warm', desc: 'Màu đất hoàng hôn ấm áp', color: '#a75d13', bg: '#faf4ee' },
  { id: 'lavender', label: 'Lavender Field', desc: 'Màu oải hương thư thái', color: '#6c429c', bg: '#f4edf9' }
];

export default function ThemeSettingsPanel() {
  const [activeTheme, setActiveTheme] = useState('light');

  useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    setActiveTheme(current);
  }, []);

  function handleThemeChange(themeId) {
    setTheme(themeId);
    setActiveTheme(themeId);
  }

  return (
    <Card title="Giao diện học tập" eyebrow="Theme Customization" variant="elevated" className="themeSettingsCard">
      <p className="muted" style={{ marginBottom: '18px' }}>
        Tùy chọn tông màu giao diện cục bộ giúp kích thích tinh thần học tập và giảm mỏi mắt.
      </p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '14px' }}>
        {THEMES.map(theme => {
          const isActive = activeTheme === theme.id;
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => handleThemeChange(theme.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '16px',
                borderRadius: '12px',
                border: isActive ? '3px solid var(--brand)' : '1px solid var(--color-border)',
                background: theme.bg,
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                position: 'relative',
                transition: 'all 0.2s ease',
                boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                transform: isActive ? 'scale(1.02)' : 'none'
              }}
            >
              {/* Color swatch dot */}
              <span style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: theme.color,
                marginBottom: '12px',
                display: 'inline-block',
                border: '1px solid rgba(0,0,0,0.1)'
              }} />
              
              <strong style={{ display: 'block', fontSize: '0.95rem', color: theme.id === 'dark' ? '#edf3f0' : '#172033', fontWeight: '800' }}>
                {theme.label}
              </strong>
              
              <span style={{ display: 'block', fontSize: '0.78rem', color: theme.id === 'dark' ? '#a9b4c0' : '#687083', marginTop: '4px', lineHeight: '1.2' }}>
                {theme.desc}
              </span>

              {isActive && (
                <span style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'var(--brand)',
                  color: 'white',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.68rem',
                  fontWeight: 'bold'
                }}>
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>
    </Card>
  );
}
