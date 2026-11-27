'use strict';
const SEED = window.SEED || (document.querySelector('#seed-json') ? JSON.parse(document.querySelector('#seed-json').textContent) : {});
const DEFAULT_BASE = 'https://axaengineers.sg.larksuite.com/base/JhlXbNcdGahzUjsk54XljxUjgtf?table=tblx35YzG7foMWAf&view=vewCwSoOiM';
const STORE_KEY = 'axanh_kex_v3_market_gate1_2026';

const DEFAULT_GATE1_ENTRIES = [
  { id: 'gate-vil-0005', villageId: 'VIL-0005', status: 'passed', receiverVillage: '🌬️ Làng Gió', receiverName: 'Jamie Tran', value: 'Chia sẻ checklist rà soát bản vẽ trước khi phát hành và hướng dẫn cách dùng trong 1 dự án nhỏ.', change: 'Làng Gió đã áp dụng vào bước kiểm tra nội bộ, giảm lỗi sót và rút ngắn thời gian rà soát cuối ngày.', evidence: 'Checklist đã cập nhật, ảnh chụp phiên làm việc, phản hồi từ Làng Gió.', comment: 'Đây là dạng hỗ trợ rất phù hợp Gate 1: giá trị cụ thể, có áp dụng thật và người nhận xác nhận được điều thay đổi.', cross: false, updated: '10/11/2026' },
  { id: 'gate-vil-0009', villageId: 'VIL-0009', status: 'reviewing', receiverVillage: '🔥 Làng Lửa', receiverName: 'Harold Le', value: 'Hướng dẫn cách chuẩn hóa email cập nhật tiến độ để giảm hiểu lầm khi phối hợp với khách hàng.', change: 'Người nhận ghi nhận đã dùng lại mẫu email trong hai tình huống thật và giúp trao đổi rõ ràng hơn.', evidence: 'Bản mẫu email, phản hồi nội bộ, ghi chú sau buổi chia sẻ.', comment: 'Hồ sơ đã có hướng tích cực nhưng BTC còn cần thêm minh chứng “đã áp dụng” đủ rõ để chốt kết quả.', cross: false, updated: '11/11/2026' },
  { id: 'gate-vil-0002', villageId: 'VIL-0002', status: 'revise', receiverVillage: '🍢 Làng Nướng', receiverName: 'Kai Nguyen', value: 'Chia sẻ cách note yêu cầu khách hàng ngay sau cuộc họp để tránh quên ý.', change: 'Người nhận nói đã hiểu cách làm nhưng chưa đính kèm ví dụ trước/sau hoặc kết quả thay đổi cụ thể.', evidence: 'Mới có nội dung buổi chia sẻ, chưa có minh chứng áp dụng.', comment: 'Chia sẻ hay là chưa đủ. Gate 1 cần bước tiếp theo: người nhận đã dùng thật và cho thấy giá trị thật.', cross: false, updated: '11/11/2026' },
  { id: 'gate-vil-0008', villageId: 'VIL-0008', status: 'valid', receiverVillage: '☁️ Làng Mơ', receiverName: 'Bruce Ngo', value: 'Hỗ trợ cách phân tách đầu việc và ước lượng thời gian để giảm cảm giác quá tải.', change: 'Làng Mơ đã thử triển khai bảng ưu tiên, giúp trưởng làng theo dõi tuần tốt hơn.', evidence: 'Ảnh bảng theo dõi, chia sẻ sau áp dụng, xác nhận của người nhận.', comment: 'Hồ sơ này gần như hoàn chỉnh. Chỉ cần BTC chốt phê duyệt cuối cùng để chuyển sang trạng thái đạt Gate 1.', cross: false, updated: '10/11/2026' },
  { id: 'gate-vil-0011', villageId: 'VIL-0011', status: 'passed', receiverVillage: '🤝 Làng Đồng Tâm', receiverName: 'Walker Bui', value: 'Chia sẻ phương pháp họp 1:1 ngắn nhưng hiệu quả để khơi mở khó khăn của thành viên.', change: 'Làng Đồng Tâm áp dụng trong tuần và ghi nhận thành viên chủ động chia sẻ hơn.', evidence: 'Mẫu khung hỏi, lịch họp 1:1, phản hồi từ người nhận.', comment: 'Đây là ví dụ tốt cho tinh thần Help Others Succeed First: không chỉ giúp xong việc mà giúp người khác phát triển cách làm.', cross: false, updated: '09/11/2026' },
  { id: 'gate-vil-0001', villageId: 'VIL-0001', status: 'pending', receiverVillage: '✨ Làng Đom Đóm', receiverName: 'Alvin Tran', value: 'Dự kiến hỗ trợ cách follow-up tiến độ với đồng đội để việc giao nhận rõ hơn.', change: 'Chưa nộp hồ sơ xác nhận từ người nhận.', evidence: 'Chưa có.', comment: 'Làng này nên bắt đầu từ một hỗ trợ nhỏ nhưng thật cụ thể, rồi chốt lại bằng minh chứng đơn giản và rõ ràng.', cross: false, updated: '—' },
  { id: 'gate-vil-0003', villageId: 'VIL-0003', status: 'failed', receiverVillage: '🪨 Làng Đá', receiverName: 'Samson Nguyen', value: 'Hỗ trợ xử lý SOP nội bộ và đồng thời dùng chính Làng Đá để xác nhận cho mình.', change: 'Có hỗ trợ thật nhưng phát sinh xác nhận chéo với hồ sơ ngược lại từ Làng Đá.', evidence: 'Hai hồ sơ xác nhận chéo A ↔ B.', comment: 'Không phải vì giá trị thấp, mà vì phạm quy tắc không xác nhận chéo. Làng vẫn có thể giúp nhau, nhưng bằng chứng dùng xét Gate 1 phải tách riêng.', cross: true, updated: '10/11/2026' },
  { id: 'gate-vil-0007', villageId: 'VIL-0007', status: 'reviewing', receiverVillage: '🍃 Làng Lá', receiverName: 'Leo Tran', value: 'Chia sẻ cách dùng một prompt AI để chuẩn bị bản tóm tắt công việc hằng tuần.', change: 'Người nhận đã bắt đầu thử trong nội bộ làng và đánh giá tiết kiệm thời gian viết báo cáo.', evidence: 'Ảnh chụp prompt, tóm tắt trước/sau, xác nhận từ người nhận.', comment: 'Nếu bổ sung rõ chỉ số trước/sau hoặc ví dụ cụ thể hơn, hồ sơ sẽ rất thuyết phục.', cross: false, updated: '11/11/2026' },
  { id: 'gate-vil-0004', villageId: 'VIL-0004', status: 'pending', receiverVillage: '🌸 Làng Thiếu Nữ', receiverName: 'Otis Nguyen', value: 'Dự kiến hỗ trợ cách tổ chức việc hỏi đúng để giảm ngại hỏi.', change: 'Chưa có buổi hỗ trợ được ghi nhận trong hệ thống demo.', evidence: 'Chưa có.', comment: 'Đừng chờ một dự án lớn. Một thay đổi nhỏ nhưng được áp dụng thật thường có giá trị Gate 1 cao hơn một buổi chia sẻ dài mà chưa đi vào thực tế.', cross: false, updated: '—' },
  { id: 'gate-vil-0006', villageId: 'VIL-0006', status: 'valid', receiverVillage: '✒️ Làng Thơ', receiverName: 'Liam Truong', value: 'Chia sẻ mẫu list ưu tiên trong tuần để giúp trưởng làng rà soát các đầu việc chính.', change: 'Người nhận cho biết đã dùng list này để sắp xếp lại nhịp làm việc và họp làng hiệu quả hơn.', evidence: 'Mẫu list, ảnh chụp áp dụng, xác nhận người nhận.', comment: 'Một hồ sơ tốt là hồ sơ khiến người đọc hình dung rất rõ: đã hỗ trợ gì, áp dụng ra sao, thay đổi chỗ nào.', cross: false, updated: '10/11/2026' },
  { id: 'gate-vil-0010', villageId: 'VIL-0010', status: 'passed', receiverVillage: '🌿 Làng Nguyên Thủy', receiverName: 'Austin Pham', value: 'Chia sẻ cách chủ động tìm việc trong dự án khi có khoảng trống ngắn.', change: 'Người nhận đã thử phân công lại và tăng tính chủ động của thành viên trong tuần.', evidence: 'Ghi nhận sau buổi họp, ví dụ nhiệm vụ được chủ động đề xuất, xác nhận của trưởng làng nhận.', comment: 'Đây là kiểu giá trị rất sát tinh thần Đại hội năm nay: một thay đổi hành vi nhỏ nhưng tạo ra hiệu quả thật.', cross: false, updated: '09/11/2026' }
];
function freshGateEntries() { return JSON.parse(JSON.stringify(DEFAULT_GATE1_ENTRIES)) }

