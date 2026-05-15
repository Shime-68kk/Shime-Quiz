import { useNavigate } from 'react-router-dom';
import Badge from '../components/Badge.jsx';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';

const supportedImports = ['JSON', 'CSV', 'Text/Markdown', '.txt/.md'];
const learningAreas = ['Thư viện', 'Phòng học', 'Tiến trình Tổng quan', 'Sao lưu/Khôi phục'];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="pageStack publicLanding" aria-label="Giới thiệu ShimeChamhoc">
      <section className="publicLandingHero" aria-labelledby="public-landing-title">
        <div className="publicLandingHero__content">
          <p className="eyebrow">ShimeChamhoc v2</p>
          <h1 id="public-landing-title">Học quiz cục bộ, rõ ràng, không cần tài khoản.</h1>
          <p className="publicLandingIdentityLine">Phòng học yên tĩnh — dữ liệu của bạn, ở đây, an toàn.</p>
          <p className="lead">
            ShimeChamhoc là ứng dụng học quiz local-first: bạn nhập nội dung học, xem trước bản nháp,
            kiểm tra chất lượng, lưu vào trình duyệt và học trong Phòng học với tiến độ hiển thị trên Tổng quan.
          </p>
          <div className="publicLandingHero__actions" aria-label="Bắt đầu dùng ShimeChamhoc">
            <Button type="button" size="lg" onClick={() => navigate('/dashboard')}>Mở Tổng quan</Button>
            <Button type="button" variant="secondary" size="lg" onClick={() => navigate('/library')}>Mở Thư viện</Button>
            <Button type="button" variant="ghost" size="lg" onClick={() => navigate('/library')}>
              Dùng quiz mẫu
            </Button>
          </div>
        </div>
        <Card title="Bắt đầu nhanh" eyebrow="Demo an toàn" className="publicLandingHero__card">
          <p className="muted">
            Vào Thư viện và chọn <strong>Dùng quiz mẫu</strong> để mở một bộ quiz mẫu cục bộ. Mẫu chỉ đi qua luồng xem trước, kiểm tra chất lượng và xác nhận lưu; Shime không tự lưu khi chưa được xác nhận.
          </p>
          <Badge tone="success">Xem trước · kiểm tra · xác nhận lưu</Badge>
        </Card>
      </section>

      <div className="cardGrid cardGrid--two">
        <Card title="Có thể làm gì?" eyebrow="Luồng học chính">
          <ul className="publicLandingList">
            <li>Học từ nội dung quiz đã nhập hoặc lưu trong Thư viện.</li>
            <li>Mở Phòng học để trả lời trắc nghiệm, câu hỏi ngắn và flashcard khi phù hợp.</li>
            <li>Xem Tổng quan để theo dõi tiến độ học cục bộ và gợi ý học tập ở mức tư vấn.</li>
            <li>Xuất/khôi phục bản sao lưu cục bộ khi bạn muốn tự quản lý dữ liệu.</li>
          </ul>
        </Card>

        <Card title="Nhập nội dung học" eyebrow="Nhập dữ liệu cục bộ">
          <div className="publicLandingPills" aria-label="Định dạng nhập được hỗ trợ">
            {supportedImports.map(item => <span key={item} className="publicLandingPill">{item}</span>)}
          </div>
          <p className="muted">
            Bạn có thể nhập JSON/CSV, dán text/Markdown, hoặc tải file .txt/.md. Mỗi luồng vẫn giữ bước kiểm tra hợp lệ, xem trước và xác nhận trước khi lưu.
          </p>
        </Card>
      </div>

      <div className="cardGrid cardGrid--two">
        <Card title="Giới hạn tài liệu EduGen" eyebrow="PDF/DOCX/PPTX/ZIP">
          <p className="muted">
            Nhập PDF/DOCX/PPTX/ZIP cần một dịch vụ EduGen/File Processor riêng, đã cấu hình và trình duyệt truy cập được. EduGen không được bundle trong Shime; chỉ hosting frontend thì không tự có chuyển đổi tài liệu.
          </p>
          <Badge tone="warning">Cần dịch vụ riêng đã cấu hình</Badge>
        </Card>

        <Card title="Giới hạn AI thủ công" eyebrow="Không gọi AI/API">
          <p className="muted">
            Shime chỉ hỗ trợ quy trình thủ công: tạo prompt/xuất, người dùng tự sao chép sang công cụ bên ngoài, rồi dán kết quả về để xem lại/nhập. Shime không có built-in AI generation, không gọi external AI/API và không có API key/BYOK support.
          </p>
          <Badge tone="neutral">Chỉ sao chép/dán thủ công</Badge>
        </Card>
      </div>

      <Card title="Local-first và giới hạn công khai" eyebrow="Quyền riêng tư · phạm vi triển khai">
        <div className="publicLandingColumns">
          <div>
            <h2 className="publicLandingSubheading">Dữ liệu ở đâu?</h2>
            <p className="muted">
              Không cần tài khoản. Dữ liệu học nằm trong bộ nhớ cục bộ của trình duyệt trừ khi bạn tự xuất hoặc chia sẻ bản sao lưu. Shime không thêm backend/cloud sync.
            </p>
          </div>
          <div>
            <h2 className="publicLandingSubheading">Không nên hiểu nhầm</h2>
            <p className="muted">
              Không OCR, không backend/auth/cloud sync, không có EduGen đi kèm, không có chứng nhận production/security/accessibility, và release tag/GitHub Release vẫn chưa được tạo hoặc phát hành.
            </p>
          </div>
        </div>
      </Card>

      <Card title="Đi tới khu vực chính" eyebrow="Điều hướng ứng dụng">
        <div className="publicLandingPills" aria-label="Khu vực chính trong Shime">
          {learningAreas.map(item => <span key={item} className="publicLandingPill">{item}</span>)}
        </div>
        <div className="publicLandingHero__actions publicLandingHero__actions--compact">
          <Button type="button" onClick={() => navigate('/dashboard')}>Tổng quan</Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/library')}>Thư viện</Button>
          <Button type="button" variant="ghost" onClick={() => navigate('/study-room')}>Phòng học</Button>
        </div>
      </Card>
    </div>
  );
}
