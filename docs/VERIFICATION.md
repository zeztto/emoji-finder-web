# 검증 기록

검증일: 2026-10-28. macOS, Node.js 26.8.1, npm 11.19.0에서 local production build를 검사했습니다. GitHub 원격 CI·공개 저장소 readback·외부 hosting 적용은 local 검증과 구분합니다.

| 검사 | 결과 |
| --- | --- |
| clean `npm ci --ignore-scripts --no-audit --no-fund` | 통과 |
| `npm run typecheck` | 통과 |
| `npm test` | 18/18, 3 files 통과 |
| `npm run build` | 통과 |
| fresh npm audit | 0건 |

회귀 검사는 storage의 wrong shape·손상 JSON·권한 거부·정상 key 독립성·원본 raw 보존, mount 뒤의 손상·읽기 거부, 최근 20개·중복 제거, 한국어 NFC·영어 category 검색, Unicode variation·ZWJ 문자열, 복사 실패와 textarea/focus 정리를 포함합니다. 수정 전 실패와 Node 26 테스트 환경 충돌 기록을 분리해 보존했습니다.

실제 브라우저에서 검색, 분리된 복사·즐겨찾기 target, reload 지속성, 기록 지우기, 세 탭의 검색 0건, clipboard 실패, key별 저장 오류를 검증했습니다. 1440×900, 1024×768, 390×844, 360×800의 실제 PNG·runtime 크기를 확인했고 복사 중심이 즐겨찾기에 가려지는 문제를 수정 후 재확인했습니다.

v3에서는 정상 mount 뒤 favorite/history key를 손상시키거나 읽기를 거부한 뒤 복사·즐겨찾기·지우기를 실제 실행했습니다. 해당 raw 값이 유지되고 setItem이 실행되지 않는 경계를 확인했습니다. v2의 화면·hit-area는 CSS와 UI가 바뀌지 않아 기존 실제 검증과 결합했습니다.

Gitleaks 8.30.1의 기본 rule, 100% redaction, custom allowlist 없이 공개 directory를 검사해 0건을 확인했습니다. 기존 private Git history는 이 검사·공개 대상에 포함하지 않습니다.

클립보드 검증은 실제 사용자 동작에서 browser copy 호출·toast·최근 기록을 확인한 범위입니다. 운영체제 clipboard를 별도로 읽어 내용까지 재검증한 결과로 확대하지 않습니다. Glyph 모양, browser 권한·iframe 정책, 모든 Unicode 입력 조합을 보장하지 않습니다.

이모지 519개·11개 category는 포함된 목록을 센 값입니다. 전체 Unicode 표준 데이터나 모든 언어의 개별 emoji 설명을 제공한다는 뜻이 아닙니다.
