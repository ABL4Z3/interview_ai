#!/bin/bash
# Setup script for IntervuAI monorepo

echo "🚀 Setting up IntervuAI..."
echo "================================"

# Check Node.js version
echo "✓ Checking Node.js version..."
NODE_VERSION=$(node -v)
echo "  Found: $NODE_VERSION"

# Install root dependencies
echo "✓ Installing root dependencies..."
npm install

# Copy env files
echo "✓ Setting up environment files..."
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

echo ""
echo "================================"
echo "✅ Setup complete!"
echo "================================"
echo ""
echo "📝 Next steps:"
echo "1. Edit .env with your API keys:"
echo "   - OPENAI_API_KEY"
echo "   - DEEPGRAM_API_KEY"
echo "   - ELEVENLABS_API_KEY"
echo "   - RAZORPAY_KEY_ID & SECRET"
echo "   - JWT_SECRET"
echo ""
echo "2. Start MongoDB (if running locally):"
echo "   mongod"
echo ""
echo "3. Start development servers:"
echo "   npm run dev"
echo ""
echo "✨ Happy coding!"
