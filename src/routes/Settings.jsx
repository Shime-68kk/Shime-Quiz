import PageHeader from '../components/PageHeader.jsx';
import FsrsExperimentalSettingsPanel from '../components/settings/FsrsExperimentalSettingsPanel.jsx';
import EduGenDraftWorkshopPanel from '../components/settings/EduGenDraftWorkshopPanel.jsx';
import EduGenDraftReviewPanel from '../components/edugen/EduGenDraftReviewPanel.jsx';

export default function Settings() {
  return (
    <div className="pageRoot">
      <PageHeader title="Cài đặt" subtitle="Tuỳ chọn nâng cao" />
      <FsrsExperimentalSettingsPanel />
      <EduGenDraftWorkshopPanel />
      <EduGenDraftReviewPanel />
    </div>
  );
}