const PAGE_LABELS = { home: ['Tổng quan', 'Phiên chợ tri thức'], villages: ['Lark Base', '11 Làng AXANH'], members: ['Thành viên làng', 'Danh sách thành viên'], market: ['Gian hàng', 'Khám phá tri thức'], matches: ['Kết nối', 'Smart Matching'], network: ['Mạng lưới kết nối', 'Bản đồ kết nối'], 'connection-detail': ['Mạng lưới kết nối', 'Chi tiết kết nối toàn hệ thống'], schedule: ['Lịch cùng học', 'Lịch học của tôi'], 'schedule-all': ['Lịch cùng học', 'Lịch học toàn AXANH'], 'learning-history': ['Lịch cùng học', 'Lịch sử học tập'], library: ['Tri thức', 'Thư viện chung'], awards: ['Ghi nhận', 'Vinh danh tri thức'], gate1: ['Gate 1', 'Điều kiện Quán quân'], forms: ['Biểu mẫu', 'Đăng ký & báo cáo'], settings: ['Hệ thống', 'Lark & API'] };
const NAV = [
  ['home', 'Tổng quan', 'home'],
  ['villages', 'Danh sách 11 Làng', 'grid'],
  ['members', 'Thành viên làng', 'users'],
  ['market', 'Phiên chợ tri thức', 'grid'],
  ['matches', 'Kết nối phù hợp', 'link'],
  {
    group: 'network-hub',
    label: 'Mạng lưới kết nối',
    icon: 'network',
    children: [
      ['network', 'Bản đồ kết nối', 'network'],
      ['connection-detail', 'Chi tiết kết nối', 'users'],
    ],
  },
  {
    group: 'learning-hub',
    label: 'Lịch cùng học',
    icon: 'calendar',
    children: [
      ['schedule', 'Lịch học của tôi', 'calendar'],
      ['schedule-all', 'Lịch học toàn AXANH', 'users'],
      ['learning-history', 'Lịch sử học tập', 'clock'],
    ],
  },
  ['library', 'Kho tri thức', 'book'],
  ['awards', 'Vinh danh', 'award'],
  ['gate1', 'Gate 1 Quán quân', 'shield'],
  ['forms', 'Hai biểu mẫu', 'form'],
];
const navOpenGroups = { 'network-hub': false, 'learning-hub': false };
let learningHistoryTab = 'mine'; // 'mine' | 'all'
let learningHistorySearch = '';
let honorsTab = 'individuals'; // 'individuals' | 'villages'
const EMPTY_STATE = { profiles: {}, connections: [], results: [], gate1: freshGateEntries(), settings: { registrationUrl: '', resultUrl: '', gate1Url: '', apiBase: '', larkBase: DEFAULT_BASE }, seeker: 'VIL-0005', matchMode: 'person', villageSeeker: '' };
let STATE = loadState(); let currentPage = 'home'; let marketSearch = ''; let officeFilter = 'all'; let __modalAction = null;
const LIVE = { loading: true, connected: false, error: '', villages: [], members: [], booths: [], boothsLoading: false, boothsError: '', currentUser: null, connections: [], inboxConnections: [], notificationCount: 0, connectionsLoading: false, connectionsError: '', learning: { loading: false, error: '', sessions: [], availableConnections: [], reportOptions: { applied: [], formats: [] } }, knowledge: { loading: false, error: '', items: [], diagnostics: {} }, honors: { loading: false, error: '', data: null } };
let connectionsActiveTab = 'accepted'; // 'accepted' | 'history' | 'inbox'
const CONNECTIONS_PAGE_SIZE = 5;
let connectionsPage = 1;
// ===== CONNECTIONS OVERVIEW STATE =====
let connOverview = { loading: false, error: '', data: null }; // data: { isPrivileged, items: [...] }
let connOverviewPage = 1;
const CONN_OVERVIEW_PAGE_SIZE = 10;
let connOverviewSearch = '';
let connOverviewVillage = 'all';
let connOverviewSort = 'most'; // 'most'|'least'|'az'|'za'
let connOverviewNoConn = false;
let connOverviewExpandedId = null; // memberId của accordion đang mở
let connOverviewBoothExpandedId = null; // memberId+peerId khi mở danh sách phiên chợ
const MATCHING = {
  loading: false,
  error: '',
  context: null,
  suggestionsData: null,
  selectedMemberId: null,
  selectedVillageId: null,
  selectedBoothId: null,
  mode: 'personal',
};
let liveMemberSearch = '';
let liveMemberOffice = 'all';
let liveNetworkMode = 'village'; // 'village' | 'personal'
let liveNetworkVillageFilter = 'all';
let learningLoadGeneration = 0;
let knowledgeLoadGeneration = 0;
let honorsLoadGeneration = 0;
let librarySearch = '';
let libraryConnectionFilter = 'all';
let libraryAppliedFilter = 'all';
function loadState() { try { const raw = localStorage.getItem(STORE_KEY); if (!raw) return structuredClone(EMPTY_STATE); const x = JSON.parse(raw); return { ...structuredClone(EMPTY_STATE), ...x, profiles: x.profiles || {}, connections: x.connections || [], results: x.results || [], gate1: Array.isArray(x.gate1) && x.gate1.length ? x.gate1 : freshGateEntries(), settings: { ...EMPTY_STATE.settings, ...x.settings } } } catch (e) { return structuredClone(EMPTY_STATE) } }
function persist() { try { localStorage.setItem(STORE_KEY, JSON.stringify(STATE)) } catch (e) { toast('Không lưu được dữ liệu trong trình duyệt.', 'warn') } }
function esc(v) { return String(v ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])) }
function icon(name, size = 20) { const d = { bell: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>', home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M9 21v-8h6v8"/>', grid: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>', link: '<path d="M10 13a5 5 0 0 0 7 .3l3-3A5 5 0 0 0 13 3l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7-.3l-3 3A5 5 0 0 0 11 21l1.7-1.7"/>', userPlus: '<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>', checkCircle: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>', unlink: '<path d="m18.84 12.25 1.72-1.71h-.02a5.004 5.004 0 0 0-.12-7.07 5.006 5.006 0 0 0-6.95 0l-1.72 1.71"/><path d="m5.17 11.75-1.71 1.71a5.004 5.004 0 0 0 .12 7.07 5.006 5.006 0 0 0 6.95 0l1.71-1.71"/><line x1="8" y1="2" x2="8" y2="5"/><line x1="2" y1="8" x2="5" y2="8"/><line x1="16" y1="19" x2="16" y2="22"/><line x1="19" y1="16" x2="22" y2="16"/>', network: '<circle cx="12" cy="12" r="3"/><circle cx="4" cy="4" r="2"/><circle cx="20" cy="4" r="2"/><circle cx="4" cy="20" r="2"/><circle cx="20" cy="20" r="2"/><path d="M6 6l4 4m4 4 4 4M18 6l-4 4M10 14l-4 4"/>', calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18"/><path d="m9 16 2 2 4-4"/>', book: '<path d="M12 7c-2-2-5-2-9-2v15c4 0 7 0 9 2 2-2 5-2 9-2V5c-4 0-7 0-9 2z"/><path d="M12 7v15"/>', award: '<circle cx="12" cy="8" r="5"/><path d="m8 12-2 9 6-3 6 3-2-9"/>', form: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 7h6M9 11h6M9 15h3"/>', settings: '<circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.5 1-1.9 3.2-1.7-.7a8 8 0 0 1-2.3 1.3l-.3 1.8h-3.6l-.4-1.8a8 8 0 0 1-2.3-1.3l-1.7.7L5 16.1l1.5-1A8 8 0 0 1 6.3 12l-1.5-1L6.7 7.7l1.7.8a8 8 0 0 1 2.3-1.4L11 5h3.6l.4 2.1a8 8 0 0 1 2.3 1.4l1.7-.8 1.9 3.3-1.5 1c.2 1 .2 2 0 3z"/>', check: '<path d="m4 12 5 5L20 6"/>', arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>', star: '<path d="m12 2 3.2 6.4 7.1 1-5.2 5.1 1.3 7.1-6.4-3.4-6.4 3.4 1.3-7.1-5.2-5.1 7.1-1z"/>', heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>', users: '<circle cx="9" cy="7" r="4"/><path d="M2 21v-3a7 7 0 0 1 14 0v3M17 3a4 4 0 0 1 0 8m2 10v-3a7 7 0 0 0-3-5.7"/>', spark: '<path d="m12 2 2.3 7.7L22 12l-7.7 2.3L12 22l-2.3-7.7L2 12l7.7-2.3z"/>', gift: '<rect x="3" y="9" width="18" height="12" rx="1"/><path d="M3 13h18M12 9v12M12 9s-7-2-7-5c0-3 6-2 7 5zm0 0s7-2 7-5c0-3-6-2-7 5z"/>', send: '<path d="m22 2-7 20-4-9-9-4zM22 2 11 13"/>', shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>', clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', search: '<circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 5 5"/>', external: '<path d="M14 4h6v6m0-6-9 9"/><path d="M19 14v6H4V5h6"/>', download: '<path d="M12 3v13m-5-5 5 5 5-5M4 17v4h16v-4"/>', close: '<path d="M5 5l14 14M19 5 5 19"/>', trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>', plus: '<path d="M12 5v14M5 12h14"/>', refresh: '<path d="M20 6v6h-6M4 18v-6h6"/><path d="M5 10a8 8 0 0 1 13-4l2 2M4 16l2 2a8 8 0 0 0 13-4"/>', info: '<circle cx="12" cy="12" r="10"/><path d="M12 11v6m0-10h.01"/>', play: '<path d="m7 4 14 8-14 8z"/>' }; return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:' + size + 'px;height:' + size + 'px;max-width:' + size + 'px;max-height:' + size + 'px;display:inline-block;vertical-align:middle;flex-shrink:0">' + (d[name] || d.info) + '</svg>' }
function getPeople() { return SEED.people.map(p => ({ ...p, ...(STATE.profiles[p.id] || {}) })) }
function person(id) { return getPeople().find(p => p.id === id) }
function pic(p, size = 50) { return p.avatar ? '<img class="person-avatar" src="' + p.avatar + '" alt="Logo ' + esc(p.village) + '" style="height:' + size + 'px;width:' + size + 'px">' : '<div class="person-avatar" style="height:' + size + 'px;width:' + size + 'px">' + esc(p.office === 'HR' ? 'HR' : p.office === 'IT' ? 'IT' : 'AX') + '</div>' }
function nameVillage(p) { return esc(p.village.replace(/^\S+\s*/, '')) }
function getVillageLeaders() { return getPeople().filter(p => p.kind === 'Làng' || /^VIL-/.test(p.id)) }
function villageLeader(name) { return getVillageLeaders().find(p => p.village === name) }
function connLabel(c) {
  if (c.type === 'village') {
    const sName = c.seekerVillage || (c.seeker && person(c.seeker)?.village) || c.seekerName || 'Làng A';
    const hName = c.helperVillage || (c.helper && person(c.helper)?.village) || c.helperName || 'Làng B';
    return sName + ' ↔ ' + hName;
  }
  const sName = c.seekerName || (c.seeker && person(c.seeker)?.name) || 'Người học';
  const hName = c.helperName || (c.helper && person(c.helper)?.name) || 'Người hướng dẫn';
  return sName + ' ↔ ' + hName;
}
function connModalText(c) {
  if (c.type === 'village') {
    const sName = c.seekerVillage || (c.seeker && person(c.seeker)?.village) || 'Làng A';
    const hName = c.helperVillage || (c.helper && person(c.helper)?.village) || 'Làng B';
    const sRep = c.seekerName || (c.seeker && person(c.seeker)?.name) || '';
    const hRep = c.helperName || (c.helper && person(c.helper)?.name) || '';
    const repText = (sRep || hRep) ? (' (qua đại diện ' + (sRep || 'thành viên') + ' và ' + (hRep || 'thành viên') + ')') : '';
    return sName + ' và ' + hName + repText;
  }
  const sName = c.seekerName || (c.seeker && person(c.seeker)?.name) || 'Người học';
  const hName = c.helperName || (c.helper && person(c.helper)?.name) || 'Người hướng dẫn';
  return sName + ' và ' + hName;
}
function toast(m, t = 'good') { const e = document.createElement('div'); e.className = 'toast ' + t; e.textContent = m; document.querySelector('#toasts').appendChild(e); setTimeout(() => e.remove(), 4100) }
function validLink(s) { try { const u = new URL(s); return ['https:', 'http:'].includes(u.protocol) } catch (e) { return false } }
function isLearningPage(page = currentPage) {
  return ['schedule', 'schedule-all', 'learning-history'].includes(page);
}
function navigate(page) {
  currentPage = PAGE_LABELS[page] ? page : 'home';
  if (page === 'settings' && !LIVE.currentUser?.isAdmin) {
    currentPage = 'home';
    render();
    return;
  }
  if (currentPage === 'connection-detail') {
    navOpenGroups['network-hub'] = true;
    loadConnectionsOverview();
  }
  if (currentPage === 'network') {
    navOpenGroups['network-hub'] = true;
  }
  if (currentPage === 'matches') {
    loadMatching();
  }
  if (isLearningPage(currentPage)) {
    navOpenGroups['learning-hub'] = true;
    loadLearningData();
  }
  if (currentPage === 'library') {
    loadKnowledge();
  }
  if (currentPage === 'awards') {
    loadHonors();
  }
  if (currentPage === 'gate1') {
    loadGate1();
  }
  if (['forms', 'settings'].includes(currentPage) && window.AXANH_LIVE_API && window.AXANH_LIVE_API.getFormsConfig) {
    window.AXANH_LIVE_API.getFormsConfig().then((cfg) => {
      if (cfg) {
        let changed = false;
        if (cfg.form01Url !== undefined && STATE.settings.registrationUrl !== cfg.form01Url) {
          STATE.settings.registrationUrl = cfg.form01Url || '';
          changed = true;
        }
        if (cfg.form02Url !== undefined && STATE.settings.resultUrl !== cfg.form02Url) {
          STATE.settings.resultUrl = cfg.form02Url || '';
          changed = true;
        }
        if (changed) {
          persist();
          render();
        }
      }
    }).catch(() => {});
  }
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function pageHeader(title, desc, action = '') { return '<div class="page-header"><div><div class="eyebrow">AXANH / ATED PRO</div><h1 class="page-title">' + esc(title) + '</h1>' + (desc ? '<p class="page-desc">' + desc + '</p>' : '') + '</div>' + action + '</div>' }
function renderNav() {
  const systemNav = LIVE.currentUser?.isAdmin
    ? '<div class="nav-section">HỆ THỐNG</div><nav class="nav"><button type="button" data-action="nav" data-page="settings" class="' + (currentPage === 'settings' ? 'active' : '') + '">' + icon('settings') + ' Cấu hình tích hợp</button></nav>'
    : '';
  const navHtml = NAV.map(item => {
    if (Array.isArray(item)) {
      const [id, l, ico] = item;
      return '<button type="button" data-action="nav" data-page="' + id + '" class="' + (currentPage === id ? 'active' : '') + '"><span class="nav-ico">' + icon(ico) + '</span>' + l + '</button>';
    }
    const visibleChildren = item.children;
    const hasActiveChild = visibleChildren.some(([cid]) => cid === currentPage);
    const isOpen = Boolean(navOpenGroups[item.group]);
    return '<div class="nav-group' + (isOpen ? ' open' : '') + '">'
      + '<button type="button" data-action="toggle-nav-group" data-group="' + item.group + '" class="nav-group-btn' + (hasActiveChild ? ' has-active' : '') + '">'
      + '<span class="nav-ico">' + icon(item.icon) + '</span>'
      + '<span style="flex:1">' + item.label + '</span>'
      + '<svg class="nav-group-chevron' + (isOpen ? ' open' : '') + '" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>'
      + '</button>'
      + (isOpen
        ? '<div class="nav-sub">' + visibleChildren.map(([cid, cl, cico]) =>
            '<button type="button" data-action="nav" data-page="' + cid + '" class="nav-sub-btn' + (currentPage === cid ? ' active' : '') + '"><span class="nav-ico">' + icon(cico, 15) + '</span>' + cl + '</button>'
          ).join('') + '</div>'
        : '')
      + '</div>';
  }).join('');
  document.querySelector('#navArea').innerHTML = '<div class="nav-section">KHÁM PHÁ</div><nav class="nav">' + navHtml + '</nav>' + systemNav;
}
function stats() {
  const active = Array.isArray(LIVE.connections)
    ? LIVE.connections.filter(c => c.status === 'Accepted').length
    : 0;
  const passed = gateCounts().passed;
  const gateValue = GATE1.loading || GATE1.error ? '—' : String(passed);
  return [
    { n: LIVE.connected ? String(LIVE.villages.length) : '—', label: 'Làng (Lark Base)', i: 'grid' },
    { n: LIVE.connected ? String(LIVE.members.length) : '—', label: 'Thành viên (Lark Base)', i: 'users' },
    { n: LIVE.connected && !LIVE.connectionsLoading ? String(active) : '—', label: 'Kết nối đang hoạt động', i: 'link' },
    { n: gateValue, label: 'Làng đạt Gate 1', i: 'shield' },
  ].map(x => '<div class="stat"><div><div class="number">' + x.n + '</div><div class="label">' + x.label + '</div></div><div class="stat-icon">' + icon(x.i, 22) + '</div></div>').join('');
}
function hero() { return '<section class="hero"><div class="hero-content"><div class="hero-mark">✦ ATED PRO · PHIÊN CHỢ TRI THỨC</div><h1>Trao đúng điều mình có.<br><em>Giúp nhau cùng lớn lên.</em></h1><p>Đây là phiên chợ tri thức của AXANH: mỗi người mang tới một điều mình có thể trao đi, và cũng thành thật nói ra một điều mình đang cần được giúp. Từ những kết nối nhỏ đó, chúng ta tạo nên giá trị thật và cả hành trình Gate 1 cho Đại hội Làng năm nay.</p><div class="btnbar"><button class="btn btn-gold" data-action="hero-open-form">' + icon('plus') + ' Mở gian hàng của tôi</button><button class="btn" data-action="nav" data-page="gate1">' + icon('shield') + ' Xem Gate 1</button></div></div><div class="hero-visual"><div class="orbit"></div><div class="orbit"></div><div class="orb-center"><img src="' + SEED.whiteLogo + '" alt="Logo AXANH"></div><div class="orb a">🌱</div><div class="orb b">💡</div><div class="orb c">🤝</div><div class="orb d">📚</div><div class="orb e">✨</div></div></section>' }
function homeVillageBoothRow(booth) {
  const village = LIVE.villages.find(item =>
    item.id === booth.villageId || item.name === booth.villageName || item.name === booth.authorVillageName
  );
  const name = booth.villageName || booth.authorVillageName || village?.name || 'Làng';
  const logo = villageLogoHtml(booth.villageIconUrl || village?.iconUrl, name, 43);
  const offer = booth.offer || booth.offerTag || 'Chưa cập nhật nội dung chia sẻ';
  return '<button type="button" class="sample-row" data-action="open-village-market" style="width:100%;text-align:left;background:#fff;font:inherit;cursor:pointer">'
    + logo + '<span><b>' + esc(name) + '</b><small>' + esc(offer) + '</small></span>'
    + '<span class="go">' + icon('arrow', 14) + '</span></button>';
}

function homeVillageBoothPanel() {
  const booths = LIVE.booths.filter(booth => booth.boothType === 'village').slice(0, 4);
  let content;
  if (LIVE.boothsLoading) {
    content = '<div class="empty">Đang tải gian hàng Làng từ Phiên chợ tri thức…</div>';
  } else if (LIVE.boothsError) {
    content = '<div class="empty">' + esc(LIVE.boothsError) + ' <button class="btn small" data-action="refresh-booths">Thử lại</button></div>';
  } else if (booths.length) {
    content = booths.map(homeVillageBoothRow).join('');
  } else {
    content = '<div class="empty">Chưa có gian hàng Làng trong Phiên chợ tri thức.</div>';
  }
  return '<div class="panel"><div class="panel-head"><h3>Gian hàng Làng từ Phiên chợ tri thức</h3>'
    + '<button class="btn small" data-action="open-village-market">Xem tất cả ' + icon('arrow', 14) + '</button></div>'
    + '<div class="sample-list">' + content + '</div></div>';
}

function home() {
  return hero()
    + '<section style="margin-top:19px" class="stat-grid">' + stats() + '</section>'
    + '<div class="section-title"><h2>Hành trình của Phiên chợ tri thức</h2><span>Từ kết nối nhỏ đến điều kiện Quán quân</span></div>'
    + '<div class="dash-columns"><div class="panel"><div class="panel-head"><h3>Từ một nhu cầu đến một giá trị mới</h3><span class="tag gold">4 bước xuyên suốt</span></div>'
    + '<div class="steps"><div class="step"><span class="step-num">01 / CHIA SẺ</span><b>Điều tôi có thể trao</b><p>Mỗi người mở gian hàng tri thức, nói rõ điều mình có thể giúp.</p></div>'
    + '<div class="step"><span class="step-num">02 / KẾT NỐI</span><b>Tìm người phù hợp</b><p>Ghép cặp theo nhu cầu, kỹ năng và thời gian phù hợp.</p></div>'
    + '<div class="step"><span class="step-num">03 / THỰC HÀNH</span><b>Học và áp dụng</b><p>Người nhận thử áp dụng vào công việc để tạo kết quả thật.</p></div>'
    + '<div class="step"><span class="step-num">04 / XÁC NHẬN</span><b>Đi tới Gate 1</b><p>Người nhận xác nhận giá trị, BTC thẩm định điều kiện Quán quân.</p></div></div>'
    + '<div class="lightbar"><button class="btn btn-primary small" data-action="nav" data-page="forms">' + icon('form') + ' Xem hai biểu mẫu</button>'
    + '<button class="btn small" data-action="nav" data-page="gate1">' + icon('shield') + ' Hành trình Gate 1</button></div></div>'
    + homeVillageBoothPanel() + '</div>'
    + '<div class="section-title"><h2>Điểm nhấn cần nhớ</h2><span>Đúng tinh thần ATED PRO và Đại hội Làng 2026</span></div>'
    + '<div class="grid3"><div class="knowledge-card"><div class="row-flex"><span class="knowledge-ico">' + icon('gift', 24) + '</span><span class="tag gold">Tinh thần</span></div>'
    + '<h3>Cho đi điều mình muốn nhận</h3><p>Muốn có sự hỗ trợ, hãy sẵn sàng hỗ trợ. Muốn có tri thức tốt hơn, hãy góp phần tạo ra tri thức tốt hơn cho người khác.</p></div>'
    + '<div class="knowledge-card"><div class="row-flex"><span class="knowledge-ico">' + icon('check', 24) + '</span><span class="tag teal">Hiệu quả</span></div>'
    + '<h3>Không dừng ở một buổi chia sẻ</h3><p>Giá trị chỉ thật sự được ghi nhận khi người nhận đã áp dụng và cảm thấy công việc hoặc thói quen của mình tiến bộ hơn.</p></div>'
    + '<div class="knowledge-card"><div class="row-flex"><span class="knowledge-ico">' + icon('shield', 24) + '</span><span class="tag">Gate 1</span></div>'
    + '<h3>Điều kiện, không phải điểm thưởng</h3><p>Gate 1 là điều kiện đủ tư cách xét Quán quân. App này giúp nhìn rõ hành trình ấy thay vì chờ tổng hợp vào cuối chặng.</p></div></div>';
}
function personCard(p) { return '<article class="person-card"><div class="person-head">' + pic(p, 57) + '<div><b>' + esc(p.name) + '</b><small>' + esc(p.village) + ' · ' + esc(p.office) + '</small></div><span class="kind-tag">' + (p.confirmed ? 'Đã xác nhận' : 'DEMO') + '</span></div><div class="offerneed"><div><span class="row-label">' + icon('gift', 11) + ' Có thể chia sẻ</span><strong>' + esc(p.offer) + '</strong></div><div class="tags">' + (p.offerTags || []).map(t => '<span class="tag teal">' + esc(t) + '</span>').join('') + '</div><div><span class="row-label">' + icon('book', 11) + ' Muốn học</span><strong>' + esc(p.need) + '</strong></div></div><button class="btn small" data-action="profile" data-id="' + p.id + '">Xem hồ sơ ' + icon('arrow', 15) + '</button></article>' }
let marketTab = 'personal';

function formatPreferredSlot(value) {
  if (value === null || value === undefined || value === '') return '';
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return '';
  return dt.toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function isOwnBooth(b) {
  if (!LIVE.currentUser || !b) return false;
  const uid = LIVE.currentUser.memberId || LIVE.currentUser.id;
  return Boolean(
    (uid && b.authorMemberId === uid) ||
    (b.authorName && LIVE.currentUser.name && b.authorName.toLowerCase() === LIVE.currentUser.name.toLowerCase())
  );
}

function personalBoothCard(b) {
  const slotText = formatPreferredSlot(b.availability);
  const avatarHtml = b.authorAvatarUrl
    ? '<img src="' + esc(b.authorAvatarUrl) + '" alt="' + esc(b.authorName) + '" style="width:52px;height:52px;object-fit:cover;border-radius:50%;display:block" onerror="this.style.display=\'none\';">'
    : '<div style="width:52px;height:52px;border-radius:50%;background:#1a3a6e;display:grid;place-items:center;color:#fff;font-weight:700;font-size:17px">' + esc((b.authorName || 'AX')[0].toUpperCase()) + '</div>';
  const isOwn = isOwnBooth(b);
  const deleteBtnHtml = (isOwn && b.recordId)
    ? '<div style="margin-top:10px;padding-top:8px;border-top:1px dashed #e2e8f0;display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:11.5px;color:#64748b">'
      + '<span>' + esc(b.boothId || '') + (b.createdAt ? ' · ' + new Date(b.createdAt).toLocaleDateString('vi-VN') : '') + '</span>'
      + '<button type="button" class="btn small btn-cancel-outline" data-action="prompt-delete-booth" data-id="' + esc(b.recordId) + '">' + icon('trash', 12) + ' Xóa phiên chợ</button>'
      + '</div>'
    : '';
  return '<article class="person-card">'
    + '<div class="person-head">'
    + '<div style="width:52px;height:52px;border-radius:50%;overflow:hidden;flex-shrink:0">' + avatarHtml + '</div>'
    + '<div><b>' + esc(b.authorName || 'Thành viên') + '</b><small>' + esc(b.authorVillageName || '—') + ' · ' + esc(b.authorOffice || '—') + '</small></div>'
    + '<span class="kind-tag">' + (isOwn ? '● Của tôi' : (b.boothId || '—')) + '</span>'
    + '</div>'
    + '<div class="offerneed">'
    + '<div><span class="row-label">' + icon('gift', 11) + ' Có thể chia sẻ</span><strong>' + esc(b.offer || '—') + '</strong></div>'
    + '<div class="tags"><span class="tag teal">' + esc(b.offerTag || '') + '</span></div>'
    + '<div><span class="row-label">' + icon('book', 11) + ' Muốn học</span><strong>' + esc(b.need || '—') + '</strong></div>'
    + '<div class="tags"><span class="tag">' + esc(b.needTag || '') + '</span></div>'
    + (b.preferredFormat ? '<div><span class="row-label">' + icon('link', 11) + ' Hình thức</span><small>' + esc(b.preferredFormat) + '</small></div>' : '')
    + (slotText ? '<div><span class="row-label">' + icon('clock', 11) + ' Khung giờ ưu tiên</span><small>' + esc(slotText) + '</small></div>' : '')
    + '</div>'
    + deleteBtnHtml
    + '</article>';
}

function getVillageBoothConnections(booth) {
  const villageId = booth.villageId || LIVE.villages.find(v =>
    v.name === booth.villageName || v.name === booth.authorVillageName
  )?.id;
  const boothRecordId = booth.recordId || '';
  const boothId = booth.boothId || '';
  const byVillage = new Map();

  (LIVE.connections || []).forEach(c => {
    if (c.connectionType !== 'village' || !['Accepted', 'Pending'].includes(c.status)) return;
    const sourceBoothMatches =
      (boothRecordId && c.sourceBoothRecordId === boothRecordId) ||
      (boothId && c.sourceBooth?.boothId === boothId);
    const targetBoothMatches =
      (boothRecordId && c.targetBoothRecordId === boothRecordId) ||
      (boothId && c.targetBooth?.boothId === boothId);
    const sourceVillageId = c.sourceVillageId || c.sourceBooth?.villageId;
    const targetVillageId = c.targetVillageId || c.targetBooth?.villageId;
    const isSource = sourceBoothMatches || (!targetBoothMatches && villageId && sourceVillageId === villageId);
    const isTarget = targetBoothMatches || (!sourceBoothMatches && villageId && targetVillageId === villageId);
    if (!isSource && !isTarget) return;

    const otherVillageId = isSource ? targetVillageId : sourceVillageId;
    const otherVillageName = isSource
      ? (c.targetVillageName || c.targetBooth?.villageName)
      : (c.seekerVillageName || c.sourceBooth?.villageName);
    const otherVillage = LIVE.villages.find(v =>
      (otherVillageId && v.id === otherVillageId) || (otherVillageName && v.name === otherVillageName)
    );
    const name = otherVillage?.name || otherVillageName;
    if (!name) return;

    const key = otherVillage?.id || otherVillageId || name;
    const existing = byVillage.get(key);
    if (!existing || (c.status === 'Accepted' && existing.status !== 'Accepted')) {
      byVillage.set(key, {
        id: otherVillage?.id || otherVillageId || '',
        name,
        iconUrl: otherVillage?.iconUrl || '',
        status: c.status,
        createdAt: c.createdAt,
        connObj: c,
      });
    }
  });

  return [...byVillage.values()].sort((a, b) => a.name.localeCompare(b.name, 'vi'));
}

function villageBoothCard(b) {
  const slotText = formatPreferredSlot(b.availability);
  const v = LIVE.villages.find(x => x.id === b.villageId || (b.authorVillageName && x.name === b.authorVillageName));
  const logoUrl = b.villageIconUrl || v?.iconUrl;
  const villageName = b.villageName || b.authorVillageName || v?.name || 'Làng';
  const boothConnections = getVillageBoothConnections(b);
  const acceptedConnections = boothConnections.filter(c => c.status === 'Accepted').length;
  const pendingConnections = boothConnections.filter(c => c.status === 'Pending').length;
  const boothKey = b.boothId || b.recordId || '';
  const connectedVillages = boothConnections.slice(0, 3).map(c =>
    '<span title="' + esc(c.name) + '" style="display:inline-flex;border:2px solid #fff;border-radius:50%;overflow:hidden">' + villageLogoHtml(c.iconUrl, c.name, 28) + '</span>'
  ).join('');
  const moreVillages = boothConnections.length > 3
    ? '<span style="width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:#dbeafe;color:#1d4ed8;font-size:10px;font-weight:800;border:2px solid #fff">+' + (boothConnections.length - 3) + '</span>'
    : '';
  const logoHtml = logoUrl
    ? '<img src="' + esc(logoUrl) + '" alt="' + esc(villageName) + '" style="width:52px;height:52px;object-fit:contain;border-radius:12px;background:#fff;padding:4px;border:1px solid #dbe4ef;display:block" onerror="this.style.display=\'none\';">'
    : '<div style="width:52px;height:52px;border-radius:12px;background:#dbeafe;color:#1e40af;display:grid;place-items:center;font-weight:800;font-size:16px;border:1px solid #bfdbfe">🏛️</div>';

  const isRegisteredByMe = isOwnBooth(b);

  return '<article class="person-card village-booth-card" style="border-top:3px solid #2563eb">'
    + '<div class="person-head">'
    + '<div style="width:52px;height:52px;flex-shrink:0">' + logoHtml + '</div>'
    + '<div><b>' + esc(villageName) + '</b><small>' + esc(b.authorOffice || v?.office || '—') + ' · <span style="color:#2563eb;font-weight:700">Gian hàng Làng</span></small></div>'
    + '<span class="kind-tag" style="background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe">' + esc(b.boothId || 'LÀNG') + '</span>'
    + '</div>'
    + '<div class="offerneed">'
    + '<div><span class="row-label">' + icon('gift', 11) + ' Làng có thể chia sẻ</span><strong>' + esc(b.offer || '—') + '</strong></div>'
    + '<div class="tags"><span class="tag teal">' + esc(b.offerTag || '') + '</span></div>'
    + '<div><span class="row-label">' + icon('book', 11) + ' Làng mong muốn học</span><strong>' + esc(b.need || '—') + '</strong></div>'
    + '<div class="tags"><span class="tag gold">' + esc(b.needTag || '') + '</span></div>'
    + (b.preferredFormat ? '<div><span class="row-label">' + icon('link', 11) + ' Hình thức</span><small>' + esc(b.preferredFormat) + '</small></div>' : '')
    + (slotText ? '<div><span class="row-label">' + icon('clock', 11) + ' Khung giờ ưu tiên</span><small>' + esc(slotText) + '</small></div>' : '')
    + '</div>'
    + '<button type="button" data-action="open-village-connections" data-id="' + esc(boothKey) + '" style="width:100%;margin-top:10px;padding:8px 10px;border:1px solid #dbeafe;border-radius:10px;background:#f8fbff;display:flex;align-items:center;justify-content:space-between;gap:8px;text-align:left;cursor:pointer">'
    + '<span style="font-size:10px;font-weight:800;letter-spacing:.04em;color:#315b87;white-space:nowrap">🔗 LÀNG ĐÃ KẾT NỐI</span>'
    + '<span style="display:flex;align-items:center;gap:7px;min-width:0">'
    + '<span style="display:flex;align-items:center">' + connectedVillages + moreVillages + '</span>'
    + '<span style="display:flex;flex-direction:column;gap:2px;font-size:10px;white-space:nowrap">'
    + '<b style="color:#15803d">✓ ' + acceptedConnections + ' đã kết nối</b>'
    + (pendingConnections > 0 ? '<b style="color:#b45309">◷ ' + pendingConnections + ' chờ duyệt (cũ)</b>' : '')
    + '</span><span style="color:#2563eb;font-size:18px">›</span>'
    + '</span></button>'
    + '<div style="margin-top:10px;padding-top:8px;border-top:1px dashed #e2e8f0;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;font-size:11.5px;color:#64748b">'
    + '<span>Đăng ký bởi: <b style="color:#0f172a">' + esc(b.authorName || 'Thành viên') + '</b>' + (isRegisteredByMe ? ' <span class="tag" style="font-size:10px;padding:1px 5px">Tôi đăng ký</span>' : '') + '</span>'
    + '<span style="display:inline-flex;align-items:center;gap:8px">'
    + (b.createdAt ? '<span style="font-size:11px">' + new Date(b.createdAt).toLocaleDateString('vi-VN') + '</span>' : '')
    + ((isRegisteredByMe && b.recordId) ? '<button type="button" class="btn small btn-cancel-outline" data-action="prompt-delete-booth" data-id="' + esc(b.recordId) + '">' + icon('trash', 12) + ' Xóa</button>' : '')
    + '</span>'
    + '</div>'
    + '</article>';
}

function boothCard(b) {
  return b.boothType === 'village' ? villageBoothCard(b) : personalBoothCard(b);
}

function market() {
  const headerBtn = '<button class="btn btn-primary" data-action="open-form" data-form="registration" data-default-type="' + esc(marketTab) + '">' + icon('plus') + ' Đăng ký gian hàng</button>';
  const header = pageHeader('Gian hàng tri thức', '', headerBtn);

  const personalBooths = LIVE.booths.filter(b => b.boothType === 'personal');
  const villageBooths = LIVE.booths.filter(b => b.boothType === 'village');

  const tabs = '<div class="market-tabs" style="display:flex;gap:10px;margin:18px 0 16px;flex-wrap:wrap">'
    + '<button class="btn ' + (marketTab === 'personal' ? 'btn-primary' : '') + '" data-action="set-market-tab" data-tab="personal">'
    + icon('users', 16) + ' Gian hàng Cá nhân (' + personalBooths.length + ')'
    + '</button>'
    + '<button class="btn ' + (marketTab === 'village' ? 'btn-primary' : '') + '" data-action="set-market-tab" data-tab="village">'
    + icon('network', 16) + ' Gian hàng Làng (' + villageBooths.length + ')'
    + '</button>'
    + '</div>';

  const searchPlaceholder = marketTab === 'village'
    ? 'Tìm theo tên làng, kỹ năng chia sẻ, chủ đề học...'
    : 'Tìm tên, kỹ năng, chủ đề học...';

  const searchBar = '<div class="search-area"><div class="field-search">' + icon('search') + '<input id="marketSearch" placeholder="' + esc(searchPlaceholder) + '" value="' + esc(marketSearch) + '"></div>'
    + '<select class="select" id="officeFilter"><option value="all">Tất cả văn phòng</option>'
    + ['VP1', 'VP2', 'VPC', 'IT', 'HR'].map(x => '<option ' + (officeFilter === x ? 'selected' : '') + '>' + x + '</option>').join('')
    + '</select></div>';

  // Nếu đang tải booths
  if (LIVE.boothsLoading) {
    return header + tabs + searchBar + '<div class="status-banner"><div class="live-spinner" style="display:inline-block;width:14px;height:14px;border:2px solid #fff3;border-top-color:#f2c657;border-radius:50%;animation:spin .8s linear infinite;vertical-align:middle;margin-right:8px"></div>Đang tải dữ liệu gian hàng từ Lark Base...</div><div id="marketGrid" class="grid3"></div>';
  }
  if (LIVE.boothsError) {
    return header + tabs + searchBar + '<div class="status-banner">' + icon('info') + ' ' + esc(LIVE.boothsError) + ' <button class="btn small" data-action="refresh-booths">Thử lại</button></div><div id="marketGrid" class="grid3"></div>';
  }

  // Lọc booths theo tab đang chọn
  const targetList = marketTab === 'village' ? villageBooths : personalBooths;
  const q = marketSearch.toLocaleLowerCase();
  const filtered = targetList.filter(b => {
    const hay = [b.authorName, b.villageName, b.authorVillageName, b.authorOffice, b.offer, b.offerTag, b.need, b.needTag, b.boothId].filter(Boolean).join(' ').toLocaleLowerCase();
    return hay.includes(q) && (officeFilter === 'all' || b.authorOffice === officeFilter);
  });

  let grid;
  if (filtered.length === 0 && targetList.length === 0) {
    if (marketTab === 'village') {
      grid = '<div class="empty" style="grid-column:1/-1">' + icon('network', 38)
        + '<b>Chưa có gian hàng Làng nào được đăng ký</b>'
        + '<p>Hãy mở gian hàng đầu tiên cho làng của bạn! Chia sẻ thế mạnh chuyên môn và nhu cầu học tập của Làng.</p>'
        + '<button class="btn btn-primary" data-action="open-form" data-form="registration" data-default-type="village">' + icon('plus') + ' Mở gian hàng cho Làng</button>'
        + '</div>';
    } else {
      grid = '<div class="empty" style="grid-column:1/-1">' + icon('gift', 38)
        + '<b>Chưa có gian hàng Cá nhân nào</b>'
        + '<p>Hãy mở gian hàng đầu tiên! Chia sẻ điều bạn có thể dạy và điều bạn muốn học.</p>'
        + '<button class="btn btn-primary" data-action="open-form" data-form="registration" data-default-type="personal">' + icon('plus') + ' Mở gian hàng của tôi</button>'
        + '</div>';
    }
  } else if (filtered.length === 0) {
    grid = '<div class="empty" style="grid-column:1/-1">Không tìm thấy gian hàng phù hợp với từ khóa.</div>';
  } else {
    grid = marketTab === 'village' ? filtered.map(villageBoothCard).join('') : filtered.map(personalBoothCard).join('');
  }

  return header + tabs + searchBar + '<div id="marketGrid" class="grid3">' + grid + '</div>';
}
function memberAvatarHtml(url, name, size = 52) {
  if (url) {
    return '<img src="' + esc(url) + '" alt="' + esc(name) + '" style="width:' + size + 'px;height:' + size + 'px;object-fit:cover;border-radius:50%;display:block" onerror="this.style.display=\'none\';">';
  }
  const initial = (name || 'AX').trim()[0]?.toUpperCase() || 'A';
  return '<div style="width:' + size + 'px;height:' + size + 'px;border-radius:50%;background:#1a3a6e;display:grid;place-items:center;color:#fff;font-weight:700;font-size:' + Math.round(size * 0.35) + 'px">' + esc(initial) + '</div>';
}

function villageLogoHtml(url, name, size = 52) {
  if (url) {
    return '<img src="' + esc(url) + '" alt="' + esc(name) + '" style="width:' + size + 'px;height:' + size + 'px;object-fit:cover;border-radius:12px;display:block" onerror="this.style.display=\'none\';">';
  }
  return '<div style="width:' + size + 'px;height:' + size + 'px;border-radius:12px;background:#eef4ff;display:grid;place-items:center;color:#1e3a8a;font-weight:700;font-size:' + Math.round(size * 0.45) + 'px">🏛️</div>';
}

async function loadMatchingSuggestions() {
  if (!MATCHING.selectedBoothId) {
    MATCHING.suggestionsData = null;
    render();
    return;
  }
  MATCHING.loading = true;
  render();
  try {
    const data = await window.AXANH_LIVE_API.getMatchingSuggestions({
      mode: MATCHING.mode,
      boothId: MATCHING.selectedBoothId,
    });
    MATCHING.suggestionsData = data;
    MATCHING.error = '';
  } catch (err) {
    console.error('[Smart Matching] Suggestions error:', err);
    MATCHING.error = err.message || 'Không thể tải đề xuất kết nối.';
  } finally {
    MATCHING.loading = false;
    render();
  }
}

async function loadMatching(resetBooth = false) {
  if (!window.AXANH_LIVE_API || !window.AXANH_LIVE_API.getMatchingContext) return;
  MATCHING.loading = true;
  MATCHING.error = '';
  render();

  try {
    const isPersonal = MATCHING.mode === 'personal';
    const targetMemberId = (isPersonal && MATCHING.selectedMemberId) ? MATCHING.selectedMemberId : undefined;
    const targetVillageId = (!isPersonal && MATCHING.selectedVillageId) ? MATCHING.selectedVillageId : undefined;

    const context = await window.AXANH_LIVE_API.getMatchingContext({
      memberId: targetMemberId,
      villageId: targetVillageId,
    });
    MATCHING.context = context;

    // Available booths for current mode
    const booths = isPersonal ? (context.personalBooths || []) : (context.villageBooths || []);

    const hasSelected = booths.some((b) => b.boothId === MATCHING.selectedBoothId);
    if (!hasSelected || resetBooth) {
      MATCHING.selectedBoothId = booths.length > 0 ? booths[0].boothId : null;
    }

    if (MATCHING.selectedBoothId) {
      const suggestions = await window.AXANH_LIVE_API.getMatchingSuggestions({
        mode: MATCHING.mode,
        boothId: MATCHING.selectedBoothId,
      });
      MATCHING.suggestionsData = suggestions;
    } else {
      MATCHING.suggestionsData = null;
    }
  } catch (err) {
    console.error('[Smart Matching] Context error:', err);
    MATCHING.error = err.message || 'Không thể tải ngữ cảnh Smart Matching.';
  } finally {
    MATCHING.loading = false;
    render();
  }
}

function matchesConnectionPair(c, s, curBooth, isPersonal) {
  const sBooth = s.targetBoothId || s.targetRecordId || s.boothId;
  const curBoothId = curBooth.boothId || curBooth.recordId;
  const srcId = c.sourceBooth?.boothId || c.sourceBooth?.recordId;
  const tgtId = c.targetBooth?.boothId || c.targetBooth?.recordId;
  if (srcId && tgtId && curBoothId && sBooth) {
    if (srcId === curBoothId && tgtId === sBooth) return true;
    if (srcId === sBooth && tgtId === curBoothId) return true;
  }
  // Fallback: so sánh qua sourceBoothRecordId / targetBoothRecordId khi sourceBooth/targetBooth không được resolve
  const srcRecId = c.sourceBoothRecordId;
  const tgtRecId = c.targetBoothRecordId;
  const curRecId = curBooth.recordId;
  const sRecId = s.targetRecordId;
  if (srcRecId && tgtRecId && curRecId) {
    if (srcRecId === curRecId && (tgtRecId === sRecId || tgtId === sBooth)) return true;
    if ((srcRecId === sRecId || srcId === sBooth) && tgtRecId === curRecId) return true;
  }
  if (isPersonal && c.connectionType === 'personal') {
    const cA = c.sourceBooth?.authorMemberId || c.requestedBy;
    const cB = c.targetMemberId || c.targetBooth?.authorMemberId;
    if (cA && cB && curBooth.authorMemberId && s.targetMemberId) {
      if ((cA === curBooth.authorMemberId && cB === s.targetMemberId) ||
          (cA === s.targetMemberId && cB === curBooth.authorMemberId)) {
        return true;
      }
    }
    // Fallback: so sánh requestedBy với LIVE.currentUser.memberId
    if (c.requestedBy && curBoothId && sBooth) {
      if ((c.requestedBy === LIVE.currentUser?.memberId && (tgtId === sBooth || tgtRecId === sRecId)) ||
          (c.targetMemberId === LIVE.currentUser?.memberId && (srcId === sBooth || srcRecId === sRecId))) {
        return true;
      }
    }
  }
  if (!isPersonal && c.connectionType === 'village') {
    const sVil = curBooth.villageId;
    const tVil = s.targetVillageId;
    const cSrcVil = c.sourceVillageId || c.sourceBooth?.villageId;
    const cTgtVil = c.targetVillageId || c.targetBooth?.villageId;
    if (sVil && tVil && ((cSrcVil === sVil && cTgtVil === tVil) || (cSrcVil === tVil && cTgtVil === sVil))) {
      return true;
    }
  }
  return false;
}

function getExistingLiveConnection(s, curBooth, isPersonal) {
  if (!s || !curBooth || !Array.isArray(LIVE.connections)) return null;
  const pairMatches = LIVE.connections.filter(c => matchesConnectionPair(c, s, curBooth, isPersonal));
  // Prioritize active Accepted connection, then legacy Pending; ignore Cancelled/Rejected so user can reconnect
  return pairMatches.find(c => c.status === 'Accepted')
    || pairMatches.find(c => c.status === 'Pending')
    || null;
}

function isLiveMatched(s, curBooth, isPersonal) {
  const existing = getExistingLiveConnection(s, curBooth, isPersonal);
  return Boolean(existing && existing.status === 'Accepted');
}

function isVillageLeaderUser(villageId, user = LIVE.currentUser) {
  if (!villageId || !user) return false;
  const v = (LIVE.villages || []).find(item => item.id === villageId);
  if (!v) return false;
  if (v.leaderOpenId && user.larkOpenId && v.leaderOpenId === user.larkOpenId) return true;
  if (v.leader && user.name) {
    return v.leader.trim().toLowerCase() === user.name.trim().toLowerCase();
  }
  return false;
}

function canCancelConnection(conn, user = LIVE.currentUser) {
  const uid = user?.memberId || user?.id;
  if (!conn || !uid) return false;
  if (conn.status !== 'Accepted' && conn.status !== 'Pending') return false;
  if (conn.connectionType === 'personal') {
    return [
      conn.requestedBy,
      conn.targetMemberId,
      conn.approverMemberId,
      conn.sourceBooth?.authorMemberId,
      conn.targetBooth?.authorMemberId,
    ].some(id => id && id === uid);
  }
  return [
    conn.requestedBy,
    conn.approverMemberId,
  ].some(id => id && id === uid)
    || isVillageLeaderUser(conn.sourceVillageId || conn.sourceBooth?.villageId, user)
    || isVillageLeaderUser(conn.targetVillageId || conn.targetBooth?.villageId, user);
}

function isConnectionParticipant(conn, user = LIVE.currentUser) {
  const uid = user?.memberId || user?.id;
  if (!conn || !uid) return false;
  return [conn.requestedBy, conn.targetMemberId, conn.approverMemberId].some(id => id && id === uid);
}

/**
 * Render nút "Hủy kết nối" thay cho badge "Đã kết nối" khi người dùng có quyền hủy.
 */
function renderAcceptedBadgeOrCancelBtn({ connId, label, type = 'personal', canCancel, small = true, iconSize = 13 }) {
  if (canCancel) {
    return '<button type="button" class="btn' + (small ? ' small' : '') + ' btn-cancel-outline" data-action="prompt-cancel-connection" data-id="' + esc(connId) + '" data-label="' + esc(label) + '" data-type="' + esc(type) + '">' + icon('unlink', iconSize) + ' Hủy kết nối</button>';
  }
  return '<span class="conn-status-accepted">' + icon('checkCircle', iconSize) + ' Đã kết nối</span>';
}

function getConnectionPeerLabel(conn, myMemberId = LIVE.currentUser?.memberId, myVillageId = LIVE.currentUser?.villageId) {
  if (!conn) return 'đối tác';
  if (conn.connectionType === 'village') {
    const srcId = conn.sourceVillageId || conn.sourceBooth?.villageId;
    const isSrc = (myVillageId && srcId === myVillageId) || (myMemberId && conn.requestedBy === myMemberId);
    return isSrc
      ? (conn.targetVillageName || conn.targetBooth?.villageName || conn.targetVillageId || 'Làng')
      : (conn.seekerVillageName || conn.sourceBooth?.villageName || conn.sourceVillageId || 'Làng');
  }
  const srcMem = conn.sourceBooth?.authorMemberId || conn.requestedBy;
  const isSrc = myMemberId && srcMem === myMemberId;
  return isSrc
    ? (conn.targetName || conn.targetBooth?.authorName || conn.targetMemberId || 'thành viên')
    : (conn.seekerName || conn.sourceBooth?.authorName || conn.requestedBy || 'thành viên');
}

const IN_FLIGHT_CONNECT = new Map();
let inFlightCancelId = null;
let inFlightDeleteBoothId = null;

function openDeleteBoothModal(recordId) {
  const b = (LIVE.booths || []).find(item => item.recordId === recordId);
  if (!b || !isOwnBooth(b)) return;
  const typeLabel = b.boothType === 'village' ? 'Gian hàng Làng' : 'Gian hàng Cá nhân';
  const bodyHtml = '<div class="confirm-unlink-head">'
    + '<div class="confirm-unlink-icon">' + icon('trash', 22) + '</div>'
    + '<div style="flex:1;min-width:0">'
    + '<p style="margin:0 0 10px;font-size:14.5px;line-height:1.6;color:#1e293b">'
    + 'Bạn có chắc chắn muốn xóa phiên chợ <b>' + esc(b.boothId || '') + '</b> (' + esc(typeLabel) + ') không?'
    + '</p>'
    + '<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:10px 12px;font-size:12.5px;color:#334155">'
    + '<div><b>Có thể chia sẻ:</b> ' + esc(b.offer || '—') + '</div>'
    + '<div style="margin-top:4px"><b>Muốn học:</b> ' + esc(b.need || '—') + '</div>'
    + '</div>'
    + '<div id="deleteBoothModalError" style="display:none;margin-top:12px;padding:10px 12px;border-radius:8px;background:#fef2f2;border:1px solid #fecaca;color:#b91c1c;font-size:12.5px;font-weight:600"></div>'
    + '</div>'
    + '</div>';
  const footerHtml = '<button type="button" class="btn" id="deleteBoothBackBtn" data-action="close-modal">Quay lại</button>'
    + '<button type="button" class="btn btn-danger-solid" id="deleteBoothConfirmBtn" data-action="confirm-delete-booth" data-id="' + esc(recordId) + '">Xóa phiên chợ</button>';
  openModal('Xóa phiên chợ đã đăng ký?', bodyHtml, footerHtml);
  setTimeout(() => {
    const backBtn = document.getElementById('deleteBoothBackBtn');
    if (backBtn) backBtn.focus();
  }, 10);
}

async function confirmDeleteBooth(recordId) {
  if (!recordId || inFlightDeleteBoothId === recordId) return;
  inFlightDeleteBoothId = recordId;
  const confirmBtn = document.getElementById('deleteBoothConfirmBtn');
  const backBtn = document.getElementById('deleteBoothBackBtn');
  const errBox = document.getElementById('deleteBoothModalError');
  if (errBox) { errBox.style.display = 'none'; errBox.textContent = ''; }
  if (confirmBtn) { confirmBtn.disabled = true; confirmBtn.textContent = 'Đang xóa...'; }
  if (backBtn) backBtn.disabled = true;

  try {
    await window.AXANH_LIVE_API.deleteBooth(recordId);
    LIVE.booths = (LIVE.booths || []).filter(item => item.recordId !== recordId);
    MATCHING.context = null;
    MATCHING.suggestionsData = null;
    closeModal();
    toast('Đã xóa phiên chợ khỏi Phiên chợ tri thức.', 'good');
    render();
    loadLiveBooths();
  } catch (err) {
    if (err?.status === 401) {
      closeModal();
      showSessionExpiredModal();
    } else {
      if (errBox) {
        errBox.textContent = err?.message || 'Không thể xóa phiên chợ. Vui lòng thử lại.';
        errBox.style.display = 'block';
      } else {
        toast(err?.message || 'Không thể xóa phiên chợ. Vui lòng thử lại.', 'warn');
      }
      if (confirmBtn) { confirmBtn.disabled = false; confirmBtn.textContent = 'Xóa phiên chợ'; }
      if (backBtn) backBtn.disabled = false;
    }
  } finally {
    inFlightDeleteBoothId = null;
  }
}

function openCancelConnectionModal({ connId, targetLabel, connectionType = 'personal' }) {
  if (!connId) return;
  const label = targetLabel || (connectionType === 'village' ? 'Làng này' : 'thành viên này');
  const title = 'Hủy kết nối?';
  const bodyHtml = '<div class="confirm-unlink-head">'
    + '<div class="confirm-unlink-icon">' + icon('unlink', 22) + '</div>'
    + '<div style="flex:1;min-width:0">'
    + '<p style="margin:0;font-size:14.5px;line-height:1.6;color:#1e293b">'
    + 'Bạn có chắc chắn muốn hủy kết nối với <b>' + esc(label) + '</b> không? Bạn có thể kết nối lại bất cứ lúc nào.'
    + '</p>'
    + '<div id="cancelConnModalError" style="display:none;margin-top:12px;padding:10px 12px;border-radius:8px;background:#fef2f2;border:1px solid #fecaca;color:#b91c1c;font-size:12.5px;font-weight:600"></div>'
    + '</div>'
    + '</div>';
  const footerHtml = '<button type="button" class="btn" id="cancelConnBackBtn" data-action="close-modal">Quay lại</button>'
    + '<button type="button" class="btn btn-danger-solid" id="cancelConnConfirmBtn" data-action="confirm-cancel-connection" data-id="' + esc(connId) + '">Hủy kết nối</button>';
  openModal(title, bodyHtml, footerHtml);
  setTimeout(() => {
    const backBtn = document.getElementById('cancelConnBackBtn');
    if (backBtn) backBtn.focus();
  }, 0);
}

async function confirmCancelConnection(connId) {
  if (!connId || inFlightCancelId === connId) return;
  const api = window.AXANH_LIVE_API;
  if (!api || typeof api.cancelConnection !== 'function') {
    toast('Dịch vụ kết nối chưa sẵn sàng. Vui lòng thử lại sau.', 'warn');
    return;
  }

  inFlightCancelId = connId;
  const confirmBtn = document.getElementById('cancelConnConfirmBtn');
  const backBtn = document.getElementById('cancelConnBackBtn');
  const errEl = document.getElementById('cancelConnModalError');
  if (errEl) {
    errEl.style.display = 'none';
    errEl.textContent = '';
  }
  if (confirmBtn) {
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = '<span class="spinner" style="width:12px;height:12px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:6px"></span> Đang hủy kết nối...';
  }
  if (backBtn) backBtn.disabled = true;

  try {
    await api.cancelConnection(connId);
    inFlightCancelId = null;
    closeModal();
    toast('Đã hủy kết nối', 'good');
    await loadLiveConnections();
    if (LIVE.learning.sessions.length > 0 || LIVE.learning.availableConnections.length > 0 || currentPage === 'schedule') {
      loadLearningData();
    }
    // Invalidate connections overview
    connOverview.data = null;
    loadConnectionsOverview();
    render();
  } catch (err) {
    console.error('[Connection] Error cancelling connection:', err);
    if (err?.status === 401) {
      inFlightCancelId = null;
      showSessionExpiredModal();
      return;
    }
    const msg = err?.message || 'Không thể hủy kết nối. Vui lòng thử lại.';
    if (errEl) {
      errEl.textContent = msg;
      errEl.style.display = 'block';
    }
    toast(msg, 'warn');
    if (confirmBtn) {
      confirmBtn.disabled = false;
      confirmBtn.textContent = 'Hủy kết nối';
    }
    if (backBtn) backBtn.disabled = false;
  } finally {
    inFlightCancelId = null;
  }
}

function showSessionExpiredModal() {
  openModal(
    'Phiên đăng nhập đã hết hạn',
    '<div style="text-align:center;padding:14px 4px">'
    + '<div style="font-size:38px;margin-bottom:12px">⌛</div>'
    + '<h3 style="margin:0 0 8px;font-size:16px;color:var(--navy)">Phiên đăng nhập đã hết hạn</h3>'
    + '<p style="font-size:13.5px;color:#64748b;line-height:1.5;margin:0 0 16px">'
    + 'Phiên đăng nhập của bạn đã hết hạn hoặc cookie bảo mật đã hết hiệu lực.<br>'
    + 'Vui lòng đăng nhập lại để tiếp tục thao tác với dữ liệu kết nối trên Lark Base.'
    + '</p>'
    + '</div>',
    '<button class="btn btn-primary" data-action="re-login" style="width:100%;justify-content:center">Đăng nhập lại ngay</button>'
  );
}

async function createLiveMatch(idx) {
  const suggestions = MATCHING.suggestionsData?.suggestions || [];
  const s = suggestions[idx];
  const isPersonal = MATCHING.mode === 'personal';
  const booths = isPersonal ? (MATCHING.context?.personalBooths || []) : (MATCHING.context?.villageBooths || []);
  const curBooth = booths.find(b => b.boothId === MATCHING.selectedBoothId) || booths[0];
  if (!s || !curBooth) return;

  if (!LIVE.currentUser) {
    openModal(
      'Yêu cầu đăng nhập',
      '<div style="text-align:center;padding:14px 4px">'
      + '<div style="font-size:38px;margin-bottom:12px">🔒</div>'
      + '<h3 style="margin:0 0 8px;font-size:16px;color:var(--navy)">Bạn chưa đăng nhập</h3>'
      + '<p style="font-size:13.5px;color:#64748b;line-height:1.5;margin:0 0 16px">'
      + 'Kết nối sẽ được ghi trực tiếp vào Lark Base (<b>T14_Connections</b>) dưới danh nghĩa thành viên của bạn.<br>'
      + 'Vui lòng đăng nhập bằng Email OTP hoặc tài khoản Lark để tiếp tục.'
      + '</p>'
      + '</div>',
      '<button class="btn btn-primary" data-action="re-login" style="width:100%;justify-content:center">Đăng nhập ngay</button>'
    );
    return;
  }

  const existing = getExistingLiveConnection(s, curBooth, isPersonal);
  if (existing && existing.status === 'Accepted') {
    toast(isPersonal ? 'Hai người đã kết nối trước đó.' : 'Hai Làng đã kết nối trước đó.', 'warn');
    return;
  }

  const targetBoothId = s.targetBoothId || s.targetRecordId || s.boothId;
  if (!targetBoothId) {
    toast('Không xác định được mã gian hàng đích để kết nối.', 'warn');
    return;
  }

  const sourceBoothId = curBooth.boothId || curBooth.recordId;
  const lockKey = `${sourceBoothId}:${targetBoothId}`;
  if (IN_FLIGHT_CONNECT.has(lockKey)) return;

  const idempotencyKey = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
    ? crypto.randomUUID()
    : ('conn-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10));
  IN_FLIGHT_CONNECT.set(lockKey, idempotencyKey);

  const buttons = document.querySelectorAll('[data-action="create-live-match"][data-idx="' + idx + '"]');
  buttons.forEach(btn => {
    btn.disabled = true;
    btn.dataset.origHtml = btn.innerHTML;
    btn.innerHTML = '<span class="spinner" style="width:12px;height:12px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:4px"></span> Đang kết nối...';
  });

  try {
    if (!window.AXANH_LIVE_API ||
        typeof window.AXANH_LIVE_API.createConnection !== 'function') {
      throw new Error('Dịch vụ kết nối chưa sẵn sàng. Vui lòng thử lại sau.');
    }

    await window.AXANH_LIVE_API.createConnection({
      sourceBoothId,
      targetBoothId,
      connectionType: isPersonal ? 'personal' : 'village',
      idempotencyKey,
    });

    toast('Kết nối thành công', 'good');

    await loadLiveConnections();
    if (LIVE.learning.sessions.length > 0 || LIVE.learning.availableConnections.length > 0 || currentPage === 'schedule') {
      loadLearningData();
    }
    // Invalidate connections overview
    connOverview.data = null;
    loadConnectionsOverview();
    closeModal();
    render();
  } catch (err) {
    console.error('[Connection] Error creating connection:', err);
    if (err?.status === 401) {
      showSessionExpiredModal();
    } else if (err?.status === 409 && err?.code === 'ALREADY_CONNECTED') {
      await loadLiveConnections();
      toast(err.message || 'Hai bên đã kết nối trước đó.', 'warn');
      closeModal();
      render();
    } else {
      toast(err?.message || 'Không thể thực hiện kết nối. Vui lòng thử lại.', 'warn');
    }
    buttons.forEach(btn => {
      btn.disabled = false;
      btn.innerHTML = btn.dataset.origHtml || (icon('userPlus', 14) + ' Kết nối');
    });
  } finally {
    IN_FLIGHT_CONNECT.delete(lockKey);
  }
}

function showMatchDetailModal(idx) {
  const suggestions = MATCHING.suggestionsData?.suggestions || [];
  const s = suggestions[idx];
  if (!s) return;
  const isPersonal = MATCHING.mode === 'personal';
  const isVillage = !isPersonal;
  const booths = isPersonal ? (MATCHING.context?.personalBooths || []) : (MATCHING.context?.villageBooths || []);
  const curBooth = booths.find(b => b.boothId === MATCHING.selectedBoothId) || booths[0];

  const targetDisplayName = isVillage ? s.targetVillageName : s.displayName;
  const title = 'Chi tiết kết nối · ' + esc(targetDisplayName);
  const avatarHtml = isVillage
    ? villageLogoHtml(s.targetVillageIconUrl, s.targetVillageName, 64)
    : memberAvatarHtml(s.avatarUrl, s.displayName, 64);

  const subLine = isVillage
    ? ('Đại diện: ' + esc(s.representativeName || 'Thành viên') + (s.targetOffice ? ' · ' + esc(s.targetOffice) : ''))
    : (esc(s.villageName || '') + (s.office ? ' · ' + esc(s.office) : ''));

  const isMatched = s.matchScore > 0;
  const reasonsList = (s.matchReasons || []).map(r => '<div style="color:#0f5132;background:#d1e7dd;padding:6px 10px;border-radius:6px;font-size:12.5px;font-weight:600">✓ ' + esc(r) + '</div>').join('');
  const reasonsHtml = isMatched
    ? (reasonsList || '<div style="color:#64748b">Chưa có lý do chi tiết</div>')
    : '<div style="color:#64748b;font-size:12.5px">Gian hàng từ Phiên chợ tri thức (chưa có điểm chung về chủ đề đã đăng ký, bạn vẫn có thể kết nối để trao đổi và học hỏi).</div>';

  const scoreBadgeHtml = isMatched
    ? '<span class="tag gold" style="font-size:13px;font-weight:700">' + s.matchScore + ' / 100 điểm</span>'
    : '<span class="tag" style="background:#f1f5f9;color:#475569;font-size:12px;font-weight:600">Gian hàng tham khảo</span>';

  const existing = getExistingLiveConnection(s, curBooth, isPersonal);
  const hintHtml = (existing && existing.status === 'Accepted')
    ? '✅ Hai bên đã kết nối chính thức. Bạn có thể đặt lịch cùng học hoặc hủy kết nối nếu cần.'
    : 'ℹ️ <b>Gợi ý:</b> Bấm "Kết nối" bên dưới để kết nối trực tiếp ngay lập tức trên Bản đồ tri thức AXANH và Lịch cùng học.';

  const bodyHtml = '<div class="person-head" style="margin-bottom:20px;display:flex;align-items:center;gap:14px">'
    + avatarHtml
    + '<div>'
    + '  <b style="font-size:17px">' + esc(targetDisplayName) + '</b>'
    + '  <div style="color:#64748b;font-size:13px;margin-top:2px">' + subLine + '</div>'
    + '</div>'
    + '<div style="margin-left:auto;text-align:right">'
    + scoreBadgeHtml
    + '</div>'
    + '</div>'
    + '<div class="kv"><span>Mã gian hàng</span><b>' + esc(s.targetBoothId || 'Chưa có') + '</b></div>'
    + '<div class="kv"><span>Nội dung có thể chia sẻ</span><b>' + esc(s.offer || 'Chưa cập nhật') + '</b></div>'
    + '<div class="kv"><span>Chủ đề chia sẻ</span><b>' + esc(s.offerTopic || (s.offerTags || []).join(', ') || 'Chưa cập nhật') + '</b></div>'
    + '<div class="kv"><span>Hình thức mong muốn</span><b>' + esc(s.preferredFormat || 'Linh hoạt') + '</b></div>'
    + '<div class="kv" style="margin-top:14px"><span>' + (isMatched ? 'Lý do đề xuất' : 'Tình trạng kết nối') + '</span>'
    + '  <div style="display:flex;flex-direction:column;gap:6px;margin-top:4px">' + reasonsHtml + '</div>'
    + '</div>'
    + '<div class="note" style="margin-top:16px;background:#f0f7ff;border:1px solid #c7e0ff;color:#1e4c8a;border-radius:8px;padding:12px;font-size:13px;line-height:1.6">'
    + hintHtml
    + '</div>';

  let actionBtnHtml = '';
  if (existing && existing.status === 'Accepted') {
    const canSch = isConnectionParticipant(existing);
    const canCan = canCancelConnection(existing);
    actionBtnHtml = renderAcceptedBadgeOrCancelBtn({ connId: existing.id, label: targetDisplayName, type: isPersonal ? 'personal' : 'village', canCancel: canCan, small: false, iconSize: 14 })
      + (canSch ? '<button type="button" class="btn btn-primary" data-action="schedule-connection" data-id="' + esc(existing.id) + '">' + icon('calendar', 14) + ' Đặt lịch cùng học</button>' : '');
  } else if (existing && existing.status === 'Pending') {
    actionBtnHtml = '<span class="conn-status-legacy">⏳ Chờ duyệt (cũ)</span>'
      + '<button type="button" class="btn btn-connect-blue" data-action="create-live-match" data-idx="' + idx + '">' + icon('userPlus', 14) + ' Kết nối</button>';
  } else {
    actionBtnHtml = '<button type="button" class="btn btn-connect-blue" data-action="create-live-match" data-idx="' + idx + '">' + icon('userPlus', 14) + ' Kết nối</button>';
  }

  const footerHtml = '<button type="button" class="btn" data-action="close-modal">Đóng</button>' + actionBtnHtml;

  openModal(title, bodyHtml, footerHtml);
}

function matches() {
  if (!MATCHING.context && !MATCHING.loading && !MATCHING.error) {
    loadMatching();
  }

  const mode = MATCHING.mode || 'personal';
  const isPersonal = mode === 'personal';
  const context = MATCHING.context || {
    canManageMatching: false,
    currentUser: LIVE.currentUser || { name: 'Thành viên', villageName: 'Chưa xác định' },
    currentVillage: null,
    personalBooths: [],
    villageBooths: [],
  };

  const tabs = '<div style="display:flex;gap:8px;flex-wrap:wrap;margin:14px 0 18px">'
    + '<button class="btn ' + (isPersonal ? 'btn-primary' : '') + '" data-action="set-live-match-mode" data-mode="personal">Cá nhân ↔ Cá nhân</button>'
    + '<button class="btn ' + (!isPersonal ? 'btn-primary' : '') + '" data-action="set-live-match-mode" data-mode="village">Làng ↔ Làng</button>'
    + '</div>';

  const header = pageHeader(
    'Tìm người đồng hành',
    '',
    '<button class="btn" data-action="nav" data-page="network">' + icon('network') + ' Xem bản đồ</button>'
  );

  // Left panel construction
  let leftPanelHtml = '';
  const booths = isPersonal ? (context.personalBooths || []) : (context.villageBooths || []);
  const curBooth = booths.find(b => b.boothId === MATCHING.selectedBoothId) || booths[0] || null;

  if (isPersonal) {
    const isAdmin = context.canManageMatching;
    const eyebrow = isAdmin ? 'ĐANG TÌM NGƯỜI HƯỚNG DẪN CHO' : 'NHU CẦU HỌC TẬP CỦA TÔI';

    let selectorHtml = '';
    if (isAdmin && LIVE.members.length > 0) {
      const selectedId = MATCHING.selectedMemberId || context.currentUser.memberId;
      selectorHtml = '<div class="field" style="margin:14px 0 18px">'
        + '<label>Chọn người học</label>'
        + '<select id="matchingMemberSelect">'
        + LIVE.members.map(m => '<option value="' + esc(m.id) + '" ' + (m.id === selectedId ? 'selected' : '') + '>' + esc(m.name) + ' – ' + esc(m.villageName || 'Không có làng') + '</option>').join('')
        + '</select></div>';
    }

    const u = context.currentUser;
    const avatar = memberAvatarHtml(u.avatarUrl, u.name, 58);
    const profileCard = '<div class="person-head" style="margin:10px 0 18px">'
      + avatar
      + '<div><b>' + esc(u.name) + '</b><small>' + esc(u.villageName || 'Chưa xác định') + (u.office ? ' · ' + esc(u.office) : '') + '</small></div>'
      + '</div>';

    let boothSelectionHtml = '';
    if (booths.length === 0) {
      boothSelectionHtml = '<div class="empty" style="padding:16px 8px;margin:12px 0">'
        + '<p style="font-size:13px;line-height:1.5;margin-bottom:12px">'
        + (isAdmin
            ? 'Thành viên này chưa có đăng ký gian hàng Cá nhân nào trong Lark Base.'
            : 'Bạn chưa có đăng ký gian hàng Cá nhân. Hãy đăng ký nhu cầu học tập để tìm người đồng hành.')
        + '</p>'
        + (isAdmin ? '' : '<button class="btn btn-primary small" data-action="open-form" data-form="registration" data-default-type="personal">' + icon('plus', 14) + ' Đăng ký gian hàng</button>')
        + '</div>';
    } else {
      boothSelectionHtml = '<div class="field" style="margin:14px 0 14px"><label>Chọn gian hàng cần hỗ trợ</label><select id="matchingBoothSelect">'
        + booths.map(b => '<option value="' + esc(b.boothId) + '" ' + (b.boothId === (curBooth?.boothId) ? 'selected' : '') + '>' + esc(b.boothId) + ': ' + esc(b.needTopic || 'Nhu cầu') + ' – ' + esc((b.need || '').slice(0, 32)) + '</option>').join('')
        + '</select></div>';
    }

    let detailHtml = '';
    if (curBooth) {
      const needTags = (curBooth.needTags || [curBooth.needTopic]).filter(Boolean);
      const tagsHtml = needTags.map(t => '<span class="tag gold">' + esc(t) + '</span>').join('');
      const formatHtml = curBooth.preferredFormat ? esc(curBooth.preferredFormat) : 'Linh hoạt';
      const timeHtml = curBooth.availability ? new Date(curBooth.availability).toLocaleDateString('vi-VN') : 'Linh hoạt / Chưa hẹn';

      detailHtml = '<div class="offerneed">'
        + '<div><span class="row-label">ĐIỀU MUỐN HỌC</span><strong>' + esc(curBooth.need || 'Chưa cập nhật') + '</strong></div>'
        + '<div class="tags">' + (tagsHtml || '<span class="tag">Chung</span>') + '</div>'
        + '<div><span class="row-label">HÌNH THỨC MONG MUỐN</span><strong>' + formatHtml + '</strong></div>'
        + '<div><span class="row-label">THỜI GIAN GỢI Ý</span><strong>' + timeHtml + '</strong></div>'
        + '</div>'
        + '<div class="lightbar"><button class="btn small" data-action="open-form" data-form="registration" data-default-type="personal">Mở thêm gian hàng</button></div>';
    }

    leftPanelHtml = '<aside class="panel matching-profile">'
      + '<div class="eyebrow">' + eyebrow + '</div>'
      + selectorHtml
      + profileCard
      + boothSelectionHtml
      + detailHtml
      + '</aside>';
  } else {
    // Village mode
    const isAdmin = context.canManageMatching;
    const eyebrow = isAdmin ? 'ĐANG TÌM LÀNG ĐỒNG HÀNH CHO' : 'NHU CẦU HỌC TẬP CỦA LÀNG';

    let selectorHtml = '';
    if (isAdmin && LIVE.villages.length > 0) {
      const selectedId = MATCHING.selectedVillageId || context.currentVillage?.villageId;
      selectorHtml = '<div class="field" style="margin:14px 0 18px">'
        + '<label>Chọn Làng</label>'
        + '<select id="matchingVillageSelect">'
        + LIVE.villages.map(v => '<option value="' + esc(v.id) + '" ' + (v.id === selectedId ? 'selected' : '') + '>' + esc(v.name) + ' – ' + esc(v.office || '') + '</option>').join('')
        + '</select></div>';
    }

    const cv = context.currentVillage;
    const logo = cv ? villageLogoHtml(cv.iconUrl, cv.villageName, 58) : '<div style="font-size:32px">🏛️</div>';
    const profileCard = '<div class="person-head" style="margin:10px 0 18px">'
      + logo
      + '<div><b>' + esc(cv?.villageName || 'Chưa xác định làng') + '</b><small>' + esc(cv?.office ? 'Văn phòng: ' + cv.office : 'AXANH') + '</small></div>'
      + '</div>';

    let boothSelectionHtml = '';
    if (!cv) {
      boothSelectionHtml = '<div class="empty" style="padding:16px 8px;margin:12px 0"><p style="color:var(--rose)">Chưa xác định được làng trực thuộc. Vui lòng liên hệ quản trị viên.</p></div>';
    } else if (booths.length === 0) {
      boothSelectionHtml = '<div class="empty" style="padding:16px 8px;margin:12px 0">'
        + '<p style="font-size:13px;line-height:1.5;margin-bottom:12px">'
        + (isAdmin
            ? 'Làng này chưa có đăng ký gian hàng Làng nào trong Lark Base.'
            : 'Làng của bạn chưa có đăng ký gian hàng Làng để tìm kết nối.')
        + '</p>'
        + (isAdmin ? '' : '<button class="btn btn-primary small" data-action="open-form" data-form="registration" data-default-type="village">' + icon('plus', 14) + ' Đăng ký gian hàng Làng</button>')
        + '</div>';
    } else {
      boothSelectionHtml = '<div class="field" style="margin:14px 0 14px"><label>Chọn gian hàng Làng</label><select id="matchingBoothSelect">'
        + booths.map(b => '<option value="' + esc(b.boothId) + '" ' + (b.boothId === (curBooth?.boothId) ? 'selected' : '') + '>' + esc(b.boothId) + ': ' + esc(b.needTopic || 'Nhu cầu') + ' – ' + esc((b.need || '').slice(0, 32)) + '</option>').join('')
        + '</select></div>';
    }

    let detailHtml = '';
    if (curBooth) {
      const needTags = (curBooth.needTags || [curBooth.needTopic]).filter(Boolean);
      const tagsHtml = needTags.map(t => '<span class="tag gold">' + esc(t) + '</span>').join('');
      const formatHtml = curBooth.preferredFormat ? esc(curBooth.preferredFormat) : 'Linh hoạt';

      detailHtml = '<div class="offerneed">'
        + '<div><span class="row-label">ĐIỀU LÀNG MUỐN HỌC</span><strong>' + esc(curBooth.need || 'Chưa cập nhật') + '</strong></div>'
        + '<div class="tags">' + (tagsHtml || '<span class="tag">Chung</span>') + '</div>'
        + '<div><span class="row-label">HÌNH THỨC MONG MUỐN</span><strong>' + formatHtml + '</strong></div>'
        + '</div>'
        + '<div class="lightbar"><button class="btn small" data-action="open-form" data-form="registration" data-default-type="village">Đăng ký thêm gian hàng Làng</button></div>';
    }

    leftPanelHtml = '<aside class="panel matching-profile">'
      + '<div class="eyebrow">' + eyebrow + '</div>'
      + selectorHtml
      + profileCard
      + boothSelectionHtml
      + detailHtml
      + '</aside>';
  }

  // Right panel construction
  let rightPanelHtml = '';
  if (MATCHING.loading) {
    rightPanelHtml = '<div><div class="empty" style="min-height:300px;display:flex;flex-direction:column;align-items:center;justify-content:center"><div class="spinner"></div><p style="margin-top:14px;color:#64748b">Đang phân tích và tìm kiếm kết nối phù hợp từ Lark Base...</p></div></div>';
  } else if (MATCHING.error) {
    rightPanelHtml = '<div><div class="empty" style="min-height:260px;display:flex;flex-direction:column;align-items:center;justify-content:center"><p style="color:var(--rose);margin-bottom:14px;font-weight:600">Lỗi: ' + esc(MATCHING.error) + '</p><button class="btn btn-primary small" data-action="retry-matching">Thử lại</button></div></div>';
  } else if (!curBooth) {
    rightPanelHtml = '<div><div class="empty" style="min-height:260px;display:flex;flex-direction:column;align-items:center;justify-content:center">'
      + icon('search', 42)
      + '<b style="margin-top:10px">Chưa có gian hàng nguồn để tìm kết nối</b>'
      + '<p style="max-width:440px;margin-top:6px">Vui lòng đăng ký gian hàng ' + (isPersonal ? 'Cá nhân' : 'Làng') + ' để hệ thống phân tích và đề xuất kết nối phù hợp từ Lark Base.</p>'
      + '</div></div>';
  } else {
    const suggestions = MATCHING.suggestionsData?.suggestions || [];
    const count = suggestions.length;
    const matchingCount = suggestions.filter(s => s.matchScore > 0).length;
    const otherCount = suggestions.filter(s => s.matchScore === 0).length;

    let titleText = '';
    if (matchingCount > 0) {
      titleText = matchingCount + ' gợi ý phù hợp' + (isPersonal ? '' : ' cấp Làng') + (otherCount > 0 ? ' (' + otherCount + ' gian hàng khác)' : '');
    } else if (otherCount > 0) {
      titleText = otherCount + ' gian hàng từ Phiên chợ tri thức' + (isPersonal ? '' : ' cấp Làng');
    } else {
      titleText = '0 gợi ý phù hợp' + (isPersonal ? '' : ' cấp Làng');
    }

    if (count === 0) {
      rightPanelHtml = '<div><div class="section-title" style="margin:0 0 15px"><h2>' + titleText + '</h2><span>So khớp chủ đề và nội dung chia sẻ thực tế từ Lark Base</span></div>'
        + '<div class="empty" style="min-height:260px;display:flex;flex-direction:column;align-items:center;justify-content:center">'
        + icon('search', 40)
        + '<b style="margin-top:10px">Chưa có gian hàng nào khác</b>'
        + '<p style="max-width:440px;margin-top:6px">Hiện chưa tìm thấy gian hàng nào khác trong Phiên chợ tri thức để kết nối.</p>'
        + '</div></div>';
    } else {
      let hasRenderedDivider = false;
      const noticeHtml = matchingCount === 0 && otherCount > 0
        ? ('<div style="background:#f8fafc;border:1px dashed #cbd5e1;border-radius:10px;padding:12px 16px;margin-bottom:16px;font-size:13px;color:#475569;line-height:1.5">'
           + '<b>Chưa có gian hàng trùng chủ đề</b> với nhu cầu <i>"' + esc(curBooth?.needTopic || curBooth?.need || '') + '"</i>. '
           + 'Dưới đây là <b>' + otherCount + ' gian hàng khác</b> đang mở trong Phiên chợ tri thức ' + (isPersonal ? 'của các thành viên' : 'của các Làng') + ' để bạn tham khảo và chủ động kết nối:'
           + '</div>')
        : '';

      const cardsHtml = suggestions.map((s, idx) => {
        const isMatched = s.matchScore > 0;
        let dividerHtml = '';

        if (!isMatched && matchingCount > 0 && !hasRenderedDivider) {
          hasRenderedDivider = true;
          dividerHtml = '<div style="display:flex;align-items:center;gap:12px;margin:26px 0 14px">'
            + '<div style="font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.04em;white-space:nowrap;display:flex;align-items:center;gap:6px">'
            + icon('grid', 14)
            + 'Các gian hàng khác trong Phiên chợ tri thức (' + otherCount + ')'
            + '</div>'
            + '<div style="flex:1;height:1px;background:#e2e8f0"></div>'
            + '</div>';
        }

        const picHtml = isPersonal
          ? memberAvatarHtml(s.avatarUrl, s.displayName, 59)
          : villageLogoHtml(s.targetVillageIconUrl, s.targetVillageName, 59);

        const heading = isPersonal ? esc(s.displayName) : esc(s.targetVillageName);
        const subHeading = isPersonal
          ? (esc(s.villageName || '') + (s.office ? ' · ' + esc(s.office) : '') + ' · Có thể giúp: <b>' + esc(s.offer) + '</b>')
          : ('Đại diện: <b>' + esc(s.representativeName || 'Thành viên') + '</b>' + (s.targetOffice ? ' · ' + esc(s.targetOffice) : '') + ' · Có thể hỗ trợ: <b>' + esc(s.offer) + '</b>');

        let tagsHtml = '';
        if (isMatched) {
          const commonTags = (s.commonTopics || []).map(t => '<span class="tag teal">Chung chủ đề: ' + esc(t) + '</span>').join('');
          const reasonTags = (s.matchReasons || []).map(r => '<span class="tag gold">' + esc(r) + '</span>').join('');
          const formatTag = s.sameFormat ? '<span class="tag">Cùng hình thức</span>' : '';
          const timeTag = s.sameTime ? '<span class="tag">Khung giờ tương đồng</span>' : '';
          const otherCountTag = s.otherMatchingBoothsCount > 0 ? '<span class="tag" style="background:#eef4ff;color:#2857a4">+' + s.otherMatchingBoothsCount + ' gian hàng khác</span>' : '';
          tagsHtml = commonTags + reasonTags + formatTag + timeTag + otherCountTag;
        } else {
          const topicTag = s.offerTopic ? ('<span class="tag" style="background:#f1f5f9;color:#475569">Chủ đề: ' + esc(s.offerTopic) + '</span>') : '';
          const noMatchTag = '<span class="tag" style="background:#fafafa;color:#94a3b8;border:1px dashed #cbd5e1">Chưa trùng chủ đề học</span>';
          const formatTag = s.sameFormat ? '<span class="tag">Cùng hình thức</span>' : '';
          const timeTag = s.sameTime ? '<span class="tag">Khung giờ tương đồng</span>' : '';
          const otherCountTag = s.otherMatchingBoothsCount > 0 ? '<span class="tag" style="background:#eef4ff;color:#2857a4">+' + s.otherMatchingBoothsCount + ' gian hàng khác</span>' : '';
          tagsHtml = topicTag + noMatchTag + formatTag + timeTag + otherCountTag;
        }

        const existing = getExistingLiveConnection(s, curBooth, isPersonal);
        const targetDisplayName = isPersonal ? s.displayName : s.targetVillageName;
        let matchButtonHtml = '';
        if (existing && existing.status === 'Accepted') {
          const canCancel = canCancelConnection(existing);
          const canSch = isConnectionParticipant(existing);
          matchButtonHtml = renderAcceptedBadgeOrCancelBtn({ connId: existing.id, label: targetDisplayName, type: isPersonal ? 'personal' : 'village', canCancel, small: true, iconSize: 13 })
            + (canSch ? '<button type="button" class="btn small" data-action="schedule-connection" data-id="' + esc(existing.id) + '">' + icon('calendar', 13) + ' Đặt lịch</button>' : '');
        } else if (existing && existing.status === 'Pending') {
          matchButtonHtml = '<span class="conn-status-legacy">⏳ Chờ duyệt (cũ)</span>'
            + '<button type="button" class="btn btn-connect-blue small" data-action="create-live-match" data-idx="' + idx + '">' + icon('userPlus', 14) + ' Kết nối</button>';
        } else {
          matchButtonHtml = '<button type="button" class="btn btn-connect-blue small" data-action="create-live-match" data-idx="' + idx + '">' + icon('userPlus', 14) + ' Kết nối</button>';
        }

        const scoreHtml = isMatched
          ? ('<div class="score">' + s.matchScore + '<small>điểm gợi ý</small></div>')
          : ('<div class="score" style="color:#94a3b8">—<small style="color:#94a3b8">tham khảo</small></div>');

        const progressHtml = isMatched
          ? ('<div class="progress"><span style="width:' + s.matchScore + '%"></span></div>')
          : ('<div class="progress" style="opacity:0.35"><span style="width:0%"></span></div>');

        return dividerHtml
          + '<div class="match-card" ' + (!isMatched ? 'style="border-color:#e2e8f0;background:#ffffff;"' : '') + '>'
          + '<div style="flex-shrink:0">' + picHtml + '</div>'
          + '<div>'
          + '  <h3>' + heading + '</h3>'
          + '  <p>' + subHeading + '</p>'
          + '  <div class="tags">' + tagsHtml + '</div>'
          +    progressHtml
          + '</div>'
          + '<div style="text-align:right">'
          +    scoreHtml
          + '  <div style="display:flex;gap:6px;justify-content:flex-end;margin-top:8px;flex-wrap:wrap">'
          +      matchButtonHtml
          + '    <button class="btn small" data-action="view-match-detail" data-idx="' + idx + '">Xem chi tiết</button>'
          + '  </div>'
          + '</div>'
          + '</div>';
      }).join('');

      rightPanelHtml = '<div><div class="section-title" style="margin:0 0 15px"><h2>' + titleText + '</h2><span>' + (matchingCount > 0 ? 'Ưu tiên những kết nối tương thích năng lực và có đầu ra áp dụng thật' : 'Dựa trên danh sách gian hàng đăng ký từ Phiên chợ tri thức') + '</span></div>'
        + noticeHtml
        + cardsHtml
        + '</div>';
    }
  }

  return header + tabs + '<div class="match-layout">' + leftPanelHtml + rightPanelHtml + '</div>' + renderConnectionsManager();
}

function renderConnectionsManager() {
  const inbox = Array.isArray(LIVE.inboxConnections) ? LIVE.inboxConnections : [];
  const allMine = Array.isArray(LIVE.connections) ? LIVE.connections : [];
  const accepted = allMine.filter(c => c.status === 'Accepted');
  const historyConns = allMine.filter(c => c.status === 'Cancelled' || c.status === 'Rejected');

  // If inbox becomes empty while on inbox tab, switch cleanly to accepted tab
  const activeTab = (connectionsActiveTab === 'inbox' && inbox.length === 0) ? 'accepted' : connectionsActiveTab;
  const activeItems = activeTab === 'inbox' ? inbox : (activeTab === 'history' ? historyConns : accepted);
  const totalPages = Math.max(1, Math.ceil(activeItems.length / CONNECTIONS_PAGE_SIZE));
  connectionsPage = Math.min(Math.max(1, connectionsPage), totalPages);
  const startIdx = (connectionsPage - 1) * CONNECTIONS_PAGE_SIZE;
  const pagedItems = activeItems.slice(startIdx, startIdx + CONNECTIONS_PAGE_SIZE);

  let listHtml = '';
  if (activeTab === 'inbox' && inbox.length > 0) {
    listHtml = pagedItems.map(c => {
      const isPers = c.connectionType === 'personal';
      const senderName = c.sourceBooth?.authorName || c.requestedBy;
      const senderVil = c.sourceBooth?.authorVillageName || c.sourceBooth?.villageName || '—';
      const senderAv = c.sourceBooth?.authorAvatarUrl || null;
      const avHtml = memberAvatarHtml(senderAv, senderName, 44);
      const offer = c.sourceBooth?.offer || 'Chia sẻ kiến thức chuyên môn';
      const need = c.sourceBooth?.need || 'Học hỏi và trao đổi';
      const createdDate = c.createdAt ? new Date(c.createdAt).toLocaleDateString('vi-VN') : '';

      return '<div class="conn-item-card">'
        + '<div class="conn-item-left">'
        + avHtml
        + '<div style="min-width:0">'
        + '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">'
        + '  <b style="font-size:14px;color:var(--navy)">' + esc(senderName) + '</b>'
        + '  <span class="tag ' + (isPers ? 'teal' : 'gold') + '" style="font-size:11px">' + (isPers ? 'Cá nhân' : 'Gian hàng Làng') + '</span>'
        + '  <small style="color:#64748b">' + esc(senderVil) + '</small>'
        + '</div>'
        + '<div style="font-size:12.5px;color:#334155;margin-top:4px">'
        + '  <span><b>Có thể chia sẻ:</b> ' + esc(offer) + '</span>'
        + '  <span style="margin:0 6px;color:#cbd5e1">·</span>'
        + '  <span><b>Muốn học:</b> ' + esc(need) + '</span>'
        + '</div>'
        + '<small style="color:#94a3b8;margin-top:4px;display:block">Yêu cầu cũ ngày: ' + esc(createdDate) + (c.connectionId ? ' · ' + esc(c.connectionId) : '') + '</small>'
        + '</div>'
        + '</div>'
        + '<div class="conn-item-right">'
        + '<button class="btn btn-primary small" data-action="respond-connection" data-id="' + esc(c.id) + '" data-decision="Accepted" style="background:#166534;border-color:#166534">' + icon('check', 13) + ' Đồng ý</button>'
        + '<button class="btn small" data-action="respond-connection" data-id="' + esc(c.id) + '" data-decision="Rejected" style="color:#b91c1c;border-color:#fca5a5">' + icon('close', 13) + ' Từ chối</button>'
        + '</div>'
        + '</div>';
    }).join('');
  } else if (activeTab === 'history') {
    if (historyConns.length === 0) {
      listHtml = '<div class="empty" style="padding:32px 16px"><p style="margin:0;color:#64748b">Chưa có lịch sử kết nối đã hủy hoặc từ chối.</p></div>';
    } else {
      listHtml = pagedItems.map(c => {
        const isPers = c.connectionType === 'personal';
        const sName = isPers
          ? (c.seekerName || c.sourceBooth?.authorName || c.requestedBy)
          : (c.seekerVillageName || c.sourceBooth?.villageName || c.sourceVillageId || 'Làng');
        const tName = isPers
          ? (c.targetName || c.targetBooth?.authorName || c.targetMemberId)
          : (c.targetVillageName || c.targetBooth?.villageName || c.targetVillageId || 'Làng');
        const dateStr = (c.respondedAt || c.createdAt) ? new Date(c.respondedAt || c.createdAt).toLocaleDateString('vi-VN') : '';
        const statusPill = c.status === 'Rejected'
          ? '<span class="status-badge" style="background:#fee2e2;color:#b91c1c;padding:4px 10px;border-radius:20px;font-size:12px;font-weight:700">✕ Đã từ chối (cũ)</span>'
          : '<span class="status-badge" style="background:#f1f5f9;color:#64748b;padding:4px 10px;border-radius:20px;font-size:12px;font-weight:600">Đã hủy</span>';

        return '<div class="conn-item-card" style="opacity:0.82">'
          + '<div class="conn-item-left">'
          + '<div style="width:38px;height:38px;border-radius:50%;background:#f1f5f9;color:#64748b;display:flex;align-items:center;justify-content:center;font-weight:700">' + icon('unlink', 17) + '</div>'
          + '<div style="min-width:0">'
          + '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">'
          + '  <b style="font-size:14px;color:var(--navy)">' + esc(sName) + ' ↔ ' + esc(tName) + '</b>'
          + '  <span class="tag ' + (isPers ? 'teal' : 'gold') + '" style="font-size:11px">' + (isPers ? 'Cá nhân' : 'Làng') + '</span>'
          + '</div>'
          + '<small style="color:#64748b;margin-top:4px;display:block">Cập nhật: ' + esc(dateStr) + (c.connectionId ? ' · ' + esc(c.connectionId) : '') + '</small>'
          + '</div>'
          + '</div>'
          + '<div class="conn-item-right">'
          + statusPill
          + '</div>'
          + '</div>';
      }).join('');
    }
  } else {
    if (accepted.length === 0) {
      listHtml = '<div class="empty" style="padding:32px 16px"><p style="margin:0;color:#64748b">Chưa có kết nối nào đang hoạt động. Bấm <b>Kết nối</b> ở các gợi ý phía trên để kết nối ngay.</p></div>';
    } else {
      listHtml = pagedItems.map(c => {
        const isPers = c.connectionType === 'personal';
        const sName = isPers
          ? (c.seekerName || c.sourceBooth?.authorName || c.requestedBy)
          : (c.seekerVillageName || c.sourceBooth?.villageName || c.sourceVillageId || 'Làng');
        const tName = isPers
          ? (c.targetName || c.targetBooth?.authorName || c.targetMemberId)
          : (c.targetVillageName || c.targetBooth?.villageName || c.targetVillageId || 'Làng');
        const sVil = c.sourceBooth?.authorVillageName || c.sourceBooth?.villageName || '';
        const tVil = c.targetBooth?.authorVillageName || c.targetBooth?.villageName || '';
        const dateStr = (c.respondedAt || c.createdAt) ? new Date(c.respondedAt || c.createdAt).toLocaleDateString('vi-VN') : '';
        const peerLabel = getConnectionPeerLabel(c);
        const canSch = isConnectionParticipant(c);
        const canCancel = canCancelConnection(c);

        return '<div class="conn-item-card">'
          + '<div class="conn-item-left">'
          + '<div style="width:38px;height:38px;border-radius:50%;background:#dcfce7;color:#15803d;display:flex;align-items:center;justify-content:center;font-weight:700">' + icon('checkCircle', 18) + '</div>'
          + '<div style="min-width:0">'
          + '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">'
          + '  <b style="font-size:14px;color:var(--navy)">' + esc(sName) + (isPers && sVil ? ' (' + esc(sVil) + ')' : '') + ' ↔ ' + esc(tName) + (isPers && tVil ? ' (' + esc(tVil) + ')' : '') + '</b>'
          + '  <span class="tag ' + (isPers ? 'teal' : 'gold') + '" style="font-size:11px">' + (isPers ? 'Cá nhân' : 'Làng') + '</span>'
          + '</div>'
          + '<small style="color:#64748b;margin-top:4px;display:block">Kết nối ngày: ' + esc(dateStr) + (c.connectionId ? ' · ' + esc(c.connectionId) : '') + '</small>'
          + '</div>'
          + '</div>'
          + '<div class="conn-item-right" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">'
          + renderAcceptedBadgeOrCancelBtn({ connId: c.id, label: peerLabel, type: isPers ? 'personal' : 'village', canCancel, small: true, iconSize: 13 })
          + (canSch ? '<button type="button" class="btn small" data-action="schedule-connection" data-id="' + esc(c.id) + '">' + icon('calendar', 13) + ' Đặt lịch cùng học</button>' : '')
          + '</div>'
          + '</div>';
      }).join('');
    }
  }

  const paginationHtml = totalPages > 1
    ? '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:16px;padding-top:12px;border-top:1px solid #e2e8f0;flex-wrap:wrap">'
      + '<small style="color:#64748b">Hiển thị ' + (startIdx + 1) + '–' + Math.min(startIdx + CONNECTIONS_PAGE_SIZE, activeItems.length) + ' / ' + activeItems.length + ' kết nối (Trang ' + connectionsPage + '/' + totalPages + ')</small>'
      + '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">'
      + '<button type="button" class="btn small" data-action="set-conn-page" data-page="' + (connectionsPage - 1) + '"' + (connectionsPage <= 1 ? ' disabled' : '') + '>‹ Trước</button>'
      + Array.from({ length: totalPages }, (_, idx) => {
          const p = idx + 1;
          return '<button type="button" class="btn small ' + (p === connectionsPage ? 'btn-primary' : '') + '" data-action="set-conn-page" data-page="' + p + '">' + p + '</button>';
        }).join('')
      + '<button type="button" class="btn small" data-action="set-conn-page" data-page="' + (connectionsPage + 1) + '"' + (connectionsPage >= totalPages ? ' disabled' : '') + '>Sau ›</button>'
      + '</div>'
      + '</div>'
    : '';

  return '<div class="connections-manager-wrap" style="margin-top:36px;border-top:1px solid #e2e8f0;padding-top:24px">'
    + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:12px">'
    + '  <div>'
    + '    <h2 style="font-size:18px;margin:0 0 4px;color:var(--navy)">Kết nối của tôi</h2>'
    + '  </div>'
    + '  <button type="button" class="btn small" data-action="refresh-connections" style="display:inline-flex;align-items:center;gap:5px">'
    +      icon('refresh', 13) + ' Làm mới'
    + '  </button>'
    + '</div>'
    + '<div class="conn-tabs">'
    + '  <button type="button" class="conn-tab-btn ' + (activeTab === 'accepted' ? 'active' : '') + '" data-action="set-conn-tab" data-tab="accepted">'
    + '    Đã kết nối (' + accepted.length + ')'
    + '  </button>'
    + (inbox.length > 0
        ? ('  <button type="button" class="conn-tab-btn ' + (activeTab === 'inbox' ? 'active' : '') + '" data-action="set-conn-tab" data-tab="inbox">'
           + '    Chờ duyệt cũ (' + inbox.length + ')'
           + '  </button>')
        : '')
    + '  <button type="button" class="conn-tab-btn ' + (activeTab === 'history' ? 'active' : '') + '" data-action="set-conn-tab" data-tab="history">'
    + '    Đã hủy / lịch sử (' + historyConns.length + ')'
    + '  </button>'
    + '</div>'
    + '<div style="margin-top:14px">'
    +    listHtml
    +    paginationHtml
    + '</div>'
    + '</div>';
}

function showNotificationsModal() {
  const inbox = Array.isArray(LIVE.inboxConnections) ? LIVE.inboxConnections : [];
  let bodyHtml = '';
  if (inbox.length === 0) {
    bodyHtml = '<div class="empty" style="padding:28px 12px"><p style="margin:0;color:#64748b">Không có thông báo hoặc yêu cầu nào đang chờ xử lý.</p></div>';
  } else {
    bodyHtml = '<div style="max-height:420px;overflow-y:auto">'
      + inbox.map(c => {
        const isPers = c.connectionType === 'personal';
        const senderName = c.sourceBooth?.authorName || c.requestedBy;
        const senderVil = c.sourceBooth?.authorVillageName || c.sourceBooth?.villageName || '—';
        const senderAv = c.sourceBooth?.authorAvatarUrl || null;
        const avHtml = memberAvatarHtml(senderAv, senderName, 40);
        const offer = c.sourceBooth?.offer || 'Chia sẻ kiến thức';

        return '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px;border:1px solid #e2e8f0;border-radius:10px;margin-bottom:8px;gap:12px">'
          + '<div style="display:flex;align-items:center;gap:10px;min-width:0;flex:1">'
          +   avHtml
          + '  <div style="min-width:0">'
          + '    <b style="display:block;font-size:13.5px;color:var(--navy)">' + esc(senderName) + '</b>'
          + '    <small style="color:#64748b">' + esc(senderVil) + ' · ' + (isPers ? 'Cá nhân' : 'Gian hàng Làng') + '</small>'
          + '    <div style="font-size:12px;color:#334155;margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"><b>Chia sẻ:</b> ' + esc(offer) + '</div>'
          + '  </div>'
          + '</div>'
          + '<div style="display:flex;gap:6px;flex-shrink:0">'
          + '  <button class="btn btn-primary small" data-action="respond-connection" data-id="' + esc(c.id) + '" data-decision="Accepted" style="background:#166534;border-color:#166534;padding:4px 10px">Đồng ý</button>'
          + '  <button class="btn small" data-action="respond-connection" data-id="' + esc(c.id) + '" data-decision="Rejected" style="color:#b91c1c;padding:4px 10px">Từ chối</button>'
          + '</div>'
          + '</div>';
      }).join('')
      + '</div>';
  }
  openModal('Thông báo kết nối' + (inbox.length > 0 ? ' (' + inbox.length + ' chờ duyệt cũ)' : ''), bodyHtml, '<button class="btn" data-action="close-modal">Đóng</button>');
}
function getVillageNodeCoords(key, villageName, villageId, coords, nodeMap) {
  if (key && coords[key]) return coords[key];
  if (villageId && coords[villageId]) return coords[villageId];
  if (villageName) {
    const clean = villageName.replace(/^[^\w\s\u00C0-\u1EF9]+/u, '').trim().toLowerCase();
    for (const [k, v] of Object.entries(coords)) {
      const nodeName = nodeMap[k];
      if (nodeName && nodeName.replace(/^[^\w\s\u00C0-\u1EF9]+/u, '').trim().toLowerCase() === clean) return v;
    }
  }
  return null;
}

// ===== CONNECTIONS OVERVIEW – Load & Render =====
async function loadConnectionsOverview() {
  if (connOverview.loading) return;
  connOverview.loading = true;
  connOverview.error = '';
  if (currentPage === 'connection-detail') render();
  try {
    const result = await window.AXANH_LIVE_API.getConnectionsOverview();
    connOverview.data = result;
    connOverview.error = '';
  } catch (err) {
    if (err?.status === 401) { showSessionExpiredModal(); return; }
    connOverview.error = err?.message || 'Không thể tải dữ liệu kết nối tổng quan.';
  } finally {
    connOverview.loading = false;
    if (currentPage === 'connection-detail') render();
  }
}

function connectionDetail() {
  if (!LIVE.currentUser) {
    return '<div class="empty">' + icon('users', 32)
      + '<b>Bạn chưa đăng nhập</b>'
      + '<p>Vui lòng đăng nhập để xem chi tiết kết nối toàn hệ thống.</p>'
      + '<button class="btn btn-primary" data-action="re-login">Đăng nhập ngay</button>'
      + '</div>';
  }
  return renderConnectionsOverview();
}

function normStr(s) {
  return String(s || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D');
}

function renderConnectionsOverview() {
  if (!LIVE.currentUser) return '';

  // Auto-load nếu chưa có data
  if (!connOverview.data && !connOverview.loading && !connOverview.error) {
    loadConnectionsOverview();
  }

  const headerHtml = '<div class="conn-ov-header">'
    + '<div class="conn-ov-header-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a7de8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="4" height="18" rx="1"/><rect x="10" y="8" width="4" height="13" rx="1"/><rect x="17" y="13" width="4" height="8" rx="1"/></svg></div>'
    + '<div><div class="conn-ov-title">Chi tiết kết nối toàn hệ thống</div>'
    + '<div class="conn-ov-subtitle">Tra cứu kết nối theo từng thành viên</div></div>'
    + '</div>';

  if (connOverview.loading) {
    return '<div class="conn-overview-wrap">' + headerHtml
      + '<div class="conn-ov-state">' + icon('refresh', 18) + ' Đang tải dữ liệu kết nối...</div>'
      + '</div>';
  }
  if (connOverview.error) {
    return '<div class="conn-overview-wrap">' + headerHtml
      + '<div class="conn-ov-state conn-ov-error">' + icon('info', 18) + ' ' + esc(connOverview.error)
      + ' <button class="btn small" data-action="reload-conn-overview">Thử lại</button></div>'
      + '</div>';
  }
  if (!connOverview.data) {
    return '<div class="conn-overview-wrap">' + headerHtml + '</div>';
  }

  const rawItems = connOverview.data.items || [];

  // ---- Bộ lọc làng (từ dữ liệu thực) ----
  const villageSet = new Set(rawItems.map(m => m.villageName).filter(Boolean));
  const villageOptions = [...villageSet].sort();

  // ---- Thanh công cụ ----
  const toolbar = '<div class="conn-ov-toolbar">'
    + '<div class="conn-ov-search-wrap">'
    + '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 5 5"/></svg>'
    + '<input id="connOvSearch" class="conn-ov-search" type="text" placeholder="Tìm thành viên, phiên chợ..." value="' + esc(connOverviewSearch) + '" autocomplete="off">'
    + '</div>'
    + '<select id="connOvVillage" class="conn-ov-select">'
    + '<option value="all"' + (connOverviewVillage === 'all' ? ' selected' : '') + '>Tất cả làng</option>'
    + villageOptions.map(v => '<option value="' + esc(v) + '"' + (connOverviewVillage === v ? ' selected' : '') + '>' + esc(v) + '</option>').join('')
    + '</select>'
    + '<select id="connOvSort" class="conn-ov-select">'
    + ['most:Kết nối nhiều nhất', 'least:Kết nối ít nhất', 'az:Tên A – Z', 'za:Tên Z – A'].map(opt => {
        const [v, label] = opt.split(':');
        return '<option value="' + v + '"' + (connOverviewSort === v ? ' selected' : '') + '>' + label + '</option>';
      }).join('')
    + '</select>'
    + '<label class="conn-ov-check-label">'
    + '<input id="connOvNoConn" type="checkbox"' + (connOverviewNoConn ? ' checked' : '') + '>'
    + ' Chỉ chưa có kết nối'
    + '</label>'
    + '</div>';

  return '<div class="conn-overview-wrap">'
    + headerHtml + toolbar
    + '<div id="connOvBody">' + renderConnectionsOverviewBody() + '</div>'
    + '</div>';
}

function renderConnectionsOverviewBody() {
  const rawItems = connOverview.data?.items || [];

  // ---- Lọc + Sort ----
  const sq = normStr(connOverviewSearch);
  let filtered = rawItems.filter(m => {
    if (connOverviewVillage !== 'all' && m.villageName !== connOverviewVillage) return false;
    if (connOverviewNoConn && m.connectedCount > 0) return false;
    if (!sq) return true;
    if (normStr(m.name).includes(sq)) return true;
    if (normStr(m.memberId).includes(sq)) return true;
    // Tìm theo tên/id phiên chợ liên quan
    if (m.connectedPeers?.some(p =>
      p.relatedBooths?.some(b => normStr(b.boothId).includes(sq) || normStr(b.offer).includes(sq))
    )) return true;
    return false;
  });

  if (connOverviewSort === 'most') filtered.sort((a, b) => b.connectedCount - a.connectedCount);
  else if (connOverviewSort === 'least') filtered.sort((a, b) => a.connectedCount - b.connectedCount);
  else if (connOverviewSort === 'az') filtered.sort((a, b) => normStr(a.name).localeCompare(normStr(b.name)));
  else if (connOverviewSort === 'za') filtered.sort((a, b) => normStr(b.name).localeCompare(normStr(a.name)));

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / CONN_OVERVIEW_PAGE_SIZE));
  const page = Math.min(connOverviewPage, totalPages);
  const pageItems = filtered.slice((page - 1) * CONN_OVERVIEW_PAGE_SIZE, page * CONN_OVERVIEW_PAGE_SIZE);
  const startIdx = (page - 1) * CONN_OVERVIEW_PAGE_SIZE + 1;
  const endIdx = Math.min(page * CONN_OVERVIEW_PAGE_SIZE, total);

  // ---- Bảng ----
  let tableBody = '';
  if (pageItems.length === 0) {
    tableBody = '<tr><td colspan="4" style="text-align:center;padding:28px;color:#94a3b8">'
      + icon('users', 20) + ' Không tìm thấy thành viên phù hợp.</td></tr>';
  } else {
    pageItems.forEach(m => {
      const isExpanded = connOverviewExpandedId === m.memberId;
      const avHtml = m.avatarUrl
        ? '<img src="' + esc(m.avatarUrl) + '" alt="' + esc(m.name) + '" class="conn-ov-avatar" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">'
          + '<div class="conn-ov-avatar conn-ov-avatar-fb" style="display:none">' + esc((m.name || 'A')[0].toUpperCase()) + '</div>'
        : '<div class="conn-ov-avatar conn-ov-avatar-fb">' + esc((m.name || 'A')[0].toUpperCase()) + '</div>';
      const villageDot = '<span class="conn-ov-village-dot"></span>';
      const countBadge = m.connectedCount > 0
        ? '<span class="conn-ov-count-badge">' + m.connectedCount + '</span>'
        : '<span class="conn-ov-count-zero">0</span>';
      const chevron = '<svg class="conn-ov-chevron' + (isExpanded ? ' expanded' : '') + '" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="m6 9 6 6 6-6"/></svg>';

      tableBody += '<tr class="conn-ov-row' + (isExpanded ? ' expanded' : '') + '" data-action="toggle-conn-ov-row" data-id="' + esc(m.memberId) + '">'
        + '<td><div class="conn-ov-member-cell">' + avHtml + '<div><div class="conn-ov-name">' + esc(m.name) + '</div>'
        + (m.office ? '<div class="conn-ov-office">' + esc(m.office) + '</div>' : '') + '</div></div></td>'
        + '<td><div class="conn-ov-village-cell">' + villageDot + esc(m.villageName || '—') + '</div></td>'
        + '<td style="text-align:center">' + countBadge + '</td>'
        + '<td style="text-align:center;width:40px">' + (m.connectedCount > 0 ? chevron : '') + '</td>'
        + '</tr>';

      if (isExpanded && m.connectedPeers?.length > 0) {
        tableBody += '<tr class="conn-ov-expand-row"><td colspan="4">'
          + '<div class="conn-ov-expand">'
          + '<div class="conn-ov-expand-label">Đã kết nối với ' + m.connectedPeers.length + ' thành viên:</div>'
          + '<div class="conn-ov-grid">'
          + m.connectedPeers.map(peer => {
              const boothKey = m.memberId + '__' + peer.memberId;
              const boothExpanded = connOverviewBoothExpandedId === boothKey;
              const pAvHtml = peer.avatarUrl
                ? '<img src="' + esc(peer.avatarUrl) + '" alt="' + esc(peer.name) + '" class="conn-ov-card-avatar" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">'
                  + '<div class="conn-ov-card-avatar conn-ov-avatar-fb" style="display:none">' + esc((peer.name || 'A')[0].toUpperCase()) + '</div>'
                : '<div class="conn-ov-card-avatar conn-ov-avatar-fb">' + esc((peer.name || 'A')[0].toUpperCase()) + '</div>';
              const boothsHtml = peer.relatedBooths?.length
                ? '<div class="conn-ov-booth-toggle" data-action="toggle-conn-booth" data-id="' + esc(boothKey) + '">'
                    + icon('grid', 12)
                    + ' Phiên chợ liên quan (' + peer.relatedBooths.length + ')'
                    + '<svg class="conn-ov-chevron-sm' + (boothExpanded ? ' expanded' : '') + '" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>'
                    + '</div>'
                    + (boothExpanded
                      ? '<div class="conn-ov-booth-list">'
                        + peer.relatedBooths.map(b => {
                            const boothTitle = b.offer || b.offerTag || '';
                            return '<div class="conn-ov-booth-item"' + (boothTitle ? ' title="' + esc(boothTitle) + '"' : '') + '><b>' + esc(b.boothId) + '</b>'
                              + (boothTitle ? ' – <span>' + esc(boothTitle.length > 60 ? boothTitle.slice(0, 58) + '…' : boothTitle) + '</span>' : '')
                              + '</div>';
                          }).join('')
                        + '</div>'
                      : '')
                : '<div class="conn-ov-no-booth">Không có phiên chợ liên kết</div>';
              return '<div class="conn-ov-card">'
                + '<div class="conn-ov-card-top">' + pAvHtml
                + '<div class="conn-ov-card-info"><div class="conn-ov-card-name">' + esc(peer.name) + '</div>'
                + '<div class="conn-ov-card-village"><span class="conn-ov-village-dot"></span>' + esc(peer.villageName || '—') + '</div>'
                + '</div></div>'
                + '<div class="conn-ov-card-status">' + icon('checkCircle', 13) + ' Đã kết nối</div>'
                + boothsHtml
                + '</div>';
            }).join('')
          + '</div></div></td></tr>';
      }
    });
  }

  const table = '<div class="conn-ov-table-wrap"><table class="conn-overview-table">'
    + '<thead><tr>'
    + '<th>THÀNH VIÊN</th><th>LÀNG</th><th style="text-align:center">SỐ KẾT NỐI</th><th></th>'
    + '</tr></thead>'
    + '<tbody>' + tableBody + '</tbody>'
    + '</table></div>';

  // ---- Phân trang ----
  let pagination = '';
  if (totalPages > 1) {
    pagination = '<div class="conn-ov-pagination">'
      + '<span class="conn-ov-pagination-info">Hiển thị ' + startIdx + '–' + endIdx + ' / ' + total + '</span>'
      + '<div class="conn-ov-pagination-btns">'
      + '<button class="conn-ov-page-btn" data-action="set-conn-ov-page" data-page="' + (page - 1) + '"' + (page <= 1 ? ' disabled' : '') + '>‹</button>';
    for (let p = 1; p <= totalPages; p++) {
      pagination += '<button class="conn-ov-page-btn' + (p === page ? ' active' : '') + '" data-action="set-conn-ov-page" data-page="' + p + '">' + p + '</button>';
    }
    pagination += '<button class="conn-ov-page-btn" data-action="set-conn-ov-page" data-page="' + (page + 1) + '"' + (page >= totalPages ? ' disabled' : '') + '>›</button>'
      + '</div></div>';
  } else if (total > 0) {
    pagination = '<div class="conn-ov-pagination"><span class="conn-ov-pagination-info">Hiển thị ' + total + ' thành viên</span></div>';
  }

  return table + pagination;
}

// ===== NETWORK (Bản đồ kết nối) =====
function network() {
  const isPersonal = liveNetworkMode === 'personal';

  if (isPersonal) {
    return networkPersonal();
  }
  return networkVillage();
}

// ===== NETWORK – Cá nhân (user hiện tại ở trung tâm) =====
function networkPersonal() {
  const me = LIVE.currentUser;
  const W = 1020, H = 700;
  const CX = W / 2, CY = H / 2;
  const R_CENTER = 70;   // bán kính avatar trung tâm
  const R_NODE   = 44;   // bán kính avatar xung quanh
  const R_ORBIT  = 270;  // quỹ đạo các node xung quanh

  // ---- Thu thập kết nối của user hiện tại ----
  const allConns = Array.isArray(LIVE.connections) ? LIVE.connections : [];
  const myMemberId = me?.memberId || me?.id || '';

  // Build danh sách các peer (người kết nối)
  const peers = [];
  allConns.forEach(c => {
    if (c.connectionType !== 'personal') return;
    const status = c.status; // 'Accepted' | 'Pending' | 'Rejected' | 'Cancelled'
    if (status !== 'Accepted' && status !== 'Pending') return;
    // Chỉ hiển thị các kết nối mà chính user hiện tại là một bên tham gia (tránh admin thấy kết nối của người khác trên bản đồ cá nhân)
    const isSeekerSide = Boolean(myMemberId) && (c.requestedBy === myMemberId || c.sourceBooth?.authorMemberId === myMemberId);
    const isTargetSide = Boolean(myMemberId) && (c.targetMemberId === myMemberId || c.targetBooth?.authorMemberId === myMemberId || c.approverMemberId === myMemberId);
    if (!isSeekerSide && !isTargetSide) return;

    // Xác định phía bên kia
    let peerId, peerName, peerVillage, peerAvatar;
    if (isSeekerSide) {
      peerId      = c.targetMemberId || c.targetBooth?.authorMemberId || '';
      peerName    = c.targetName || c.targetBooth?.authorName || '';
      peerVillage = c.targetVillageName || c.targetBooth?.authorVillageName || c.targetVillageId || '';
      peerAvatar  = c.targetAvatarUrl || c.targetBooth?.authorAvatarUrl || '';
    } else {
      peerId      = c.requestedBy || c.sourceBooth?.authorMemberId || '';
      peerName    = c.seekerName || c.sourceBooth?.authorName || '';
      peerVillage = c.seekerVillageName || c.sourceBooth?.authorVillageName || c.sourceVillageId || '';
      peerAvatar  = c.seekerAvatarUrl || c.sourceBooth?.authorAvatarUrl || '';
    }

    // Luôn tra cứu LIVE.members để lấy họ tên đầy đủ và làng chuẩn có emoji
    const lm = (LIVE.members || []).find(m => m.id === peerId || m.memberId === peerId);
    if (lm) {
      if (!peerName || peerName === peerId || /^MEM-\d+$/i.test(peerName)) {
        peerName = lm.name || peerId;
      }
      if (!peerVillage || /^VIL-\d+$/i.test(peerVillage)) {
        peerVillage = lm.villageName || '';
      }
      if (!peerAvatar) {
        peerAvatar = lm.avatarUrl || '';
      }
    }

    // Fallback: tìm qua LIVE.booths nếu vẫn còn ID thô (trường hợp memberId không khớp)
    if (!peerName || /^MEM-\d+$/i.test(peerName)) {
      const peerBoothRecId = isSeekerSide
        ? (c.targetBoothRecordId || c.targetBooth?.recordId)
        : (c.sourceBoothRecordId || c.sourceBooth?.recordId);
      const lb = peerBoothRecId
        ? (LIVE.booths || []).find(b => b.recordId === peerBoothRecId)
        : (peerId ? (LIVE.booths || []).find(b => b.authorMemberId === peerId) : null);
      if (lb) {
        if (!peerName || /^MEM-\d+$/i.test(peerName)) peerName = lb.authorName || peerName;
        if (!peerVillage || /^VIL-\d+$/i.test(peerVillage)) peerVillage = lb.authorVillageName || lb.villageName || peerVillage;
        if (!peerAvatar) peerAvatar = lb.authorAvatarUrl || '';
        if (!peerId && lb.authorMemberId) peerId = lb.authorMemberId;
      }
    }

    // Nếu village vẫn là mã VIL-xxx thì tìm trong LIVE.villages
    if (peerVillage && /^VIL-\d+$/i.test(peerVillage)) {
      const lv = (LIVE.villages || []).find(v => v.id === peerVillage);
      if (lv) peerVillage = lv.name;
    }

    if (!peerName || /^MEM-\d+$/i.test(peerName)) peerName = peerId || 'Thành viên';

    peers.push({ peerId, peerName, peerVillage, peerAvatar, status, connId: c.id || c.connectionId, connObj: c });
  });

  // Nếu chưa đăng nhập hoặc chưa có kết nối
  const togglePill = buildNetworkTogglePill(true);

  if (!me) {
    const svgEmpty = '<svg class="network-map-svg" viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;height:auto;display:block">'
      + buildPersonalDefs()
      + buildPersonalOrbits(CX, CY, R_ORBIT)
      + buildCenterBadgeGuest(CX, CY, R_CENTER)
      + '</svg>';
    return buildNetworkPage(togglePill, svgEmpty,
      '<div class="network-bottom-caption">Đăng nhập để xem kết nối cá nhân của bạn</div>',
      buildNetworkLegendPersonal(0, 0),
      '<div class="empty">' + icon('users', 32) + '<b>Bạn chưa đăng nhập</b><p>Vui lòng đăng nhập để xem bản đồ kết nối cá nhân.</p><button class="btn btn-primary" data-action="re-login">Đăng nhập ngay</button></div>'
    );
  }

  const accepted = peers.filter(p => p.status === 'Accepted');
  const pending  = peers.filter(p => p.status === 'Pending');
  const total    = peers.length;

  // ---- SVG defs ----
  const defs = buildPersonalDefs();

  // ---- Orbits ----
  const orbits = buildPersonalOrbits(CX, CY, R_ORBIT);

  // ---- Node coords xung quanh ----
  function peerCoord(i, n) {
    const angle = -Math.PI / 2 + i * (2 * Math.PI / n);
    return { x: CX + R_ORBIT * Math.cos(angle), y: CY + R_ORBIT * Math.sin(angle) };
  }

  // ---- Lines & Arrows kết nối giữa user trung tâm và các peer ----
  let lines = '';
  peers.forEach((p, i) => {
    const q = peerCoord(i, Math.max(total, 1));
    const isAccepted = p.status === 'Accepted';

    const angle = Math.atan2(q.y - CY, q.x - CX);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    // Điểm bắt đầu từ rìa vòng tròn ngoài của avatar trung tâm
    // Khi sin > 0.15 (hướng xuống dưới), tránh đè lên nhãn tên & làng của user trung tâm
    const startDist = 82 + Math.max(0, sin) * 36;
    const x1 = CX + startDist * cos;
    const y1 = CY + startDist * sin;

    // Điểm kết thúc: Ngay trước rìa ngoài của node peer.
    // Khi sin < -0.15 (hướng lên trên), peer node có nhãn tên & làng nằm ở phía dưới avatar,
    // nên dừng đường nối và mũi tên trước nhãn text để không bao giờ đè lên tên hay làng
    const stopDist = 56 + Math.max(0, -sin) * 40;
    const x2 = q.x - stopDist * cos;
    const y2 = q.y - stopDist * sin;

    if (isAccepted) {
      // Đã kết nối: Đường nét liền Cyan sáng (#00e5ff), mũi tên kết nối 2 chiều
      lines += '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="#00e5ff" stroke-width="2.5" stroke-opacity="0.9" stroke-linecap="round" marker-end="url(#arrowAcceptedEnd)" marker-start="url(#arrowAcceptedStart)"/>';
    } else {
      // Chờ duyệt: Đường nét đứt màu Vàng (#f2c657), mũi tên hướng tới người nhận
      lines += '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="#f2c657" stroke-width="2" stroke-opacity="0.95" stroke-dasharray="7 5" stroke-linecap="round" marker-end="url(#arrowPendingEnd)"/>';

      // Badge Chờ duyệt ở giữa đường nối
      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2;
      lines += '<g transform="translate(' + mx.toFixed(1) + ',' + my.toFixed(1) + ')">'
        + '<rect x="-30" y="-11" width="60" height="22" rx="11" fill="#f2c657" opacity="0.95" filter="url(#nodeGlow2)"/>'
        + '<text x="0" y="4.5" text-anchor="middle" fill="#0b192c" font-size="9.5" font-weight="700" font-family="inherit">Chờ duyệt</text>'
        + '</g>';
    }
  });

  // ---- Center node (user hiện tại) ----
  const myName    = me.name || 'Bạn';
  // Giữ nguyên villageName đầy đủ (có emoji), không strip và không hardcode emoji riêng
  const myVillage = me.villageName || '';
  const myAvatar  = me.avatarUrl || '';
  const myInitial = myName[0]?.toUpperCase() || 'A';

  const centerNode = '<g filter="url(#centerGlow2)">'
    // Vòng sáng ngoài
    + '<circle cx="' + CX + '" cy="' + CY + '" r="' + (R_CENTER + 20) + '" fill="none" stroke="#1a7de8" stroke-opacity="0.25" stroke-width="1.5"/>'
    + '<circle cx="' + CX + '" cy="' + CY + '" r="' + (R_CENTER + 10) + '" fill="none" stroke="#1a7de8" stroke-opacity="0.4" stroke-width="1"/>'
    // Avatar circle
    + '<circle cx="' + CX + '" cy="' + CY + '" r="' + R_CENTER + '" fill="#0d2644" stroke="#1a7de8" stroke-width="3"/>'
    + (myAvatar
      ? '<image x="' + (CX - R_CENTER) + '" y="' + (CY - R_CENTER) + '" width="' + (R_CENTER * 2) + '" height="' + (R_CENTER * 2) + '" href="' + esc(myAvatar) + '" clip-path="circle(' + R_CENTER + 'px at ' + R_CENTER + 'px ' + R_CENTER + 'px)" preserveAspectRatio="xMidYMid slice"/>'
      : '<text x="' + CX + '" y="' + (CY + 12) + '" text-anchor="middle" fill="#fff" font-size="32" font-weight="700">' + esc(myInitial) + '</text>')
    // Tên
    + '<text x="' + CX + '" y="' + (CY + R_CENTER + 22) + '" text-anchor="middle" fill="#ffffff" font-size="13" font-weight="700" font-family="inherit">' + esc(myName) + '</text>'
    + (myVillage ? '<text x="' + CX + '" y="' + (CY + R_CENTER + 37) + '" text-anchor="middle" fill="#4fc3f7" font-size="10.5" font-family="inherit">' + esc(myVillage) + '</text>' : '')
    + '</g>';

  // ---- Peer nodes ----
  let peerNodes = '';
  peers.forEach((p, i) => {
    const q = peerCoord(i, Math.max(total, 1));
    const isAccepted = p.status === 'Accepted';
    const strokeColor = isAccepted ? '#1a7de8' : '#f2c657';
    const strokeWidth = isAccepted ? '2.5' : '2';
    const shortName = p.peerName.length > 14 ? p.peerName.slice(0, 13) + '…' : p.peerName;
    // Giữ nguyên villageName đầy đủ (emoji + tên), cắt ngắn nếu quá dài
    const shortVil  = (p.peerVillage || '').slice(0, 18);
    const initial   = (p.peerName[0] || 'A').toUpperCase();

    peerNodes += '<g data-action="open-peer-node" data-id="' + esc(p.peerId) + '" data-conn-id="' + esc(p.connId) + '" style="cursor:pointer" filter="url(#nodeGlow2)">'
      + '<circle cx="' + q.x.toFixed(1) + '" cy="' + q.y.toFixed(1) + '" r="' + (R_NODE + 6) + '" fill="none" stroke="' + strokeColor + '" stroke-opacity="0.3" stroke-width="1"/>'
      + '<circle cx="' + q.x.toFixed(1) + '" cy="' + q.y.toFixed(1) + '" r="' + R_NODE + '" fill="#0d2644" stroke="' + strokeColor + '" stroke-width="' + strokeWidth + '"/>'
      + (p.peerAvatar
        ? '<image x="' + (q.x - R_NODE).toFixed(1) + '" y="' + (q.y - R_NODE).toFixed(1) + '" width="' + (R_NODE * 2) + '" height="' + (R_NODE * 2) + '" href="' + esc(p.peerAvatar) + '" clip-path="circle(' + R_NODE + 'px at ' + R_NODE + 'px ' + R_NODE + 'px)" preserveAspectRatio="xMidYMid slice"/>'
        : '<text x="' + q.x.toFixed(1) + '" y="' + (q.y + 6).toFixed(1) + '" text-anchor="middle" fill="#fff" font-size="20" font-weight="700">' + esc(initial) + '</text>')
      + '<text x="' + q.x.toFixed(1) + '" y="' + (q.y + R_NODE + 18) + '" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="700" font-family="inherit">' + esc(shortName) + '</text>'
      + (shortVil ? '<text x="' + q.x.toFixed(1) + '" y="' + (q.y + R_NODE + 31) + '" text-anchor="middle" fill="#4fc3f7" font-size="9.5" font-family="inherit">' + esc(shortVil) + '</text>' : '')
      + '</g>';
  });

  // ---- Trạng thái rỗng (chưa có kết nối) ----
  let emptyOverlay = '';
  if (total === 0) {
    emptyOverlay = '<text x="' + CX + '" y="' + (CY - R_CENTER - 30) + '" text-anchor="middle" fill="#8aaecc" font-size="12" font-family="inherit">Chưa có kết nối nào</text>';
  }

  const svgEl = '<svg class="network-map-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Bản đồ kết nối cá nhân AXANH" style="width:100%;height:auto;display:block">'
    + defs + orbits + lines + centerNode + peerNodes + emptyOverlay + '</svg>';

  const caption = '<div class="network-bottom-caption">'
    + (accepted.length > 0 ? accepted.length + ' kết nối đang hoạt động' : 'Chưa có kết nối nào')
    + (pending.length > 0 ? ' · ' + pending.length + ' chờ duyệt (cũ)' : '')
    + ' · Nhấn vào avatar để xem gian hàng tri thức'
    + '</div>';

  const legend = buildNetworkLegendPersonal(accepted.length, pending.length);

  return buildNetworkPage(togglePill, svgEl, caption, legend, '');
}

// ===== NETWORK – Làng (dữ liệu Phiên chợ tri thức) =====
function networkVillage() {
  const W = 1020, H = 660;
  const CX = 510, CY = 345, RX = 380, RY = 210;
  const villageBooths = (LIVE.booths || []).filter(b => b.boothType === 'village');
  const liveVillages = LIVE.villages || [];
  const villageNodes = [...new Map(villageBooths.map(booth => {
    const village = liveVillages.find(v =>
      (booth.villageId && v.id === booth.villageId) ||
      v.name === booth.villageName ||
      v.name === booth.authorVillageName
    );
    return village ? [village.id, village] : null;
  }).filter(Boolean))].map(([, village]) => village);

  function nodeCoord(i, total) {
    const angle = -Math.PI / 2 + i * (2 * Math.PI / total);
    return { x: CX + RX * Math.cos(angle), y: CY + RY * Math.sin(angle) };
  }

  const coords = {}, nameMap = {};
  villageNodes.forEach((v, i) => {
    const pt = nodeCoord(i, villageNodes.length);
    coords[v.id] = pt;
    nameMap[v.id] = v.name;
  });

  const activeLines = [];
  (LIVE.connections || []).forEach(c => {
    if (c.connectionType !== 'village' || !['Accepted', 'Pending'].includes(c.status)) return;
    const a = getVillageNodeCoords(
      c.sourceVillageId || c.sourceBooth?.villageId,
      c.sourceVillageName || c.sourceBooth?.villageName,
      c.sourceVillageId || c.sourceBooth?.villageId,
      coords,
      nameMap
    );
    const b = getVillageNodeCoords(
      c.targetVillageId || c.targetBooth?.villageId,
      c.targetVillageName || c.targetBooth?.villageName,
      c.targetVillageId || c.targetBooth?.villageId,
      coords,
      nameMap
    );
    if (a && b && (a.x !== b.x || a.y !== b.y)) activeLines.push({ c, a, b });
  });

  const defs = '<defs>'
    + '<radialGradient id="netCenterGrad" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#143c6d"/><stop offset="100%" stop-color="#071932"/></radialGradient>'
    + '<linearGradient id="netline" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#f2c657"/><stop offset="1" stop-color="#59dccd"/></linearGradient>'
    + '<filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'
    + '<filter id="centerGlow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="8" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'
    + '<marker id="vilArrowAcceptedEnd" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto">'
    + '<path d="M 0 1.5 L 9 5 L 0 8.5 L 2.5 5 z" fill="#59dccd"/>'
    + '</marker>'
    + '<marker id="vilArrowAcceptedStart" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto">'
    + '<path d="M 9 1.5 L 0 5 L 9 8.5 L 6.5 5 z" fill="#59dccd"/>'
    + '</marker>'
    + '<marker id="vilArrowPendingEnd" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto">'
    + '<path d="M 0 1.5 L 9 5 L 0 8.5 L 2.5 5 z" fill="#f2c657"/>'
    + '</marker>'
    + '</defs>';

  const orbits = '<ellipse cx="' + CX + '" cy="' + CY + '" rx="' + RX + '" ry="' + RY + '" fill="none" stroke="#ffffff14" stroke-width="1"/>'
    + '<ellipse cx="' + CX + '" cy="' + CY + '" rx="' + (RX * 0.6) + '" ry="' + (RY * 0.6) + '" fill="none" stroke="#ffffff08" stroke-width="1"/>';

  const badge = '<circle cx="' + CX + '" cy="' + CY + '" r="95" fill="none" stroke="#3a7bd5" stroke-opacity=".18" stroke-width="1"/>'
    + '<circle cx="' + CX + '" cy="' + CY + '" r="83" fill="url(#netCenterGrad)" stroke="#4a8fd4" stroke-opacity=".35" stroke-width="1.5" filter="url(#centerGlow)"/>'
    + '<text x="' + CX + '" y="' + (CY - 14) + '" text-anchor="middle" fill="#ffffff" font-size="22" font-weight="900" letter-spacing="3" font-family="inherit">AXANH</text>'
    + '<text x="' + CX + '" y="' + (CY + 8) + '" text-anchor="middle" fill="#f2bd43" font-size="12" font-weight="700" letter-spacing="2" font-family="inherit">KNOWLEDGE</text>'
    + '<text x="' + CX + '" y="' + (CY + 26) + '" text-anchor="middle" fill="#8aaecc" font-size="11" letter-spacing="1.5" font-family="inherit">EXCHANGE</text>';

  const lines = activeLines.map(({ c, a, b }) => {
    const mx = (a.x + b.x) / 2 + (CX - (a.x + b.x) / 2) * 0.4;
    const my = (a.y + b.y) / 2 + (CY - (a.y + b.y) / 2) * 0.4;
    const angA = Math.atan2(my - a.y, mx - a.x);
    const angB = Math.atan2(my - b.y, mx - b.x);
    const offA = 46 + Math.max(0, Math.sin(angA) - 0.35) * 28;
    const offB = 46 + Math.max(0, Math.sin(angB) - 0.35) * 28;
    const sx = a.x + offA * Math.cos(angA);
    const sy = a.y + offA * Math.sin(angA);
    const ex = b.x + offB * Math.cos(angB);
    const ey = b.y + offB * Math.sin(angB);
    const isAcc = c.status === 'Accepted';
    const markerAttrs = isAcc
      ? ' marker-start="url(#vilArrowAcceptedStart)" marker-end="url(#vilArrowAcceptedEnd)"'
      : ' marker-end="url(#vilArrowPendingEnd)"';
    return '<path d="M ' + sx.toFixed(1) + ' ' + sy.toFixed(1) + ' Q ' + mx.toFixed(1) + ' ' + my.toFixed(1) + ' ' + ex.toFixed(1) + ' ' + ey.toFixed(1) + '" fill="none" stroke="' + (isAcc ? 'url(#netline)' : '#f2c657') + '" stroke-width="' + (isAcc ? '3' : '2') + '"' + (isAcc ? '' : ' stroke-dasharray="6 5"') + ' opacity=".85" stroke-linecap="round"' + markerAttrs + '/>';
  }).join('');

  const nodes = villageNodes.map((v, i) => {
    const q = nodeCoord(i, villageNodes.length);
    const iconSrc = v.iconUrl || '';
    const shortName = esc((v.name || '').replace(/^\S+\s*/, ''));
    return '<g data-action="open-village-node" data-id="' + esc(v.id) + '" style="cursor:pointer" filter="url(#nodeGlow)">'
      + '<circle cx="' + q.x.toFixed(1) + '" cy="' + q.y.toFixed(1) + '" r="38" fill="#f8f4e8" stroke="#d4aa50" stroke-width="2.5"/>'
      + (iconSrc ? '<image x="' + (q.x - 32).toFixed(1) + '" y="' + (q.y - 32).toFixed(1) + '" width="64" height="64" href="' + esc(iconSrc) + '" clip-path="circle(32px at 32px 32px)" preserveAspectRatio="xMidYMid slice"/>'
        : '<text x="' + q.x.toFixed(1) + '" y="' + (q.y + 6).toFixed(1) + '" text-anchor="middle" fill="#1a3a6e" font-size="18" font-weight="900">AX</text>')
      + '<text x="' + q.x.toFixed(1) + '" y="' + (q.y + 56).toFixed(1) + '" text-anchor="middle" fill="#c8ddf5" font-size="12" font-weight="700" font-family="inherit">' + shortName + '</text>'
      + '</g>';
  }).join('');
  const emptyOverlay = villageNodes.length === 0
    ? '<text x="' + CX + '" y="' + (CY + 125) + '" text-anchor="middle" fill="#8aaecc" font-size="12" font-family="inherit">'
      + (LIVE.boothsLoading ? 'Đang tải gian hàng Làng…' : 'Chưa có gian hàng Làng từ Phiên chợ tri thức')
      + '</text>'
    : '';

  const svgEl = '<svg class="network-map-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Bản đồ kết nối Làng–Làng AXANH" style="width:100%;height:auto;display:block">'
    + defs + orbits + lines + badge + nodes + emptyOverlay + '</svg>';

  const hasLegacyPending = activeLines.some(({ c }) => c.status === 'Pending');
  const caption = '<div class="network-bottom-caption">Đường nối lấy từ kết nối Làng–Làng trên Lark Base · Nhấn vào Làng để xem các phiên chợ đã đăng ký</div>';
  const legend = '<div class="network-legend">'
    + '<span><i class="dot" style="background:#d4aa50"></i>' + villageNodes.length + ' Làng có gian hàng</span>'
    + '<span><i class="dot" style="background:#59dccd"></i>Đã kết nối</span>'
    + (hasLegacyPending ? '<span><i class="dot" style="background:#f2c657"></i>Chờ duyệt (cũ)</span>' : '')
    + '</div>';

  return buildNetworkPage(buildNetworkTogglePill(false), svgEl, caption, legend, '');
}

function openVillageConnectionsModal(boothId) {
  const booth = LIVE.booths.find(b => b.boothId === boothId || b.recordId === boothId);
  if (!booth) {
    toast('Không tìm thấy gian hàng Làng để tải kết nối.', 'warn');
    return;
  }
  const connections = getVillageBoothConnections(booth);
  const body = connections.length
    ? '<div style="display:flex;flex-direction:column;gap:8px">'
      + connections.map(c => {
          const connected = c.status === 'Accepted';
          const date = c.createdAt ? new Date(c.createdAt).toLocaleDateString('vi-VN') : '—';
          const canCancel = connected && c.connObj && canCancelConnection(c.connObj);
          return '<div style="display:flex;align-items:center;gap:10px;padding:8px 4px;border-bottom:1px solid #eef2f7">'
            + villageLogoHtml(c.iconUrl, c.name, 40)
            + '<div style="flex:1;min-width:0"><b style="display:block;font-size:13px">' + esc(c.name) + '</b><small style="color:#64748b">Ngày kết nối: ' + esc(date) + '</small></div>'
            + '<div style="display:flex;align-items:center;gap:6px;flex-shrink:0">'
            + (connected
                ? renderAcceptedBadgeOrCancelBtn({ connId: c.connObj.id, label: c.name, type: 'village', canCancel, small: true, iconSize: 12 })
                : '<span class="conn-status-legacy">◷ Chờ duyệt (cũ)</span>')
            + '</div></div>';
        }).join('')
      + '</div>'
    : '<div class="empty"><b>Chưa có Làng kết nối</b><p>Các kết nối Làng–Làng của gian hàng này sẽ hiển thị tại đây.</p></div>';
  openModal(
    'Làng tham gia phiên này (' + connections.length + ')',
    body,
    '<button class="btn" data-action="close-modal">Đóng</button>'
  );
}

function openVillageBoothsModal(villageId) {
  const village = (LIVE.villages || []).find(v => v.id === villageId);
  const villageName = village?.name || villageId || 'Làng';
  const booths = (LIVE.booths || []).filter(b => {
    if (b.boothType !== 'village') return false;
    if (villageId && b.villageId === villageId) return true;
    return village?.name && (b.villageName === village.name || b.authorVillageName === village.name);
  });

  const headerHtml = '<div class="person-head" style="margin-bottom:16px;display:flex;align-items:center;gap:12px">'
    + villageLogoHtml(village?.iconUrl, villageName, 56)
    + '<div style="flex:1;min-width:0"><b style="font-size:16px">' + esc(villageName) + '</b>'
    + '<small style="display:block;color:#64748b">' + esc(village?.office || '—')
    + (village?.leader ? ' · Trưởng làng: ' + esc(village.leader) : '') + '</small></div>'
    + '<span class="kind-tag" style="background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe">' + booths.length + ' phiên chợ</span>'
    + '</div>';

  const listHtml = booths.length
    ? '<div style="display:flex;flex-direction:column;gap:12px">'
      + booths.map(b => {
          const slotText = formatPreferredSlot(b.availability);
          const dateText = b.createdAt ? new Date(b.createdAt).toLocaleDateString('vi-VN') : '';
          return '<div style="border:1px solid #e2e8f0;border-radius:12px;padding:14px;background:#f8fafc">'
            + '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px">'
            + '<span class="kind-tag" style="background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe">' + esc(b.boothId || 'LÀNG') + '</span>'
            + '<small style="color:#64748b">Đăng ký bởi: <b style="color:#0f172a">' + esc(b.authorName || 'Thành viên') + '</b>' + (dateText ? ' · ' + esc(dateText) : '') + '</small>'
            + '</div>'
            + '<div class="kv"><span>Có thể chia sẻ</span><b>' + esc(b.offer || 'Chưa cập nhật') + (b.offerTag ? ' <span class="tag teal" style="margin-left:4px">' + esc(b.offerTag) + '</span>' : '') + '</b></div>'
            + '<div class="kv"><span>Muốn học</span><b>' + esc(b.need || 'Chưa cập nhật') + (b.needTag ? ' <span class="tag gold" style="margin-left:4px">' + esc(b.needTag) + '</span>' : '') + '</b></div>'
            + (b.preferredFormat ? '<div class="kv"><span>Hình thức</span><b>' + esc(b.preferredFormat) + '</b></div>' : '')
            + (slotText ? '<div class="kv"><span>Khung giờ ưu tiên</span><b>' + esc(slotText) + '</b></div>' : '')
            + (b.outcome ? '<div class="kv"><span>Kết quả mong muốn</span><b>' + esc(b.outcome) + '</b></div>' : '')
            + '</div>';
        }).join('')
      + '</div>'
    : '<div class="empty"><b>Chưa có phiên chợ nào</b><p>Làng này chưa đăng ký gian hàng Làng trên Phiên chợ tri thức.</p></div>';

  openModal(
    'Phiên chợ tri thức · ' + esc(villageName),
    headerHtml + listHtml,
    '<button type="button" class="btn" data-action="close-modal">Đóng</button>'
    + '<button type="button" class="btn btn-primary" data-action="open-village-market">' + icon('network', 14) + ' Xem Gian hàng Làng</button>'
  );
}

// ===== NETWORK – Helper functions =====
function buildNetworkTogglePill(isPersonal) {
  // SVG icons inline, kích thước cứng 16x16, không phụ thuộc hàm icon()
  const svgNetwork = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;flex-shrink:0;overflow:hidden" aria-hidden="true"><circle cx="12" cy="12" r="3"/><circle cx="4" cy="4" r="2"/><circle cx="20" cy="4" r="2"/><circle cx="4" cy="20" r="2"/><circle cx="20" cy="20" r="2"/><path d="M6 6l4 4m4 4 4 4M18 6l-4 4M10 14l-4 4"/></svg>';
  const svgUsers   = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;flex-shrink:0;overflow:hidden" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>';
  return '<div class="network-top-bar">'
    + '<div class="network-toggle-pill">'
    + '<button class="network-toggle-btn' + (!isPersonal ? ' active' : '') + '" data-action="set-network-mode" data-mode="village" type="button">'
    + svgNetwork
    + '<span class="toggle-label">Bản đồ Làng–Làng</span>'
    + '</button>'
    + '<button class="network-toggle-btn' + (isPersonal ? ' active' : '') + '" data-action="set-network-mode" data-mode="personal" type="button">'
    + svgUsers
    + '<span class="toggle-label">Cá nhân–Cá nhân</span>'
    + '</button>'
    + '</div>'
    + '</div>';
}

function buildPersonalDefs() {
  return '<defs>'
    + '<radialGradient id="personalCenterGrad" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#1a4a8a"/><stop offset="100%" stop-color="#071932"/></radialGradient>'
    + '<filter id="centerGlow2" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="10" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'
    + '<filter id="nodeGlow2" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'
    // Mũi tên Accepted (Cyan #00e5ff) hướng tới node
    + '<marker id="arrowAcceptedEnd" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">'
    + '<path d="M 0 1.5 L 9 5 L 0 8.5 L 2.5 5 z" fill="#00e5ff"/>'
    + '</marker>'
    // Mũi tên Accepted (Cyan #00e5ff) hướng về phía trung tâm (kết nối 2 chiều)
    + '<marker id="arrowAcceptedStart" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="6" markerHeight="6" orient="auto">'
    + '<path d="M 9 1.5 L 0 5 L 9 8.5 L 6.5 5 z" fill="#00e5ff"/>'
    + '</marker>'
    // Mũi tên Pending (Gold #f2c657) hướng tới người nhận
    + '<marker id="arrowPendingEnd" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">'
    + '<path d="M 0 1.5 L 9 5 L 0 8.5 L 2.5 5 z" fill="#f2c657"/>'
    + '</marker>'
    + '</defs>';
}

function buildPersonalOrbits(cx, cy, r) {
  return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="rgba(26,125,232,0.12)" stroke-width="1"/>'
    + '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 0.6) + '" fill="none" stroke="rgba(26,125,232,0.07)" stroke-width="1"/>'
    + '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 0.3) + '" fill="none" stroke="rgba(26,125,232,0.07)" stroke-width="1"/>';
}

function buildCenterBadgeGuest(cx, cy, r) {
  return '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r + 18) + '" fill="none" stroke="#1a7de8" stroke-opacity="0.2" stroke-width="1.5"/>'
    + '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="#0d2644" stroke="#1a7de8" stroke-width="2.5"/>'
    + '<text x="' + cx + '" y="' + (cy + 10) + '" text-anchor="middle" fill="#8aaecc" font-size="22">👤</text>'
    + '<text x="' + cx + '" y="' + (cy + r + 22) + '" text-anchor="middle" fill="#8aaecc" font-size="11" font-family="inherit">Chưa đăng nhập</text>';
}

function buildNetworkLegendPersonal(acceptedCount, pendingCount) {
  return '<div class="network-legend">'
    + '<span><i class="dot" style="background:#1a7de8"></i>' + acceptedCount + ' Đã kết nối</span>'
    + (pendingCount > 0 ? '<span><i class="dot" style="background:#f2c657"></i>' + pendingCount + ' Chờ duyệt (cũ)</span>' : '')
    + '</div>';
}

function buildNetworkPage(togglePill, svgEl, caption, legend, bottomHtml) {
  return pageHeader('Bản đồ kết nối AXANH', '', '<button class="btn btn-primary" data-action="nav" data-page="matches">' + icon('link') + ' Tạo kết nối</button>')
    + '<div class="network-wrap">'
    + togglePill
    + svgEl
    + caption
    + legend
    + '</div>'
    + bottomHtml;
}

function formatLearningDateTime(timestamp) {
  if (!Number.isFinite(timestamp)) return 'Chưa có thời gian';
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp));
}

function vietnamDateParts() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return values.year + '-' + values.month + '-' + values.day;
}

