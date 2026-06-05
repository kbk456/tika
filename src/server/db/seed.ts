process.loadEnvFile('.env.local');

async function seed() {
  // dotenv 실행 후 동적 import (ESM import 호이스팅 방지)
  const { db } = await import('./index');
  const { tickets } = await import('./schema');

  await db.delete(tickets);

  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000 + 60 * 60 * 1000); // 23시간 전 (Done 24h 필터 통과)
  const today = now.toISOString().split('T')[0];
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const pastDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 3일 전 (isOverdue 테스트용)

  await db.insert(tickets).values([
    // BACKLOG (position 오름차순)
    {
      title: '알림 기능 조사',
      description: '푸시 알림 또는 인앱 알림 구현 방식 조사',
      status: 'BACKLOG',
      priority: 'LOW',
      position: 1024,
    },
    {
      title: '다크 모드 지원',
      status: 'BACKLOG',
      priority: 'MEDIUM',
      position: 2048,
      dueDate: nextWeek,
    },
    {
      title: '성능 최적화',
      description: '렌더링 성능 병목 구간 분석 및 개선',
      status: 'BACKLOG',
      priority: 'HIGH',
      position: 3072,
      dueDate: pastDate, // isOverdue=true
    },

    // TODO (startedAt 있음)
    {
      title: '로그인 페이지 구현',
      status: 'TODO',
      priority: 'HIGH',
      position: 1024,
      plannedStartDate: today,
      dueDate: tomorrow,
      startedAt: now,
    },
    {
      title: '회원가입 API 연동',
      status: 'TODO',
      priority: 'MEDIUM',
      position: 2048,
      startedAt: now,
    },

    // IN_PROGRESS
    {
      title: 'API 설계 문서 작성',
      description: 'REST API 엔드포인트와 요청/응답 형식을 정의한다',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      position: 1024,
      plannedStartDate: today,
      dueDate: nextWeek,
      startedAt: now,
    },
    {
      title: '칸반 보드 UI 구현',
      description: '드래그앤드롭 포함 보드 화면 개발',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      position: 2048,
      dueDate: pastDate, // isOverdue=true
      startedAt: now,
    },

    // DONE (completedAt 23시간 전 → 24h 필터 통과)
    {
      title: '프로젝트 요구사항 정리',
      description: '제품 요구사항 문서(PRD) 작성 완료',
      status: 'DONE',
      priority: 'HIGH',
      position: 1024,
      startedAt: yesterday,
      completedAt: yesterday,
    },
    {
      title: 'DB 스키마 설계',
      status: 'DONE',
      priority: 'MEDIUM',
      position: 2048,
      startedAt: yesterday,
      completedAt: now,
    },
  ]);

  console.log('시드 데이터 삽입 완료');
  console.log('  BACKLOG: 3개 (isOverdue 1개 포함)');
  console.log('  TODO: 2개');
  console.log('  IN_PROGRESS: 2개 (isOverdue 1개 포함)');
  console.log('  DONE: 2개 (24h 이내)');
  process.exit(0);
}

seed();
