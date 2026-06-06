'use client';

import { useState } from 'react';
import { TicketWithOverdue, BoardData } from '@/shared/types';
import Badge from '@/client/components/ui/Badge';
import Button from '@/client/components/ui/Button';
import Modal from '@/client/components/ui/Modal';
import ConfirmDialog from '@/client/components/ui/ConfirmDialog';
import TicketCard from '@/client/components/ticket/TicketCard';
import ColumnHeader from '@/client/components/board/ColumnHeader';
import Board from '@/client/components/board/Board';
import { DndContext } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';

// ─── Mock Data ────────────────────────────────────────────────────
const mockTickets: Record<string, TicketWithOverdue> = {
  t1: {
    id: 1,
    title: '로그인 페이지 UI 구현',
    description: '이메일/비밀번호 폼, 유효성 검사, 에러 메시지 표시 포함',
    status: 'BACKLOG',
    priority: 'HIGH',
    position: 1024,
    plannedStartDate: '2026-06-10',
    dueDate: '2026-06-20',
    startedAt: null,
    completedAt: null,
    createdAt: new Date('2026-06-01'),
    updatedAt: new Date('2026-06-01'),
    isOverdue: false,
  },
  t2: {
    id: 2,
    title: '티켓 목록 API 연동',
    description: null,
    status: 'TODO',
    priority: 'MEDIUM',
    position: 2048,
    plannedStartDate: null,
    dueDate: '2026-06-08',
    startedAt: null,
    completedAt: null,
    createdAt: new Date('2026-06-02'),
    updatedAt: new Date('2026-06-02'),
    isOverdue: true,
  },
  t3: {
    id: 3,
    title: '드래그앤드롭 구현',
    description: '칼럼 간 이동 및 칼럼 내 순서 변경',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    position: 3072,
    plannedStartDate: '2026-06-05',
    dueDate: '2026-06-15',
    startedAt: new Date('2026-06-05'),
    completedAt: null,
    createdAt: new Date('2026-06-03'),
    updatedAt: new Date('2026-06-05'),
    isOverdue: false,
  },
  t4: {
    id: 4,
    title: 'README 작성',
    description: null,
    status: 'DONE',
    priority: 'LOW',
    position: 4096,
    plannedStartDate: null,
    dueDate: null,
    startedAt: new Date('2026-06-04'),
    completedAt: new Date('2026-06-05'),
    createdAt: new Date('2026-06-03'),
    updatedAt: new Date('2026-06-05'),
    isOverdue: false,
  },
  t5: {
    id: 5,
    title: '제목만 있는 짧은 티켓',
    description: null,
    status: 'BACKLOG',
    priority: 'LOW',
    position: 5120,
    plannedStartDate: null,
    dueDate: null,
    startedAt: null,
    completedAt: null,
    createdAt: new Date('2026-06-06'),
    updatedAt: new Date('2026-06-06'),
    isOverdue: false,
  },
  t6: {
    id: 6,
    title: '매우 긴 제목을 가진 티켓 — 말줄임 처리 확인용으로 의도적으로 길게 작성된 케이스입니다',
    description: '설명도 길게 작성: 이 설명은 두 줄을 초과할 만큼 충분히 길게 작성되었습니다. 말줄임 처리가 올바르게 동작하는지 확인하기 위한 테스트 데이터입니다.',
    status: 'TODO',
    priority: 'MEDIUM',
    position: 6144,
    plannedStartDate: null,
    dueDate: '2026-06-30',
    startedAt: null,
    completedAt: null,
    createdAt: new Date('2026-06-06'),
    updatedAt: new Date('2026-06-06'),
    isOverdue: false,
  },
  t7: {
    id: 7,
    title: '단위 테스트 작성',
    description: null,
    status: 'TODO',
    priority: 'LOW',
    position: 7168,
    plannedStartDate: null,
    dueDate: null,
    startedAt: null,
    completedAt: null,
    createdAt: new Date('2026-06-06'),
    updatedAt: new Date('2026-06-06'),
    isOverdue: false,
  },
};

const mockBoardData: BoardData = {
  board: {
    BACKLOG: [mockTickets.t1, mockTickets.t5],           // 2개: HIGH, LOW
    TODO: [mockTickets.t2, mockTickets.t6, mockTickets.t7], // 3개: overdue, 긴제목, 낮음
    IN_PROGRESS: [mockTickets.t3],                       // 1개
    DONE: [mockTickets.t4],                              // 1개
  },
  total: 7,
};