function learningSessionCard(session) {
  const permission = session.permissions || {};
  const participantsHtml = learningParticipantsHtml(session.participantDetails || session.participants || []);
  const connectionLabelHtml = session.connectionType === 'village'
    ? '<small class="muted">' + esc(session.connectionLabel) + '</small>'
    : '';
  const statusLabel = session.status === 'Proposed' ? 'Chờ xác nhận'
    : session.status === 'Confirmed' ? 'Đã xác nhận'
      : session.status === 'Completed' ? 'Đã hoàn thành'
        : 'Đã hủy / từ chối';
  const place = session.format === 'Online' && validLink(session.locationOrLink)
    ? '<a href="' + esc(session.locationOrLink) + '" target="_blank" rel="noopener noreferrer">Mở link họp</a>'
    : esc(session.locationOrLink || 'Chưa có địa điểm / link');
  let actions = '';
  if (permission.canRespond) {
    actions += '<button class="btn btn-primary small" data-action="learning-respond" data-id="' + esc(session.id) + '" data-decision="accept">Xác nhận</button>'
      + '<button class="btn small" data-action="learning-respond" data-id="' + esc(session.id) + '" data-decision="reject">Từ chối</button>';
  }
  if (permission.canCancel) {
    actions += '<button class="btn small" data-action="learning-respond" data-id="' + esc(session.id) + '" data-decision="cancel">Hủy đề xuất</button>';
  }
  if (permission.canComplete) {
    actions += '<button class="btn btn-primary small" data-action="learning-complete" data-id="' + esc(session.id) + '">Xác nhận đã hoàn thành</button>';
  }
  if (permission.canReport) {
    actions += '<button class="btn ' + (session.hasReported ? '' : 'btn-primary') + ' small" data-action="learning-results" data-id="' + esc(session.id) + '">'
      + (session.hasReported ? 'Xem kết quả' : 'Báo cáo kết quả') + '</button>';
  }
  return '<article class="panel" style="margin-bottom:10px">'
    + '<div class="row-flex" style="align-items:flex-start;gap:12px"><div style="min-width:0;flex:1">'
    + '<h3 style="margin:0 0 6px">' + esc(session.title) + '</h3>'
    + connectionLabelHtml
    + (participantsHtml ? '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:8px">' + participantsHtml + '</div>' : '')
    + '<p style="margin:7px 0;color:#64748b">' + esc(formatLearningDateTime(session.startAt)) + ' – ' + esc(formatLearningDateTime(session.endAt)) + '</p>'
    + '<p style="margin:0;color:#64748b">' + esc(session.format || 'Chưa chọn hình thức') + ' · ' + place + '</p>'
    + '</div><span class="status">' + statusLabel + '</span></div>'
    + (session.status === 'Confirmed' && session.endAt <= Date.now() ? '<p class="muted" style="margin:10px 0 0">Đã qua thời gian dự kiến; buổi học chưa được đánh dấu hoàn thành.</p>' : '')
    + (session.hasReported ? '<p class="tag teal" style="display:inline-block;margin:10px 0 0">Bạn đã báo cáo kết quả</p>' : '')
    + (actions ? '<div class="btnbar" style="margin-top:12px">' + actions + '</div>' : '')
    + '</article>';
}

