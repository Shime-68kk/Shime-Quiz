import { useNavigate } from 'react-router-dom';
import Badge from '../components/Badge.jsx';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';

const supportedImports = ['JSON', 'CSV', 'Text/Markdown', '.txt/.md'];
const learningAreas = ['Library', 'Study Room', 'Dashboard progress', 'Backup/restore'];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="pageStack publicLanding" aria-label="ShimeChamhoc public introduction">
      <section className="publicLandingHero" aria-labelledby="public-landing-title">
        <div className="publicLandingHero__content">
          <p className="eyebrow">ShimeChamhoc v2</p>
          <h1 id="public-landing-title">Học quiz cục bộ, rõ ràng, không cần tài khoản.</h1>
          <p className="lead">
            ShimeChamhoc là ứng dụng học quiz local-first: bạn nhập nội dung học, xem trước bản nháp,
            kiểm tra chất lượng, lưu vào trình duyệt và học trong Study Room với tiến độ hiển thị trên Dashboard.
          </p>
          <div className="publicLandingHero__actions" aria-label="Bắt đầu dùng ShimeChamhoc">
            <Button type="button" size="lg" onClick={() => navigate('/dashboard')}>Mở Dashboard</Button>
            <Button type="button" variant="secondary" size="lg" onClick={() => navigate('/library')}>Mở Library</Button>
            <Button type="button" variant="ghost" size="lg" onClick={() => navigate('/library')}>
              Dùng quiz mẫu
            </Button>
          </div>
        </div>
        <Card title="Bắt đầu nhanh" eyebrow="Demo an toàn" className="publicLandingHero__card">
          <p className="muted">
            Vào Library và chọn <strong>Dùng quiz mẫu</strong> để mở một bộ quiz mẫu cục bộ. Mẫu chỉ đi qua luồng xem trước, kiểm tra chất lượng và xác nhận lưu; Shime không auto-save.
          </p>
          <Badge tone="success">Preview / review / confirm-save</Badge>
        </Card>
      </section>

      <div className="cardGrid cardGrid--two">
        <Card title="Có thể làm gì?" eyebrow="Luồng học chính">
          <ul className="publicLandingList">
            <li>Học từ nội dung quiz đã nhập hoặc lưu trong Library.</li>
            <li>Mở Study Room để trả lời trắc nghiệm, câu hỏi ngắn và flashcard nơi phù hợp.</li>
            <li>Xem Dashboard để theo dõi tiến độ học cục bộ và gợi ý học tập ở mức tư vấn.</li>
            <li>Xuất/khôi phục backup cục bộ khi cần tự quản lý dữ liệu.</li>
          </ul>
        </Card>

        <Card title="Nhập nội dung học" eyebrow="Import cục bộ">
          <div className="publicLandingPills" aria-label="Định dạng import được hỗ trợ">
            {supportedImports.map(item => <span key={item} className="publicLandingPill">{item}</span>)}
          </div>
          <p className="muted">
            Bạn có thể import JSON/CSV, dán text/Markdown, hoặc tải file .txt/.md. Mỗi luồng vẫn giữ kiểm tra validation, xem trước và xác nhận trước khi lưu.
          </p>
        </Card>
      </div>

      <div className="cardGrid cardGrid--two">
        <Card title="Ranh giới tài liệu EduGen" eyebrow="PDF/DOCX/PPTX/ZIP">
          <p className="muted">
            Import PDF/DOCX/PPTX/ZIP cần một EduGen/File Processor riêng, đã cấu hình và trình duyệt truy cập được. EduGen không được bundle trong Shime; chỉ hosting frontend thì không tự có chuyển đổi tài liệu.
          </p>
          <Badge tone="warning">Separate configured service required</Badge>
        </Card>

        <Card title="Ranh giới AI thủ công" eyebrow="Không gọi AI/API">
          <p className="muted">
            Shime chỉ hỗ trợ quy trình thủ công: tạo prompt/export, người dùng tự copy sang công cụ bên ngoài, rồi dán kết quả về để xem lại/import. Shime không có built-in AI generation, không gọi external AI/API và không có API key/BYOK support.
          </p>
          <Badge tone="neutral">Manual copy/paste only</Badge>
        </Card>
      </div>

      <Card title="Local-first và giới hạn công khai" eyebrow="Privacy / deployment boundary">
        <div className="publicLandingColumns">
          <div>
            <h2 className="publicLandingSubheading">Dữ liệu ở đâu?</h2>
            <p className="muted">
              Không cần tài khoản. Dữ liệu học nằm trong browser local storage trừ khi bạn tự export hoặc chia sẻ backup. Shime không thêm backend/cloud sync.
            </p>
          </div>
          <div>
            <h2 className="publicLandingSubheading">Không nên hiểu nhầm</h2>
            <p className="muted">
              Không OCR, không backend/auth/cloud sync, không EduGen bundled, không production/security/accessibility certification, và release tag/GitHub Release vẫn chưa được tạo hoặc publish.
            </p>
          </div>
        </div>
      </Card>

      <Card title="Đi tới khu vực chính" eyebrow="App navigation">
        <div className="publicLandingPills" aria-label="Khu vực chính trong Shime">
          {learningAreas.map(item => <span key={item} className="publicLandingPill">{item}</span>)}
        </div>
        <div className="publicLandingHero__actions publicLandingHero__actions--compact">
          <Button type="button" onClick={() => navigate('/dashboard')}>Dashboard</Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/library')}>Library</Button>
          <Button type="button" variant="ghost" onClick={() => navigate('/study-room')}>Study Room</Button>
        </div>
      </Card>
    </div>
  );
}
