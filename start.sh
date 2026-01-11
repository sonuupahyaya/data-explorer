#!/bin/bash

# World of Books Discovery Platform - Startup Script
# Usage: ./start.sh [dev|prod|clean]

set -e

COMMAND=${1:-dev}
PROJECT_NAME="world-of-books"

echo "🌐 World of Books Discovery Platform"
echo "===================================="

case $COMMAND in
  dev)
    echo "🚀 Starting development environment..."
    echo ""
    echo "Checking environment file..."
    if [ ! -f ".env" ]; then
      echo "⚠️  .env file not found, creating from template..."
      cp .env.example .env
      echo "✅ Created .env - please update MongoDB and Redis URLs if needed"
    fi
    
    echo ""
    echo "Starting Docker Compose services..."
    docker-compose up -d
    
    echo ""
    echo "✅ Services starting up..."
    echo ""
    echo "📍 Frontend:  http://localhost:3000"
    echo "📍 Backend:   http://localhost:3001"
    echo "📍 API Docs:  http://localhost:3001/api/docs"
    echo "📍 MongoDB:   mongodb://localhost:27017"
    echo "📍 Redis:     redis://localhost:6379"
    echo ""
    echo "🔄 Services may take 30-60 seconds to be fully ready"
    echo ""
    echo "Next steps:"
    echo "  - Check backend health: curl http://localhost:3001/api/navigation"
    echo "  - Check frontend: open http://localhost:3000"
    echo "  - View logs: docker-compose logs -f"
    echo "  - Stop services: ./start.sh stop"
    ;;
    
  stop)
    echo "🛑 Stopping services..."
    docker-compose down
    echo "✅ Services stopped"
    ;;
    
  restart)
    echo "🔄 Restarting services..."
    docker-compose restart
    echo "✅ Services restarted"
    ;;
    
  logs)
    echo "📋 Showing logs..."
    docker-compose logs -f
    ;;
    
  rebuild)
    echo "🔨 Rebuilding Docker images..."
    docker-compose down
    docker-compose up -d --build
    echo "✅ Rebuild complete"
    ;;
    
  clean)
    echo "🧹 Cleaning up..."
    docker-compose down -v
    rm -f .env
    echo "✅ Cleaned - all data and containers removed"
    echo "⚠️  Note: You may need to delete node_modules folders manually"
    ;;
    
  prod)
    echo "🚀 Starting production environment..."
    
    if [ ! -f ".env" ]; then
      echo "❌ .env file required for production"
      echo "Please create .env with production configuration"
      exit 1
    fi
    
    echo "Building for production..."
    docker-compose -f docker-compose.prod.yml up -d
    echo "✅ Production deployment started"
    ;;
    
  status)
    echo "📊 Container status:"
    docker-compose ps
    echo ""
    echo "📊 Resource usage:"
    docker stats --no-stream
    ;;
    
  shell-backend)
    echo "🐚 Entering backend container..."
    docker-compose exec backend /bin/bash
    ;;
    
  shell-frontend)
    echo "🐚 Entering frontend container..."
    docker-compose exec frontend /bin/sh
    ;;
    
  *)
    echo "Usage: ./start.sh [command]"
    echo ""
    echo "Commands:"
    echo "  dev              Start development environment (default)"
    echo "  stop             Stop all services"
    echo "  restart          Restart all services"
    echo "  logs             Show live logs"
    echo "  rebuild          Rebuild Docker images"
    echo "  clean            Remove all containers and data"
    echo "  prod             Start production environment"
    echo "  status           Show container status"
    echo "  shell-backend    Enter backend container shell"
    echo "  shell-frontend   Enter frontend container shell"
    echo ""
    echo "Examples:"
    echo "  ./start.sh dev       # Start development"
    echo "  ./start.sh logs      # View logs"
    echo "  ./start.sh clean     # Clean up everything"
    exit 1
    ;;
esac