function learningParticipantsHtml(participants, showIds = false) {
  const memberById = new Map(LIVE.members.map((member) => [member.id, member]));
  const rendered = participants.map((participant) => typeof participant === 'string'
    ? { name: participant }
    : participant);
  return rendered.map((participant, index) => {
    const member = participant.memberId ? memberById.get(participant.memberId) : null;
    const name = member?.name || participant.name || participant.memberId || 'Thành viên';
    const avatarUrl = member?.avatarUrl || participant.avatarUrl;
    const details = showIds && participant.memberId
      ? '<small style="display:block;color:#64748b">Member_ID: ' + esc(participant.memberId) + '</small>'
      : '';
    return (index ? '<span aria-hidden="true" style="color:#94a3b8">↔</span>' : '')
      + '<span style="display:inline-flex;align-items:center;gap:7px">'
      + memberAvatarHtml(avatarUrl, name, 36)
      + '<span><b>' + esc(name) + '</b>' + details + '</span>'
      + '</span>';
  }).join('');
}

function learningGroup(title, sessions) {
  if (!sessions.length) return '';
  return '<section style="margin-top:22px"><div class="section-title"><h2>' + title + '</h2><span>' + sessions.length + '</span></div>'
    + sessions.map(learningSessionCard).join('') + '</section>';
}

