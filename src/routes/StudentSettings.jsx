import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RevealToggle from '../components/cram/RevealToggle.jsx';
import ShimeLogoMark from '../components/brand/ShimeLogoMark.jsx';
import { DECK } from '../cram/cramDeck.js';
import {
  PROFILE_LE_THUY,
  clearCramProfile,
  readCramPrefs,
  readCramProfile,
  resetCramStates,
  saveCramPrefs
} from '../cram/cramStorage.js';
import { CRAM_ROUTE_PATH } from '../config/studentDeployment.js';
import { applyUiTheme, readStoredUiTheme } from '../uiTheme/themeRuntime.js';
import '../styles/cram.css';

// Student deployment settings: only what a learner needs.
const THEMES = [
  { id: 'lavender', name: 'Lavender', swatch: '#6c429c', ground: '#f4edf9' },
  { id: 'light', name: 'Rừng xanh', swatch: '#059669', ground: '#f8fafc' },
  { id: 'ocean', name: 'Biển', swatch: '#2f5f9f', ground: '#eef3f8' },
  { id: 'sunset', name: 'Hoàng hôn', swatch: '#a75d13', ground: '#faf4ee' },
  { id: 'dark', name: 'Tối', swatch: '#10b981', ground: '#11131a' }
];

export default function StudentSettings() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => readStoredUiTheme());
  const [prefs, setPrefs] = useState(() => readCramPrefs());
  const [profile] = useState(() => readCramProfile());
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  function chooseTheme(id) {
    setTheme(applyUiTheme(id));
  }

  function resetProgress() {
    if (!profile) return;
    if (!confirmReset) {
      setConfirmReset(true);
      window.setTimeout(() => setConfirmReset(false), 4000);
      return;
    }
    resetCramStates(profile.id, DECK.version);
    setConfirmReset(false);
    setResetDone(true);
  }

  function switchLearner() {
    clearCramProfile();
    navigate(CRAM_ROUTE_PATH);
  }

  return (
    <div className="cramPage">
      <div className="cramHome">
        <header className="cramHello">
          <div>
            <p className="cramKicker">Shime · Ôn thi GDQP – An ninh</p>
            <h1 className="cramHello__title">Cài đặt</h1>
          </div>
          <ShimeLogoMark size={48} tile="app" />
        </header>

        <section className="cramSection" aria-labelledby="set-theme">
          <h2 id="set-theme" className="cramSection__title">Màu giao diện</h2>
          <div className="setThemes" role="radiogroup" aria-labelledby="set-theme">
            {THEMES.map(option => (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={theme === option.id}
                className={`setTheme${theme === option.id ? ' is-on' : ''}`}
                onClick={() => chooseTheme(option.id)}
              >
                <span className="setTheme__swatch" style={{ background: option.ground }}>
                  <span style={{ background: option.swatch }} />
                </span>
                <span className="setTheme__name">{option.name}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="cramSection" aria-labelledby="set-reveal">
          <h2 id="set-reveal" className="cramSection__title">Cách hiện đáp án</h2>
          <RevealToggle revealMode={prefs.revealMode} onChange={mode => setPrefs(saveCramPrefs({ revealMode: mode }))} />
          <p className="cramSubtle setHint">
            {prefs.revealMode === 'check'
              ? 'Chọn đáp án rồi bấm Kiểm tra mới biết đúng hay sai. Có thời gian suy nghĩ lại.'
              : 'Chạm vào đáp án là biết ngay đúng hay sai. Nhanh hơn.'}
          </p>
        </section>

        <section className="cramSection" aria-labelledby="set-learner">
          <h2 id="set-learner" className="cramSection__title">Người học</h2>
          <ul className="cramChapters">
            <li className="setRow">
              <span className="setRow__label">Đang học</span>
              <span className="setRow__value">{profile?.id === PROFILE_LE_THUY ? 'Lệ Thủy' : profile ? 'Người khác' : 'Chưa chọn'}</span>
            </li>
            <li>
              <button type="button" className="setRow setRow--button" onClick={switchLearner}>
                <span className="setRow__label">Đổi người học</span>
                <span className="setRow__chev" aria-hidden="true">›</span>
              </button>
            </li>
            <li>
              <button type="button" className="setRow setRow--button" onClick={() => navigate(CRAM_ROUTE_PATH, { state: { showGuide: true } })}>
                <span className="setRow__label">Xem lại hướng dẫn</span>
                <span className="setRow__chev" aria-hidden="true">›</span>
              </button>
            </li>
          </ul>
        </section>

        <section className="cramSection" aria-labelledby="set-data">
          <h2 id="set-data" className="cramSection__title">Tiến độ</h2>
          <ul className="cramChapters">
            <li>
              <button
                type="button"
                className={`setRow setRow--button${confirmReset ? ' setRow--danger' : ''}`}
                onClick={resetProgress}
                disabled={!profile}
              >
                <span className="setRow__label">{confirmReset ? 'Bấm lần nữa để xóa toàn bộ tiến độ' : 'Học lại từ đầu'}</span>
                <span className="setRow__chev" aria-hidden="true">›</span>
              </button>
            </li>
          </ul>
          <p className="cramSubtle setHint" role="status">
            {resetDone ? 'Đã xóa tiến độ. Bạn có thể bắt đầu lại từ Chương 1.' : 'Tiến độ được lưu ngay trên máy này, không cần tài khoản.'}
          </p>
        </section>
      </div>
    </div>
  );
}
