# 🚦 Load Testing with k6

###### This directory contains a load testing script using [k6](https://k6.io/), ideal for validating the behavior of **Blue/Green** and **Canary** deployments in Kubernetes.

---

## ✅ Requirements

- The application exposed locally via `kubectl port-forward`
- Having `k6` installed locally or using it via Docker

---

## 🚀 How to run the tests

### 1. Expose the service

Run the following command to redirect traffic from local port 8081 to the Kubernetes Service:

```bash
kubectl -n canary port-forward svc/canary-service 8081:80
# Accessible at: http://localhost:8081
```

### 2. Export the URL for k6
```bash
export SERVICE_URL=http://localhost:8081
# Currently hardcoded in the script
```

### 3. Run the load test
```bash
cd load_tests/k6
k6 run ./script.js
```

## 🧪  Test details (script.js)

This script simulates a gradual usage scenario with peaks and error handling.

### Test configuration
```js
export let options = {
  stages: [
    { duration: '30s', target: 20 },  // ramp-up
    { duration: '1m',  target: 20 },  // steady
    { duration: '30s', target: 0 },   // ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% of responses < 500ms
    http_req_failed: ['rate<0.01'],    // <1% of errors allowed
  },
};


```bash
Example output:

k6 run script.js

          /\      |‾‾| /‾‾/   /‾‾/   
     /\  /  \     |  |/  /   /  /    
    /  \/    \    |     (   /   ‾‾\  
   /          \   |  |\  \ |  (‾)  | 
  / __________ \  |__| \__\ \_____/ .io

  execution: local
     script: script.js
     output: -

  scenarios: (100.00%) 1 scenario, 20 max VUs, 2m30s max duration (incl. graceful stop):
           * default: Up to 20 looping VUs for 2m0s over 3 stages (gracefulRampDown: 30s, gracefulStop: 30s)


     ✓ status 200
     ✗ tiene header X-App-Version
      ↳  0% — ✓ 0 / ✗ 1818

     checks.........................: 50.00% ✓ 1818      ✗ 1818
     data_received..................: 278 kB 2.3 kB/s
     data_sent......................: 145 kB 1.2 kB/s
     http_req_blocked...............: avg=14.48µs  min=2.18µs   med=8.99µs   max=732.08µs p(90)=11.74µs  p(95)=13.49µs 
     http_req_connecting............: avg=3.79µs   min=0s       med=0s       max=481.35µs p(90)=0s       p(95)=0s      
   ✓ http_req_duration..............: avg=3.01ms   min=704.27µs med=2.9ms    max=18.6ms   p(90)=3.73ms   p(95)=4.12ms  
       { expected_response:true }...: avg=3.01ms   min=704.27µs med=2.9ms    max=18.6ms   p(90)=3.73ms   p(95)=4.12ms  
   ✓ http_req_failed................: 0.00%  ✓ 0         ✗ 1818
     http_req_receiving.............: avg=108.97µs min=27.45µs  med=105.78µs max=396.66µs p(90)=143.74µs p(95)=162.05µs
     http_req_sending...............: avg=43.74µs  min=7.46µs   med=42.08µs  max=219.73µs p(90)=58.27µs  p(95)=69.23µs 
     http_req_tls_handshaking.......: avg=0s       min=0s       med=0s       max=0s       p(90)=0s       p(95)=0s      
     http_req_waiting...............: avg=2.86ms   min=658.34µs med=2.73ms   max=18.4ms   p(90)=3.56ms   p(95)=3.96ms  
     http_reqs......................: 1818   15.091157/s
     iteration_duration.............: avg=1s       min=1s       med=1s       max=1.02s    p(90)=1s       p(95)=1s      
     iterations.....................: 1818   15.091157/s
     vus............................: 1      min=1       max=20
     vus_max........................: 20     min=20      max=20


running (2m00.5s), 00/20 VUs, 1818 complete and 0 interrupted iterations
default ✓ [======================================] 00/20 VUs  2m0s
```

### ✅ Included validations
- HTTP status code 200
- Presence of the X-App-Version header (useful for identifying the active version)

### ⚙️ Customization
You can edit the script to:
#### Change the number of virtual users (VUs)
```js
export let options = {
  vus: 50,              // establecer un número fijo de VUs
  duration: '2m',       // duración total de la prueba
  thresholds: {
    http_req_duration: ['p(95)<500'],
  },
};
```

#### Adjust the duration of the load phases
```js
export let options = {
  stages: [
    { duration: '1m',  target: 50 },  // ramp‑up: subir a 50 VUs en 1 minuto
    { duration: '2m',  target: 50 },  // steady: mantener 50 VUs por 2 minutos
    { duration: '1m',  target: 0  },  // ramp‑down: bajar a 0 VUs en 1 minuto
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
  },
};
```
#### Validate response body content
```js
import http from 'k6/http';
import { check } from 'k6';

export default function () {
  const res = http.get(`${__ENV.SERVICE_URL}/api/health`);
  check(res, {
    'status is 200': (r) => r.status === 200,
    'body contains "OK"': (r) => r.body.includes('OK'),
  });
}

```


### 📈 Metrics displayed
- Successful and failed requests
- Latencies (average, p95, p99)
- Wait time (http_req_waiting)
- Total iteration time
- Requests per second (RPS)
- Total number of completed iterations

### 📚  Useful resources
- [Official k6 documentation](https://k6.io/docs/)
- [Advanced scenario configuration](https://k6.io/docs/using-k6/scenarios/)
- [Response validation](https://k6.io/docs/using-k6/checks/)
- [Real-time metrics output](https://k6.io/docs/results-output/real-time/)
- [k6 GitHub repository](https://github.com/grafana/k6)
