# 🚦 Pruebas de Carga con k6

Este directorio contiene un script de pruebas de carga usando [k6](https://k6.io/), ideal para validar el comportamiento de los despliegues **Blue/Green** y **Canary** en Kubernetes.

---

## ✅ Requisitos

- Tener la aplicación expuesta localmente mediante `kubectl port-forward`
- Tener instalado `k6` localmente o usarlo vía Docker

---

## 🚀 Cómo ejecutar los tests

### 1. Exponer el servicio

Ejecutá el siguiente comando para redirigir tráfico del puerto 8081 local al `Service` en Kubernetes:

```bash
kubectl -n canary port-forward svc/canary-service 8081:80
#Accesible en: http://localhost:8081
```

### 2. Exportar la URL para k6
```bash
export SERVICE_URL=http://localhost:8081
#Actualmente hardcodeado en el script
```

### 3. Ejecutar el test de carga
```bash
cd load_tests/k6
k6 run ./script.js
```

## 🧪 Detalles del test (script.js)

Este script simula un escenario de uso gradual con picos y control de errores.

### Configuración de la prueba
```js
export let options = {
  stages: [
    { duration: '30s', target: 20 },  // ramp-up
    { duration: '1m',  target: 20 },  // steady
    { duration: '30s', target: 0 },   // ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% de respuestas < 500ms
    http_req_failed: ['rate<0.01'],    // <1% de errores permitidos
  },
};


```bash
Salida de ejemplo:
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

### ✅ Validaciones incluidas
- Código de estado HTTP 200
- Presencia del header X-App-Version (útil para identificar la versión activa)

### ⚙️ Personalización
Podés editar el script para:
- Cambiar la cantidad de usuarios virtuales (VUs)
- Ajustar duración de las fases de carga
- Validar contenido del cuerpo de la respuesta
- Simular autenticación (tokens, headers personalizados)
- Enviar peticiones POST, PUT, DELETE, etc.
- Agregar delays más complejos, loops o escenarios por segmento

### 📈 Métricas que se muestran
- Peticiones exitosas y fallidas
- Latencias (promedio, p95, p99)
- Tiempo de espera (http_req_waiting)
- Tiempo total de iteración
- Peticiones por segundo (RPS)
- Cantidad total de iteraciones completadas

### 📚 Recursos útiles
- [Documentación oficial de k6](https://k6.io/docs/)
- [Configuración avanzada de escenarios](https://k6.io/docs/using-k6/scenarios/)
- [Validación de respuestas](https://k6.io/docs/using-k6/checks/)
- [Salida de métricas en tiempo real](https://k6.io/docs/results-output/real-time/)
- [Repositorio GitHub de k6](https://github.com/grafana/k6)
