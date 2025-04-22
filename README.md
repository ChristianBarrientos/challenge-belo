# Kubernetes Deployment Strategies Challenge

Este repositorio demuestra las estrategias de despliegue **Blue/Green** y **Canary** en Kubernetes, usando un clúster local con Minikube.

---

## 📋 Requisitos Previos
- [Docker](https://docs.docker.com/get-docker/)
- [Minikube](https://minikube.sigs.k8s.io/docs/start/)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- [k6](https://k6.io/docs/get-started/installation/) (para pruebas de carga)

---

## 🚀 Configuración Inicial

### 1. Iniciar Minikube
```bash
minikube start --driver=docker
minikube status 
```

### 2. Configurar el entorno de Docker de Minikube
```bash
eval $(minikube docker-env)
```

### 3. 🐳 Construir Imágenes Docker
```bash
docker build -t app-blue:latest -f app/blue/Dockerfile ./app/blue
docker build -t app-green:latest -f app/green/Dockerfile ./app/green
```

### 4. Crear namespace
```bash
kubectl create ns blue-green
kubectl create ns canary
```

## ☸️ Desplegar en Kubernetes
### 🔵🟢 Blue/Green Deployment

### 1. Aplicar los recursos
```bash
kubectl apply -f minikube/blue-green/
```

### 2. Verificar recursos
```bash
kubectl -n blue-green get pods,svc
```

### 3. Exponer svc
```bash
kubectl -n blue-green port-forward svc/blue-green-service 8081:80
```

### 4. Cambiar entre Blue y Green
Edita el selector del `Service` para redirigir el tráfico:
```yaml
selector:
  version: green  # Cambiar a "blue" para cambiar de versión
```

### 5. Aplica el cambio
```bash
kubectl apply -f minikube/blue-green/service.yaml
```

###  🐦⬛ Canary Deployment

### 1. Aplicar los recursos
```bash
kubectl apply -f minikube/canary/ 
```

### 2. Exponer svc
```bash
kubectl -n canary port-forward svc/canary-service 8081:80
```

### 3. Verificar distribución (75% v1, 25% v2)
```bash
kubectl get pods -n canary -l app=web-app,version=v1
#Devuelve 1 pod representando el 25% de la carga
kubectl get pods -n canary -l app=web-app,version=v2
#Devuelve 3 pods representando el 75% de la carga
```

### 4.  Escalar v2 y Verificar distribución (50% v1, 50% v2)
```bash
kubectl -n canary scale deployment app-v1 --replicas=3 
kubectl get pods -n canary -l app=web-app,version=v1
#Devuelve 3 pod representando el 50% de la carga
kubectl get pods -n canary -l app=web-app,version=v2
#Devuelve 3 pod representando el 50% de la carga
```