function renderScheduleBoard({ title, sessions, emptyTitle, emptyDesc, showAvailableBanner = false }) {
  const learning = LIVE.learning;
  const header = pageHeader(title, '',
    '<button class="btn btn-primary" data-action="learning-create">' + icon('plus') + ' Đặt lịch học</button>');
  if (learning.loading) return header + '<div class="status-banner">Đang tải lịch học từ Lark Base…</div>';
  if (learning.error) {
    return header + '<div class="status-banner">' + icon('info') + ' ' + esc(learning.error)
      + ' <button class="btn small" data-action="learning-refresh">Thử lại</button></div>';
  }
  const now = Date.now();
  const upcoming = sessions.filter(item => item.status === 'Confirmed' && item.endAt > now);
  const pending = sessions.filter(item => item.status === 'Proposed');
  const elapsed = sessions.filter(item => item.status === 'Confirmed' && item.endAt <= now);
  const content = learningGroup('Lịch sắp tới', upcoming)
    + learningGroup('Chờ xác nhận', pending)
    + learningGroup('Đã qua thời gian dự kiến', elapsed);
  return header
    + (showAvailableBanner && !learning.availableConnections.length
      ? '<div class="status-banner" style="margin-top:14px">Chưa có kết nối Lark Base ở trạng thái Accepted mà bạn có quyền tham gia.</div>'
      : '')
    + (content || '<div class="empty">' + icon('calendar', 38) + '<b>' + esc(emptyTitle) + '</b><p>' + esc(emptyDesc) + '</p></div>')
    + '<p class="muted" style="margin-top:16px">Lịch đã qua giờ kết thúc không tự chuyển sang hoàn thành. Một người tham gia cần xác nhận buổi học đã diễn ra.</p>';
}

function schedule() {
  const mySessions = (LIVE.learning.sessions || []).filter(item => item.isParticipant);
  return renderScheduleBoard({
    title: 'Lịch học của tôi',
    sessions: mySessions,
    emptyTitle: 'Chưa có buổi học nào của bạn',
    emptyDesc: 'Đặt lịch từ một kết nối đã được chấp nhận hoặc xem toàn bộ ở Lịch học toàn AXANH.',
    showAvailableBanner: true,
  });
}

function scheduleAll() {
  const allSessions = LIVE.learning.sessions || [];
  return renderScheduleBoard({
    title: 'Lịch học toàn AXANH',
    sessions: allSessions,
    emptyTitle: 'Chưa có buổi học nào trên hệ thống',
    emptyDesc: 'Khi các thành viên hoặc Làng đặt lịch cùng học, lịch sẽ hiển thị tại đây.',
    showAvailableBanner: false,
  });
}

function formatLearningDateOnly(timestamp) {
  if (!timestamp) return '—';
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(timestamp);
}

function formatHoursLabel(totalMinutes) {
  const hrs = Math.round((totalMinutes / 60) * 10) / 10;
  return (Number.isInteger(hrs) ? String(hrs) : String(hrs).replace('.', ',')) + ' giờ';
}

function getLearningHistoryStatsAndItems() {
  const allSessions = LIVE.learning.sessions || [];
  const isMine = learningHistoryTab === 'mine';
  const completed = allSessions
    .filter(s => s.status === 'Completed' && (!isMine || s.isParticipant))
    .sort((a, b) => (b.startAt ?? 0) - (a.startAt ?? 0));

  const totalMinutes = completed.reduce((sum, s) => {
    const mins = (s.startAt && s.endAt && s.endAt > s.startAt) ? Math.round((s.endAt - s.startAt) / 60000) : 0;
    return sum + mins;
  }, 0);

  const reportedCount = isMine
    ? completed.filter(s => s.hasReported).length
    : completed.reduce((sum, s) => sum + (s.reportCount || (s.hasReported ? 1 : 0)), 0);

  const q = normStr(learningHistorySearch.trim());
  const filtered = q
    ? completed.filter(s => {
        if (normStr(s.title).includes(q)) return true;
        if (normStr(s.connectionLabel).includes(q)) return true;
        if (Array.isArray(s.participants) && s.participants.some(p => normStr(p).includes(q))) return true;
        return false;
      })
    : completed;

  return {
    totalCompleted: completed.length,
    totalHoursLabel: formatHoursLabel(totalMinutes),
    reportedCount,
    items: filtered,
  };
}

function renderLearningHistoryList() {
  const { items } = getLearningHistoryStatsAndItems();
  const isMine = learningHistoryTab === 'mine';
  if (!items.length) {
    return '<div class="empty">' + icon('clock', 36)
      + '<b>Chưa có buổi học đã hoàn thành</b>'
      + '<p>' + (learningHistorySearch.trim()
        ? 'Không tìm thấy buổi học phù hợp với từ khóa tìm kiếm.'
        : (isMine ? 'Khi bạn hoàn thành buổi học, lịch sử và báo cáo Form 02 sẽ hiển thị tại đây.' : 'Chưa có buổi học nào hoàn thành trên toàn hệ thống.'))
      + '</p></div>';
  }
  return '<div class="lh-list">' + items.map(s => {
    const mins = (s.startAt && s.endAt && s.endAt > s.startAt) ? Math.round((s.endAt - s.startAt) / 60000) : 0;
    const isReported = isMine ? Boolean(s.hasReported) : Boolean((s.reportCount || 0) > 0 || s.hasReported);
    const canView = Boolean(s.permissions?.canViewResults || s.isParticipant || LIVE.currentUser?.isAdmin);
    const canSubmitForm2 = Boolean(s.isParticipant && s.permissions?.canReport && !s.hasReported);

    let rightBtn = '';
    if (isReported && canView) {
      const btnText = (isMine || s.hasReported) ? 'Xem báo cáo của tôi' : 'Xem báo cáo';
      rightBtn = '<button type="button" class="btn small" data-action="learning-results" data-id="' + esc(s.id) + '">' + btnText + '</button>';
    } else if (!isReported && canSubmitForm2) {
      rightBtn = '<button type="button" class="btn small btn-primary" data-action="learning-report" data-id="' + esc(s.id) + '">Nộp Form 02</button>';
    } else if (isMine && !s.hasReported && s.permissions?.canReport) {
      rightBtn = '<button type="button" class="btn small btn-primary" data-action="learning-report" data-id="' + esc(s.id) + '">Nộp Form 02</button>';
    }

    const statusHtml = isReported
      ? '<span class="lh-status lh-status-done">✓ Đã nộp báo cáo' + (!isMine && (s.reportCount || 0) > 1 ? ' (' + s.reportCount + ')' : '') + '</span>'
      : '<span class="lh-status lh-status-pending">Chưa nộp báo cáo</span>';

    return '<article class="lh-card">'
      + '<div class="lh-card-head">'
      + '<div class="lh-card-title-wrap">'
      + '<h3 class="lh-card-title">' + esc(s.title || 'Buổi học') + '</h3>'
      + '<div class="lh-card-pair">' + esc(s.connectionLabel || (s.participants || []).join(' ↔ ')) + '</div>'
      + '<div class="lh-card-meta">'
      + '<span>' + icon('calendar', 14) + ' ' + esc(formatLearningDateOnly(s.startAt)) + '</span>'
      + (mins > 0 ? '<span>' + icon('clock', 14) + ' ' + mins + ' phút</span>' : '')
      + '</div>'
      + '</div>'
      + '<span class="lh-check-badge" title="Đã hoàn thành">' + icon('checkCircle', 18) + '</span>'
      + '</div>'
      + '<div class="lh-card-foot">'
      + statusHtml
      + rightBtn
      + '</div>'
      + '</article>';
  }).join('') + '</div>';
}

function learningHistory() {
  const learning = LIVE.learning;
  const header = pageHeader('Lịch sử học tập', 'Theo dõi các buổi học đã hoàn thành và tình trạng nộp báo cáo Form 02', '');
  if (learning.loading) return header + '<div class="status-banner">Đang tải lịch sử học tập từ Lark Base…</div>';
  if (learning.error) {
    return header + '<div class="status-banner">' + icon('info') + ' ' + esc(learning.error)
      + ' <button class="btn small" data-action="learning-refresh">Thử lại</button></div>';
  }
  const { totalCompleted, totalHoursLabel, reportedCount } = getLearningHistoryStatsAndItems();

  const tabsHtml = '<div class="lh-tabs">'
    + '<button type="button" class="lh-tab' + (learningHistoryTab === 'mine' ? ' active' : '') + '" data-action="set-learning-history-tab" data-tab="mine">Cá nhân</button>'
    + '<button type="button" class="lh-tab' + (learningHistoryTab === 'all' ? ' active' : '') + '" data-action="set-learning-history-tab" data-tab="all">Toàn AXANH</button>'
    + '</div>';

  const kpisHtml = '<div class="lh-kpis">'
    + '<div class="lh-kpi-card">'
    + '<div class="lh-kpi-ico">' + icon('checkCircle', 18) + '</div>'
    + '<div class="lh-kpi-val">' + totalCompleted + '</div>'
    + '<div class="lh-kpi-label">Buổi đã hoàn thành</div>'
    + '</div>'
    + '<div class="lh-kpi-card">'
    + '<div class="lh-kpi-ico">' + icon('clock', 18) + '</div>'
    + '<div class="lh-kpi-val">' + esc(totalHoursLabel) + '</div>'
    + '<div class="lh-kpi-label">Thời lượng theo lịch</div>'
    + '</div>'
    + '<div class="lh-kpi-card">'
    + '<div class="lh-kpi-ico">' + icon('form', 18) + '</div>'
    + '<div class="lh-kpi-val">' + reportedCount + '</div>'
    + '<div class="lh-kpi-label">Đã nộp báo cáo</div>'
    + '</div>'
    + '</div>';

  const searchHtml = '<div class="lh-search-box">'
    + icon('search', 16)
    + '<input id="learningHistorySearch" type="text" placeholder="Tìm kiếm chủ đề, thành viên..." value="' + esc(learningHistorySearch) + '" autocomplete="off">'
    + '</div>';

  return header + tabsHtml + kpisHtml + searchHtml
    + '<div id="learningHistoryList">' + renderLearningHistoryList() + '</div>';
}

function openLearningScheduleModal(preselectConnId = '') {
  const connections = LIVE.learning.availableConnections || [];
  const connectionOptions = connections.map(connection => '<option value="' + esc(connection.id) + '"' + (preselectConnId && (connection.id === preselectConnId || connection.connectionId === preselectConnId) ? ' selected' : '') + '>' + esc(connection.label) + '</option>').join('');
  const formats = (LIVE.learning.reportOptions?.formats || ['Online', 'Trực tiếp'])
    .map(format => '<option value="' + esc(format) + '">' + esc(format) + '</option>').join('');
  const today = vietnamDateParts();
  openModal('Đặt lịch học', '<form id="learningScheduleForm" class="settings-form">'
    + (connections.length
      ? '<div class="field"><label>Kết nối đã chấp nhận</label><select name="connectionId" required><option value="">Chọn kết nối</option>' + connectionOptions + '</select></div>'
      : '<div class="empty"><b>Chưa có kết nối phù hợp</b><p>Chỉ có thể đặt lịch từ kết nối Làng hoặc Cá nhân đã được chấp nhận và bạn là người tham gia được ủy quyền.</p></div>')
    + '<div class="field"><label>Tiêu đề buổi học</label><input name="title" maxlength="200" required></div>'
    + '<div class="field-grid"><div class="field"><label>Ngày học (giờ Việt Nam)</label><input type="date" name="date" min="' + today + '" value="' + today + '" required></div>'
    + '<div class="field"><label>Hình thức</label><select name="format" required>' + formats + '</select></div></div>'
    + '<div class="field-grid"><div class="field"><label>Giờ bắt đầu</label><input type="time" name="startTime" required></div>'
    + '<div class="field"><label>Giờ kết thúc</label><input type="time" name="endTime" required></div></div>'
    + '<div class="field"><label>Link họp hoặc địa điểm (không bắt buộc)</label><input name="locationOrLink" maxlength="1000" placeholder="Có thể để trống"></div>'
    + '<button class="btn btn-primary" type="submit"' + (connections.length ? '' : ' disabled') + '>' + icon('calendar') + ' Gửi đề xuất lịch</button>'
    + '</form>');
}

function openLearningReportForm(session) {
  const appliedOptions = (LIVE.learning.reportOptions?.applied || [])
    .map(option => '<option value="' + esc(option) + '">' + esc(option) + '</option>').join('');
  const participantsHtml = learningParticipantsHtml(
    session.participantDetails || session.participants || [],
    true,
  );
  openModal('Form 02 · Báo cáo buổi học', '<div class="panel" style="margin-bottom:14px">'
    + '<b>' + esc(session.title) + '</b><p>' + esc(formatLearningDateTime(session.startAt)) + ' · ' + esc(session.connectionLabel) + '</p>'
    + '<small>Người báo cáo: ' + esc(LIVE.currentUser?.name || 'Bạn') + '</small>'
    + (participantsHtml ? '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:10px"><b>Cùng học:</b>' + participantsHtml + '</div>' : '')
    + '</div>'
    + '<form id="learningReportForm" class="settings-form" data-session-id="' + esc(session.id) + '">'
    + '<div class="field"><label>Điều em đã học được</label><textarea name="learned" required maxlength="5000"></textarea></div>'
    + '<div class="field-grid"><div class="field"><label>Đã thử áp dụng?</label><select name="applied" required>' + appliedOptions + '</select></div>'
    + '<div class="field"><label>Mức độ hữu ích</label><select name="rating" required><option value="5">5 – Rất hữu ích</option><option value="4">4 – Hữu ích</option><option value="3">3 – Có ích phần nào</option><option value="2">2 – Cần cải thiện</option><option value="1">1 – Chưa hữu ích</option></select></div></div>'
    + '<div class="field"><label>Kết quả sau khi áp dụng (tùy chọn)</label><textarea name="outcome" maxlength="5000"></textarea></div>'
    + '<div class="field"><label>Tài sản tri thức có thể chia sẻ lại (tùy chọn)</label><input name="asset" maxlength="2000"></div>'
    + '<div class="field"><label>Link / minh chứng (tùy chọn)</label><input name="evidence" type="url" maxlength="2000"></div>'
    + '<label class="checkline"><input type="checkbox" name="share">Đồng ý chia sẻ bài học này ở chế độ nội bộ khi tổ chức có cơ chế phê duyệt.</label>'
    + '<button class="btn btn-primary" type="submit">' + icon('check') + ' Gửi Form 02</button></form>');
}

async function openLearningResults(session) {
  openModal('Kết quả buổi học', '<div class="status-banner">Đang tải kết quả…</div>');
  try {
    const reports = await window.AXANH_LIVE_API.getLearningResults(session.id);
    const root = document.querySelector('#modal');
    const body = reports.length
      ? '<div style="display:flex;flex-direction:column;gap:12px">' + reports.map(report =>
        '<article class="panel"><div class="row-flex"><b>' + esc(report.reporterName) + (report.own ? ' · Bạn' : '') + '</b><span>' + (report.share ? 'Đã đồng ý chia sẻ' : 'Riêng tư') + '</span></div>'
        + '<p><b>Điều đã học:</b> ' + esc(report.learned) + '</p><p><b>Đã thử áp dụng:</b> ' + esc(report.applied) + '</p>'
        + '<p><b>Mức độ hữu ích:</b> ' + esc(report.rating ?? '—') + '/5</p>'
        + (report.outcome ? '<p><b>Kết quả:</b> ' + esc(report.outcome) + '</p>' : '')
        + (report.asset ? '<p><b>Tài sản có thể chia sẻ:</b> ' + esc(report.asset) + '</p>' : '')
        + (report.evidence && validLink(report.evidence) ? '<p><a href="' + esc(report.evidence) + '" target="_blank" rel="noopener noreferrer">Mở link / minh chứng</a></p>' : '')
        + '</article>').join('') + '</div>'
      : '<div class="empty"><b>Chưa có kết quả bạn được phép xem</b><p>Báo cáo của người khác chỉ hiển thị khi họ đồng ý chia sẻ.</p></div>';
    if (root?.classList.contains('open')) root.querySelector('.modal-body').innerHTML = body;
    if (session.permissions?.canReport && !session.hasReported) {
      const footer = root?.querySelector('.modal-foot');
      if (footer) footer.innerHTML = '<button class="btn" data-action="close-modal">Đóng</button><button class="btn btn-primary" data-action="learning-report" data-id="' + esc(session.id) + '">Báo cáo kết quả</button>';
      else if (root) root.querySelector('.modal').insertAdjacentHTML('beforeend', '<div class="modal-foot"><button class="btn" data-action="close-modal">Đóng</button><button class="btn btn-primary" data-action="learning-report" data-id="' + esc(session.id) + '">Báo cáo kết quả</button></div>');
    }
  } catch (err) {
    const root = document.querySelector('#modal');
    if (root?.classList.contains('open')) root.querySelector('.modal-body').innerHTML = '<div class="status-banner">' + esc(err.message || 'Không thể tải kết quả.') + '</div>';
  }
}
function knowledgeTypeLabel(type) {
  return type === 'personal' ? 'Cá nhân' : type === 'village' ? 'Làng' : 'Chưa phân loại';
}

function knowledgeDate(timestamp) {
  if (!Number.isFinite(timestamp)) return 'Chưa có ngày';
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    dateStyle: 'medium',
  }).format(new Date(timestamp));
}

function filteredKnowledgeItems() {
  const search = librarySearch.trim().toLocaleLowerCase('vi');
  return (LIVE.knowledge.items || []).filter((item) => {
    if (libraryConnectionFilter !== 'all' && item.connectionType !== libraryConnectionFilter) return false;
    if (libraryAppliedFilter === 'applied' && !item.isApplied) return false;
    if (libraryAppliedFilter === 'not-applied' && item.isApplied) return false;
    if (!search) return true;
    return [item.title, item.topic, item.learned, item.authorName]
      .some((value) => String(value || '').toLocaleLowerCase('vi').includes(search));
  });
}

function knowledgeCard(item) {
  return '<article class="knowledge-card">'
    + '<div class="row-flex"><span class="knowledge-ico">' + icon('book', 24) + '</span><span class="tag teal">' + esc(knowledgeTypeLabel(item.connectionType)) + '</span></div>'
    + '<h3>' + esc(item.title) + '</h3>'
    + '<p><b>Chủ đề / Nội dung học:</b> ' + esc(item.topic) + '</p>'
    + '<div class="lightbar"><span>' + esc(knowledgeDate(item.startAt)) + '</span><span class="tag">' + esc(item.isApplied ? 'Đã áp dụng' : 'Chưa áp dụng') + '</span></div>'
    + (item.authorName ? '<p>Người chia sẻ: ' + esc(item.authorName) + '</p>' : '')
    + '<button class="btn small" data-action="knowledge-detail" data-id="' + esc(item.id) + '">Xem chi tiết ' + icon('arrow', 15) + '</button>'
    + '</article>';
}

function renderKnowledgeResults() {
  const allItems = LIVE.knowledge.items || [];
  if (!allItems.length) {
    return '<div class="empty">' + icon('book', 38) + '<b>Chưa có bài học nào được chia sẻ.</b><p>Những bài học được đồng ý chia sẻ sau khi hoàn thành buổi học sẽ xuất hiện tại đây.</p></div>';
  }
  const items = filteredKnowledgeItems();
  return items.length
    ? '<div class="grid3">' + items.map(knowledgeCard).join('') + '</div>'
    : '<div class="empty"><b>Không tìm thấy bài học phù hợp.</b><p>Thử thay đổi từ khóa hoặc bộ lọc.</p></div>';
}

function library() {
  const header = pageHeader(
    'Kho tri thức',
    '',
    '<button class="btn" data-action="knowledge-refresh">' + icon('refresh') + ' Làm mới</button>',
  );
  if (LIVE.knowledge.loading) return header + '<div class="status-banner">Đang tải bài học đã được chia sẻ từ Form 02…</div>';
  if (LIVE.knowledge.error) {
    return header + '<div class="status-banner">' + icon('info') + ' ' + esc(LIVE.knowledge.error)
      + ' <button class="btn small" data-action="knowledge-refresh">Thử lại</button></div>';
  }

  return header
    + '<div class="knowledge-controls">'
    + '<label class="field-search">' + icon('search', 18) + '<input id="knowledgeSearch" type="search" value="' + esc(librarySearch) + '" placeholder="Tìm tiêu đề, nội dung, bài học hoặc người chia sẻ" aria-label="Tìm trong Kho tri thức"></label>'
    + '<label class="select"><span>Loại kết nối</span><select id="knowledgeConnectionFilter"><option value="all"' + (libraryConnectionFilter === 'all' ? ' selected' : '') + '>Tất cả bài học</option><option value="personal"' + (libraryConnectionFilter === 'personal' ? ' selected' : '') + '>Cá nhân</option><option value="village"' + (libraryConnectionFilter === 'village' ? ' selected' : '') + '>Làng</option></select></label>'
    + '<label class="select"><span>Áp dụng</span><select id="knowledgeAppliedFilter"><option value="all"' + (libraryAppliedFilter === 'all' ? ' selected' : '') + '>Tất cả</option><option value="applied"' + (libraryAppliedFilter === 'applied' ? ' selected' : '') + '>Đã áp dụng</option><option value="not-applied"' + (libraryAppliedFilter === 'not-applied' ? ' selected' : '') + '>Chưa áp dụng</option></select></label>'
    + '</div>'
    + '<div id="knowledgeResults" style="margin-top:16px">' + renderKnowledgeResults() + '</div>';
}

function refreshKnowledgeResults() {
  const root = document.querySelector('#knowledgeResults');
  if (root) root.innerHTML = renderKnowledgeResults();
}

async function loadKnowledge() {
  const generation = ++knowledgeLoadGeneration;
  const api = window.AXANH_LIVE_API;
  if (!api?.getKnowledge) {
    LIVE.knowledge.error = 'Chưa kết nối API Kho tri thức.';
    LIVE.knowledge.items = [];
    if (currentPage === 'library') render();
    return;
  }
  LIVE.knowledge.loading = true;
  LIVE.knowledge.error = '';
  if (currentPage === 'library') render();
  try {
    const data = await api.getKnowledge();
    if (generation !== knowledgeLoadGeneration) return;
    LIVE.knowledge.items = Array.isArray(data.items) ? data.items : [];
    LIVE.knowledge.diagnostics = data.diagnostics || {};
  } catch (error) {
    if (generation !== knowledgeLoadGeneration) return;
    LIVE.knowledge.error = error.message || 'Không thể tải Kho tri thức.';
    LIVE.knowledge.items = [];
    LIVE.knowledge.diagnostics = {};
  } finally {
    if (generation === knowledgeLoadGeneration) {
      LIVE.knowledge.loading = false;
      if (currentPage === 'library') render();
    }
  }
}

async function loadHonors(forceFresh = false) {
  const generation = ++honorsLoadGeneration;
  const api = window.AXANH_LIVE_API;
  if (!api?.getHonors) {
    LIVE.honors = { loading: false, error: 'Chưa kết nối API Vinh danh.', data: null };
    if (currentPage === 'awards') render();
    return;
  }
  LIVE.honors.loading = true;
  LIVE.honors.error = '';
  if (currentPage === 'awards') render();
  try {
    const data = await api.getHonors(forceFresh);
    if (generation !== honorsLoadGeneration) return;
    LIVE.honors.data = data;
  } catch (error) {
    if (generation !== honorsLoadGeneration) return;
    LIVE.honors.error = error.message || 'Không thể tải dữ liệu Vinh danh.';
    LIVE.honors.data = null;
  } finally {
    if (generation === honorsLoadGeneration) {
      LIVE.honors.loading = false;
      if (currentPage === 'awards') render();
    }
  }
}

