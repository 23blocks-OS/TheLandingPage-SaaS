import Link from 'next/link'
import { Rocket, Zap, Shield, Code } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Rocket className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">23Blocks Deploy</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 rounded-md text-sm font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl font-extrabold text-gray-900 sm:text-6xl">
              Deploy Your Sites
              <span className="text-primary-600"> Instantly</span>
            </h1>
            <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
              Open-source deployment platform for static sites. Like Netlify or Vercel, but you
              control the infrastructure.
            </p>
            <div className="mt-10 flex justify-center space-x-4">
              <Link
                href="/register"
                className="bg-primary-600 text-white hover:bg-primary-700 px-8 py-3 rounded-lg text-lg font-medium shadow-lg hover:shadow-xl transition"
              >
                Start Deploying
              </Link>
              <Link
                href="https://github.com/23blocks-OS/TheLandingPage-SaaS"
                className="bg-white text-gray-700 hover:bg-gray-50 px-8 py-3 rounded-lg text-lg font-medium shadow-lg hover:shadow-xl transition border border-gray-300"
              >
                View on GitHub
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Zap className="h-8 w-8 text-primary-600" />}
              title="Instant Deploys"
              description="Upload your dist folder and get a live URL in seconds"
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8 text-primary-600" />}
              title="Self-Hosted"
              description="Bring your own AWS keys. You control the infrastructure."
            />
            <FeatureCard
              icon={<Code className="h-8 w-8 text-primary-600" />}
              title="Open Source"
              description="Fully open-source. Modify and customize as you need."
            />
            <FeatureCard
              icon={<Rocket className="h-8 w-8 text-primary-600" />}
              title="CDN Powered"
              description="CloudFront CDN ensures fast delivery worldwide"
            />
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <StepCard
                number="1"
                title="Create Project"
                description="Create a new project and get a unique subdomain"
              />
              <StepCard
                number="2"
                title="Upload Files"
                description="Upload your dist folder via CLI or web interface"
              />
              <StepCard
                number="3"
                title="Go Live"
                description="Your site is live at yourproject.23blocks.net"
              />
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-primary-600 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Deploy?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Join developers who trust 23Blocks Deploy for their hosting needs
            </p>
            <Link
              href="/register"
              className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 rounded-lg text-lg font-medium shadow-lg hover:shadow-xl transition inline-block"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </main>

      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2024 23Blocks Deploy. Open-source and self-hostable.
          </p>
          <div className="mt-4 space-x-6">
            <Link href="/docs" className="text-gray-400 hover:text-white">
              Documentation
            </Link>
            <Link href="https://github.com/23blocks-OS/TheLandingPage-SaaS" className="text-gray-400 hover:text-white">
              GitHub
            </Link>
            <Link href="/support" className="text-gray-400 hover:text-white">
              Support
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-600 text-white rounded-full text-xl font-bold mb-4">
        {number}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}
