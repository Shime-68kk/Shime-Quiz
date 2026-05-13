import PageHeader from '../components/PageHeader.jsx';
import FsrsExperimentalSettingsPanel from '../components/settings/FsrsExperimentalSettingsPanel.jsx';

export default function Settings() {
  return (
    <div className="pageRoot">
      <PageHeader title="Cài đặt" subtitle="Tuỳ chọn nâng cao" />
      <FsrsExperimentalSettingsPanel />
    </div>
  );
}