async function openKnowledgeDetail(id) {
  openModal('Chi tiết bài học', '<div class="status-banner knowledge-detail-loading">Đang kiểm tra quyền chia sẻ và tải nội dung…</div>');
  try {
    const item = await window.AXANH_LIVE_API.getKnowledgeDetail(id);
    const root = document.querySelector('#modal');
    const loading = root?.querySelector('.knowledge-detail-loading');
    if (!loading) return;
    const evidence = item.evidenceUrl && validLink(item.evidenceUrl)
      ? '<p><a href="' + esc(item.evidenceUrl) + '" target="_blank" rel="noopener noreferrer">Mở tài liệu / minh chứng</a></p>'
      : '';
    loading.outerHTML = '<div class="knowledge-detail">'
      + '<p class="muted">' + esc(knowledgeDate(item.startAt)) + ' · ' + esc(knowledgeTypeLabel(item.connectionType)) + '</p>'
      + (item.authorName ? '<p><b>Người chia sẻ:</b> ' + esc(item.authorName) + '</p>' : '')
      + '<section><h3>Chủ đề / Nội dung học</h3><p>' + esc(item.topic) + '</p></section>'
      + '<section><h3>Điều đã học được</h3><p>' + esc(item.learned || '—') + '</p></section>'
      + '<section><h3>Đã thử áp dụng?</h3><p>' + esc(item.applied || '—') + '</p></section>'
      + '<section><h3>Kết quả sau khi áp dụng</h3><p>' + esc(item.outcome || '—') + '</p></section>'
      + (evidence ? '<section><h3>Tài liệu / Minh chứng</h3>' + evidence + '</section>' : '')
      + '</div>';
  } catch (error) {
    const root = document.querySelector('#modal');
    const loading = root?.querySelector('.knowledge-detail-loading');
    if (loading) loading.outerHTML = '<div class="status-banner">' + esc(error.message || 'Không thể tải chi tiết bài học.') + '</div>';
  }
}
function honorMetricsMarkup(item) {
  return '<div class="kv"><span>Kết nối được chấp nhận</span><b>' + esc(item.acceptedConnections || 0) + '</b></div>'
    + '<div class="kv"><span>Buổi học đã hoàn thành</span><b>' + esc(item.completedSessions || 0) + '</b></div>'
    + '<div class="kv"><span>Báo cáo Form 02 hợp lệ</span><b>' + esc(item.validReports || 0) + '</b></div>';
}

function honorIndividualCard(item) {
  return '<article class="person-card"><div class="person-head">' + renderMemberAvatar(item)
    + '<div><b>' + esc(item.name) + '</b><small>' + esc(item.villageName) + '</small></div></div>'
    + honorMetricsMarkup(item) + '</article>';
}

function honorVillageCard(item) {
  const avatar = item.iconUrl
    ? '<div class="person-avatar" style="height:52px;width:52px;padding:0;overflow:hidden"><img src="' + esc(item.iconUrl) + '" alt="Biểu tượng ' + esc(item.name) + '" loading="lazy" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display=\'none\';if(this.nextElementSibling)this.nextElementSibling.style.display=\'grid\';"><span style="display:none;width:100%;height:100%;place-items:center">' + icon('network', 22) + '</span></div>'
    : '<div class="person-avatar" style="height:52px;width:52px">' + icon('network', 22) + '</div>';
  return '<article class="person-card"><div class="person-head">' + avatar
    + '<div><b>' + esc(item.name) + '</b><small>Hoạt động của Làng</small></div></div>'
    + honorMetricsMarkup(item) + '</article>';
}

function honors() {
  const header = pageHeader(
    'Vinh danh tri thức',
    '',
    '<button class="btn" data-action="honors-refresh">' + icon('refresh') + ' Làm mới</button>',
  );
  if (LIVE.honors.loading) return header + '<div class="status-banner">Đang tải thống kê hoạt động từ Lark Base…</div>';
  if (LIVE.honors.error) {
    return header + '<div class="status-banner">' + icon('info') + ' ' + esc(LIVE.honors.error)
      + ' <button class="btn small" data-action="honors-refresh">Thử lại</button></div>';
  }
  const data = LIVE.honors.data;
  if (!data || !Array.isArray(data.individuals) || !Array.isArray(data.villages)
    || !data.totals) {
    return header + '<div class="status-banner">Dữ liệu Vinh danh không đúng cấu trúc; vui lòng tải lại.</div>';
  }

  const total = data.totals;
  const individualCards = data.individuals.length
    ? '<div class="grid3">' + data.individuals.map(honorIndividualCard).join('') + '</div>'
    : '<div class="empty">Chưa có hoạt động cá nhân đủ điều kiện thống kê.</div>';
  const villageCards = data.villages.length
    ? '<div class="grid3">' + data.villages.map(honorVillageCard).join('') + '</div>'
    : '<div class="empty">Chưa có hoạt động cấp Làng đủ điều kiện thống kê.</div>';
  const categories = [
    { i: 'gift', name: 'Người Gieo Tri Thức', description: 'Chia sẻ giúp người khác thực hành tốt hơn.' },
    { i: 'spark', name: 'Người Học Hỏi Chủ Động', description: 'Nhận ra điều cần học và áp dụng kiến thức vào công việc.' },
    { i: 'users', name: 'Cặp Đồng Hành Giá Trị', description: 'Cùng giải quyết vấn đề hoặc tạo sản phẩm tri thức hữu ích.' },
    { i: 'network', name: 'Làng Lan Tỏa Tri Thức', description: 'Đóng góp được Làng khác sử dụng và xác nhận có ích.' },
  ];

  return header
    + '<section style="margin-bottom:22px"><div class="section-title"><h2>Các hạng mục ghi nhận</h2></div>'
    + '<div class="grid2">' + categories.map((item) => '<article class="reward-card"><div class="reward-icon">'
      + icon(item.i, 25) + '</div><h3>' + esc(item.name) + '</h3><p>' + esc(item.description) + '</p></article>').join('') + '</div></section>'
    + '<section style="margin-bottom:22px"><div class="section-title"><h2>Bảng thành tích hoạt động</h2></div>'
    + '<div class="stat-grid honors-stat-grid">'
    + '<div class="stat"><div><div class="number">' + esc(total.acceptedConnections || 0) + '</div><div class="label">Kết nối được chấp nhận</div></div><div class="stat-icon">' + icon('link', 22) + '</div></div>'
    + '<div class="stat"><div><div class="number">' + esc(total.completedSessions || 0) + '</div><div class="label">Buổi học hoàn thành</div></div><div class="stat-icon">' + icon('calendar', 22) + '</div></div>'
    + '<div class="stat"><div><div class="number">' + esc(total.validReports || 0) + '</div><div class="label">Báo cáo Form 02 hợp lệ</div></div><div class="stat-icon">' + icon('form', 22) + '</div></div>'
    + '</div></section>'
    + '<section style="margin-bottom:22px">'
    + '<div class="lh-tabs">'
    + '<button type="button" class="lh-tab' + (honorsTab === 'individuals' ? ' active' : '') + '" data-action="set-honors-tab" data-tab="individuals">Cá nhân tiêu biểu (' + esc(data.individuals.length) + ')</button>'
    + '<button type="button" class="lh-tab' + (honorsTab === 'villages' ? ' active' : '') + '" data-action="set-honors-tab" data-tab="villages">Làng tri thức tiêu biểu (' + esc(data.villages.length) + ')</button>'
    + '</div>'
    + (honorsTab === 'villages' ? villageCards : individualCards)
    + '</section>';
}

const GATE1_STATUS_META = {
  '⚪ Chưa nộp': ['⚪ Chưa nộp', 'pending'],
  '🟡 Đang kiểm tra': ['🟡 Đang kiểm tra', 'reviewing'],
  '🟠 Cần bổ sung': ['🟠 Cần bổ sung', 'revise'],
  '🔵 Hợp lệ': ['🔵 Hợp lệ', 'valid'],
  '🟢 Đạt Gate 1': ['🟢 Đạt Gate 1', 'passed'],
  '🔴 Chưa đạt Gate 1': ['🔴 Chưa đạt Gate 1', 'failed'],
};
const GATE1 = { loading: false, error: '', items: [], gateRecordCount: 0, unassignedRecordCount: 0, unclassifiedRecordCount: 0 };
let gate1LoadGeneration = 0;
function gateStatusMeta(status) { return GATE1_STATUS_META[status] || [status || 'Chưa có dữ liệu xác nhận', 'pending'] }
function gateCounts(items = GATE1.items) {
  return {
    passed: items.filter(item => item.status === '🟢 Đạt Gate 1').length,
    valid: items.filter(item => item.status === '🔵 Hợp lệ').length,
    reviewing: items.filter(item => item.status === '🟡 Đang kiểm tra').length,
  };
}
function gateCard(item) {
  const meta = gateStatusMeta(item.status);
  const logo = villageLogoHtml(item.villageIconUrl, item.villageName, 58);
  const detailButton = item.recordCount === 1
    ? '<button class="btn small btn-primary" data-action="gate-open" data-id="' + esc(item.villageId) + '">Xem hồ sơ</button>'
    : '';
  const fireworksButton = meta[1] === 'passed'
    ? '<button class="btn small btn-gold" data-action="gate-fireworks" data-id="' + esc(item.villageId) + '">' + icon('spark', 14) + ' Khởi động pháo hoa</button>'
    : '';
  const actions = [detailButton, fireworksButton].filter(Boolean).join('');
  return '<article class="gate-card"><div class="gate-head">' + logo + '<div><h3>' + esc(item.villageName) + '</h3><div class="gate-meta">' + esc(item.villageOffice || 'AXANH') + '</div></div><span class="gate-status ' + meta[1] + '">' + esc(meta[0]) + '</span></div><p><strong>Đang giúp:</strong> ' + esc(item.supportingVillageName || 'Chưa có dữ liệu xác nhận') + '</p><div class="gate-kv"><div><span>Giá trị hỗ trợ</span>' + esc(item.valueReceived || 'Chưa có dữ liệu xác nhận') + '</div><div><span>Dấu hiệu thay đổi</span>' + esc(item.observedChange || 'Chưa có dữ liệu xác nhận') + '</div></div>' + (actions ? '<div class="gate-actions">' + actions + '</div>' : '') + '</article>';
}
function gateRule(text, num) { return '<div class="rule"><div class="mini">' + num + '</div><div><b>' + text.split('|')[0] + '</b><div class="gate-note" style="margin:4px 0 0">' + text.split('|')[1] + '</div></div></div>' }
function gate1() {
  const c = gateCounts();
  const gateContent = GATE1.error
    ? '<div class="empty">Chưa có dữ liệu Gate 1 để hiển thị.</div>'
    : GATE1.loading
      ? '<div class="empty">Đang tải dữ liệu chính thức từ T07...</div>'
      : GATE1.items.length
        ? '<div class="gate-grid" style="margin-top:18px">' + GATE1.items.map(gateCard).join('') + '</div>'
        : '<div class="empty">Không tìm thấy Làng đang hoạt động trong T01.</div>';
  return pageHeader('Gate 1 – Điều kiện đủ tư cách Quán quân', '', '') + '<section class="gate-banner"><div class="eyebrow" style="color:#f3ca62">ĐẠI HỘI LÀNG AXANH 2026</div><h2>Phiên chợ tri thức<br>gắn trực tiếp với Gate 1 Quán quân</h2><div class="gate-strip"><div class="gate-step"><div class="pulse-star">1</div><b>Kết nối</b><small>Người có thể giúp và người đang cần giúp gặp nhau đúng nhu cầu.</small></div><div class="gate-step"><div class="pulse-star">2</div><b>Thực hành</b><small>Chia sẻ công cụ, kinh nghiệm hoặc cách làm để giải quyết vấn đề thật.</small></div><div class="gate-step"><div class="pulse-star">3</div><b>Xác nhận giá trị</b><small>Người nhận cho biết mình đã dùng được gì và thay đổi ra sao.</small></div><div class="gate-step"><div class="pulse-star">4</div><b>BTC thẩm định</b><small>Kiểm tra minh chứng, chống xác nhận chéo và chốt điều kiện Quán quân.</small></div></div></section><div class="gate-layout" style="margin-top:18px"><div><div class="panel"><div class="panel-head"><h3>11 Làng và trạng thái Gate 1</h3></div><div class="gate-mini-stats"><div class="gate-mini"><b>' + c.passed + '</b><small>Làng đã đạt Gate 1</small></div><div class="gate-mini"><b>' + c.valid + '</b><small>Hồ sơ hợp lệ chờ chốt</small></div><div class="gate-mini"><b>' + c.reviewing + '</b><small>Hồ sơ đang kiểm tra</small></div></div><div class="gate-legend"><span><i style="background:#167953"></i>Đạt Gate 1</span><span><i style="background:#325ea3"></i>Hợp lệ</span><span><i style="background:#a06a09"></i>Đang kiểm tra</span><span><i style="background:#b24c45"></i>Cần bổ sung / Chưa đạt</span></div>' + gateContent + '</div></div><aside><div class="panel"><div class="panel-head"><h3>5 nguyên tắc bắt buộc</h3></div><div class="gate-principles">' + [
    'Có ít nhất một Làng khác xác nhận nhận được giá trị cụ thể|Không tính chung chung kiểu “đã hỗ trợ”, mà phải rõ giúp điều gì.',
    'Người nhận đã dùng hoặc áp dụng sự hỗ trợ|Gate 1 không dừng ở buổi chia sẻ, mà phải có bước áp dụng thật.',
    'Có thay đổi tích cực và có minh chứng kiểm tra được|Ví dụ: checklist, SOP, ảnh chụp, phản hồi công việc, ví dụ trước/sau.',
    'Không xác nhận chéo để cùng đạt Gate 1|Nếu A dùng xác nhận từ B thì B không dùng xác nhận ngược lại từ A cho cùng mục đích.',
    'Người xác nhận là Trưởng hoặc Phó Làng nhận, BTC thẩm định cuối cùng|App cần phân quyền rõ ai xác nhận và ai phê duyệt.'
  ].map((t, i) => gateRule(t, i + 1)).join('') +   '</div><p class="gate-note"><strong>Ghi nhớ:</strong> Gate 1 nằm ngoài thang điểm 100 và là điều kiện bắt buộc để xét Quán quân. Vì vậy, app cần giúp nhìn rõ tiến độ chứ không biến việc giúp nhau thành chạy điểm.</p></div><div class="panel" style="margin-top:16px"><div class="panel-head"><h3>Tiến độ mẫu đề xuất</h3></div><div class="timeline-box"><div class="timeline-card"><b>Trước cuộc họp</b><p>Mọi người điền Form 01 “Tôi có thể giúp / Tôi mong được giúp”.</p></div><div class="timeline-card"><b>Sau khi ghép cặp</b><p>Hai bên hẹn thời gian, chia sẻ ngắn 20–30 phút, tập trung vào một vấn đề thật.</p></div><div class="timeline-card"><b>Sau khi đã học</b><p>Người nhận điền Form 02 để phản hồi điều đã áp dụng được. Nếu đủ điều kiện, app gợi ý chuyển sang hồ sơ Gate 1.</p></div><div class="timeline-card"><b>BTC thẩm định</b><p>Kiểm tra minh chứng, cảnh báo xác nhận chéo và chốt trạng thái cuối cùng. Mốc khóa Gate 1 theo Rulebook là 24/12/2026.</p></div></div></div></aside></div>'
}
async function loadGate1(forceFresh = false) {
  const generation = ++gate1LoadGeneration;
  GATE1.loading = true;
  GATE1.error = '';
  GATE1.items = [];
  GATE1.gateRecordCount = 0;
  GATE1.unassignedRecordCount = 0;
  GATE1.unclassifiedRecordCount = 0;
  if (currentPage === 'gate1') render();
  try {
    if (!window.AXANH_LIVE_API?.getGate1) throw new Error('Thiếu API Gate 1.');
    const result = await window.AXANH_LIVE_API.getGate1({ forceFresh });
    if (!Array.isArray(result.items)) throw new Error('Dữ liệu Gate 1 không đúng cấu trúc.');
    if (generation !== gate1LoadGeneration) return;
    GATE1.items = result.items;
    GATE1.gateRecordCount = Number(result.gateRecordCount) || 0;
    GATE1.unassignedRecordCount = Number(result.unassignedRecordCount) || 0;
    GATE1.unclassifiedRecordCount = Number(result.unclassifiedRecordCount) || 0;
  } catch (error) {
    if (generation !== gate1LoadGeneration) return;
    GATE1.items = [];
    GATE1.gateRecordCount = 0;
    GATE1.unassignedRecordCount = 0;
    GATE1.unclassifiedRecordCount = 0;
    GATE1.error = error instanceof Error ? error.message : 'Không xác định';
  } finally {
    if (generation === gate1LoadGeneration) {
      GATE1.loading = false;
      if (currentPage === 'gate1' || currentPage === 'home') render();
    }
  }
}
function openGateDetail(villageId) {
  const item = GATE1.items.find(entry => entry.villageId === villageId);
  if (!item || item.recordCount !== 1) return;
  const meta = gateStatusMeta(item.status);
  const missing = 'Chưa có dữ liệu xác nhận';
  openModal('Hồ sơ Gate 1 · ' + esc(item.villageName),
    '<div class="person-head" style="margin-bottom:20px">' + villageLogoHtml(item.villageIconUrl, item.villageName, 72) + '<div><b style="font-size:16px">' + esc(item.villageName) + '</b><small>' + esc(item.villageOffice || 'AXANH') + '</small></div><span class="gate-status ' + meta[1] + '" style="margin-left:auto">' + esc(meta[0]) + '</span></div>'
    + '<div class="kv"><span>Làng nhận giá trị</span><b>' + esc(item.villageName) + '</b></div>'
    + '<div class="kv"><span>Làng hỗ trợ</span><b>' + esc(item.supportingVillageName || missing) + '</b></div>'
    + '<div class="kv"><span>Giá trị hỗ trợ</span><b>' + esc(item.valueReceived || missing) + '</b></div>'
    + '<div class="kv"><span>Dấu hiệu thay đổi</span><b>' + esc(item.observedChange || missing) + '</b></div>'
    + '<div class="kv"><span>Xác nhận người nhận</span><b>' + esc(item.recipientConfirmation || missing) + '</b></div>'
    + '<div class="kv"><span>BTC thẩm định</span><b>' + esc(item.btcVerification || missing) + '</b></div>'
    + '<div class="kv"><span>Minh chứng</span><b>' + (item.evidenceCount ? esc(item.evidenceCount + ' mục được liên kết') : missing) + '</b></div>',
    '<button class="btn" data-action="close-modal">Đóng</button>');
}
function clearGate1Data() {
  gate1LoadGeneration += 1;
  Object.assign(GATE1, { loading: false, error: '', items: [], gateRecordCount: 0, unassignedRecordCount: 0, unclassifiedRecordCount: 0 });
}

function forms() {
  const reg = STATE.settings.registrationUrl;
  const res = STATE.settings.resultUrl;
  return pageHeader(
    'Hai biểu mẫu',
    '',
    '<button class="btn btn-gold" data-action="nav" data-page="gate1">' + icon('shield') + ' Xem Gate 1</button>'
  ) + '<div class="form-grid">'
    + '<div class="form-tile">'
    + '  <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px;position:relative;z-index:2">'
    + '    <div class="form-number">BIỂU MẪU 01</div>'
    +      (reg ? '<span class="form-status-tag ready">● Đã liên kết Lark Form</span>' : '<span class="form-status-tag missing">○ Chưa cấu hình biểu mẫu</span>')
    + '  </div>'
    + '  <h3>Tôi có thể giúp / Tôi muốn học</h3>'
    + '  <p>Mở gian hàng tri thức, nêu một kỹ năng có thể chia sẻ và một nhu cầu học hỏi. Dữ liệu gửi từ form này sẽ được ghi trực tiếp vào Lark Base.</p>'
    + '  <div class="btnbar">'
    +      (reg
             ? '<button class="btn btn-primary" data-action="open-lark-form" data-form="registration">' + icon('form') + ' Điền Form 01</button>'
               + '<button class="btn" data-action="external-form" data-form="registration">' + icon('external') + ' Mở trên Lark</button>'
             : '<button class="btn" disabled style="opacity:0.6">' + icon('form') + ' Điền Form 01 (Chưa cấu hình)</button>'
           )
    + '  </div>'
    + '</div>'
    + '<div class="form-tile">'
    + '  <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px;position:relative;z-index:2">'
    + '    <div class="form-number">BIỂU MẪU 02</div>'
    +      (res ? '<span class="form-status-tag ready">● Đã liên kết Lark Form</span>' : '<span class="form-status-tag missing">○ Chưa cấu hình biểu mẫu</span>')
    + '  </div>'
    + '  <h3>Tôi đã học và áp dụng được gì?</h3>'
    + '  <p>Người nhận hỗ trợ chia sẻ bài học, đánh giá mức độ hữu ích và một bước sẽ áp dụng. Ghi nhận dữ liệu để thẩm định điều kiện Gate 1.</p>'
    + '  <div class="btnbar">'
    +      (res
             ? '<button class="btn btn-primary" data-action="open-lark-form" data-form="result">' + icon('form') + ' Điền Form 02</button>'
               + '<button class="btn" data-action="external-form" data-form="result">' + icon('external') + ' Mở trên Lark</button>'
             : '<button class="btn" disabled style="opacity:0.6">' + icon('form') + ' Điền Form 02 (Chưa cấu hình)</button>'
           )
    + '  </div>'
    + '</div>'
    + '</div>'
    + '<div class="section-title"><h2>Luồng kết nối dữ liệu biểu mẫu</h2></div>'
    + '<div class="panel">'
    + '  <div class="steps">'
    + '    <div class="step"><span class="step-num">01 / LARK FORM</span><b>Thu thập dữ liệu</b><p>Form đăng ký / báo cáo ghi bản ghi an toàn vào Lark Base.</p></div>'
    + '    <div class="step"><span class="step-num">02 / BACKEND API</span><b>Đọc và xử lý</b><p>Đồng bộ hồ sơ, kiểm tra điều kiện Gate 1, xác nhận kết quả.</p></div>'
    + '    <div class="step"><span class="step-num">03 / WEB APP</span><b>Trình bày & Vinh danh</b><p>Hiển thị kết nối, lịch sinh hoạt và tiến độ Quán quân.</p></div>'
    + '  </div>'
    + '</div>';
}

function settings() {
  if (!LIVE.currentUser?.isAdmin) {
    return pageHeader('Không có quyền truy cập', 'Chỉ tài khoản quản trị mới có thể cấu hình tích hợp Lark.', '');
  }
  return pageHeader(
    'Cấu hình tích hợp Lark',
    'Quản lý tập trung đường dẫn Form 01 và Form 02 để nhúng trực tiếp vào AXANH Gate1. Cấu hình được lưu an toàn tại máy chủ Backend và áp dụng chung cho tất cả nhân viên.',
    '<button class="btn" data-action="export-demo">' + icon('download') + ' Xuất dữ liệu demo</button>'
  ) + '<div class="panel">'
    + '<div class="section-title" style="margin:0 0 15px">'
    + '  <h2>Liên kết biểu mẫu và Lark Base</h2>'
    + '  <span style="color:var(--blue);font-weight:700">● Lưu tập trung máy chủ (Backend SQLite)</span>'
    + '</div>'
    + '<form id="settingsForm" class="settings-form">'
    + '  <div class="field">'
    + '    <label>URL Form 01 – Đăng ký trao / nhận tri thức</label>'
    + '    <input name="registrationUrl" type="url" value="' + esc(STATE.settings.registrationUrl) + '" placeholder="https://example.larksuite.com/share/base/form/..."/>'
    + '    <small>Dán liên kết Share / Publish Form của Lark Base (bắt buộc HTTPS, tên miền larksuite.com hoặc feishu.cn).</small>'
    + '  </div>'
    + '  <div class="field">'
    + '    <label>URL Form 02 – Báo cáo kết quả hỗ trợ</label>'
    + '    <input name="resultUrl" type="url" value="' + esc(STATE.settings.resultUrl) + '" placeholder="https://example.larksuite.com/share/base/form/..."/>'
    + '    <small>Dán liên kết Share / Publish Form của Lark Base (bắt buộc HTTPS, tên miền larksuite.com hoặc feishu.cn).</small>'
    + '  </div>'
    + '  <div class="field">'
    + '    <label>URL bảng Lark Base (đã cung cấp)</label>'
    + '    <input name="larkBase" type="url" value="' + esc(STATE.settings.larkBase) + '"/>'
    + '    <small>Chỉ dùng để mở nhanh tới bảng Lark Base trên trình duyệt.</small>'
    + '  </div>'
    + '  <div class="field">'
    + '    <label>Backend API URL</label>'
    + '    <input name="apiBase" type="url" value="' + esc(STATE.settings.apiBase || 'http://127.0.0.1:3100') + '" placeholder="http://127.0.0.1:3100"/>'
    + '    <small>Dịch vụ API nội bộ đã kết nối. Không sửa nếu đang chạy mặc định.</small>'
    + '  </div>'
    + '  <div class="btnbar">'
    + '    <button type="submit" class="btn btn-primary">' + icon('check') + ' Lưu cấu hình</button>'
    + '    <button type="button" class="btn" data-action="open-base">' + icon('external') + ' Mở bảng Lark Base</button>'
    + '  </div>'
    + '</form>'
    + '</div>'
    + '<div class="panel" style="margin-top:18px">'
    + '  <div class="row-flex">'
    + '    <div><h3>Kiểm thử và quản lý demo</h3><p>Dữ liệu ghép cặp và form demo chỉ được lưu trên máy / trình duyệt hiện tại, không đồng bộ giữa nhiều máy.</p></div>'
    + '    <button class="btn danger small" data-action="reset-demo">' + icon('refresh') + ' Khôi phục demo</button>'
    + '  </div>'
    + '  <div class="note">URL Form 01 và Form 02 được lưu bền vững trên Backend database. Nhân viên đăng nhập qua Email OTP có thể mở và điền biểu mẫu trực tiếp trên AXANH Gate1.</div>'
    + '</div>';
}
function footer() { return '<footer class="footer"><span>© AXANH · ATED PRO 2026 · Phiên chợ tri thức</span><span>V3.0 UI Prototype · Đã bổ sung Gate 1 và hiệu ứng trình chiếu pháo hoa</span></footer>' }
// Live read-only directory. Keep separate from SEED, matching and Gate 1 demo.
function livePageStatus() {
  if (LIVE.loading) return '<div class="panel"><h3>Đang tải danh bạ...</h3><p>Đang lấy dữ liệu qua backend Lark API.</p></div>';
  if (LIVE.error) return '<div class="panel"><h3>Không thể tải dữ liệu</h3><p>' + esc(LIVE.error) + '</p><button class="btn btn-primary" data-action="live-refresh">Thử tải lại</button></div>';
  if (!LIVE.connected) return '<div class="panel">Chưa kết nối danh bạ Lark Base.</div>';
  return '';
}

function renderVillageLogo(v) {
  const altText = 'Logo ' + (v.name || v.id || 'Làng');
  if (v.iconUrl) {
    return '<div class="village-logo-wrap">'
      + '<img class="village-logo" src="' + esc(v.iconUrl) + '" alt="' + esc(altText) + '" loading="lazy" onerror="this.style.display=\'none\';if(this.nextElementSibling)this.nextElementSibling.style.display=\'grid\';">'
      + '<div class="village-logo-placeholder" style="display:none">AX</div>'
      + '</div>';
  }
  return '<div class="village-logo-wrap"><div class="village-logo-placeholder">AX</div></div>';
}

function villageCard(v) {
  const count = Number.isFinite(v.memberCount) ? String(v.memberCount) : '—';
  const isMyVillage = LIVE.currentUser && (
    (v.id && LIVE.currentUser.villageId && v.id === LIVE.currentUser.villageId) ||
    (v.name && LIVE.currentUser.villageName && v.name.toLowerCase() === LIVE.currentUser.villageName.toLowerCase())
  );
  const myVillageTag = isMyVillage ? ' <span class="tag gold" style="font-size:10.5px;padding:1px 6px">● Làng của tôi</span>' : '';
  const hasScore = Number.isFinite(v.totalScore);
  const hasGate1 = typeof v.gate1Status === 'string' && v.gate1Status.trim() !== '';

  return '<article class="panel village-card"' + (isMyVillage ? ' style="border-top:3px solid #f59e0b"' : '') + '>'
    + '<div class="village-head">'
    + renderVillageLogo(v)
    + '<div class="village-head-info">'
    + '<div class="row-flex"><b>' + esc(v.name || v.id || 'Làng chưa có tên') + '</b>' + myVillageTag + '<span class="tag teal">LARK · ' + esc(v.id || '—') + '</span></div>'
    + '<p class="village-slogan">' + esc(v.slogan || 'Chưa cập nhật khẩu hiệu') + '</p>'
    + '</div>'
    + '</div>'
    + '<div class="kv"><span>Văn phòng</span><b>' + esc(v.office || '—') + '</b></div>'
    + '<div class="kv"><span>Trưởng làng</span><b>' + esc(v.leader || '—') + '</b></div>'
    + '<div class="kv"><span>Phó làng</span><b>' + esc(v.deputy || '—') + '</b></div>'
    + '<div class="kv"><span>Thành viên</span><b>' + count + '</b></div>'
    + (hasScore ? '<div class="kv"><span>Điểm trong Base</span><b>' + String(v.totalScore) + '</b></div>' : '')
    + (hasGate1 ? '<div class="kv"><span>Gate 1 (theo T01)</span><b>' + esc(v.gate1Status) + '</b></div>' : '')
    + '</article>';
}

function liveVillagesPage() {
  const pending = livePageStatus();
  return pageHeader('11 Làng AXANH', '', '<button class="btn" data-action="live-refresh">' + icon('refresh') + ' Làm mới dữ liệu</button>')
    + pending
    + (LIVE.connected ? '<div class="grid3">' + [...LIVE.villages].sort((a, b) => String(a.id).localeCompare(String(b.id))).map(villageCard).join('') + '</div>' : '');
}

function matchingMembers() {
  const q = liveMemberSearch.trim().toLocaleLowerCase('vi');
  return LIVE.members.filter((m) => {
    const hay = [m.id, m.name, m.villageName, m.office, m.programRole].filter(Boolean).join(' ').toLocaleLowerCase('vi');
    return hay.includes(q) && (liveMemberOffice === 'all' || m.office === liveMemberOffice);
  });
}

function renderMemberAvatar(m) {
  const altText = 'Avatar ' + (m.name || m.id || 'thành viên');
  if (m.avatarUrl) {
    return '<div class="person-avatar" style="height:52px;width:52px;padding:0;overflow:hidden">'
      + '<img class="member-avatar" src="' + esc(m.avatarUrl) + '" alt="' + esc(altText) + '" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block" onerror="this.style.display=\'none\';if(this.nextElementSibling)this.nextElementSibling.style.display=\'grid\';">'
      + '<div class="member-avatar-placeholder" style="display:none;width:100%;height:100%;place-items:center">AX</div>'
      + '</div>';
  }
  return '<div class="person-avatar" style="height:52px;width:52px">AX</div>';
}

function liveMemberCards() {
  const items = matchingMembers();
  if (!items.length) return '<div class="empty">Không tìm thấy thành viên phù hợp với bộ lọc.</div>';
  return items.map((m) => {
    const status = m.active === true ? 'Đang tham gia' : m.active === false ? 'Không tham gia' : 'Chưa xác định';
    return '<article class="person-card"><div class="person-head">' + renderMemberAvatar(m) + '<div><b>' + esc(m.name || 'Chưa có tên') + '</b><small>' + esc(m.id || '—') + '</small></div><span class="tag teal">LARK</span></div>'
      + '<div class="kv"><span>Làng</span><b>' + esc(m.villageName || 'Chưa liên kết') + '</b></div>'
      + '<div class="kv"><span>Văn phòng</span><b>' + esc(m.office || '—') + '</b></div>'
      + '<div class="kv"><span>Vai trò</span><b>' + esc(m.programRole || '—') + '</b></div>'
      + '<div class="kv"><span>Active✅</span><b>' + esc(status) + '</b></div>'
      + '<p class="muted" style="font-size:12px">Kỹ năng và nhu cầu chưa được đăng ký trong Base.</p></article>';
  }).join('');
}

function liveMembersPage() {
  const pending = livePageStatus();
  const n = LIVE.connected ? matchingMembers().length : 0;
  const villageName = LIVE.currentUser?.villageName || 'Tên làng';
  return pageHeader('Danh sách thành viên – ' + villageName, '', '<button class="btn" data-action="live-refresh">' + icon('refresh') + ' Làm mới dữ liệu</button>')
    + pending
    + (LIVE.connected ? '<div class="search-area"><div class="field-search">' + icon('search') + '<input id="liveMemberSearch" placeholder="Tìm tên, làng, mã thành viên..." value="' + esc(liveMemberSearch) + '"></div>'
      + '<select class="select" id="liveMemberOffice"><option value="all">Tất cả văn phòng</option>'
      + ['VPC', 'VP1', 'VP2', 'IT', 'HR'].map(x => '<option value="' + x + '" ' + (liveMemberOffice === x ? 'selected' : '') + '>' + x + '</option>').join('')
      + '</select></div><p class="muted" id="liveMemberCount">Đang hiển thị ' + n + '/' + LIVE.members.length + ' thành viên</p>'
      + '<div id="liveMemberGrid" class="grid3">' + liveMemberCards() + '</div>' : '');
}

function renderUserHeader() {
  const container = document.querySelector('.top-actions');
  if (!container) return;
  const u = LIVE.currentUser;
  if (u) {
    const avatarHtml = u.avatarUrl
      ? '<img class="user-avatar-img" src="' + esc(u.avatarUrl) + '" alt="Avatar ' + esc(u.name || '') + '">'
      : '<div class="user-avatar-initials">' + esc(u.name ? u.name.slice(0, 2).toUpperCase() : 'AX') + '</div>';

    container.innerHTML = '<span class="chip chip-demo">● ' + (LIVE.connected ? 'LARK LIVE' : 'DEMO') + '</span>'
      + '<button class="topbar-bell-btn" data-action="toggle-notifications" aria-label="Lời mời kết nối" title="Lời mời kết nối (' + (LIVE.notificationCount || 0) + ' chờ xác nhận)">'
      + icon('bell', 18)
      + (LIVE.notificationCount > 0 ? '<span class="topbar-bell-badge">' + LIVE.notificationCount + '</span>' : '')
      + '</button>'
      + '<div class="user-menu-wrap">'
      + '  <button class="user-avatar-btn" data-action="toggle-user-menu" aria-expanded="false" aria-haspopup="true" title="Tài khoản">'
      + '    ' + avatarHtml
      + '    <span class="user-avatar-name">' + esc(u.name || 'Thành viên') + '</span>'
      + '    <span class="user-avatar-caret">▾</span>'
      + '  </button>'
      + '  <div class="user-dropdown" id="userDropdown" role="menu">'
      + '    <div class="user-dropdown-header">'
      + '      <div class="user-dropdown-name">' + esc(u.name || 'Thành viên') + '</div>'
      + '      <div class="user-dropdown-meta">'
      + '        <strong style="color:var(--navy);font-size:12.5px">' + esc(u.villageName || '—') + '</strong><br>'
      + '        <span>' + esc(u.office || '') + (u.role ? ' · ' + esc(u.role) : '') + '</span><br>'
      + '        <span style="font-family:Consolas,monospace;font-size:11px;color:var(--muted)">' + esc(u.memberId || '') + '</span>'
      + '      </div>'
      + '    </div>'
      + '    <button class="user-dropdown-item" data-action="my-profile" role="menuitem">'
      + '      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--blue)"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
      + '      Hồ sơ của tôi'
      + '    </button>'
      + '    <button class="user-dropdown-item danger" data-action="logout" role="menuitem">'
      + '      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>'
      + '      Đăng xuất'
      + '    </button>'
      + '  </div>'
      + '</div>';
  } else {
    container.innerHTML = '<span class="chip chip-demo">● CHẾ ĐỘ DEMO</span>'
      + '<a href="/auth/lark/login" class="btn btn-primary small" style="text-decoration:none;display:inline-flex;align-items:center;gap:6px">🔑 Đăng nhập Lark</a>';
  }
}

const AUTH_FLOW = {
  step: 'email', // 'email' | 'otp'
  email: '',
  cooldown: 0,
  expiresIn: 0,
  timerInterval: null,
};