// ─── Phase 정의 (FRONTEND_TASKS.md 기준) ─────────────────────────
const PHASES = [
  { id: 1, label: 'Phase 1', title: 'UI 기본 컴포넌트', desc: 'Button · Badge · Modal · ConfirmDialog', done: true },
  { id: 2, label: 'Phase 2', title: 'Board 컴포넌트', desc: 'TicketCard · ColumnHeader · Column · Board', done: true },
  { id: 3, label: 'Phase 3', title: 'Ticket 컴포넌트', desc: 'TicketDetailView · TicketForm · TicketModal', done: false },
  { id: 4, label: 'Phase 4', title: '데이터 레이어', desc: 'ticketApi · useTickets', done: false },
  { id: 5, label: 'Phase 5', title: '컨테이너', desc: 'BoardHeader · FilterBar · BoardContainer · page.tsx', done: false },
] as const;

// ─── Preview Page ─────────────────────────────────────────────────
export default function PreviewPage() {
  const [activePhase, setActivePhase] = useState<number | 'all'>('all');

  const visiblePhases =
    activePhase === 'all' ? PHASES : PHASES.filter((p) => p.id === activePhase);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f4f5f7', fontFamily: 'inherit' }}>

      {/* 페이지 헤더 */}
      <header style={{
        backgroundColor: '#0052cc',
        color: '#fff',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Tika — Component Preview</h1>
          <p style={{ margin: '2px 0 0', fontSize: 13, opacity: 0.8 }}>
            DB 없이 목 데이터로 컴포넌트를 시각적으로 확인하는 갤러리 페이지
          </p>
        </div>
        <a
          href="/"
          style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}
        >
          ← 보드로 돌아가기
        </a>
      </header>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>

        {/* 사이드 네비게이션 */}
        <nav style={{
          width: 220,
          flexShrink: 0,
          backgroundColor: '#fff',
          borderRight: '1px solid #dfe1e6',
          padding: '16px 0',
          position: 'sticky',
          top: 0,
          height: 'calc(100vh - 64px)',
          overflowY: 'auto',
        }}>
          <button
            onClick={() => setActivePhase('all')}
            style={navButtonStyle(activePhase === 'all')}
          >
            전체 보기
          </button>
          <div style={{ height: 1, backgroundColor: '#dfe1e6', margin: '8px 12px' }} />
          {PHASES.map((phase) => (
            <button
              key={phase.id}
              onClick={() => setActivePhase(phase.id)}
              style={navButtonStyle(activePhase === phase.id)}
            >
              <span style={{ fontSize: 11, opacity: 0.7, display: 'block' }}>
                {phase.label} {phase.done ? '✅' : '🔲'}
              </span>
              <span style={{ fontWeight: 600 }}>{phase.title}</span>
            </button>
          ))}
        </nav>

        {/* 메인 콘텐츠 */}
        <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>

          {/* 디자인 토큰 팔레트 (항상 표시) */}
          {activePhase === 'all' && (
            <DesignTokenSection />
          )}

          {/* Phase 섹션들 */}
          {visiblePhases.map((phase) => (
            <PhaseSection key={phase.id} phase={phase} mockTickets={mockTickets} mockBoardData={mockBoardData} />
          ))}

        </main>
      </div>
    </div>
  );
}

// ─── 네비 버튼 스타일 헬퍼 ─────────────────────────────────────────
function navButtonStyle(active: boolean): React.CSSProperties {
  return {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    padding: '8px 16px',
    border: 'none',
    backgroundColor: active ? '#deebff' : 'transparent',
    color: active ? '#0052cc' : '#172b4d',
    cursor: 'pointer',
    fontSize: 13,
    borderLeft: active ? '3px solid #0052cc' : '3px solid transparent',
    lineHeight: 1.5,
  };
}

// ─── 섹션 컨테이너 ────────────────────────────────────────────────
function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      backgroundColor: '#fff',
      border: '1px solid #dfe1e6',
      borderRadius: 8,
      marginBottom: 16,
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '10px 16px',
        borderBottom: '1px solid #dfe1e6',
        fontSize: 12,
        fontWeight: 700,
        color: '#5e6c84',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        backgroundColor: '#f8f9fa',
      }}>
        {title}
      </div>
      <div style={{ padding: '16px' }}>
        {children}
      </div>
    </div>
  );
}

// ─── 플레이스홀더 ─────────────────────────────────────────────────
function Placeholder({ label, height = 80 }: { label: string; height?: number }) {
  return (
    <div style={{
      height,
      border: '2px dashed #c1c7d0',
      borderRadius: 6,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#97a0af',
      fontSize: 13,
      backgroundColor: '#fafbfc',
    }}>
      {label}
    </div>
  );
}

