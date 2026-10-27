# 이모지 모음

기기에 표시되는 이모지를 찾아 복사하는 한국어 웹 앱입니다. 11개 카테고리의 519개 문자 목록을 탐색하고, 즐겨찾기와 최근 복사 기록을 이 브라우저에 저장합니다. 이미지·글꼴 파일, 계정, 외부 API는 필요하지 않습니다.

## 실행과 검사

Node.js 22.12 이상이 필요합니다. 검증 환경은 Node.js 26.8.1과 npm 11.19.0입니다.

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm run dev
npm run typecheck
npm test
npm run build
npm audit --audit-level=moderate
npm run preview
```

개발·미리보기 서버는 loopback에 바인딩합니다. production bundle은 `dist/`에 생성됩니다. 정적 호스팅 설정의 헤더 적용 여부는 호스팅 서비스에서 별도로 확인해야 합니다. 공개 배포가 이루어졌다고 주장하지 않습니다.

## 사용

- 이모지 문자열, 한국어 카테고리 이름·관련 단어 또는 영어 카테고리 단어로 검색합니다. `동물`, `ANIMAL`, `스포츠`, `heart`처럼 카테고리를 찾을 수 있습니다. 모든 이모지의 개별 이름·모든 언어 번역을 지원하는 검색은 아닙니다.
- 검색은 Unicode NFC 정규화와 대소문자 무시를 사용합니다. U+FE0E/U+FE0F variation selector는 비교할 때만 무시하고, 복사하는 원래 문자열은 보존합니다. ZWJ와 피부색 modifier는 제거하지 않습니다.
- 문자 버튼을 누르면 복사하고, 별도의 별 버튼으로 즐겨찾기를 추가·해제합니다. 최근 사용에는 복사에 성공한 문자만 최대 20개를 기록합니다.
- 카테고리 이동, 접기·펼치기, 전체·즐겨찾기·최근 사용 탭을 제공합니다. 검색은 각 탭에 적용됩니다.
- 최근 사용의 기록 지우기는 해당 목록만 지웁니다. JSON·CSV import/export 기능은 없습니다.

## 저장과 권한

`localStorage`의 `emojiHistory`, `emojiFavorites`를 사용합니다. 정상적으로 읽은 key는 변경·reload 뒤에도 유지되며 원격 서버로 전송하지 않습니다. 브라우저 데이터를 지우면 사라집니다.

손상된 JSON, 배열이 아닌 값, 모르는 항목 또는 읽기 권한 문제가 있는 key는 원래 raw 값을 덮어쓰지 않습니다. 매 저장 직전에도 현재 key를 다시 검증해 나중에 손상되거나 읽을 수 없어진 값도 덮어쓰지 않습니다. 해당 key의 변경은 현재 화면의 메모리에만 적용하고 한국어 경고를 표시합니다. 다른 정상 key는 독립적으로 계속 저장합니다. 쓰기 권한·용량 문제도 경고하며 앱은 계속 사용할 수 있습니다.

복사는 사용자 click 안에서 `execCommand`를 시도하고, 실패하면 secure context의 Clipboard API를 시도합니다. 두 경로 모두 실패하면 실패를 알리고 최근 기록을 갱신하지 않습니다. 브라우저·iframe 권한 정책에 따라 복사를 허용해야 할 수 있습니다.

## 검증 범위

18개 테스트는 잘못된 저장 shape, 손상 JSON, 읽기·쓰기 거부, 원본 raw 보존, 정상 key 독립성, 즐겨찾기·최근 기록, 검색 정규화, clipboard 실패와 focus 정리를 검사합니다. Node 26의 native storage가 jsdom을 가리지 않도록 Vitest worker에서만 native Web Storage를 끕니다. 실제 앱의 browser storage를 끄는 설정은 아닙니다.

확인한 명령과 브라우저 범위는 [검증 기록](docs/VERIFICATION.md), 변경은 [변경 기록](CHANGELOG.md)에 있습니다. 실제 glyph 모양은 운영체제와 글꼴에 따라 달라집니다.

자체 코드: [MIT](LICENSE). 외부 고지: [ATTRIBUTIONS.md](ATTRIBUTIONS.md), [shadcn MIT](SHADCN-LICENSE.txt).

공식 문서: [React](https://react.dev/) · [Vite](https://vite.dev/guide/) · [Clipboard API](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API) · [Web Storage](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
