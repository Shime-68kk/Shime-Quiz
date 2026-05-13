import PageHeader from '../components/PageHeader.jsx';
import FsrsTwoStepScaffold from '../components/study/FsrsTwoStepScaffold.jsx';

export default function FsrsUiFixture() {
  return (
    <div className="pageRoot">
      <PageHeader title="FSRS UI Fixture" subtitle="Developer / Test Mode Only" />
      <FsrsTwoStepScaffold />
    </div>
  );
}
