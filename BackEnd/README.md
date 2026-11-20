# AXANH Phiên Chợ Tri Thức - Lark Base Backend

Backend dùng **Node.js 22+**, không cần `npm install` hay thư viện bên ngoài. Ngoài các API đọc dữ liệu, hệ thống có các luồng xác thực, kết nối và Lịch cùng học/Form 02 ghi vào Lark Base.

## Mục tiêu phiên bản 0.1.0

- Đọc `T01_Villages` và `T02_Members` qua **Lark Search Records API**.
- Tự lấy và cache `tenant_access_token` (có làm mới trước khi hết hạn).
- Tự đi qua toàn bộ `page_token` (không bỏ sót vì `page_size`).
- Chuyển dữ liệu Lark thành JSON dễ dùng cho web.
- Ghép thành viên vào làng bằng **`Village.link_record_ids[]` -> `T01_Villages.record_id`**.
- **Chỉ đọc dữ liệu**, không có các lệnh cập nhật/xóa.
- **Chỉ phục vụ trên loopback**, yêu cầu `x-internal-test-key` để thử bằng `curl`; chưa có Lark SSO và **KHÔNG ĐƯỢC** publish ra Internet.

## 1. Chuẩn bị

1. Node.js 22+.
2. Tài khoản Lark Developer có Custom App và scope `bitable:app:readonly` đã được duyệt.
3. Custom App đã được cho phép đọc Base (đã kiểm tra được `code: 0`).
4. `LARK_APP_ID`, `LARK_APP_SECRET` trong Credentials của Custom App.
5. `LARK_BASE_APP_TOKEN` của **đúng** Base, `LARK_TABLE_VILLAGES`, `LARK_TABLE_MEMBERS` lấy từ List Tables.

**Lưu ý quan trọng:** Trong HTML V4 do sếp gửi có `DEFAULT_BASE` riêng. Hãy xác nhận URL đó trỏ cùng Base mà API Explorer đang đọc trước khi đồng bộ. Không tự đoán bằng tên bảng.

## 2. Cấu hình

Sao chép `.env.example` thành `.env`, điền các giá trị thực tế. Không gửi `.env` cho bất kỳ ai.

Có thể tạo chuỗi test key an toàn bằng Node:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Không nhập test key vào `index.html` hay commit nó lên Git.

## 3. Chạy trên máy cá nhân

```powershell
node --version
npm test
npm start
```

Gọi thử API từ terminal khác (thay `<KEY_FROM_ENV>` bằng key của bạn):

```powershell
curl.exe -H "x-internal-test-key: <KEY_FROM_ENV>" http://127.0.0.1:3100/api/v1/villages
curl.exe -H "x-internal-test-key: <KEY_FROM_ENV>" http://127.0.0.1:3100/api/v1/members
```

Health check không chứa dữ liệu nội bộ:

```powershell
curl.exe http://127.0.0.1:3100/health
```

## 4. API Contract (v0.1)

- `GET /api/v1/villages` -> `{ count, items: [{ id, name, slogan, office, leader, deputy, memberCount, totalScore, gate1Status, gate1Passed, gate1Total, status, hasIconAttachment }] }`
- `GET /api/v1/members` -> `{ count, items: [{ id, name, villageId, villageName, office, programRole, active, offer, offerTags, need, needTags, availability }] }`

`active` có thể là `null` khi trường `Active✅` bị thiếu; không tự hiểu là `false`.
`offer`, `need`, tags và lịch rảnh hiện không có trong `T02_Members`, nên trả `null` / `[]` thay vì sử dụng dữ liệu mock.

Các file `Color/Icon` của Lark cần API/proxy ảnh được cấp quyền trước khi đưa lên website thật; hiện trả `hasIconAttachment` thay vì URL tạm.

## 5. Lịch cùng học và báo cáo Form 02

Trang Lịch cùng học dùng `T15_Learning_Sessions` làm nguồn dữ liệu, không dùng lịch demo trong `localStorage`. Có thể cấu hình `LARK_TABLE_LEARNING_SESSIONS`; nếu bỏ trống, backend dùng ID T15 đã được xác minh cho Base hiện tại.

Backend kiểm tra metadata field trước khi đọc/ghi. Trong Base hiện tại:

- `T15.Connection` là Linked Record tới `T14_Connections`; khi tạo lịch, backend ghi `record_id` Lark thật của T14.
- `T15.Session_Status` dùng các giá trị `Proposed`, `Confirmed`, `Completed`, `Cancelled`.
- `T15.Confirmed_By` lưu `Member_ID` của người xác nhận lịch; khi gửi Form 02, `Submitted_By` và `👤 Người điền` tiếp tục xác định người báo cáo.
- `T15.Other_Participant_ID` lưu `Member_ID` của người còn lại trong kết nối ngay khi tạo lịch, không phụ thuộc người này đã xác nhận hay chưa.
- `Form 02.Learning_Session` là Linked Record tới T15.
- `Form 02.Connection` hiện liên kết tới bảng đăng ký gian hàng, không phải T14; backend không ghi nhầm record T14 vào field này. Liên kết T14 được giữ qua T15.
- Người báo cáo được nhận diện bằng Lark user fields từ session thành viên; báo cáo trùng cùng thành viên/buổi học được trả lại thay vì tạo thêm.

Các API dùng session đăng nhập hiện tại:

- `GET /api/v1/learning-sessions`
- `POST /api/v1/learning-sessions`
- `POST /api/v1/learning-sessions/:id/respond`
- `POST /api/v1/learning-sessions/:id/complete`
- `GET /api/v1/learning-sessions/:id/results`
- `POST /api/v1/learning-sessions/:id/results`

Chỉ người tham gia được đặt lịch, phản hồi, hoàn thành hoặc gửi báo cáo; quản trị viên có thể xem toàn hệ thống nhưng không thể thay người khác thực hiện nghiệp vụ. Từ chối lịch hiện lưu `Cancelled` vì schema T15 chưa có lựa chọn `Rejected`.

## 6. Kho tri thức

Kho tri thức đọc Form 02 và chỉ xuất bản báo cáo khi checkbox `Đồng ý chia sẻ bài học này ở chế độ nội bộ khi tổ chức có cơ chế phê duyệt.` là boolean `true`, báo cáo liên kết duy nhất tới một record T15 hợp lệ, và `T15.Session_Status` là `Completed`. Báo cáo thiếu liên kết, buổi học chưa hoàn thành hoặc thiếu nội dung chia sẻ không được trả về. Bài có thể bị gỡ ngay sau khi bỏ đồng ý vì API đọc dữ liệu Lark mới ở mỗi yêu cầu, không cache danh sách hoặc chi tiết.

Field mapping đã đối chiếu với schema Lark:

- Chủ đề / Nội dung học lấy từ Form 02.`Tài sản tri thức có thể chia sẻ lại`; không dùng `Learning_Title`.
- Tiêu đề và ngày lấy từ T15.`Learning_Title` và `Start_At`.
- Liên kết Form 02.`Learning_Session` và T15.`Connection` được giải bằng các Lark `record_id`.
- Loại kết nối lấy từ T14.`Connection_Type`.
- Người chia sẻ chỉ hiển thị tên khớp với `Submitted_By` / `👤 Người điền` và `T02_Members.Lark_User`; API không trả email, Member_ID hoặc open_id.
- Link / minh chứng chỉ được trả khi URL hợp lệ và dùng HTTP(S).

Các API yêu cầu session Email OTP hợp lệ:

- `GET /api/v1/knowledge` trả danh sách đã lọc cùng số đếm tổng hợp: thiếu liên kết T15, liên kết mơ hồ / không còn hợp lệ, buổi học chưa hoàn thành, thiếu nội dung hoặc thiếu tiêu đề.
- `GET /api/v1/knowledge/:id` kiểm tra lại quyền chia sẻ và trạng thái hoàn thành trước khi trả chi tiết; bài đã thu hồi hoặc không đủ điều kiện trả `404`.

Không ghi dữ liệu sang T05 và không thay đổi schema Form 02.

## 7. Vinh danh và thống kê hoạt động

`GET /api/v1/honors` yêu cầu session Email OTP hợp lệ và chỉ đọc dữ liệu. Có thể thêm `?refresh=1` để bỏ qua cache backend. API trả về thống kê hoạt động cá nhân/Làng, không tạo bảng xếp hạng điểm hoặc tự phong danh hiệu.

Các chỉ số được tính từ dữ liệu Lark đã đối chiếu:

