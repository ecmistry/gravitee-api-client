import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Download, 
  ArrowLeft,
  CheckCircle2,
  Terminal,
  Rocket,
  FileJson,
  Play,
  Settings,
  Zap,
  Apple,
  Monitor
} from "lucide-react";
import { Link } from "wouter";

export default function GettingStarted() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#8B7FD8] to-[#00D4D4] flex items-center justify-center">
                <span className="text-white font-bold text-xl">G</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-[#8B7FD8] to-[#00D4D4] bg-clip-text text-transparent">
                  Newton
                </h1>
                <p className="text-xs text-slate-600">API Client for Newton</p>
              </div>
            </div>
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge className="mb-6 bg-gradient-to-r from-[#8B7FD8] to-[#00D4D4] text-white border-none">
            Getting Started
          </Badge>
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-[#EA3527] to-[#F09135] bg-clip-text text-transparent">
            Get Up and Running in Minutes
          </h2>
          <p className="text-xl text-slate-600 leading-relaxed">
            Follow this guide to install Newton, create your first API request, 
            and start testing your Newton APIs.
          </p>
        </div>
      </section>

      {/* Installation Section */}
      <section className="py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Step 1: Download & Install</h3>
            <p className="text-slate-600">Choose your platform and download Newton</p>
          </div>

          <Tabs defaultValue="macos" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
              <TabsTrigger value="macos">
                <Apple className="w-4 h-4 mr-2" />
                macOS
              </TabsTrigger>
              <TabsTrigger value="windows">
                <Monitor className="w-4 h-4 mr-2" />
                Windows
              </TabsTrigger>
              <TabsTrigger value="linux">
                <Terminal className="w-4 h-4 mr-2" />
                Linux
              </TabsTrigger>
            </TabsList>

            <TabsContent value="macos" className="mt-6">
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Apple className="w-5 h-5 text-[#8B7FD8]" />
                    macOS Installation
                  </CardTitle>
                  <CardDescription>For macOS 10.15 (Catalina) or later</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <a href="https://files.manuscdn.com/user_upload_by_module/session_file/310419663030907721/IidujXYNLsSttVvL.gz" download="newton-api-client-v1.0.0-source.tar.gz">
                      <Button className="bg-gradient-to-r from-[#8B7FD8] to-[#00D4D4] text-white hover:opacity-90 w-full">
                        <Download className="w-4 h-4 mr-2" />
                        Download Source Code (Build from Source)
                      </Button>
                    </a>
                    <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
                      <p className="text-sm text-amber-900">
                        <strong>Pre-built binaries coming soon!</strong> For now, download the source code and build locally. <strong>Requires Node.js v22.x</strong> (not v24+).
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">1. Extract the source code</p>
                        <p className="text-sm text-slate-600">tar -xzf newton-api-client-v1.0.0-source.tar.gz && cd newton-api-client</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">2. Install dependencies</p>
                        <p className="text-sm text-slate-600">npm install --legacy-peer-deps (requires Node.js v22.x)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">3. Build and package</p>
                        <p className="text-sm text-slate-600">npm run app-build && npm run app-package</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">4. Install the .dmg</p>
                        <p className="text-sm text-slate-600">Find the built .dmg in packages/newton/dist/</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg space-y-2">
                    <p className="text-sm text-blue-900">
                      <strong>Quick Start:</strong> Run <code className="bg-blue-100 px-1 rounded">npm run dev</code> to launch in development mode without building.
                    </p>
                    <p className="text-sm text-blue-900">
                      <strong>Node.js Version:</strong> Use Node v22.x. If you have v24+, install v22 via <code className="bg-blue-100 px-1 rounded">nvm install 22</code> or <code className="bg-blue-100 px-1 rounded">brew install node@22</code>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="windows" className="mt-6">
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="w-5 h-5 text-[#8B7FD8]" />
                    Windows Installation
                  </CardTitle>
                  <CardDescription>For Windows 10 or later</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <a href="https://files.manuscdn.com/user_upload_by_module/session_file/310419663030907721/IidujXYNLsSttVvL.gz" download="newton-api-client-v1.0.0-source.tar.gz">
                      <Button className="bg-gradient-to-r from-[#8B7FD8] to-[#00D4D4] text-white hover:opacity-90 w-full">
                        <Download className="w-4 h-4 mr-2" />
                        Download Source Code (Build from Source)
                      </Button>
                    </a>
                    <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
                      <p className="text-sm text-amber-900">
                        <strong>Pre-built binaries coming soon!</strong> For now, download the source code and build locally. <strong>Requires Node.js v22.x</strong> (not v24+).
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">1. Run the installer</p>
                        <p className="text-sm text-slate-600">Double-click Newton-Setup-1.0.0.exe</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">2. Follow installation wizard</p>
                        <p className="text-sm text-slate-600">Accept the license and choose installation location</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">3. Launch Newton</p>
                        <p className="text-sm text-slate-600">Use the desktop shortcut or Start menu</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <p className="text-sm text-blue-900">
                      <strong>Portable Version:</strong> Extract the .zip file and run Newton.exe directly 
                      without installation. Perfect for USB drives.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="linux" className="mt-6">
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-[#8B7FD8]" />
                    Linux Installation
                  </CardTitle>
                  <CardDescription>Multiple formats available</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <a href="https://files.manuscdn.com/user_upload_by_module/session_file/310419663030907721/IidujXYNLsSttVvL.gz" download="newton-api-client-v1.0.0-source.tar.gz">
                      <Button className="bg-gradient-to-r from-[#8B7FD8] to-[#00D4D4] text-white hover:opacity-90 w-full">
                        <Download className="w-4 h-4 mr-2" />
                        Download Source Code (Build from Source)
                      </Button>
                    </a>
                    <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
                      <p className="text-sm text-amber-900">
                        <strong>Pre-built binaries coming soon!</strong> For now, download the source code and build locally. <strong>Requires Node.js v22.x</strong> (not v24+).
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-lg space-y-4">
                    <div>
                      <p className="font-medium mb-2">AppImage (Recommended)</p>
                      <div className="bg-slate-900 p-3 rounded font-mono text-sm text-green-400">
                        chmod +x Newton-1.0.0.AppImage<br/>
                        ./Newton-1.0.0.AppImage
                      </div>
                    </div>
                    
                    <div>
                      <p className="font-medium mb-2">Debian/Ubuntu (.deb)</p>
                      <div className="bg-slate-900 p-3 rounded font-mono text-sm text-green-400">
                        sudo dpkg -i newton_1.0.0_amd64.deb
                      </div>
                    </div>

                    <div>
                      <p className="font-medium mb-2">Fedora/RHEL (.rpm)</p>
                      <div className="bg-slate-900 p-3 rounded font-mono text-sm text-green-400">
                        sudo rpm -i newton-1.0.0.x86_64.rpm
                      </div>
                    </div>

                    <div>
                      <p className="font-medium mb-2">Snap</p>
                      <div className="bg-slate-900 p-3 rounded font-mono text-sm text-green-400">
                        sudo snap install newton
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* First Request Section */}
      <section className="py-12 px-6 bg-white/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Step 2: Create Your First Request</h3>
            <p className="text-slate-600">Test your first API in under a minute</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-slate-200">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#8B7FD8] to-[#00D4D4] flex items-center justify-center mb-4">
                  <Play className="w-6 h-6 text-white" />
                </div>
                <CardTitle>1. Create a New Request</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#8B7FD8] mt-0.5 flex-shrink-0" />
                  <p className="text-slate-700">Click the <strong>"+"</strong> button or press <kbd className="px-2 py-1 bg-slate-100 rounded text-sm">Cmd+N</kbd></p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#8B7FD8] mt-0.5 flex-shrink-0" />
                  <p className="text-slate-700">Select <strong>"HTTP Request"</strong> from the menu</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#8B7FD8] mt-0.5 flex-shrink-0" />
                  <p className="text-slate-700">Give your request a name (e.g., "Get API List")</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#8B7FD8] to-[#00D4D4] flex items-center justify-center mb-4">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <CardTitle>2. Configure the Request</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#8B7FD8] mt-0.5 flex-shrink-0" />
                  <p className="text-slate-700">Choose the HTTP method (GET, POST, etc.)</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#8B7FD8] mt-0.5 flex-shrink-0" />
                  <p className="text-slate-700">Enter your Newton API URL</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#8B7FD8] mt-0.5 flex-shrink-0" />
                  <p className="text-slate-700">Add headers, auth, or body as needed</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#8B7FD8] to-[#00D4D4] flex items-center justify-center mb-4">
                  <Rocket className="w-6 h-6 text-white" />
                </div>
                <CardTitle>3. Send the Request</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#8B7FD8] mt-0.5 flex-shrink-0" />
                  <p className="text-slate-700">Click <strong>"Send"</strong> or press <kbd className="px-2 py-1 bg-slate-100 rounded text-sm">Cmd+Enter</kbd></p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#8B7FD8] mt-0.5 flex-shrink-0" />
                  <p className="text-slate-700">View the response in the right panel</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#8B7FD8] mt-0.5 flex-shrink-0" />
                  <p className="text-slate-700">Inspect status, headers, and response body</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#8B7FD8] to-[#00D4D4] flex items-center justify-center mb-4">
                  <FileJson className="w-6 h-6 text-white" />
                </div>
                <CardTitle>4. Save & Organize</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#8B7FD8] mt-0.5 flex-shrink-0" />
                  <p className="text-slate-700">Create collections to organize requests</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#8B7FD8] mt-0.5 flex-shrink-0" />
                  <p className="text-slate-700">Use environments for different configurations</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#8B7FD8] mt-0.5 flex-shrink-0" />
                  <p className="text-slate-700">Sync with Git or store locally</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Newton Integration */}
      <section className="py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Step 3: Connect to Newton</h3>
            <p className="text-slate-600">Import APIs directly from your Newton platform</p>
          </div>

          <Card className="border-[#8B7FD8] border-2">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
              <CardTitle className="text-2xl">Newton Integration</CardTitle>
              <CardDescription>Seamlessly work with your Newton APIs</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Import Newton APIs</h4>
                  <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#8B7FD8] text-white text-sm font-bold flex-shrink-0">1</span>
                      <p className="text-sm">Go to <strong>File → Import → Newton API</strong></p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#8B7FD8] text-white text-sm font-bold flex-shrink-0">2</span>
                      <p className="text-sm">Enter your Newton API Management URL</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#8B7FD8] text-white text-sm font-bold flex-shrink-0">3</span>
                      <p className="text-sm">Authenticate with your Newton credentials</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#8B7FD8] text-white text-sm font-bold flex-shrink-0">4</span>
                      <p className="text-sm">Select APIs to import into Newton</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Test with Policies</h4>
                  <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                    <div className="flex items-start gap-3">
                      <Zap className="w-5 h-5 text-[#8B7FD8] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">Enable Policy Testing</p>
                        <p className="text-xs text-slate-600">Test APIs with Newton policies applied</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Zap className="w-5 h-5 text-[#8B7FD8] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">View Gateway Metrics</p>
                        <p className="text-xs text-slate-600">Monitor real-time API analytics</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Zap className="w-5 h-5 text-[#8B7FD8] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">Sync with Portal</p>
                        <p className="text-xs text-slate-600">Publish to Newton Developer Portal</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Quick Tips */}
      <section className="py-12 px-6 bg-white/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Quick Tips</h3>
            <p className="text-slate-600">Pro tips to get the most out of Newton</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg">Keyboard Shortcuts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>New Request</span>
                  <kbd className="px-2 py-1 bg-slate-100 rounded">⌘N</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Send Request</span>
                  <kbd className="px-2 py-1 bg-slate-100 rounded">⌘↵</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Toggle Sidebar</span>
                  <kbd className="px-2 py-1 bg-slate-100 rounded">⌘\</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Search</span>
                  <kbd className="px-2 py-1 bg-slate-100 rounded">⌘P</kbd>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg">Environment Variables</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-slate-700">Use variables to manage different environments:</p>
                <div className="bg-slate-50 p-3 rounded font-mono text-xs">
                  {'{{ base_url }}/api/v1/users'}
                </div>
                <p className="text-slate-600">Switch between dev, staging, and production easily.</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg">Collections</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-slate-700">Organize requests into collections:</p>
                <ul className="space-y-1 text-slate-600">
                  <li>• Group related APIs together</li>
                  <li>• Share with team via Git</li>
                  <li>• Run entire collections as tests</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-br from-[#8B7FD8] to-[#00D4D4]">
        <div className="container mx-auto text-center max-w-3xl">
          <h3 className="text-4xl font-bold text-white mb-6">
            Ready to Start Testing?
          </h3>
          <p className="text-xl text-white/90 mb-8">
            Download Newton now and experience the power of Newton-native API testing
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/">
              <Button size="lg" variant="secondary" className="bg-white text-[#8B7FD8] hover:bg-slate-100">
                <Download className="w-5 h-5 mr-2" />
                Download Now
              </Button>
            </Link>
            <Link href="/troubleshooting">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Troubleshooting
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-slate-900 text-white">
        <div className="container mx-auto text-center">
          <p className="text-slate-400">Built with ❤️ for the Newton community</p>
          <p className="mt-2 text-slate-500">© 2026 Newton • Apache License 2.0</p>
        </div>
      </footer>
    </div>
  );
}