function clearAuthTimer() {
  if (AUTH_FLOW.timerInterval) {
    clearInterval(AUTH_FLOW.timerInterval);
    AUTH_FLOW.timerInterval = null;
  }
}

function startAuthTimer() {
  clearAuthTimer();
  AUTH_FLOW.timerInterval = setInterval(() => {
    let changed = false;
    if (AUTH_FLOW.cooldown > 0) {
      AUTH_FLOW.cooldown -= 1;
      changed = true;
    }
    if (AUTH_FLOW.expiresIn > 0) {
      AUTH_FLOW.expiresIn -= 1;
      changed = true;
    }
    if (changed) {
      updateAuthTimerDisplay();
    }
    if (AUTH_FLOW.cooldown <= 0 && AUTH_FLOW.expiresIn <= 0) {
      clearAuthTimer();
    }
  }, 1000);
}

function formatMinutes(seconds) {
  const m = Math.floor(Math.max(0, seconds) / 60);
  const s = Math.max(0, seconds) % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function updateAuthTimerDisplay() {
  const timerEl = document.getElementById('authExpireTimer');
  if (timerEl) {
    timerEl.textContent = formatMinutes(AUTH_FLOW.expiresIn);
  }
  const resendBtn = document.getElementById('authResendBtn');
  if (resendBtn) {
    if (AUTH_FLOW.cooldown > 0) {
      resendBtn.disabled = true;
      resendBtn.textContent = `Gửi lại mã (${AUTH_FLOW.cooldown}s)`;
    } else {
      resendBtn.disabled = false;
      resendBtn.textContent = 'Gửi lại mã';
    }
  }
}

function renderAuthScreen(opts = {}) {
  const { loading = false, error = '' } = opts;
  const authEl = document.getElementById('authScreen');
  const appShell = document.getElementById('appShell') || document.querySelector('.app-shell');
  if (!authEl) return;

  if (loading) {
    authEl.style.display = 'flex';
    if (appShell) appShell.style.display = 'none';
    authEl.innerHTML = '<div class="axanh-auth-loading"><div class="axanh-auth-spinner"></div><span>Đang kết nối hệ thống...</span></div>';
    return;
  }

  authEl.style.display = 'flex';
  if (appShell) appShell.style.display = 'none';

  const logoSrc = (window.SEED && window.SEED.navyLogo) ? window.SEED.navyLogo : '';
  const logoTag = logoSrc
    ? '<img class="axanh-login-logo" src="' + logoSrc + '" alt="Logo AXANH">'
    : '<div style="font-size:28px;font-weight:900;color:#eff5ff;margin-bottom:20px;letter-spacing:2px">AXANH</div>';
  const errorHtml = error ? '<div class="axanh-login-error">⚠ ' + esc(error) + '</div>' : '';


  let formContentHtml = '';

  if (AUTH_FLOW.step === 'email') {
    formContentHtml = '<form id="authEmailForm" autocomplete="on">'
      + '<div class="axanh-login-input-group">'
      + '  <label class="axanh-login-label" for="authEmailInput">Email nhân viên đã liên kết</label>'
      + '  <input class="axanh-login-input" type="email" id="authEmailInput" name="email" required autocomplete="email" placeholder="ví dụ: ten.nv@axanh.com" value="' + esc(AUTH_FLOW.email) + '">'
      + '</div>'
      + errorHtml
      + '<button class="axanh-login-btn" type="submit" id="authSendOtpBtn">'
      + '  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m22 2-7 20-4-9-9-4zM22 2 11 13"/></svg>'
      + '  Nhận mã OTP qua Email'
      + '</button>'
      + '</form>';
  } else {
    // Step: OTP
    formContentHtml = '<form id="authOtpForm" autocomplete="off">'
      + '<div class="axanh-otp-meta">'
      + '  Đã gửi mã xác thực 6 số đến: <strong style="color:#eff5ff">' + esc(AUTH_FLOW.email) + '</strong><br>'
      + '  Hiệu lực còn lại: <span class="axanh-otp-timer" id="authExpireTimer">' + formatMinutes(AUTH_FLOW.expiresIn) + '</span>'
      + '</div>'
      + '<div class="axanh-login-input-group">'
      + '  <input class="axanh-login-input axanh-otp-input" type="text" id="authOtpInput" name="otp" required inputmode="numeric" pattern="[0-9]{6}" maxlength="6" autocomplete="one-time-code" placeholder="••••••" autofocus>'
      + '</div>'
      + errorHtml
      + '<button class="axanh-login-btn btn-teal" type="submit" id="authVerifyOtpBtn">'
      + '  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m5 12 5 5L20 6"/></svg>'
      + '  Xác nhận & Đăng nhập'
      + '</button>'
      + '<div class="axanh-otp-actions">'
      + '  <button type="button" class="axanh-link-btn" id="authBackBtn">← Đổi email khác</button>'
      + '  <button type="button" class="axanh-link-btn" id="authResendBtn"' + (AUTH_FLOW.cooldown > 0 ? ' disabled' : '') + '>'
      + (AUTH_FLOW.cooldown > 0 ? `Gửi lại mã (${AUTH_FLOW.cooldown}s)` : 'Gửi lại mã')
      + '  </button>'
      + '</div>'
      + '</form>';
  }

  authEl.innerHTML = '<div class="axanh-login-card">'
    + logoTag
    + '<div class="axanh-login-badge">ATED PRO 2026</div>'
    + '<h1 class="axanh-login-title">Phiên Chợ Tri Thức</h1>'
    + '<p class="axanh-login-desc">'
    + (AUTH_FLOW.step === 'email' ? 'Nhập email nhân viên AXANH để nhận mã xác thực bảo mật.' : 'Nhập mã gồm 6 chữ số vừa nhận trong email.')
    + '</p>'
    + formContentHtml
    + '<div class="axanh-login-footer">Hệ thống nội bộ AXANH · Môi trường LAN<br>Xác thực qua danh bạ thành viên T02_Members</div>'
    + '</div>';

  // Attach Handlers
  const emailForm = document.getElementById('authEmailForm');
  if (emailForm) {
    emailForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('authEmailInput');
      const emailVal = (emailInput?.value || '').trim();
      if (!emailVal) return;

      const btn = document.getElementById('authSendOtpBtn');
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = 'Đang gửi mã xác thực...';
      }

      try {
        const res = await window.AXANH_LIVE_API.requestOtp(emailVal);
        AUTH_FLOW.email = emailVal;
        AUTH_FLOW.step = 'otp';
        AUTH_FLOW.cooldown = res.cooldownSeconds || 60;
        AUTH_FLOW.expiresIn = (res.ttlMinutes || 5) * 60;
        startAuthTimer();
        renderAuthScreen();
      } catch (err) {
        renderAuthScreen({ error: err.message || 'Không thể gửi mã xác thực.' });
      }
    });
  }

  const otpForm = document.getElementById('authOtpForm');
  if (otpForm) {
    const otpInput = document.getElementById('authOtpInput');
    if (otpInput) {
      otpInput.focus();
      otpInput.addEventListener('input', () => {
        // Only allow digits
        otpInput.value = otpInput.value.replace(/\D/g, '').slice(0, 6);
        if (otpInput.value.length === 6) {
          // Auto submit when 6 digits entered
          otpForm.requestSubmit();
        }
      });
    }

    otpForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const otpVal = (otpInput?.value || '').trim();
      if (otpVal.length !== 6) {
        renderAuthScreen({ error: 'Vui lòng nhập đủ 6 chữ số mã xác thực.' });
        return;
      }

      const verifyBtn = document.getElementById('authVerifyOtpBtn');
      if (verifyBtn) {
        verifyBtn.disabled = true;
        verifyBtn.innerHTML = 'Đang xác thực...';
      }

      try {
        const res = await window.AXANH_LIVE_API.verifyOtp(AUTH_FLOW.email, otpVal);
        if (res && res.authenticated) {
          clearAuthTimer();
          AUTH_FLOW.step = 'email';
          AUTH_FLOW.email = '';
          LIVE.currentUser = res.user;
          showAppShell();
          render();
          await loadLiveData();
        } else {
          renderAuthScreen({ error: 'Xác thực không thành công.' });
        }
      } catch (err) {
        renderAuthScreen({ error: err.message || 'Mã xác thực không hợp lệ.' });
      }
    });

    const backBtn = document.getElementById('authBackBtn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        clearAuthTimer();
        AUTH_FLOW.step = 'email';
        renderAuthScreen();
      });
    }

    const resendBtn = document.getElementById('authResendBtn');
    if (resendBtn) {
      resendBtn.addEventListener('click', async () => {
        if (AUTH_FLOW.cooldown > 0) return;
        resendBtn.disabled = true;
        resendBtn.textContent = 'Đang gửi lại...';
        try {
          const res = await window.AXANH_LIVE_API.requestOtp(AUTH_FLOW.email);
          AUTH_FLOW.cooldown = res.cooldownSeconds || 60;
          AUTH_FLOW.expiresIn = (res.ttlMinutes || 5) * 60;
          startAuthTimer();
          renderAuthScreen();
        } catch (err) {
          renderAuthScreen({ error: err.message || 'Không thể gửi lại mã.' });
        }
      });
    }
  }
}

function showAuthScreen(error = '') {
  renderAuthScreen({ error });
}

function showAppShell() {
  const authEl = document.getElementById('authScreen');
  const appShell = document.getElementById('appShell') || document.querySelector('.app-shell');
  if (authEl) authEl.style.display = 'none';
  if (appShell) appShell.style.display = '';
}

function openMyProfileModal() {
  const u = LIVE.currentUser;
  if (!u) return;
  const avatarHtml = u.avatarUrl
    ? '<img src="' + esc(u.avatarUrl) + '" alt="Avatar" style="width:72px;height:72px;border-radius:50%;object-fit:cover;border:3px solid #edbd4b;margin-bottom:14px">'
    : '<div class="avatar-mini" style="width:72px;height:72px;font-size:22px;border:3px solid #edbd4b;margin-bottom:14px">' + esc(u.name ? u.name.slice(0, 2).toUpperCase() : 'AX') + '</div>';
  openModal('Hồ sơ của tôi',
    '<div style="text-align:center">' + avatarHtml + '</div>'
    + '<div class="kv"><span>Họ tên</span><b>' + esc(u.name || '—') + '</b></div>'
    + '<div class="kv"><span>Member ID</span><b>' + esc(u.memberId || '—') + '</b></div>'
    + '<div class="kv"><span>Làng</span><b>' + esc(u.villageName || '—') + '</b></div>'
    + '<div class="kv"><span>Văn phòng</span><b>' + esc(u.office || '—') + '</b></div>'
    + '<div class="kv"><span>Vai trò</span><b>' + esc(u.role || '—') + '</b></div>',
    '<button class="btn" data-action="close-modal">Đóng</button>'
  );
}

async function loadLiveData() {
  if (!window.AXANH_LIVE_API) {
    LIVE.loading = false;
    LIVE.error = 'Thiếu FrontEnd/api.js.';
    render();
    return;
  }
  LIVE.loading = true;
  LIVE.error = '';
  render();
  try {
    const { villages, members } = await window.AXANH_LIVE_API.loadData();
    LIVE.villages = villages;
    LIVE.members = members;
    LIVE.connected = true;
  } catch (error) {
    LIVE.connected = false;
    LIVE.villages = [];
    LIVE.members = [];
    LIVE.error = error instanceof Error ? error.message : 'Không xác định';
  } finally {
    LIVE.loading = false;
    render();
  }
  // Tải booths và connections song song sau khi đã kết nối
  loadLiveBooths();
  loadLiveConnections();
}

async function loadLiveConnections() {
  const api = window.AXANH_LIVE_API;

  if (!api ||
      typeof api.getConnectionsMine !== 'function' ||
      typeof api.getConnectionsInbox !== 'function' ||
      typeof api.getNotificationsCount !== 'function') {
    const message = 'Dịch vụ kết nối chưa sẵn sàng.';
    if (LIVE.connectionsError !== message) toast(message, 'warn');
    LIVE.connectionsError = message;
    return;
  }

  LIVE.connectionsLoading = true;

  try {
    const [mine, inbox, notif] = await Promise.all([
      api.getConnectionsMine(),
      api.getConnectionsInbox(),
      api.getNotificationsCount(),
    ]);

    if (!Array.isArray(mine) ||
        !Array.isArray(inbox) ||
        !notif ||
        !Number.isSafeInteger(notif.pendingCount) ||
        notif.pendingCount < 0) {
      throw new Error('Dữ liệu kết nối từ Backend không hợp lệ.');
    }

    LIVE.connections = mine;
    LIVE.inboxConnections = inbox;
    LIVE.notificationCount = notif.pendingCount;
    LIVE.connectionsError = '';
  } catch (err) {
    if (err?.status === 401) {
      LIVE.connectionsError = 'Phiên đăng nhập hết hạn.';
      console.warn('[Connections] Session expired while loading connections');
      return;
    }
    const message = 'Không thể đồng bộ kết nối. Dữ liệu có thể đã cũ.';
    console.warn('[Connections] Failed to load live connections:', err);
    if (LIVE.connectionsError !== message) {
      toast(message, 'warn');
    }
    LIVE.connectionsError = message;
  } finally {
    LIVE.connectionsLoading = false;
    renderUserHeader();
    if (currentPage === 'matches' || currentPage === 'network' || currentPage === 'market' || currentPage === 'home') render();
  }
}

async function loadLearningData() {
  const generation = ++learningLoadGeneration;
  const api = window.AXANH_LIVE_API;
  if (!api?.getLearningData) {
    LIVE.learning.error = 'Chưa kết nối API lịch học.';
    LIVE.learning.sessions = [];
    LIVE.learning.availableConnections = [];
    if (isLearningPage()) render();
    return;
  }
  LIVE.learning.loading = true;
  LIVE.learning.error = '';
  if (isLearningPage()) render();
  try {
    const data = await api.getLearningData();
    if (generation !== learningLoadGeneration) return;
    LIVE.learning.sessions = Array.isArray(data.items) ? data.items : [];
    LIVE.learning.availableConnections = Array.isArray(data.availableConnections) ? data.availableConnections : [];
    LIVE.learning.reportOptions = data.reportOptions || LIVE.learning.reportOptions;
  } catch (err) {
    if (generation !== learningLoadGeneration) return;
    LIVE.learning.error = err.message || 'Không thể tải lịch học từ Lark Base.';
    LIVE.learning.sessions = [];
    LIVE.learning.availableConnections = [];
  } finally {
    if (generation === learningLoadGeneration) {
      LIVE.learning.loading = false;
      if (isLearningPage()) render();
    }
  }
}

function resetLearningData() {
  learningLoadGeneration += 1;
  LIVE.learning = { loading: false, error: '', sessions: [], availableConnections: [], reportOptions: { applied: [], formats: [] } };
}

// Polling định kỳ mỗi 45s để cập nhật chuông thông báo
if (!window.__notifIntervalSet) {
  window.__notifIntervalSet = true;
  setInterval(async () => {
    if (!LIVE.currentUser || !window.AXANH_LIVE_API?.getNotificationsCount) return;
    try {
      const n = await window.AXANH_LIVE_API.getNotificationsCount();
      const newCount = n?.pendingCount || 0;
      if (newCount !== LIVE.notificationCount) {
        LIVE.notificationCount = newCount;
        renderUserHeader();
        if (currentPage === 'matches') {
          loadLiveConnections();
        }
      }
    } catch {}
  }, 45000);
}

async function loadLiveBooths(forcSync = false) {
  if (!window.AXANH_LIVE_API || !window.AXANH_LIVE_API.getBooths) return;
  LIVE.boothsLoading = true;
  LIVE.boothsError = '';
  if (currentPage === 'home' || currentPage === 'market' || currentPage === 'network') render();
  try {
    let result;
    if (forcSync && window.AXANH_LIVE_API.syncBooths) {
      // Gọi sync để backend force-fetch từ Lark Base bỏ qua cache
      result = await window.AXANH_LIVE_API.syncBooths();
      LIVE.booths = Array.isArray(result?.items) ? result.items : [];
    } else {
      const items = await window.AXANH_LIVE_API.getBooths();
      LIVE.booths = Array.isArray(items) ? items : [];
    }
  } catch (err) {
    LIVE.boothsError = err instanceof Error ? err.message : 'Không tải được gian hàng.';
    LIVE.booths = [];
  } finally {
    LIVE.boothsLoading = false;
    if (currentPage === 'home' || currentPage === 'market' || currentPage === 'network') render();
  }
}

function render() {
  const logoEl = document.querySelector("#brandLogo");
  if (logoEl) logoEl.src = SEED.navyLogo;
  renderNav();
  const topCat = document.querySelector('#topCategory');
  const topTit = document.querySelector('#topTitle');
  if (topCat) topCat.textContent = PAGE_LABELS[currentPage][0];
  if (topTit) topTit.textContent = PAGE_LABELS[currentPage][1];
  const viewEl = document.querySelector('#view');
  if (viewEl) {
    let body = { home, villages: liveVillagesPage, members: liveMembersPage, market, matches, network, 'connection-detail': connectionDetail, schedule, 'schedule-all': scheduleAll, 'learning-history': learningHistory, library, awards: honors, gate1, forms, settings }[currentPage]();
    viewEl.innerHTML = body + footer();
  }
  const sidebar = document.querySelector('#sidebar');
  if (sidebar) sidebar.classList.remove('show');
  renderUserHeader();
}
function openModal(title, body, footer = '') { const root = document.querySelector('#modal'); root.innerHTML = '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle"><div class="modal-head"><div><div class="eyebrow">ATED PRO · PHIÊN CHỢ TRI THỨC</div><h2 id="modalTitle">' + title + '</h2></div><button class="modal-close" data-action="close-modal" aria-label="Đóng">' + icon('close', 18) + '</button></div><div class="modal-body">' + body + '</div>' + (footer ? '<div class="modal-foot">' + footer + '</div>' : '') + '</div>'; root.classList.add('open'); document.body.style.overflow = 'hidden' }
function closeModal() { if (inFlightCancelId) return; document.querySelector('#modal').classList.remove('open'); document.querySelector('#modal').innerHTML = ''; document.body.style.overflow = '' }
function openPeerBoothModal(peerId, connId) {
  const member = (LIVE.members || []).find(m => m.id === peerId || m.memberId === peerId);
  const connection = (LIVE.connections || []).find(c =>
    c.connectionType === 'personal' &&
    (c.connectionId === connId || c.recordId === connId || c.id === connId)
  );
  if (!connection) {
    openModal(
      'Gian hàng tri thức',
      '<div class="empty"><b>Không tìm thấy kết nối này</b><p>Vui lòng làm mới dữ liệu kết nối rồi thử lại.</p></div>',
      '<button class="btn" data-action="close-modal">Đóng</button>'
    );
    return;
  }

  const sourceMemberId = connection.sourceBooth?.authorMemberId || connection.requestedBy;
  const targetMemberId = connection.targetBooth?.authorMemberId || connection.targetMemberId;
  const isSourceBooth = sourceMemberId === peerId;
  const peerBooth = isSourceBooth
    ? connection.sourceBooth
    : targetMemberId === peerId
      ? connection.targetBooth
      : connection.requestedBy === LIVE.currentUser?.memberId
        ? connection.targetBooth
        : connection.sourceBooth;
  const boothRecordId = isSourceBooth ? connection.sourceBoothRecordId : connection.targetBoothRecordId;
  const fullBooth = (LIVE.booths || []).find(b =>
    (peerBooth?.recordId && b.recordId === peerBooth.recordId) ||
    (peerBooth?.boothId && b.boothId === peerBooth.boothId) ||
    (boothRecordId && b.recordId === boothRecordId)
  );
  const booth = peerBooth || fullBooth ? { ...(peerBooth || {}), ...(fullBooth || {}) } : null;
  const peerName = booth?.authorName || member?.name || 'Thành viên';

  if (!booth) {
    openModal(
      'Gian hàng tri thức · ' + esc(peerName),
      '<div class="empty"><b>Chưa có thông tin gian hàng trong kết nối này</b><p>Không tìm thấy gian hàng tri thức đã được dùng để tạo kết nối.</p></div>',
      '<button class="btn" data-action="close-modal">Đóng</button>'
    );
    return;
  }

  const villageName = booth.authorVillageName || booth.villageName || member?.villageName || 'Chưa xác định';
  const village = (LIVE.villages || []).find(v =>
    (booth.villageId && v.id === booth.villageId) || v.name === villageName
  );
  const offerTopics = Array.isArray(booth.offerTags) ? booth.offerTags : [booth.offerTopic || booth.offerTag];
  const statusBadge = connection.status === 'Accepted'
    ? '<span class="conn-status-accepted">' + icon('checkCircle', 13) + ' Đã kết nối</span>'
    : '<span class="conn-status-legacy">⏳ Chờ duyệt (cũ)</span>';
  const canSch = connection.status === 'Accepted' && isConnectionParticipant(connection);
  const canCancel = canCancelConnection(connection);
  const footer = '<button type="button" class="btn" data-action="close-modal">Đóng</button>'
    + (canSch ? '<button type="button" class="btn btn-primary" data-action="schedule-connection" data-id="' + esc(connection.id) + '">' + icon('calendar', 14) + ' Đặt lịch cùng học</button>' : '')
    + (canCancel ? '<button type="button" class="btn btn-cancel-outline" data-action="prompt-cancel-connection" data-id="' + esc(connection.id) + '" data-label="' + esc(peerName) + '" data-type="personal">Hủy kết nối</button>' : '');
  const body = '<div class="person-head" style="margin-bottom:20px;display:flex;align-items:center;gap:12px">'
    + villageLogoHtml(booth.villageIconUrl || village?.iconUrl, villageName, 72)
    + '<div style="flex:1;min-width:0"><b style="font-size:16px">' + esc(villageName) + '</b><small>'
    + esc(booth.authorOffice || member?.office || '—')
    + '</small></div>'
    + statusBadge
    + '</div>'
    + '<div class="note">Thông tin bên dưới lấy từ gian hàng tri thức của ' + esc(peerName) + '.</div>'
    + '<div class="kv"><span>Có thể chia sẻ</span><b>' + esc(booth.offer || 'Chưa cập nhật') + '</b></div>'
    + '<div class="kv"><span>Chủ đề</span><b>' + esc(offerTopics.filter(Boolean).join(' · ') || 'Chưa cập nhật') + '</b></div>'
    + '<div class="kv"><span>Muốn học</span><b>' + esc(booth.need || 'Chưa cập nhật') + '</b></div>'
    + (formatPreferredSlot(booth.availability) ? '<div class="kv"><span>Khung giờ ưu tiên</span><b>' + esc(formatPreferredSlot(booth.availability)) + '</b></div>' : '');
  openModal(
    'Phiên chợ tri thức · ' + esc(peerName),
    body,
    footer
  );
}
function profileModal(id) { const p = person(id); if (!p) return; openModal(esc(p.name), '<div class="person-head" style="margin-bottom:22px">' + pic(p, 72) + '<div><b style="font-size:16px">' + esc(p.village) + '</b><small>' + esc(p.office) + ' · ' + (p.confirmed ? 'Tự khai' : 'Hồ sơ minh họa') + '</small></div></div><div class="note">Kỹ năng và nhu cầu hiển thị là ví dụ thiết kế; chưa được người tham gia xác nhận. Không dùng làm cơ sở đánh giá cá nhân.</div><div class="kv"><span>Có thể chia sẻ</span><b>' + esc(p.offer) + '</b></div><div class="kv"><span>Chủ đề</span><b>' + esc((p.offerTags || []).join(' · ')) + '</b></div><div class="kv"><span>Muốn học</span><b>' + esc(p.need) + '</b></div><div class="kv"><span>Thời gian gợi ý</span><b>' + esc(p.availability.join(' · ')) + '</b></div>', '<button class="btn" data-action="close-modal">Đóng</button><button class="btn btn-primary" data-action="choose-seeker" data-id="' + p.id + '">Tìm người phù hợp</button>') }
function openLarkFormModal(type) {
  const isReg = type === 'registration';
  const title = isReg ? 'Form 01 · Đăng ký trao / nhận tri thức' : 'Form 02 · Báo cáo kết quả hỗ trợ';
  const url = STATE.settings[isReg ? 'registrationUrl' : 'resultUrl'];
  if (!validLink(url)) {
    toast('Chưa cấu hình URL biểu mẫu Lark cho form này.', 'warn');
    navigate('settings');
    return;
  }
  const root = document.querySelector('#modal');
  root.innerHTML = '<div class="modal modal-lark" role="dialog" aria-modal="true" aria-labelledby="modalTitle">'
    + '  <div class="modal-head">'
    + '    <div class="modal-lark-title-wrap">'
    + '      <div class="eyebrow">LARK BASE FORM NHÚNG TRỰC TIẾP</div>'
    + '      <h2 id="modalTitle">' + esc(title) + '</h2>'
    + '    </div>'
    + '    <div class="modal-lark-actions">'
    + '      <a href="' + esc(url) + '" target="_blank" rel="noopener noreferrer" class="btn small btn-primary" style="text-decoration:none;display:inline-flex;align-items:center;gap:6px">'
    +          icon('external', 14) + ' Mở trên Lark'
    + '      </a>'
    + '      <button class="modal-close" data-action="close-modal" aria-label="Đóng">' + icon('close', 18) + '</button>'
    + '    </div>'
    + '  </div>'
    + '  <div class="lark-fallback-bar">'
    + '    <span>ℹ️ Nếu biểu mẫu không hiển thị do chính sách bảo mật của Lark/trình duyệt, hãy nhấn nút <b>Mở trên Lark</b> để điền trực tiếp.</span>'
    + '    <a href="' + esc(url) + '" target="_blank" rel="noopener noreferrer" style="color:#92400e;font-weight:700;text-decoration:underline">Mở tab mới ↗</a>'
    + '  </div>'
    + '  <div class="modal-body">'
    + '    <div class="lark-iframe-container">'
    + '      <div class="lark-iframe-loader" id="larkLoader">'
    + '        <div class="lark-spinner"></div>'
    + '        <span>Đang tải biểu mẫu từ Lark Base...</span>'
    + '      </div>'
    + '      <iframe class="lark-iframe" src="' + esc(url) + '" allow="camera; microphone; clipboard-write" onload="const el = document.getElementById(\'larkLoader\'); if(el) el.classList.add(\'hidden\');"></iframe>'
    + '    </div>'
    + '  </div>'
    + '</div>';
  root.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function renderRegistrationBanner(type) {
  const u = LIVE.currentUser;
  if (!u) {
    return {
      html: '<div class="status-banner" style="margin-bottom:16px">⚠️ Chưa xác định được phiên đăng nhập. Vui lòng đăng xuất và đăng nhập lại.</div>',
      canSubmit: false,
    };
  }

  if (type === 'village') {
    const v = (LIVE.villages || []).find(x => (u.villageId && x.id === u.villageId) || (u.villageName && x.name === u.villageName));
    const villageId = u.villageId || v?.id;
    const villageName = u.villageName || v?.name;
    const office = u.office || v?.office || '—';

    if (!villageId || !villageName || villageName === 'Chưa xác định') {
      return {
        html: '<div style="display:flex;align-items:flex-start;gap:14px;background:#fff1f2;border:1px solid #fecdd3;border-radius:12px;padding:14px 18px;margin-bottom:18px;color:#be123c">'
          + '<div style="font-size:24px;line-height:1">⚠️</div>'
          + '<div>'
          + '<div style="font-weight:800;font-size:14px;color:#9f1239">Không thể mở gian hàng cấp Làng</div>'
          + '<div style="font-size:12px;line-height:1.6;margin-top:2px;color:#4c0519">Tài khoản <b>' + esc(u.name || 'Thành viên') + '</b> chưa được liên kết với Làng nào trong danh bạ 11 Làng (T01_Villages). Chỉ thành viên có làng trực thuộc mới có thể mở gian hàng cho Làng.</div>'
          + '</div></div>',
        canSubmit: false,
      };
    }

    const logoUrl = v?.iconUrl || (villageId ? '/api/v1/villages/' + encodeURIComponent(villageId) + '/icon' : null);
    const logoHtml = logoUrl
      ? '<img src="' + esc(logoUrl) + '" alt="' + esc(villageName) + '" style="width:52px;height:52px;object-fit:contain;border-radius:12px;background:#fff;padding:4px;border:1px solid #bfdbfe;display:block" onerror="this.style.display=\'none\';">'
      : '<div style="width:52px;height:52px;border-radius:12px;background:#dbeafe;color:#1e40af;display:grid;place-items:center;font-weight:800;font-size:18px;border:1px solid #bfdbfe">🏛️</div>';

    return {
      html: '<div style="display:flex;align-items:center;gap:14px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:14px 18px;margin-bottom:18px">'
        + '<div style="flex-shrink:0">' + logoHtml + '</div>'
        + '<div>'
        + '<div style="font-weight:800;font-size:15px;color:#1e3a8a">' + esc(villageName) + ' <span style="font-size:11px;font-weight:600;background:#dbeafe;color:#1e40af;padding:2px 8px;border-radius:6px;margin-left:6px">GIAN HÀNG LÀNG</span></div>'
        + '<div style="font-size:12px;color:#475569;line-height:1.6">Văn phòng: ' + esc(office) + ' · Đại diện đăng ký: <b style="color:#0f172a">' + esc(u.name || 'Bạn') + '</b></div>'
        + '<span style="display:inline-block;margin-top:4px;font-size:11px;background:#2563eb;color:#fff;padding:2px 10px;border-radius:99px;font-weight:600">● Đại diện Làng · Lưu vào Lark Base với Booth_Type = Làng</span>'
        + '</div></div>',
      canSubmit: true,
    };
  }

  // Personal banner
  const avatarHtml = u.avatarUrl
    ? '<img src="' + esc(u.avatarUrl) + '" alt="avatar" style="width:52px;height:52px;border-radius:50%;object-fit:cover;display:block" onerror="this.style.display=\'none\';">'
    : '<div style="width:52px;height:52px;border-radius:50%;background:#1a3a6e;display:grid;place-items:center;color:#fff;font-weight:700;font-size:20px">' + esc((u.name || 'AX')[0].toUpperCase()) + '</div>';

  return {
    html: '<div style="display:flex;align-items:center;gap:14px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:14px 18px;margin-bottom:18px">'
      + '<div style="flex-shrink:0">' + avatarHtml + '</div>'
      + '<div>'
      + '<div style="font-weight:800;font-size:14.5px;color:#061b3e">' + esc(u.name || 'Thành viên') + ' <span style="font-size:11px;font-weight:600;background:#dcfce7;color:#15803d;padding:2px 8px;border-radius:6px;margin-left:6px">CÁ NHÂN</span></div>'
      + '<div style="font-size:12px;color:#657d95;line-height:1.6">' + esc(u.villageName || u.village || '—') + ' · ' + esc(u.office || '—') + '</div>'
      + '<span style="display:inline-block;margin-top:5px;font-size:11px;background:#1a7f5a;color:#fff;padding:2px 10px;border-radius:99px;font-weight:600">● Hồ sơ cá nhân của bạn · đã xác thực Email OTP</span>'
      + '</div></div>',
    canSubmit: true,
  };
}

window.handleBoothTypeChange = function(type) {
  const bannerWrap = document.getElementById('boothTypeBannerWrap');
  const bannerInfo = renderRegistrationBanner(type);
  if (bannerWrap) bannerWrap.innerHTML = bannerInfo.html;

  const submitBtn = document.getElementById('registrationSubmitBtn');
  if (submitBtn) {
    submitBtn.disabled = !bannerInfo.canSubmit;
    submitBtn.innerHTML = type === 'village'
      ? (icon('check') + ' Đăng ký gian hàng cho Làng')
      : (icon('check') + ' Đăng ký gian hàng');
  }

  const isVillage = type === 'village';
  const lblOffer = document.getElementById('lblOffer');
  const lblOfferTag = document.getElementById('lblOfferTag');
  const lblNeed = document.getElementById('lblNeed');
  const lblNeedTag = document.getElementById('lblNeedTag');
  const lblConsent = document.getElementById('lblConsent');
  const offerInput = document.querySelector('input[name="offer"]');
  const needInput = document.querySelector('input[name="need"]');

  if (lblOffer) lblOffer.innerHTML = (isVillage ? 'Điều Làng có thể chia sẻ' : 'Điều bạn có thể chia sẻ') + ' <span style="color:#e11d48">*</span>';
  if (lblOfferTag) lblOfferTag.innerHTML = (isVillage ? 'Chủ đề Làng chia sẻ' : 'Chủ đề chia sẻ') + ' <span style="color:#e11d48">*</span>';
  if (lblNeed) lblNeed.innerHTML = (isVillage ? 'Điều Làng muốn học' : 'Điều bạn muốn học') + ' <span style="color:#e11d48">*</span>';
  if (lblNeedTag) lblNeedTag.innerHTML = (isVillage ? 'Chủ đề Làng muốn học' : 'Chủ đề muốn học') + ' <span style="color:#e11d48">*</span>';
  if (lblConsent) lblConsent.textContent = isVillage
    ? 'Tôi xác nhận đại diện Làng đăng ký thông tin kỹ năng và nhu cầu này để kết nối trong nội bộ AXANH.'
    : 'Tôi đồng ý cho hiển thị thông tin kỹ năng và nhu cầu trong phạm vi nội bộ AXANH.';
  if (offerInput) offerInput.placeholder = isVillage
    ? 'Ví dụ: Làng Lửa đào tạo QA/QC bản vẽ, quy trình nghiệm thu nội bộ...'
    : 'Ví dụ: Kiểm tra bản vẽ trước khi phát hành, dùng AI để soạn thảo nhanh...';
  if (needInput) needInput.placeholder = isVillage
    ? 'Ví dụ: Làng Lửa mong muốn học hỏi về AI & Automation, Civil 3D chuyên sâu...'
    : 'Ví dụ: Làm việc với AI, kỹ năng thuyết trình...';
};

function openRegistrationForm(defaultType = 'personal') {
  const chosenType = defaultType === 'village' ? 'village' : 'personal';
  const u = LIVE.currentUser;
  const tags = ['QA/QC', 'SOP', 'Civil 3D', 'AI', 'Automation', 'Tiếng Anh', 'Giao tiếp', 'Lãnh đạo', 'Đào tạo', 'Mentoring', 'Ưu tiên', 'Quản lý dự án', 'Coaching', 'ATED'];
  const formats = [
    { v: '💬 Trao đổi 1-1', l: '💬 Trao đổi 1-1' },
    { v: '👥 Nhóm nhỏ', l: '👥 Nhóm nhỏ' },
    { v: '🖥️ Demo trực tiếp', l: '🖥️ Demo trực tiếp' },
    { v: '🧪 Thực hành cùng nhau', l: '🧪 Thực hành cùng nhau' },
    { v: '📄 Chia sẻ tài liệu / hướng dẫn', l: '📄 Chia sẻ tài liệu / hướng dẫn' },
  ];

  const typeSelector = '<div style="margin-bottom:16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:12px 16px">'
    + '<div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:8px">1. Chọn loại gian hàng bạn muốn đăng ký</div>'
    + '<div style="display:flex;gap:24px;align-items:center;flex-wrap:wrap">'
    + '<label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-weight:700;font-size:14px;color:#0f172a">'
    + '<input type="radio" name="boothType" value="personal" ' + (chosenType === 'personal' ? 'checked' : '') + ' onchange="window.handleBoothTypeChange(\'personal\')" style="accent-color:#1a7f5a;width:17px;height:17px">'
    + '<span>👤 Gian hàng Cá nhân</span>'
    + '</label>'
    + '<label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-weight:700;font-size:14px;color:#0f172a">'
    + '<input type="radio" name="boothType" value="village" ' + (chosenType === 'village' ? 'checked' : '') + ' onchange="window.handleBoothTypeChange(\'village\')" style="accent-color:#2563eb;width:17px;height:17px">'
    + '<span>🏛️ Gian hàng Làng</span>'
    + '</label>'
    + '</div>'
    + '</div>';

  const initialBanner = renderRegistrationBanner(chosenType);
  const isVillage = chosenType === 'village';

  openModal('Form 01 · Mở gian hàng tri thức',
    '<form id="registrationForm" class="settings-form">'
    + typeSelector
    + '<div id="boothTypeBannerWrap">' + initialBanner.html + '</div>'
    + '<div class="field-grid">'
    + '<div class="field"><label id="lblOffer">' + (isVillage ? 'Điều Làng có thể chia sẻ' : 'Điều bạn có thể chia sẻ') + ' <span style="color:#e11d48">*</span></label><input name="offer" required maxlength="500" placeholder="' + (isVillage ? 'Ví dụ: Làng Lửa đào tạo QA/QC bản vẽ, quy trình nghiệm thu nội bộ...' : 'Ví dụ: Kiểm tra bản vẽ trước khi phát hành, dùng AI để soạn thảo nhanh...') + '"/></div>'
    + '<div class="field"><label id="lblOfferTag">' + (isVillage ? 'Chủ đề Làng chia sẻ' : 'Chủ đề chia sẻ') + ' <span style="color:#e11d48">*</span></label><select name="offerTag" required><option value="">Chọn chủ đề</option>' + tags.map(t => '<option>' + esc(t) + '</option>').join('') + '</select></div>'
    + '</div>'
    + '<div class="field-grid">'
    + '<div class="field"><label id="lblNeed">' + (isVillage ? 'Điều Làng muốn học' : 'Điều bạn muốn học') + ' <span style="color:#e11d48">*</span></label><input name="need" required maxlength="500" placeholder="' + (isVillage ? 'Ví dụ: Làng Lửa mong muốn học hỏi về AI & Automation...' : 'Ví dụ: Làm việc với AI, kỹ năng thuyết trình...') + '"/></div>'
    + '<div class="field"><label id="lblNeedTag">' + (isVillage ? 'Chủ đề Làng muốn học' : 'Chủ đề muốn học') + ' <span style="color:#e11d48">*</span></label><select name="needTag" required><option value="">Chọn chủ đề</option>' + tags.map(t => '<option>' + esc(t) + '</option>').join('') + '</select></div>'
    + '</div>'
    + '<div class="field-grid">'
    + '<div class="field"><label>Hình thức mong muốn</label><select name="preferredFormat"><option value="">Không xác định</option>' + formats.map(f => '<option value="' + esc(f.v) + '">' + esc(f.l) + '</option>').join('') + '</select></div>'
    + '<div class="field"><label>Khung giờ ưu tiên</label><input type="datetime-local" name="availability" /></div>'
    + '</div>'
    + '<div class="field"><label>Kết quả mong muốn sau buổi hỗ trợ</label><textarea name="outcome" placeholder="Sau buổi này, tôi muốn có thể..."></textarea></div>'
    + '<label class="checkline"><input type="checkbox" name="consent" checked><span id="lblConsent">' + (isVillage ? 'Tôi xác nhận đại diện Làng đăng ký thông tin kỹ năng và nhu cầu này để kết nối trong nội bộ AXANH.' : 'Tôi đồng ý cho hiển thị thông tin kỹ năng và nhu cầu trong phạm vi nội bộ AXANH.') + '</span></label>'
    + '<div id="registrationFormStatus" style="margin-bottom:8px;min-height:20px"></div>'
    + '<button type="submit" class="btn btn-primary" id="registrationSubmitBtn" ' + (initialBanner.canSubmit ? '' : 'disabled') + '>' + icon('check') + (isVillage ? ' Đăng ký gian hàng cho Làng' : ' Đăng ký gian hàng') + '</button>'
    + '</form>'
  );
}
function openResultForm(id = '') { let options = STATE.connections.map(c => '<option value="' + c.id + '" ' + (c.id === id ? 'selected' : '') + '>' + esc(connLabel(c)) + ' – ' + esc(c.topic) + '</option>').join(''); openModal('Form 02 · Ghi nhận kết quả', '<form id="resultForm" class="settings-form"><div class="field"><label>Kết nối đã hỗ trợ</label><select name="connectionId" required><option value="">Chọn kết nối</option>' + options + '</select></div><div class="field"><label>Điều em đã học được</label><textarea name="learned" required placeholder="Em đã hiểu hoặc làm được điều gì? (dữ liệu demo)"></textarea></div><div class="field-grid"><div class="field"><label>Đã thử áp dụng?</label><select name="applied"><option value="yes">Đã áp dụng</option><option value="next">Sẽ thử trong tuần tới</option><option value="no">Chưa phù hợp để áp dụng</option></select></div><div class="field"><label>Mức độ hữu ích</label><select name="rating"><option value="5">5 – Rất hữu ích</option><option value="4">4 – Hữu ích</option><option value="3">3 – Có ích phần nào</option><option value="2">2 – Cần cải thiện</option><option value="1">1 – Chưa hữu ích</option></select></div></div><div class="field"><label>Tài sản tri thức có thể chia sẻ lại (tùy chọn)</label><input name="asset" placeholder="Ví dụ: checklist / SOP / mẹo ngắn"/></div><label class="checkline"><input type="checkbox" name="share">Đồng ý chia sẻ bài học này ở chế độ nội bộ khi tổ chức có cơ chế phê duyệt.</label><button class="btn btn-primary" type="submit">' + icon('check') + ' Ghi nhận kết quả demo</button></form>') }
function newMatch(a, b, mode = 'person', sv = '', hv = '') { if (mode === 'village') { const sa = person(a), hb = person(b); if (!sa || !hb || !sv || !hv || sa.id === hb.id) return; const exists = STATE.connections.some(x => (x.type || 'person') === 'village' && x.seekerVillage === sv && x.helperVillage === hv); if (exists) { toast('Hai Làng đã có một kết nối demo.', 'warn'); return } const x = { id: 'KEX-' + Date.now(), type: 'village', seeker: sa.id, helper: hb.id, seekerVillage: sv, helperVillage: hv, topic: sa.need, status: 'pending', when: '', createdAt: new Date().toISOString() }; STATE.connections.unshift(x); persist(); toast('Đã thêm kết nối demo giữa hai Làng. Cần hai bên đồng ý trước khi xếp lịch.'); render(); return } if (!person(a) || !person(b) || a === b) return; const exists = STATE.connections.some(x => (x.type || 'person') === 'person' && x.seeker === a && x.helper === b); if (exists) { toast('Hai người đã có một kết nối demo.', 'warn'); return } const need = person(a); const x = { id: 'KEX-' + Date.now(), type: 'person', seeker: a, helper: b, topic: need.need, status: 'pending', when: '', createdAt: new Date().toISOString() }; STATE.connections.unshift(x); persist(); toast('Đã thêm kết nối demo. Cần hai bên đồng ý trước khi xếp lịch.'); render() }
function scheduleModal(id) { const c = STATE.connections.find(x => x.id === id); if (!c) return; openModal('Xác nhận lịch trao đổi', '<p style="line-height:1.7;color:#657d95">' + esc(connModalText(c)) + ' cần đồng ý lịch trước khi gặp. Đây chỉ là lịch minh họa và sẽ không tự tạo sự kiện trên Lark.</p><form id="scheduleForm" class="settings-form"><input type="hidden" name="id" value="' + esc(id) + '"/><div class="field-grid"><div class="field"><label>Ngày</label><input type="date" name="day" required min="2026-11-12" value="2026-11-17"></div><div class="field"><label>Giờ bắt đầu</label><input type="time" name="time" required value="14:00"/></div></div><div class="field"><label>Thời lượng</label><select name="duration"><option value="20">20 phút</option><option value="30" selected>30 phút</option></select></div><label class="checkline"><input type="checkbox" required name="consent">Hai bên đã đồng ý trao đổi trong thời gian này.</label><button type="submit" class="btn btn-primary">' + icon('calendar') + ' Ghi lịch demo</button></form>') }
function viewResult(id) { const r = STATE.results.find(x => x.connectionId === id); if (!r) return; openModal('Kết quả buổi chia sẻ', '<div class="kv"><span>Điều học được</span><b>' + esc(r.learned) + '</b></div><div class="kv"><span>Áp dụng</span><b>' + esc(r.applied === 'yes' ? 'Đã áp dụng' : r.applied === 'next' ? 'Dự định áp dụng' : 'Chưa áp dụng') + '</b></div><div class="kv"><span>Đánh giá</span><b>' + esc(r.rating) + '/5</b></div><div class="kv"><span>Tài sản</span><b>' + esc(r.asset || 'Chưa có') + '</b></div><p class="muted">Dữ liệu demo cục bộ, chưa được BTC xác nhận.</p>') }
function externalForm(type) { const url = STATE.settings[type === 'registration' ? 'registrationUrl' : 'resultUrl']; if (!validLink(url)) { toast('Chưa cấu hình URL Lark Form thật.', 'warn'); navigate('settings'); return } window.open(url, '_blank', 'noopener,noreferrer') }
function addToastSettings() { toast('Đã lưu đường dẫn trên trình duyệt. Chưa có kết nối API tự động.') }

function launchFireworks({ bursts = 7 } = {}) { const canvas = document.getElementById('fxCanvas'); if (!canvas) return; const ctx = canvas.getContext('2d'); canvas.width = window.innerWidth * devicePixelRatio; canvas.height = window.innerHeight * devicePixelRatio; canvas.style.width = window.innerWidth + 'px'; canvas.style.height = window.innerHeight + 'px'; canvas.style.background = 'rgba(3,10,30,.72)'; canvas.style.backdropFilter = 'blur(1px)'; ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0); const w = window.innerWidth, h = window.innerHeight; const palette = ['#ffd34f', '#ff6b7a', '#5ee7df', '#8ac6ff', '#ffffff', '#f59e0b']; const particles = []; const burstsArr = []; for (let i = 0; i < bursts; i++) { burstsArr.push({ x: Math.random() * w * 0.82 + w * 0.09, y: Math.random() * h * 0.42 + h * 0.08, delay: i * 130 }) } const start = performance.now(); function spawn(b) { for (let i = 0; i < 42; i++) { const ang = Math.random() * Math.PI * 2, speed = 1.5 + Math.random() * 5.5; particles.push({ x: b.x, y: b.y, vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed, g: .055 + Math.random() * .03, life: 48 + Math.random() * 28, size: 2 + Math.random() * 2.8, color: palette[(Math.random() * palette.length) | 0] }) } } function frame(t) { ctx.clearRect(0, 0, w, h); burstsArr.forEach(b => { if (!b.done && t - start > b.delay) { spawn(b); b.done = true } }); for (let i = particles.length - 1; i >= 0; i--) { const p = particles[i]; p.x += p.vx; p.y += p.vy; p.vy += p.g; p.life -= 1; if (p.life <= 0) { particles.splice(i, 1); continue } ctx.globalAlpha = Math.max(.08, p.life / 80); ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill(); if (p.life > 18) { ctx.strokeStyle = p.color; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 2.2, p.y - p.vy * 2.2); ctx.stroke(); } } ctx.globalAlpha = 1; if (particles.length || burstsArr.some(b => !b.done)) { requestAnimationFrame(frame) } else { ctx.clearRect(0, 0, w, h); canvas.style.background = 'transparent'; canvas.style.backdropFilter = 'none'; } } requestAnimationFrame(frame) }
window.addEventListener('resize', () => { const canvas = document.getElementById('fxCanvas'); if (canvas) { canvas.width = window.innerWidth * devicePixelRatio; canvas.height = window.innerHeight * devicePixelRatio; canvas.style.width = window.innerWidth + 'px'; canvas.style.height = window.innerHeight + 'px'; } });