- Kết nối chỉ được tính khi T14.`Connection_Status` là `Accepted`, liên kết đúng một cặp gian hàng T01/T02 và loại gian hàng phù hợp với Cá nhân/Làng.
- Buổi học chỉ được tính khi T15.`Session_Status` là `Completed` và T15.`Connection` trỏ tới kết nối Accepted hợp lệ.
- Form 02 chỉ được tính khi có đúng một liên kết `Learning_Session` tới buổi học Completed, có nội dung học và mức hữu ích từ 1 đến 5, đồng thời người gửi khớp với người tham gia của kết nối. Checkbox đồng ý chia sẻ không được dùng làm điều kiện thành tích; nội dung báo cáo riêng tư không được trả về.
- Thống kê cá nhân không được biến thành thứ hạng; số liệu kết nối Làng ↔ Làng được ghi cho hai Làng tham gia. Không cộng điểm T08 vào đây.

Audit schema Lark hiện tại:

- `T06_Good_Fruit` là hồ sơ Good Fruit/Gate 1, có trạng thái hồ sơ và đánh giá như `Case_Status`, `Score_Status`, cùng trường điểm/giám khảo. Bản ghi cần xét ở Gate 1; đây không phải bảng danh hiệu Vinh danh.
- `T08_Score_Ledger` liên kết Làng, hạng mục điểm và hoạt động; có `Review_Status`, `Score_Record_Type`, điểm điều chỉnh và các trường công thức. `Ranking_Score`/`Result_Tier` dùng quy tắc xếp hạng Đại hội. Không cộng hoặc chuyển các điểm này thành danh hiệu Vinh danh.
- Không có bảng hoặc trường nguồn chính thức thể hiện đầy đủ đối tượng, danh hiệu, kỳ xét và trạng thái công bố. Vì vậy `awards` và `history` hiện rỗng, giao diện hiển thị “Chưa có danh hiệu được công bố trong kỳ này.” Không có API ghi/duyệt danh hiệu và không thay đổi schema Lark.

## 8. Gate 1 đọc từ T07

- `GET /api/v1/gate1` yêu cầu session admin/BTC và chỉ đọc dữ liệu từ T01/T07; không ghi Base.
- `LARK_TABLE_GATE1` có thể cấu hình riêng; mặc định dùng table ID T07 đã xác minh qua liên kết T01.
- Ghép Làng bằng record ID trong `Recipient_Village`, không ghép theo tên. Chỉ `Gate1_Status` quyết định trạng thái hiển thị; thiếu trạng thái, liên kết hoặc có nhiều hồ sơ không được suy diễn/chọn mới nhất.
- Phản hồi chỉ gồm dữ liệu cần cho trang Gate 1; không đưa `Verified_By`, reviewer comments, email hay Member ID ra giao diện.
- Audit hiện tại tìm thấy một hồ sơ Gate 1 nhưng chưa có `Recipient_Village`, `Gate1_Status`, xác nhận người nhận hay minh chứng. Vì vậy trang giữ trạng thái trung tính và báo hồ sơ chưa thể gán cho Làng.
- Không tìm thấy Rulebook riêng trong workspace; nội dung Rulebook v2.0 và tiến độ mẫu trong giao diện được giữ nguyên, không coi tiến độ mẫu là dữ liệu chính thức.

Cần kiểm thử thêm:

- Xác minh 11 làng và 86 thành viên qua API (số liệu có thể thay đổi theo Base).
- Kiểm tra bảng T02 có bản ghi `Active✅` vắng mặt và quy tắc nghiệp vụ cho việc hiển thị.
- Kiểm tra field `Gate1_Status` theo trạng thái thực tế, tránh lẫn `PENDING` trong Lark với `pending` của demo.
- Chỉ cho phép frontend thấy dữ liệu cần thiết; không truy vấn/đưa bảng `DS NV Tổng` lên giao diện nếu không có căn cứ quyền truy cập.
- Sau cùng mới triển khai tính năng ghi (matches, forms) trên Base thử nghiệm.

## 9. Trước khi tích hợp HTML V4 / deploy DSM

**Không đặt `INTERNAL_TEST_KEY` trong trình duyệt.** Cần bổ sung Lark SSO và xác thực session phía server (kèm quyền BTC/nhân viên), sau đó mới cho frontend gọi API cùng origin.

## 10. Tài liệu Lark

- Lark Base overview: https://open.larksuite.com/document/server-docs/docs/bitable-v1/bitable-overview
- Search Records: https://open.larksuite.com/document/server-docs/docs/bitable-v1/app-table-record/search
- Authentication: https://open.larksuite.com/document/home/synchronize-corporate-organizational-structure-to-feishu/obtain-the-application-access-token
