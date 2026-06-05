# CHANGELOG

프롬프트별 작업 이력. `/changelog` 스킬로 자동 기록된다.

---

## [main] 2026-06-05 23:11

**프롬프트**: Context7 MCP 추가 커밋 푸시 후 체인지 로그 업데이트 스킬 테스트를 해보자.

**커밋**: feat: /changelog 스킬 추가 및 초기 CHANGELOG 기록

**변경 파일**
| 구분 | 파일 경로 | +추가 | -삭제 |
|------|----------|-------|-------|
| 추가 | .claude/skills/changelog/SKILL.md | 128 | 0 |
| 추가 | CHANGELOG.md | 22 | 0 |
| 수정 | CLAUDE.md | 5 | 0 |

**테스트**: ✅ 65 passed, 0 failed (8 suites)

---

## [main] 2026-06-05 23:05

**프롬프트**: 시드 데이터 추가 및 db:seed 스크립트 tsx로 교체, /changelog 스킬 생성

**커밋**: feat: 시드 데이터 추가 및 db:seed 스크립트 tsx로 교체

**변경 파일**
| 구분 | 파일 경로 | +추가 | -삭제 |
|------|----------|-------|-------|
| 추가 | src/server/db/seed.ts | 109 | 0 |
| 수정 | package.json | 2 | 1 |
| 수정 | package-lock.json | 504 | 0 |

**테스트**: ✅ 65 passed, 0 failed (8 suites)

---
