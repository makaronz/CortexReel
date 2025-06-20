#!/bin/bash

# CortexReel Production Deployment Script
# KILLER-666 AUTONOMOUS DEPLOYMENT PROTOCOL

set -euo pipefail

echo "🔥 CORTEXREEL PRODUCTION DEPLOYMENT INITIATED"
echo "================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="cortexreel"
DOMAIN="${DOMAIN:-localhost}"
EMAIL="${EMAIL:-admin@cortexreel.com}"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check dependencies
check_dependencies() {
    print_status "Checking system dependencies..."
    
    local missing_deps=()
    
    if ! command -v docker &> /dev/null; then
        missing_deps+=("docker")
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        missing_deps+=("docker-compose")
    fi
    
    if ! command -v openssl &> /dev/null; then
        missing_deps+=("openssl")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing dependencies: ${missing_deps[*]}"
        print_error "Please install missing dependencies and try again."
        exit 1
    fi
    
    print_success "All dependencies found"
}

# Create SSL certificates
setup_ssl() {
    print_status "Setting up SSL certificates..."
    
    if [ ! -d "ssl" ]; then
        mkdir -p ssl
    fi
    
    if [ ! -f "ssl/server.crt" ] || [ ! -f "ssl/server.key" ]; then
        print_status "Generating self-signed SSL certificate..."
        
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout ssl/server.key \
            -out ssl/server.crt \
            -subj "/C=US/ST=CA/L=San Francisco/O=CortexReel/CN=${DOMAIN}"
        
        print_success "SSL certificate generated"
    else
        print_success "SSL certificate already exists"
    fi
}

# Setup environment files
setup_environment() {
    print_status "Setting up environment configuration..."
    
    if [ ! -f ".env.docker" ]; then
        if [ -f "env.docker.example" ]; then
            cp env.docker.example .env.docker
            print_warning "Copied env.docker.example to .env.docker"
            print_warning "Please edit .env.docker with your actual API keys before deployment"
        else
            print_error "env.docker.example not found"
            exit 1
        fi
    else
        print_success "Environment file already exists"
    fi
    
    # Validate critical environment variables
    if grep -q "your_actual_gemini_api_key_here" .env.docker; then
        print_warning "GEMINI_API_KEY still contains placeholder value"
        print_warning "Update .env.docker with your actual API key"
    fi
}

# Create necessary directories
setup_directories() {
    print_status "Creating necessary directories..."
    
    local dirs=(
        "uploads"
        "logs"
        "ssl"
        "scripts"
    )
    
    for dir in "${dirs[@]}"; do
        if [ ! -d "$dir" ]; then
            mkdir -p "$dir"
            print_success "Created directory: $dir"
        fi
    done
}

# Build and start services
deploy_stack() {
    print_status "Building and deploying Docker stack..."
    
    # Pull latest images
    print_status "Pulling latest Docker images..."
    docker-compose pull
    
    # Build custom images
    print_status "Building custom Docker images..."
    docker-compose build --no-cache
    
    # Start services
    print_status "Starting Docker services..."
    docker-compose --env-file .env.docker up -d
    
    print_success "Docker stack deployed"
}

# Health checks
perform_health_checks() {
    print_status "Performing health checks..."
    
    local services=(
        "mongodb:27017"
        "redis:6379"
        "weaviate:8080"
        "minio:9000"
        "backend:3001"
    )
    
    local max_attempts=30
    local attempt=1
    
    for service in "${services[@]}"; do
        local host_port=(${service//:/ })
        local host=${host_port[0]}
        local port=${host_port[1]}
        
        print_status "Checking $host:$port..."
        
        while [ $attempt -le $max_attempts ]; do
            if docker run --rm --network cortexreel_cortexreel-network alpine nc -z $host $port &> /dev/null; then
                print_success "$service is healthy"
                break
            fi
            
            if [ $attempt -eq $max_attempts ]; then
                print_error "$service failed health check after $max_attempts attempts"
                return 1
            fi
            
            sleep 2
            ((attempt++))
        done
        
        attempt=1
    done
}

# Display deployment summary
show_summary() {
    print_success "🚀 DEPLOYMENT COMPLETED SUCCESSFULLY!"
    echo ""
    echo "================================================="
    echo "         CORTEXREEL DEPLOYMENT SUMMARY"
    echo "================================================="
    echo ""
    echo "📊 Services Status:"
    echo "  - MongoDB:    running on port 27017"
    echo "  - Redis:      running on port 6379"
    echo "  - Weaviate:   running on port 8080"
    echo "  - MinIO:      running on port 9000 (console: 9001)"
    echo "  - Backend:    running on port 3001"
    echo "  - Nginx:      running on ports 80/443"
    echo ""
    echo "🌐 Access URLs:"
    echo "  - Application:  https://${DOMAIN}"
    echo "  - MinIO Console: http://${DOMAIN}:9001"
    echo "  - Weaviate:     http://${DOMAIN}:8080"
    echo ""
    echo "🔐 Default Credentials:"
    echo "  - MongoDB:    cortexreel / cortexreel_mongo_2024!"
    echo "  - Redis:      cortexreel_redis_2024!"
    echo "  - MinIO:      cortexreel / cortexreel_minio_2024!"
    echo "  - Weaviate:   cortexreel-weaviate-key-2024"
    echo ""
    echo "⚠️  SECURITY NOTES:"
    echo "  - Self-signed SSL certificate generated"
    echo "  - Change default passwords in production"
    echo "  - Update API keys in .env.docker"
    echo "  - Configure firewall rules"
    echo ""
    echo "📝 Useful Commands:"
    echo "  - View logs:        docker-compose logs -f"
    echo "  - Stop services:    docker-compose down"
    echo "  - Restart:          docker-compose restart"
    echo "  - Update:           ./scripts/deploy.sh"
    echo ""
    echo "================================================="
}

# Cleanup function
cleanup() {
    if [ $? -ne 0 ]; then
        print_error "Deployment failed. Cleaning up..."
        docker-compose down
    fi
}

# Set trap for cleanup
trap cleanup EXIT

# Main deployment flow
main() {
    echo "🔥 KILLER-666 AUTONOMOUS DEPLOYMENT PROTOCOL"
    echo "=============================================="
    
    check_dependencies
    setup_directories
    setup_ssl
    setup_environment
    deploy_stack
    
    # Wait for services to start
    print_status "Waiting for services to stabilize..."
    sleep 30
    
    perform_health_checks
    show_summary
    
    print_success "🎯 MISSION ACCOMPLISHED - CORTEXREEL IS LIVE!"
}

# Parse command line arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "stop")
        print_status "Stopping CortexReel services..."
        docker-compose down
        print_success "Services stopped"
        ;;
    "restart")
        print_status "Restarting CortexReel services..."
        docker-compose restart
        print_success "Services restarted"
        ;;
    "logs")
        print_status "Showing service logs..."
        docker-compose logs -f
        ;;
    "health")
        perform_health_checks
        ;;
    "clean")
        print_status "Cleaning up Docker resources..."
        docker-compose down -v
        docker system prune -f
        print_success "Cleanup completed"
        ;;
    *)
        echo "Usage: $0 {deploy|stop|restart|logs|health|clean}"
        echo ""
        echo "Commands:"
        echo "  deploy  - Deploy the full stack (default)"
        echo "  stop    - Stop all services"
        echo "  restart - Restart all services"
        echo "  logs    - Show live logs"
        echo "  health  - Perform health checks"
        echo "  clean   - Clean up all resources"
        exit 1
        ;;
esac 