const ApiAdapter = { mode: 'live-readonly', async listPeople() { return getPeople() }, async listVillages() { return LIVE.villages }, async listMembers() { return LIVE.members }, async listConnections() { return LIVE.connections }, async readFromLarkBackend() { return window.AXANH_LIVE_API.load() } };
window.AXANH_KEX_ADAPTER = ApiAdapter;

// ===== CLICK HANDLER (thêm toggle-user-menu + my-profile) =====
window.addEventListener('click', e => {
  // Đóng dropdown khi click ra ngoài
  const dropdown = document.getElementById('userDropdown');
  const menuWrap = e.target.closest('.user-menu-wrap');
  if (dropdown && dropdown.classList.contains('open') && !menuWrap) {
    dropdown.classList.remove('open');
    const btn = document.querySelector('.user-avatar-btn');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }

  if (e.target.id === 'modal') { closeModal(); return }
  const b = e.target.closest('[data-action]');
  if (!b) return;
  const a = b.dataset.action, id = b.dataset.id;
  switch (a) {
    case 'nav': navigate(b.dataset.page); break;
    case 'toggle-nav-group': {
      const grp = b.dataset.group;
      if (grp) {
        navOpenGroups[grp] = !navOpenGroups[grp];
        renderNav();
      }
      break;
    }
    case 'set-learning-history-tab':
      learningHistoryTab = b.dataset.tab === 'all' ? 'all' : 'mine';
      if (currentPage === 'learning-history') render();
      break;
    case 'set-honors-tab':
      honorsTab = b.dataset.tab === 'villages' ? 'villages' : 'individuals';
      if (currentPage === 'awards') render();
      break;
    case 'open-village-market': closeModal(); marketTab = 'village'; navigate('market'); break;
    case 'forms': navigate('forms'); break;
    case 'settings': navigate('settings'); break;
    case 'mobile-menu': document.querySelector('#sidebar').classList.toggle('show'); break;
    case 'profile': profileModal(id); break;
    case 'open-village-connections': openVillageConnectionsModal(id); break;
    case 'toggle-user-menu': {
      const dd = document.getElementById('userDropdown');
      const avatarBtn = b;
      if (!dd) break;
      const isOpen = dd.classList.toggle('open');
      avatarBtn.setAttribute('aria-expanded', String(isOpen));
      break;
    }
    case 'my-profile': {
      const dd = document.getElementById('userDropdown');
      if (dd) dd.classList.remove('open');
      openMyProfileModal();
      break;
    }
    case 're-login':
      closeModal();
      LIVE.currentUser = null;
      clearGate1Data();
      resetLearningData();
      knowledgeLoadGeneration += 1;
      honorsLoadGeneration += 1;
      LIVE.knowledge = { loading: false, error: '', items: [], diagnostics: {} };
      LIVE.honors = { loading: false, error: '', data: null };
      showAuthScreen('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      break;
    case 'logout':
      if (window.AXANH_LIVE_API && window.AXANH_LIVE_API.logout) {
        window.AXANH_LIVE_API.logout();
      }
      break;
    case 'live-refresh': loadLiveData(); break;
    case 'refresh-booths': loadLiveBooths(true); break;
    case 'learning-create': openLearningScheduleModal(); break;
    case 'learning-refresh': loadLearningData(); break;
    case 'knowledge-refresh': loadKnowledge(); break;
    case 'honors-refresh': loadHonors(true); break;
    case 'knowledge-detail': openKnowledgeDetail(id); break;
    case 'learning-respond': {
      b.disabled = true;
      window.AXANH_LIVE_API.respondLearningSession(id, b.dataset.decision)
        .then(() => {
          toast(b.dataset.decision === 'accept' ? 'Đã xác nhận lịch học.' : b.dataset.decision === 'reject' ? 'Đã từ chối lịch; trạng thái được lưu là Cancelled.' : 'Đã hủy đề xuất lịch.');
          closeModal();
          return loadLearningData();
        })
        .catch(err => {
          toast(err.message || 'Không thể cập nhật lịch học.', 'warn');
          b.disabled = false;
        });
      break;
    }
    case 'learning-complete': {
      b.disabled = true;
      window.AXANH_LIVE_API.completeLearningSession(id)
        .then(() => {
          toast('Đã xác nhận buổi học hoàn thành.');
          return loadLearningData();
        })
        .catch(err => {
          toast(err.message || 'Không thể xác nhận hoàn thành.', 'warn');
          b.disabled = false;
        });
      break;
    }
    case 'learning-report': {
      const session = LIVE.learning.sessions.find(item => item.id === id);
      if (session) openLearningReportForm(session);
      break;
    }
    case 'learning-results': {
      const session = LIVE.learning.sessions.find(item => item.id === id);
      if (session) openLearningResults(session);
      break;
    }
    case 'set-market-tab': marketTab = b.dataset.tab || 'personal'; render(); break;
    case 'close-modal': closeModal(); break;
    case 'choose-seeker': STATE.seeker = id; persist(); closeModal(); navigate('matches'); break;
    case 'open-lark-form': openLarkFormModal(b.dataset.form); break;
    case 'hero-open-form':
      if (STATE.settings.registrationUrl) {
        openLarkFormModal('registration');
      } else {
        openRegistrationForm(marketTab || 'personal');
      }
      break;
    case 'open-form': b.dataset.form === 'registration' ? openRegistrationForm(b.dataset.defaultType || marketTab || 'personal') : openResultForm(id); break;
    case 'external-form': externalForm(b.dataset.form); break;
    case 'set-live-match-mode':
      MATCHING.mode = b.dataset.mode || 'personal';
      MATCHING.selectedBoothId = null;
      loadMatching(true);
      break;
    case 'view-match-detail':
      showMatchDetailModal(Number(b.dataset.idx));
      break;
    case 'open-peer-node': {
      const peerId = b.dataset.id;
      openPeerBoothModal(peerId, b.dataset.connId);
      break;
    }
    case 'open-village-node': {
      openVillageBoothsModal(id);
      break;
    }
    case 'create-live-match':
      createLiveMatch(Number(b.dataset.idx));
      break;
    case 'toggle-notifications':
      showNotificationsModal();
      break;
    case 'set-conn-tab':
      connectionsActiveTab = b.dataset.tab || 'accepted';
      connectionsPage = 1;
      if (currentPage === 'matches') render();
      break;
    case 'set-conn-page':
      connectionsPage = Math.max(1, Number(b.dataset.page) || 1);
      if (currentPage === 'matches') render();
      break;
    case 'refresh-connections': {
      b.disabled = true;
      loadLiveConnections().then(() => {
        toast('Đã đồng bộ kết nối mới nhất từ Lark Base.');
        b.disabled = false;
        if (currentPage === 'matches') render();
      });
      break;
    }
    case 'respond-connection': {
      const connId = b.dataset.id;
      const decision = b.dataset.decision;
      b.disabled = true;
      window.AXANH_LIVE_API.respondConnection(connId, { decision })
        .then(() => {
          toast(decision === 'Accepted' ? 'Đã đồng ý kết nối thành công!' : 'Đã từ chối lời mời kết nối.', 'good');
          return loadLiveConnections();
        })
        .then(() => {
          closeModal();
          render();
        })
        .catch(err => {
          if (err?.status === 401) { showSessionExpiredModal(); return; }
          toast(err.message || 'Lỗi xử lý xác nhận.', 'warn');
          b.disabled = false;
        });
      break;
    }
    case 'prompt-delete-booth':
      openDeleteBoothModal(id);
      break;
    case 'confirm-delete-booth':
      confirmDeleteBooth(id);
      break;
    case 'prompt-cancel-connection': {
      openCancelConnectionModal({
        connId: b.dataset.id,
        targetLabel: b.dataset.label || '',
        connectionType: b.dataset.type || 'personal',
      });
      break;
    }
    case 'confirm-cancel-connection': {
      confirmCancelConnection(b.dataset.id);
      break;
    }
    case 'schedule-connection': {
      const connId = b.dataset.id || '';
      closeModal();
      currentPage = 'schedule';
      render();
      loadLearningData().then(() => {
        if (currentPage === 'schedule') {
          openLearningScheduleModal(connId);
        }
      });
      break;
    }
    case 'cancel-connection': {
      const connId = b.dataset.id;
      const conn = (LIVE.connections || []).find(c => c.id === connId || c.connectionId === connId);
      openCancelConnectionModal({
        connId,
        targetLabel: conn ? getConnectionPeerLabel(conn) : '',
        connectionType: conn?.connectionType || 'personal',
      });
      break;
    }
    // ===== CONNECTIONS OVERVIEW ACTIONS =====
    case 'reload-conn-overview':
      connOverview = { loading: false, error: '', data: null };
      loadConnectionsOverview();
      break;
    case 'toggle-conn-ov-row': {
      const rowId = b.dataset.id;
      connOverviewExpandedId = connOverviewExpandedId === rowId ? null : rowId;
      connOverviewBoothExpandedId = null;
      const ovBody = document.getElementById('connOvBody');
      if (ovBody) ovBody.innerHTML = renderConnectionsOverviewBody();
      else if (currentPage === 'connection-detail') render();
      break;
    }
    case 'set-conn-ov-page': {
      const p = parseInt(b.dataset.page, 10);
      if (!isNaN(p) && p >= 1) {
        connOverviewPage = p;
        const ovBody = document.getElementById('connOvBody');
        if (ovBody) ovBody.innerHTML = renderConnectionsOverviewBody();
        else if (currentPage === 'connection-detail') render();
      }
      break;
    }
    case 'toggle-conn-booth': {
      const bk = b.dataset.id;
      connOverviewBoothExpandedId = connOverviewBoothExpandedId === bk ? null : bk;
      const ovBody = document.getElementById('connOvBody');
      if (ovBody) ovBody.innerHTML = renderConnectionsOverviewBody();
      else if (currentPage === 'connection-detail') render();
      break;
    }
    case 'set-network-mode':
      liveNetworkMode = b.dataset.mode || 'village';
      liveNetworkVillageFilter = 'all';
      if (currentPage === 'network') render();
      break;
    case 'filter-net-village':
      liveNetworkVillageFilter = b.dataset.village || 'all';
      if (currentPage === 'network') render();
      break;
    case 'open-member-node': {
      const mem = (LIVE.members || []).find(m => m.id === id);
      if (mem) {
        const avHtml = memberAvatarHtml(mem.avatarUrl, mem.name, 60);
        openModal(esc(mem.name || 'Thành viên'), avHtml
          + '<div class="kv"><span>Làng</span><b>' + esc(mem.villageName || '—') + '</b></div>'
          + '<div class="kv"><span>Văn phòng</span><b>' + esc(mem.office || '—') + '</b></div>'
          + '<div class="kv"><span>Vai trò</span><b>' + esc(mem.programRole || '—') + '</b></div>',
          '<button class="btn" data-action="close-modal">Đóng</button>');
      }
      break;
    }
    case 'retry-matching':
      loadMatching();
      break;
    case 'set-match-mode': STATE.matchMode = b.dataset.mode || 'person'; persist(); render(); break;
    case 'create-match': newMatch(b.dataset.seeker, b.dataset.helper, b.dataset.mode, b.dataset.seekervillage, b.dataset.helpervillage); break;
    case 'schedule-one': scheduleModal(id); break;
    case 'view-result': viewResult(id); break;
    case 'open-base': if (validLink(STATE.settings.larkBase)) window.open(STATE.settings.larkBase, '_blank', 'noopener,noreferrer'); break;
    case 'gate-open': openGateDetail(id); break;
    case 'gate-fireworks': {
      const item = GATE1.items.find(entry => entry.villageId === id);
      if (!item || gateStatusMeta(item.status)[1] !== 'passed') break;
      launchFireworks({ bursts: 12 });
      toast('Chúc mừng ' + item.villageName + ' đạt Gate 1!');
      break;
    }
    case 'gate-global-fireworks': launchFireworks({ bursts: 12 }); toast('Chúc cả hành trình Phiên chợ tri thức thật rực rỡ!'); break;
    case 'reset-demo':
      if (confirm('Xóa toàn bộ hồ sơ, lịch, báo cáo và trạng thái Gate 1 demo lưu trên trình duyệt này? (Giữ URL Lark Form)')) {
        const x = STATE.settings; STATE = structuredClone(EMPTY_STATE); STATE.settings = x; persist(); navigate('home'); toast('Đã khôi phục dữ liệu demo.')
      }
      break;
    case 'export-demo': {
      const blob = new Blob([JSON.stringify({ version: 4, exportedAt: new Date().toISOString(), profiles: STATE.profiles, connections: STATE.connections, results: STATE.results, gate1: STATE.gate1 }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const al = document.createElement('a'); al.href = url; al.download = 'AXANH_KEX_demo_data.json'; al.click();
      setTimeout(() => URL.revokeObjectURL(url), 1200); toast('Đã xuất dữ liệu demo JSON.');
      break;
    }
  }
});
document.addEventListener('change', e => {
  if (e.target.id === 'knowledgeConnectionFilter') {
    libraryConnectionFilter = e.target.value;
    refreshKnowledgeResults();
  }
  if (e.target.id === 'knowledgeAppliedFilter') {
    libraryAppliedFilter = e.target.value;
    refreshKnowledgeResults();
  }
  if (e.target.id === 'matchingMemberSelect') {
    MATCHING.selectedMemberId = e.target.value;
    MATCHING.selectedBoothId = null;
    loadMatching(true);
  }
  if (e.target.id === 'matchingVillageSelect') {
    MATCHING.selectedVillageId = e.target.value;
    MATCHING.selectedBoothId = null;
    loadMatching(true);
  }
  if (e.target.id === 'matchingBoothSelect') {
    MATCHING.selectedBoothId = e.target.value;
    loadMatchingSuggestions();
  }
  if (e.target.id === 'seekerSelect') { STATE.seeker = e.target.value; persist(); render() }
  if (e.target.id === 'villageSeekerSelect') { STATE.villageSeeker = e.target.value; persist(); render() }
  if (e.target.id === 'officeFilter') { officeFilter = e.target.value; render() }
  if (e.target.id === 'liveMemberOffice') { liveMemberOffice = e.target.value; render() }
  if (e.target.id === 'connOvVillage') {
    connOverviewVillage = e.target.value || 'all';
    connOverviewPage = 1;
    const ovBody = document.getElementById('connOvBody');
    if (ovBody) ovBody.innerHTML = renderConnectionsOverviewBody();
    else if (currentPage === 'connection-detail') render();
  }
  if (e.target.id === 'connOvSort') {
    connOverviewSort = e.target.value || 'most';
    connOverviewPage = 1;
    const ovBody = document.getElementById('connOvBody');
    if (ovBody) ovBody.innerHTML = renderConnectionsOverviewBody();
    else if (currentPage === 'connection-detail') render();
  }
  if (e.target.id === 'connOvNoConn') {
    connOverviewNoConn = Boolean(e.target.checked);
    connOverviewPage = 1;
    const ovBody = document.getElementById('connOvBody');
    if (ovBody) ovBody.innerHTML = renderConnectionsOverviewBody();
    else if (currentPage === 'connection-detail') render();
  }
});
document.addEventListener('input', e => { if (e.target.id === 'liveMemberSearch') { liveMemberSearch = e.target.value; const grid = document.querySelector('#liveMemberGrid'); if (grid) grid.innerHTML = liveMemberCards(); const count = document.querySelector('#liveMemberCount'); if (count) count.textContent = 'Đang hiển thị ' + matchingMembers().length + '/' + LIVE.members.length + ' thành viên'; } if (e.target.id === 'marketSearch') { marketSearch = e.target.value; if (currentPage === 'market') render(); } });
document.addEventListener('input', e => {
  if (e.target.id === 'connOvSearch') {
    connOverviewSearch = e.target.value;
    connOverviewPage = 1;
    const ovBody = document.getElementById('connOvBody');
    if (ovBody) ovBody.innerHTML = renderConnectionsOverviewBody();
    else if (currentPage === 'connection-detail') render();
  }
  if (e.target.id === 'learningHistorySearch') {
    learningHistorySearch = e.target.value;
    const lhList = document.getElementById('learningHistoryList');
    if (lhList) lhList.innerHTML = renderLearningHistoryList();
    else if (currentPage === 'learning-history') render();
  }
});
document.addEventListener('input', e => {
  if (e.target.id === 'knowledgeSearch') {
    librarySearch = e.target.value;
    refreshKnowledgeResults();
  }
});
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && currentPage === 'library') loadKnowledge();
  if (!document.hidden && currentPage === 'awards') loadHonors();
});
document.addEventListener('submit', e => {
  const form = e.target;
  const formId = form.getAttribute('id');
  if (!['learningScheduleForm', 'learningReportForm'].includes(formId)) return;
  e.preventDefault();
  const submitButton = form.querySelector('button[type="submit"]');
  if (submitButton) submitButton.disabled = true;
  const values = Object.fromEntries(new FormData(form).entries());
  const request = formId === 'learningScheduleForm'
    ? window.AXANH_LIVE_API.createLearningSession({
        connectionId: values.connectionId,
        title: values.title,
        startAt: values.date + 'T' + values.startTime + ':00+07:00',
        endAt: values.date + 'T' + values.endTime + ':00+07:00',
        format: values.format,
        locationOrLink: values.locationOrLink,
      })
    : window.AXANH_LIVE_API.submitLearningResult(form.dataset.sessionId, {
        learned: values.learned,
        applied: values.applied,
        rating: Number(values.rating),
        asset: values.asset || '',
        outcome: values.outcome || '',
        evidence: values.evidence || '',
        share: form.querySelector('input[name="share"]')?.checked === true,
      });
  request.then(async result => {
    const sessionId = form.dataset.sessionId;
    closeModal();
    await loadLearningData();
    if (formId === 'learningScheduleForm') {
      toast('Đã gửi đề xuất lịch học lên Lark Base.');
      return;
    }
    if (result.duplicate) {
      toast('Bạn đã gửi báo cáo cho buổi học này; đang mở báo cáo hiện có.', 'warn');
      const session = LIVE.learning.sessions.find(item => item.id === sessionId);
      if (session) openLearningResults(session);
      return;
    }
    toast('Đã lưu Form 02 vào Lark Base.');
  }).catch(err => {
    toast(err.message || 'Không thể lưu dữ liệu học tập.', 'warn');
    if (submitButton) submitButton.disabled = false;
  });
});
document.addEventListener('submit', e => { const formId = e.target.getAttribute('id'); if (!['settingsForm', 'registrationForm', 'resultForm', 'scheduleForm'].includes(formId)) return; e.preventDefault(); const f = e.target; const d = Object.fromEntries(new FormData(f).entries()); if (formId === 'settingsForm') {
    const regUrl = (d.registrationUrl || '').trim();
    const resUrl = (d.resultUrl || '').trim();
    const larkDomainRegex = /^https:\/\/([a-z0-9-]+\.)*(larksuite\.com|feishu\.cn)/i;
    if (regUrl && !larkDomainRegex.test(regUrl)) {
      toast('URL Form 01 phải là liên kết HTTPS thuộc Lark (larksuite.com hoặc feishu.cn).', 'warn');
      return;
    }
    if (resUrl && !larkDomainRegex.test(resUrl)) {
      toast('URL Form 02 phải là liên kết HTTPS thuộc Lark (larksuite.com hoặc feishu.cn).', 'warn');
      return;
    }
    if (window.AXANH_LIVE_API && window.AXANH_LIVE_API.updateFormsConfig) {
      window.AXANH_LIVE_API.updateFormsConfig({
        form01Url: regUrl,
        form02Url: resUrl,
      }).then(() => {
        STATE.settings.registrationUrl = regUrl;
        STATE.settings.resultUrl = resUrl;
        STATE.settings.larkBase = (d.larkBase || '').trim();
        STATE.settings.apiBase = (d.apiBase || '').trim();
        persist();
        toast('Đã lưu cấu hình biểu mẫu Lark thành công vào hệ thống!');
        render();
      }).catch((err) => {
        toast(err.message || 'Lỗi khi lưu cấu hình lên máy chủ.', 'warn');
      });
    } else {
      STATE.settings.registrationUrl = regUrl;
      STATE.settings.resultUrl = resUrl;
      STATE.settings.larkBase = (d.larkBase || '').trim();
      STATE.settings.apiBase = (d.apiBase || '').trim();
      persist();
      toast('Đã lưu cấu hình.');
      render();
    }
    return;
  } if (formId === 'registrationForm') {
    // Gửi lên Lark Base qua API thật
    if (!window.AXANH_LIVE_API || !window.AXANH_LIVE_API.createBooth) {
      toast('Chưa kết nối API. Vui lòng thử lại.', 'warn');
      return;
    }
    const statusEl = document.getElementById('registrationFormStatus');
    const submitBtn = document.getElementById('registrationSubmitBtn');
    const selectedType = f.querySelector('input[name="boothType"]:checked')?.value || 'personal';
    const isVillage = selectedType === 'village';

    if (statusEl) statusEl.innerHTML = '<span style="color:#1a7f5a;font-size:12px">⏳ Đang gửi đến Lark Base...</span>';
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Đang gửi...'; }

    let availability = null;
    if (d.availability) {
      const rawSlot = d.availability.length === 16 ? d.availability + ':00+07:00' : d.availability;
      const parsedSlot = Date.parse(rawSlot);
      if (Number.isFinite(parsedSlot)) availability = parsedSlot;
    }
    const boothData = {
      boothType: selectedType,
      offer: d.offer || '',
      offerTag: d.offerTag || '',
      need: d.need || '',
      needTag: d.needTag || '',
      preferredFormat: d.preferredFormat || '',
      availability,
      outcome: d.outcome || '',
      consent: !!f.querySelector('input[name="consent"]')?.checked,
    };
    window.AXANH_LIVE_API.createBooth(boothData).then((result) => {
      closeModal();
      launchFireworks({ bursts: 5 });
      toast('🎉 Đăng ký gian hàng ' + (isVillage ? 'Làng' : 'Cá nhân') + ' thành công! Booth ID: ' + (result.data?.boothId || '—'));
      if (result.data) {
        LIVE.booths = [result.data, ...LIVE.booths];
      }
      marketTab = selectedType;
      navigate('market');
      // Reload booths từ Lark để đảm bảo đồng bộ
      setTimeout(() => loadLiveBooths(), 1500);
    }).catch((err) => {
      if (statusEl) statusEl.innerHTML = '<span style="color:#e11d48;font-size:12px">❌ ' + esc(err.message || 'Đăng ký thất bại. Vui lòng thử lại.') + '</span>';
      if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = '✓ ' + (isVillage ? 'Đăng ký gian hàng cho Làng' : 'Đăng ký gian hàng'); }
    });
    return;
  } if (formId === 'resultForm') { const c = STATE.connections.find(x => x.id === d.connectionId); if (!c) { toast('Chưa chọn kết nối hợp lệ.', 'warn'); return } STATE.results = STATE.results.filter(r => r.connectionId !== d.connectionId); STATE.results.push({ connectionId: d.connectionId, learned: d.learned, applied: d.applied, rating: Number(d.rating), asset: d.asset || '', share: !!d.share, submittedAt: new Date().toISOString() }); c.status = 'completed'; persist(); closeModal(); launchFireworks({ bursts: 5 }); toast('Đã ghi nhận bài học demo.'); navigate('awards'); return } if (formId === 'scheduleForm') { const c = STATE.connections.find(x => x.id === d.id); if (!c) return; c.status = 'scheduled'; c.when = d.day + ' · ' + d.time + ' · ' + d.duration + ' phút'; persist(); closeModal(); toast('Đã ghi lịch demo (chưa gửi Lark Calendar).'); navigate('schedule'); return } });
window.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeModal();
    const dd = document.getElementById('userDropdown');
    if (dd) dd.classList.remove('open');
  }
});

// Lắng nghe sự kiện logout từ api.js
window.addEventListener('axanh:logout', () => {
  LIVE.currentUser = null;
  clearGate1Data();
  resetLearningData();
  knowledgeLoadGeneration += 1;
  honorsLoadGeneration += 1;
  LIVE.knowledge = { loading: false, error: '', items: [], diagnostics: {} };
  LIVE.honors = { loading: false, error: '', data: null };
  LIVE.connected = false;
  LIVE.villages = [];
  LIVE.members = [];
  LIVE.booths = [];
  LIVE.boothsError = '';
  showAuthScreen();
});

// ===== KHỞI ĐỘNG ỨNG DỤNG =====
async function init() {
  // Hiện loading trước
  renderAuthScreen({ loading: true });

  // Kiểm tra session
  const API = window.AXANH_LIVE_API;
  if (!API) {
    showAuthScreen('Thiếu FrontEnd/api.js. Vui lòng kiểm tra lại.');
    return;
  }

  let me;
  try {
    me = await API.getMe();
  } catch (error) {
    console.error('[Auth] Session verification failed:', error);
    showAuthScreen('Không thể kết nối hoặc xác minh phiên đăng nhập. Vui lòng thử lại sau.');
    return;
  }
  if (!me) {
    // Chưa đăng nhập → hiện màn hình login AXANH, KHÔNG load dữ liệu nội bộ
    showAuthScreen();
    return;
  }

  // Đã đăng nhập → hiện giao diện chính
  LIVE.currentUser = me;
  showAppShell();
  render();

  // Đồng bộ cấu hình biểu mẫu Lark từ Backend
  if (API.getFormsConfig) {
    API.getFormsConfig().then((cfg) => {
      if (cfg) {
        let changed = false;
        if (cfg.form01Url !== undefined && STATE.settings.registrationUrl !== cfg.form01Url) {
          STATE.settings.registrationUrl = cfg.form01Url || '';
          changed = true;
        }
        if (cfg.form02Url !== undefined && STATE.settings.resultUrl !== cfg.form02Url) {
          STATE.settings.resultUrl = cfg.form02Url || '';
          changed = true;
        }
        if (changed) {
          persist();
          render();
        }
      }
    }).catch(() => {});
  }

  // Nền: tải villages + members
  await loadLiveData();
  await loadGate1();
  if (currentPage === 'matches') {
    loadMatching();
  }
}

// Khởi động
init();
