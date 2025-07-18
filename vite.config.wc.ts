// vite.config.wc.ts
import { defineConfig, loadEnv } from 'vite'; // loadEnv 임포트
import react from '@vitejs/plugin-react';
import path from 'path';
import svgr from 'vite-plugin-svgr';

// defineConfig의 콜백 함수를 사용하여 'mode' (development, production 등)에 접근합니다.
export default defineConfig(({ mode }) => {
  // 현재 작업 디렉토리의 .env 파일들을 로드합니다.
  // process.cwd()는 프로젝트 루트를 가리킵니다.
  // 세 번째 인자 ''는 모든 환경 변수를 로드하도록 합니다 (VITE_ 접두사가 없는 것도 포함, 하지만 보통 VITE_ 사용).
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), svgr()],
    define: {
      // 1. 'process.env.NODE_ENV' 정의:
      // 많은 라이브러리들이 이 값을 참조하여 개발 모드와 프로덕션 모드를 구분합니다.
      'process.env.NODE_ENV': JSON.stringify(mode), // 현재 빌드 모드('development' 또는 'production')를 사용

      // 2. 'process.env.VITE_...' 형태의 환경 변수 정의 (선택적이지만 안전장치):
      // 웹 컴포넌트 코드나 라이브러리가 'process.env.VITE_HOLIDAYS_SERVICE_KEY' 같이 직접 접근하는 경우를 대비합니다.
      // Vite의 표준적인 방법은 코드 내에서 'import.meta.env.VITE_HOLIDAYS_SERVICE_KEY'를 사용하는 것입니다.
      // 이 define 설정은 'process.env'를 통한 접근 시에도 값이 대체되도록 합니다.
      'process.env.VITE_HOLIDAYS_SERVICE_KEY': JSON.stringify(env.VITE_HOLIDAYS_SERVICE_KEY),
      'process.env.VITE_LINK_PREVIEW_API_KEY': JSON.stringify(env.VITE_LINK_PREVIEW_API_KEY),

      // 만약 'process' 객체 자체가 필요하다는 오류가 계속 발생하면 (예: process.version 등),
      // 이는 더 복잡한 문제일 수 있으며, 해당 라이브러리의 브라우저 호환성이나 별도의 polyfill이 필요할 수 있습니다.
      // 하지만 대부분의 경우는 위와 같이 특정 'process.env' 속성을 정의하는 것으로 해결됩니다.
      // 'process': 'undefined' // 만약 process 객체 자체의 존재 여부를 체크하는 코드가 있다면
    },
    build: {
      lib: {
        entry: path.resolve(__dirname, 'src/web-component/kanban-web-component.ts'),
        name: 'BizbeeKanbanWC',
        fileName: (format) => `bizbee-kanban-wc.${format}.js`,
        formats: ['iife', 'es'],
      },
      rollupOptions: {
        // 필요한 경우 external, output.globals 설정
      },
      outDir: 'dist-wc',
      sourcemap: true,
    },
  };
});
