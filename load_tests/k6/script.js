import http from 'k6/http';
import { check, sleep } from 'k6';

// Configuración de stages para ramp‑up / steady / ramp‑down
export let options = {
  stages: [
    { duration: '30s', target: 20 },   // ramp‑up: 0 → 20 usuarios en 30s
    { duration: '1m',  target: 20 },   // steady: 20 usuarios durante 1m
    { duration: '30s', target: 0 },    // ramp‑down: 20 → 0 usuarios en 30s
  ],
  thresholds: {
    // 95% de solicitudes < 500 ms
    http_req_duration: ['p(95)<500'],
    // < 1% de fallos
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  // Toma la URL del servicio de una variable de entorno
  const url = __ENV.SERVICE_URL || 'http://localhost:8081';
  const res = http.get(url);

  // Checks básicos: status y cabecera con la versión
  check(res, {
    'status 200': (r) => r.status === 200,
    'tiene header X-App-Version': (r) => r.headers['X-App-Version'] !== undefined,
  });

  sleep(1);  // pausar 1s entre iteraciones
}
