# Kubernetes Deployment Strategies Challenge

###### This repository demonstrates **Blue/Green** and **Canary** deployment strategies in Kubernetes, using a local Minikube cluster.
---

## 📋 Prerequisites
- [Docker](https://docs.docker.com/get-docker/)
- [Minikube](https://minikube.sigs.k8s.io/docs/start/)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- [k6](https://k6.io/docs/get-started/installation/) (for load testing)

---

## 🚀 Initial Setup

### 1. Start Minikube
```bash
minikube start --driver=docker
minikube status 
```

### 2. Configure Docker environment for Minikube
```bash
eval $(minikube docker-env)
```

### 3. 🐳 Build Docker Images
```bash
docker build -t app-blue:latest -f app/blue/Dockerfile ./app/blue
docker build -t app-green:latest -f app/green/Dockerfile ./app/green
```

### 4. Create namespaces
```bash
kubectl create ns blue-green
kubectl create ns canary
```

## ☸️ Deploying to Kubernetes
### 🔵🟢 Blue/Green Deployment

### 1. Apply the resources
```bash
kubectl apply -f minikube/blue-green/
```

### 2. Verify resources
```bash
kubectl -n blue-green get pods,svc
```

### 3. Expose the service
```bash
kubectl -n blue-green port-forward svc/blue-green-service 8081:80
```

### 4. Switch between Blue and Green
Edit the Service selector to redirect traffic:
```yaml
selector:
  version: green  # Cambiar a "blue" para cambiar de versión
```

### 5. Apply the change
```bash
kubectl apply -f minikube/blue-green/service.yaml
```

###  🐦⬛ Canary Deployment

### 1. Apply the resources
```bash
kubectl apply -f minikube/canary/ 
```

### 2. Expose the service
```bash
kubectl -n canary port-forward svc/canary-service 8081:80
```

### 3. Verify distribution (75% v1, 25% v2)
```bash
kubectl get pods -n canary -l app=web-app,version=v1
# Returns 1 pod representing 25% of the load
kubectl get pods -n canary -l app=web-app,version=v2
# Returns 3 pods representing 75% of the load
```

### 4. Scale v2 and verify distribution (50% v1, 50% v2)
```bash
kubectl -n canary scale deployment app-v1 --replicas=3 
kubectl get pods -n canary -l app=web-app,version=v1
# Returns 3 pods representing 50% of the load
kubectl get pods -n canary -l app=web-app,version=v2
# Returns 3 pods representing 50% of the load
```

### Improvements
- Add readiness and liveness probes in the deployments

```yaml
livenessProbe:  
  httpGet:  
    path: /health  
    port: 3000  
  initialDelaySeconds: 5  
  periodSeconds: 10  
```

