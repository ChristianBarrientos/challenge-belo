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
kubectl -n belo port-forward svc/myapp-service 8081:80
#Accesible en: http://localhost:8081
```

### 2. Exportar la URL para k6
```bash
export SERVICE_URL=http://localhost:8081
```

### 3. Ejecutar el test de carga
```bash
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