// ─── 디자인 토큰 팔레트 ───────────────────────────────────────────
function DesignTokenSection() {
  const colors = [
    { label: 'Primary', value: '#0052cc', text: '#fff' },
    { label: 'BG Board', value: '#f4f5f7', text: '#172b4d' },
    { label: 'BG Column', value: '#ebecf0', text: '#172b4d' },
    { label: 'BG Card', value: '#ffffff', text: '#172b4d', border: '#dfe1e6' },
    { label: 'Text Primary', value: '#172b4d', text: '#fff' },
    { label: 'Text Secondary', value: '#5e6c84', text: '#fff' },
    { label: 'Border', value: '#dfe1e6', text: '#172b4d' },
    { label: 'High / Danger', value: '#de350b', text: '#fff' },
    { label: 'Medium / Info', value: '#0052cc', text: '#fff' },
    { label: 'Overdue BG', value: '#fff5f3', text: '#172b4d', border: '#de350b' },
  ];

  return (
    <section style={{ marginBottom: 32 }}>
      <h2 style={sectionHeading}>Design Tokens</h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
        gap: 10,
      }}>
        {colors.map((c) => (
          <div key={c.label} style={{
            borderRadius: 6,
            overflow: 'hidden',
            border: `1px solid ${c.border ?? c.value}`,
            boxShadow: '0 1px 2px rgba(9,30,66,0.1)',
          }}>
            <div style={{
              backgroundColor: c.value,
              height: 48,
              display: 'flex',
              alignItems: 'flex-end',
              padding: '4px 8px',
            }}>
              <span style={{ color: c.text, fontSize: 10, fontFamily: 'monospace' }}>
                {c.value}
              </span>
            </div>
            <div style={{
              padding: '6px 8px',
              fontSize: 11,
              fontWeight: 600,
              color: '#5e6c84',
              backgroundColor: '#fff',
            }}>
              {c.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Phase 섹션 ───────────────────────────────────────────────────
function PhaseSection({
  phase,
  mockTickets: _mockTickets,
  mockBoardData: _mockBoardData,
}: {
  phase: typeof PHASES[number];
  mockTickets: typeof mockTickets;
  mockBoardData: BoardData;
}) {
  return (
    <section style={{ marginBottom: 40 }}>
      {/* Phase 헤더 */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 16 }}>
        <span style={{
          backgroundColor: phase.done ? '#36b37e' : '#0052cc',
          color: '#fff',
          borderRadius: 4,
          padding: '2px 8px',
          fontSize: 11,
          fontWeight: 700,
        }}>
          {phase.label}
        </span>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#172b4d' }}>
          {phase.title}
        </h2>
        <span style={{ fontSize: 13, color: '#5e6c84' }}>{phase.desc}</span>
        {phase.done && (
          <span style={{ fontSize: 12, color: '#36b37e', fontWeight: 600 }}>✅ 완료</span>
        )}
      </div>

      {/* Phase 콘텐츠 */}
      {phase.id === 1 && <Phase1Content />}
      {phase.id === 2 && <Phase2Content />}
      {phase.id === 3 && <Phase3Content />}
      {phase.id === 4 && <Phase4Content />}
      {phase.id === 5 && <Phase5Content />}
    </section>
  );
}

// ─── Phase 1: UI 기본 컴포넌트 (✅ 완료) ─────────────────────────
function Phase1Content() {
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const handleConfirm = () => {
    setConfirmLoading(true);
    setTimeout(() => {
      setConfirmLoading(false);
      setConfirmOpen(false);
      setLastAction('✅ 확인 클릭됨');
    }, 1200);
  };

  return (
    <>
      {/* Badge */}
      <SectionCard title="Badge — 우선순위 & 날짜 variant">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <Badge variant="low">LOW</Badge>
          <Badge variant="medium">MEDIUM</Badge>
          <Badge variant="high">HIGH</Badge>
          <div style={{ width: 1, height: 20, backgroundColor: '#dfe1e6', margin: '0 4px' }} />
          <Badge variant="due">2026-06-20</Badge>
          <Badge variant="overdue">기한 초과</Badge>
        </div>
      </SectionCard>

      {/* Button — variant */}
      <SectionCard title="Button — 4가지 variant">
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      </SectionCard>

      {/* Button — size */}
      <SectionCard title="Button — size (sm / md / lg)">
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <Button variant="primary" size="sm">Small</Button>
          <Button variant="primary" size="md">Medium</Button>
          <Button variant="primary" size="lg">Large</Button>
        </div>
      </SectionCard>

      {/* Button — isLoading / disabled */}
      <SectionCard title="Button — isLoading & disabled 상태">
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button variant="primary" isLoading>저장 중</Button>
          <Button variant="danger" isLoading>삭제 중</Button>
          <Button variant="secondary" disabled>비활성화</Button>
        </div>
      </SectionCard>

      {/* Modal */}
      <SectionCard title="Modal — 오버레이 팝업">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            모달 열기
          </Button>
          <span style={{ fontSize: 12, color: '#5e6c84' }}>
            ESC 키 또는 바깥 클릭으로 닫힘
          </span>
        </div>

        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
          <div className="modal-header">
            <span style={{ fontSize: 16, fontWeight: 700 }}>Modal 제목</span>
            <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>✕</Button>
          </div>
          <div className="modal-body">
            <p style={{ margin: 0, color: '#5e6c84', fontSize: 14 }}>
              모달 본문입니다. 오버레이 클릭 또는 ESC 키로 닫을 수 있습니다.
            </p>
          </div>
          <div className="modal-footer">
            <Button variant="secondary" size="md" onClick={() => setModalOpen(false)}>취소</Button>
            <Button variant="primary" size="md" onClick={() => setModalOpen(false)}>확인</Button>
          </div>
        </Modal>
      </SectionCard>

      {/* ConfirmDialog */}
      <SectionCard title="ConfirmDialog — 삭제 확인 다이얼로그">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button variant="danger" onClick={() => { setConfirmOpen(true); setLastAction(null); }}>
            삭제 버튼 클릭
          </Button>
          {lastAction && (
            <span style={{ fontSize: 13, color: '#0052cc', fontWeight: 600 }}>
              {lastAction}
            </span>
          )}
        </div>

        <ConfirmDialog
          isOpen={confirmOpen}
          message="정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
          isLoading={confirmLoading}
          onConfirm={handleConfirm}
          onCancel={() => { setConfirmOpen(false); setLastAction('❌ 취소 클릭됨'); }}
        />
      </SectionCard>
    </>
  );
}

// ─── Phase 2: Board 컴포넌트 (✅ 완료) ───────────────────────────
function Phase2Content() {
  const cardCases: Array<{ label: string; ticket: TicketWithOverdue }> = [
    { label: 'HIGH 우선순위 + dueDate', ticket: mockTickets.t1 },
    { label: '기한 초과 (isOverdue=true)', ticket: mockTickets.t2 },
    { label: 'LOW 우선순위, dueDate 없음', ticket: mockTickets.t5 },
    { label: 'DONE 상태 (완료 스타일)', ticket: mockTickets.t4 },
    { label: '긴 제목 (말줄임 처리)', ticket: mockTickets.t6 },
  ];

  return (
    <>
      {/* TicketCard */}
      <SectionCard title="TicketCard — 케이스별 렌더링">
        <DndContext>
          <SortableContext items={cardCases.map((c) => c.ticket.id)}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
              {cardCases.map(({ label, ticket }) => (
                <div key={ticket.id}>
                  <p style={{ fontSize: 11, color: '#5e6c84', marginBottom: 4, fontWeight: 600 }}>
                    {label}
                  </p>
                  <TicketCard ticket={ticket} onClick={() => {}} />
                </div>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </SectionCard>

      {/* ColumnHeader */}
      <SectionCard title="ColumnHeader — 칼럼명 + 티켓 수 뱃지">
        <div style={{ display: 'flex', gap: 2, flexDirection: 'column', maxWidth: 280, backgroundColor: '#ebecf0', borderRadius: 6, overflow: 'hidden' }}>
          <ColumnHeader title="Backlog" count={2} />
          <ColumnHeader title="Todo" count={3} />
          <ColumnHeader title="In Progress" count={1} />
          <ColumnHeader title="Done" count={1} />
        </div>
      </SectionCard>

      {/* Board */}
      <SectionCard title="Board — 4칼럼 레이아웃 (BACKLOG 사이드바 + 3칼럼 그리드)">
        <div style={{
          height: 480,
          border: '1px solid #dfe1e6',
          borderRadius: 6,
          overflow: 'hidden',
        }}>
          <Board
            board={mockBoardData}
            onTicketClick={() => {}}
            onDragEnd={() => {}}
            activeTicket={null}
          />
        </div>
      </SectionCard>
    </>
  );
}

// ─── Phase 3: Ticket 컴포넌트 (🔲 구현 예정) ─────────────────────
function Phase3Content() {
  return (
    <>
      <SectionCard title="TicketDetailView — 읽기 전용 필드">
        <Placeholder label="TicketDetailView (status, startedAt, completedAt, createdAt) — Phase 3 구현 후 활성화" height={160} />
        {/* <TicketDetailView ticket={mockTickets.t3} /> */}
      </SectionCard>

      <SectionCard title="TicketForm — 생성 모드">
        <Placeholder label="TicketForm (create mode) — Phase 3 구현 후 활성화" height={320} />
        {/* <TicketForm mode="create" onSubmit={() => {}} onCancel={() => {}} isLoading={false} /> */}
      </SectionCard>

      <SectionCard title="TicketForm — 수정 모드 (initialData 있음)">
        <Placeholder label="TicketForm (edit mode) — Phase 3 구현 후 활성화" height={320} />
        {/* <TicketForm mode="edit" initialData={mockTickets.t1} onSubmit={() => {}} onCancel={() => {}} isLoading={false} /> */}
      </SectionCard>

      <SectionCard title="TicketModal — 상세/수정 모달">
        <Placeholder label="TicketModal (버튼 클릭 시 열림) — Phase 3 구현 후 활성화" height={56} />
        {/* <TicketModalDemo ticket={mockTickets.t1} /> */}
      </SectionCard>
    </>
  );
}

// ─── Phase 4: 데이터 레이어 (🔲 구현 예정) ───────────────────────
function Phase4Content() {
  return (
    <>
      <SectionCard title="ticketApi — API 함수 목록">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
          {[
            'fetchBoard()',
            'createTicket(data)',
            'getTicket(id)',
            'updateTicket(id, data)',
            'deleteTicket(id)',
            'completeTicket(id)',
            'reorderTicket(data)',
          ].map((fn) => (
            <div key={fn} style={{
              padding: '8px 12px',
              backgroundColor: '#f4f5f7',
              border: '1px solid #dfe1e6',
              borderRadius: 4,
              fontFamily: 'monospace',
              fontSize: 13,
              color: '#172b4d',
            }}>
              {fn}
            </div>
          ))}
        </div>
        <p style={{ marginTop: 12, fontSize: 12, color: '#97a0af' }}>
          ※ API 함수는 시각적 렌더링 없음 — 구현 후 테스트로 검증
        </p>
      </SectionCard>

      <SectionCard title="useTickets Hook — 상태 뷰어">
        <Placeholder label="useTickets 상태 뷰어 (board, isLoading, error) — Phase 4 구현 후 활성화" height={80} />
        {/* <UseTicketsDemo initialData={mockBoardData} /> */}
      </SectionCard>
    </>
  );
}

// ─── Phase 5: 컨테이너 (🔲 구현 예정) ────────────────────────────
function Phase5Content() {
  return (
    <>
      <SectionCard title="BoardHeader — 타이틀 + 새 업무 버튼">
        <Placeholder label="BoardHeader (Search placeholder + 새 업무 버튼) — Phase 5 구현 후 활성화" height={52} />
        {/* <BoardHeader onCreateClick={() => alert('새 업무 클릭')} /> */}
      </SectionCard>

      <SectionCard title="FilterBar — 필터 탭 (all / thisWeek / overdue)">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Placeholder label="activeFilter=all" height={40} />
          <Placeholder label="activeFilter=thisWeek (count=2)" height={40} />
          <Placeholder label="activeFilter=overdue (count=1)" height={40} />
        </div>
        {/* <FilterBar activeFilter="all" onFilterChange={() => {}} counts={{ thisWeek: 2, overdue: 1 }} /> */}
      </SectionCard>

      <SectionCard title="BoardContainer — 상태 관리 + DnD 통합">
        <Placeholder label="BoardContainer (완전한 인터랙션) — Phase 5 구현 후 활성화" height={500} />
        {/* <BoardContainer initialData={mockBoardData} /> */}
      </SectionCard>

      <SectionCard title="page.tsx — 서버 컴포넌트">
        <div style={{ padding: 12, backgroundColor: '#fffae6', border: '1px solid #f6c000', borderRadius: 6 }}>
          <p style={{ margin: 0, fontSize: 13, color: '#172b4d' }}>
            <code style={{ backgroundColor: '#ebecf0', padding: '1px 5px', borderRadius: 3 }}>app/(board)/page.tsx</code>는
            DB 연결 및 실제 API 동작이 필요합니다. 구현 완료 후 <a href="/" style={{ color: '#0052cc' }}>/ 경로</a>에서 확인하세요.
          </p>
        </div>
      </SectionCard>
    </>
  );
}

// ─── 공통 스타일 헬퍼 ─────────────────────────────────────────────
const sectionHeading: React.CSSProperties = {
  margin: '0 0 16px',
  fontSize: 15,
  fontWeight: 700,
  color: '#172b4d',
  borderBottom: '2px solid #dfe1e6',
  paddingBottom: 8,
};
