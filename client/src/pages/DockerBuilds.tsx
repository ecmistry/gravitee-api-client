import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Container, Download, Terminal, Package, CheckCircle2, AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function DockerBuilds() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#8B7FD8] to-[#00D4D4] flex items-center justify-center text-white font-bold text-xl">
                G
              </div>
              <div>
                <div className="font-bold text-xl text-slate-900">Newton</div>
                <div className="text-xs text-slate-600">API Client for Newton</div>
              </div>
            </div>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/getting-started">
              <span className="text-slate-700 hover:text-[#8B7FD8] cursor-pointer transition-colors">Get Started</span>
            </Link>
            <Link href="/comparison">
              <span className="text-slate-700 hover:text-[#8B7FD8] cursor-pointer transition-colors">Why Newton?</span>
            </Link>
            <Link href="/troubleshooting">
              <span className="text-slate-700 hover:text-[#8B7FD8] cursor-pointer transition-colors">Troubleshooting</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-[#8B7FD8] to-[#00D4D4]">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center text-white">
            <Container className="w-16 h-16 mx-auto mb-6" />
            <h1 className="text-5xl font-bold mb-6">
              Docker Build Environment
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Build Newton binaries consistently across all platforms using Docker. No more Node.js version issues or missing dependencies.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">
            Why Use Docker for Building?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card>
              <CardHeader>
                <CheckCircle2 className="w-12 h-12 text-green-600 mb-4" />
                <CardTitle>Consistent Environment</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Docker ensures everyone uses the exact same Node.js version, system libraries, and build tools. No more "works on my machine" issues.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CheckCircle2 className="w-12 h-12 text-green-600 mb-4" />
                <CardTitle>Zero Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  No need to install Node.js, Python, or build tools manually. Docker handles all dependencies automatically.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CheckCircle2 className="w-12 h-12 text-green-600 mb-4" />
                <CardTitle>Cross-Platform Builds</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Build Linux and Windows binaries from any platform. macOS builds require actual Mac hardware.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Separator className="my-8" />

      {/* Quick Start Section */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">
              Quick Start Guide
            </h2>

            <div className="space-y-8">
              {/* Step 1 */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#8B7FD8] to-[#00D4D4] flex items-center justify-center text-white font-bold text-xl">
                      1
                    </div>
                    <div>
                      <CardTitle>Install Docker</CardTitle>
                      <CardDescription>Download and install Docker Desktop for your platform</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm">
                    <p className="text-slate-400"># macOS/Windows: Download Docker Desktop</p>
                    <p className="text-blue-400">https://www.docker.com/products/docker-desktop/</p>
                    <br />
                    <p className="text-slate-400"># Linux: Install via package manager</p>
                    <p>sudo apt-get install docker.io docker-compose</p>
                  </div>
                </CardContent>
              </Card>

              {/* Step 2 */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#8B7FD8] to-[#00D4D4] flex items-center justify-center text-white font-bold text-xl">
                      2
                    </div>
                    <div>
                      <CardTitle>Download Newton Source</CardTitle>
                      <CardDescription>Get the latest source code with Docker configuration</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm mb-4">
                    <p className="text-slate-400"># Download and extract</p>
                    <p>wget https://files.manuscdn.com/.../newton-api-client-v1.0.0-source.tar.gz</p>
                    <p>tar -xzf newton-api-client-v1.0.0-source.tar.gz</p>
                    <p>cd newton-api-client</p>
                  </div>
                  <a href="https://files.manuscdn.com/user_upload_by_module/session_file/310419663030907721/IidujXYNLsSttVvL.gz" download="newton-api-client-v1.0.0-source.tar.gz">
                    <Button className="bg-gradient-to-r from-[#8B7FD8] to-[#00D4D4] text-white hover:opacity-90">
                      <Download className="w-4 h-4 mr-2" />
                      Download Source (7.3 MB)
                    </Button>
                  </a>
                </CardContent>
              </Card>

              {/* Step 3 */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#8B7FD8] to-[#00D4D4] flex items-center justify-center text-white font-bold text-xl">
                      3
                    </div>
                    <div>
                      <CardTitle>Build with Docker</CardTitle>
                      <CardDescription>Run the build script for your target platform</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm">
                    <p className="text-slate-400"># Build for Linux (recommended - works everywhere)</p>
                    <p>bash build-scripts/build-linux.sh</p>
                    <br />
                    <p className="text-slate-400"># Build for Windows</p>
                    <p>bash build-scripts/build-windows.sh</p>
                    <br />
                    <p className="text-slate-400"># Build for macOS (requires macOS hardware)</p>
                    <p>bash build-scripts/build-macos.sh</p>
                    <br />
                    <p className="text-slate-400"># Build all platforms</p>
                    <p>bash build-scripts/build-all.sh</p>
                  </div>
                </CardContent>
              </Card>

              {/* Step 4 */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#8B7FD8] to-[#00D4D4] flex items-center justify-center text-white font-bold text-xl">
                      4
                    </div>
                    <div>
                      <CardTitle>Get Your Binaries</CardTitle>
                      <CardDescription>Find built applications in the dist/ directory</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm">
                    <p className="text-slate-400"># Check built binaries</p>
                    <p>ls -lh dist/</p>
                    <br />
                    <p className="text-green-400"># Linux</p>
                    <p>Newton-1.0.0.AppImage</p>
                    <p>gravitas_1.0.0_amd64.deb</p>
                    <p>gravitas-1.0.0.x86_64.rpm</p>
                    <br />
                    <p className="text-blue-400"># Windows</p>
                    <p>Newton-Setup-1.0.0.exe</p>
                    <p>Newton-1.0.0-win.zip</p>
                    <br />
                    <p className="text-purple-400"># macOS</p>
                    <p>Newton-1.0.0-arm64.dmg</p>
                    <p>Newton-1.0.0-x64.dmg</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Separator className="my-8" />

      {/* Docker Compose Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">
              Using Docker Compose
            </h2>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Build with Docker Compose</CardTitle>
                <CardDescription>Alternative method using docker-compose.yml</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm">
                  <p className="text-slate-400"># Build the Docker image</p>
                  <p>docker-compose build</p>
                  <br />
                  <p className="text-slate-400"># Package the application</p>
                  <p>docker-compose run --rm build</p>
                  <br />
                  <p className="text-slate-400"># Run in development mode</p>
                  <p>docker-compose run --rm dev</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Troubleshooting Section */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">
              Common Issues
            </h2>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-6 h-6 text-amber-600" />
                    <CardTitle>Docker not found</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 mb-4">
                    Make sure Docker Desktop is installed and running.
                  </p>
                  <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm">
                    <p className="text-slate-400"># Check Docker status</p>
                    <p>docker --version</p>
                    <p>docker ps</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-6 h-6 text-amber-600" />
                    <CardTitle>Permission denied (Linux)</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 mb-4">
                    Add your user to the docker group.
                  </p>
                  <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm">
                    <p>sudo usermod -aG docker $USER</p>
                    <p className="text-slate-400"># Log out and back in</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-6 h-6 text-amber-600" />
                    <CardTitle>Build fails</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 mb-4">
                    Clean Docker cache and rebuild.
                  </p>
                  <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm">
                    <p>docker system prune -a</p>
                    <p>docker-compose build --no-cache</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-12 text-center">
              <p className="text-slate-600 mb-4">
                For more detailed troubleshooting, check the full documentation:
              </p>
              <Link href="/troubleshooting">
                <Button variant="outline" className="border-[#8B7FD8] text-[#8B7FD8] hover:bg-[#8B7FD8] hover:text-white">
                  View Troubleshooting Guide
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#8B7FD8] to-[#00D4D4]">
        <div className="container mx-auto px-6 text-center">
          <h3 className="text-4xl font-bold text-white mb-6">
            Ready to Build Newton?
          </h3>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Download the source code and start building with Docker in minutes
          </p>
          <div className="flex items-center justify-center gap-4">
            <a href="https://files.manuscdn.com/user_upload_by_module/session_file/310419663030907721/IidujXYNLsSttVvL.gz" download="newton-api-client-v1.0.0-source.tar.gz">
              <Button size="lg" variant="secondary" className="bg-white text-[#8B7FD8] hover:bg-slate-100">
                <Download className="w-5 h-5 mr-2" />
                Download Source
              </Button>
            </a>
            <Link href="/getting-started">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Getting Started
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded bg-gradient-to-br from-[#8B7FD8] to-[#00D4D4] flex items-center justify-center font-bold">
                  G
                </div>
                <span className="font-bold text-lg">Newton</span>
              </div>
              <p className="text-slate-400 text-sm">
                The Newton-native API client
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link href="/"><span className="hover:text-white cursor-pointer">Features</span></Link></li>
                <li><Link href="/comparison"><span className="hover:text-white cursor-pointer">Comparison</span></Link></li>
                <li><Link href="/docker-builds"><span className="hover:text-white cursor-pointer">Docker Builds</span></Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link href="/getting-started"><span className="hover:text-white cursor-pointer">Getting Started</span></Link></li>
                <li><Link href="/troubleshooting"><span className="hover:text-white cursor-pointer">Troubleshooting</span></Link></li>
                <li><a href="https://github.com/gravitee-io/gravitas" className="hover:text-white">GitHub</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="https://gravitee.io" className="hover:text-white">Newton.io</a></li>
                <li><a href="https://github.com/gravitee-io/gravitas/discussions" className="hover:text-white">Discussions</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400 text-sm">
            <p>Built with ❤️ for the Newton community</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
