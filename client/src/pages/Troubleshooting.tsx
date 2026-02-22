import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Terminal,
  Download,
  Wrench,
  Bug
} from "lucide-react";
import { Link } from "wouter";

export default function Troubleshooting() {
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
          <Badge className="mb-6 bg-amber-500 text-white border-none">
            <Bug className="w-3 h-3 mr-1" />
            Troubleshooting
          </Badge>
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-[#EA3527] to-[#F09135] bg-clip-text text-transparent">
            Common Issues & Solutions
          </h2>
          <p className="text-xl text-slate-600 leading-relaxed">
            Having trouble building or running Newton? Find solutions to common problems below.
          </p>
        </div>
      </section>

      {/* Quick Fix Alert */}
      <section className="py-8 px-6">
        <div className="container mx-auto max-w-4xl">
          <Card className="border-amber-300 bg-amber-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
                <CardTitle className="text-amber-900">Most Common Issue: Node.js Version</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-amber-900">
                <strong>90% of build failures</strong> are caused by using Node.js v23+ or v24+. 
                Newton requires <strong>Node.js 18.7.0 to 22.x</strong>.
              </p>
              <div className="bg-white p-4 rounded-lg border border-amber-200">
                <p className="font-mono text-sm mb-2">Check your version:</p>
                <code className="bg-slate-900 text-green-400 px-3 py-2 rounded block">
                  node --version
                </code>
              </div>
              <div className="bg-white p-4 rounded-lg border border-amber-200">
                <p className="font-mono text-sm mb-2">Install Node.js 22 with nvm:</p>
                <code className="bg-slate-900 text-green-400 px-3 py-2 rounded block">
                  nvm install 22 && nvm use 22
                </code>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Troubleshooting Accordion */}
      <section className="py-12 px-6">
        <div className="container mx-auto max-w-4xl">
          <h3 className="text-3xl font-bold mb-8 text-center">Installation Issues</h3>
          
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="node-version" className="bg-white border border-slate-200 rounded-lg px-6">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Terminal className="w-5 h-5 text-[#8B7FD8]" />
                  <span className="font-semibold">Node.js Version Mismatch</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 space-y-4">
                <div className="bg-red-50 p-3 rounded border border-red-200">
                  <p className="text-sm font-mono text-red-900">
                    npm warn EBADENGINE Unsupported engine
                  </p>
                </div>
                <p className="text-slate-700">
                  <strong>Solution:</strong> Install Node.js 22.x using nvm:
                </p>
                <div className="bg-slate-900 p-4 rounded">
                  <code className="text-green-400 text-sm">
                    # Install nvm<br/>
                    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash<br/>
                    <br/>
                    # Install Node.js 22<br/>
                    nvm install 22<br/>
                    nvm use 22<br/>
                    <br/>
                    # Verify<br/>
                    node --version
                  </code>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="native-modules" className="bg-white border border-slate-200 rounded-lg px-6">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Wrench className="w-5 h-5 text-[#8B7FD8]" />
                  <span className="font-semibold">Native Module Build Failures</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 space-y-4">
                <div className="bg-red-50 p-3 rounded border border-red-200">
                  <p className="text-sm font-mono text-red-900">
                    npm error command sh -c node-pre-gyp install --fallback-to-build
                  </p>
                </div>
                <p className="text-slate-700">
                  <strong>Cause:</strong> Missing system build tools.
                </p>
                
                <div className="space-y-3">
                  <p className="font-semibold">macOS:</p>
                  <div className="bg-slate-900 p-4 rounded">
                    <code className="text-green-400 text-sm">
                      # Install Xcode Command Line Tools<br/>
                      xcode-select --install<br/>
                      <br/>
                      # Accept license<br/>
                      sudo xcodebuild -license accept<br/>
                      <br/>
                      # Install libcurl<br/>
                      brew install curl
                    </code>
                  </div>

                  <p className="font-semibold">Linux (Ubuntu/Debian):</p>
                  <div className="bg-slate-900 p-4 rounded">
                    <code className="text-green-400 text-sm">
                      sudo apt-get update<br/>
                      sudo apt-get install -y build-essential python3 libcurl4-openssl-dev
                    </code>
                  </div>

                  <p className="font-semibold">Windows:</p>
                  <div className="bg-slate-900 p-4 rounded">
                    <code className="text-green-400 text-sm">
                      # Run PowerShell as Administrator<br/>
                      npm install --global windows-build-tools
                    </code>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="cross-env" className="bg-white border border-slate-200 rounded-lg px-6">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Bug className="w-5 h-5 text-[#8B7FD8]" />
                  <span className="font-semibold">Missing cross-env Command</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 space-y-4">
                <div className="bg-red-50 p-3 rounded border border-red-200">
                  <p className="text-sm font-mono text-red-900">
                    sh: cross-env: command not found
                  </p>
                </div>
                <p className="text-slate-700">
                  <strong>Solution:</strong> Reinstall dependencies:
                </p>
                <div className="bg-slate-900 p-4 rounded">
                  <code className="text-green-400 text-sm">
                    npm install
                  </code>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="prebuilt-binary" className="bg-white border border-slate-200 rounded-lg px-6">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-[#8B7FD8]" />
                  <span className="font-semibold">Pre-built Binary Not Found (404)</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 space-y-4">
                <div className="bg-red-50 p-3 rounded border border-red-200">
                  <p className="text-sm font-mono text-red-900">
                    [error] install response status 404 Not Found
                  </p>
                </div>
                <p className="text-slate-700">
                  <strong>Cause:</strong> No pre-built binary for your Node.js version.
                </p>
                <p className="text-slate-700">
                  <strong>Solution:</strong> Use Node.js 18-22 and clear cache:
                </p>
                <div className="bg-slate-900 p-4 rounded">
                  <code className="text-green-400 text-sm">
                    npm cache clean --force<br/>
                    rm -rf node_modules package-lock.json<br/>
                    npm install
                  </code>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Runtime Issues */}
      <section className="py-12 px-6 bg-white/50">
        <div className="container mx-auto max-w-4xl">
          <h3 className="text-3xl font-bold mb-8 text-center">Runtime Issues</h3>
          
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="macos-cant-open" className="bg-white border border-slate-200 rounded-lg px-6">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-[#8B7FD8]" />
                  <span className="font-semibold">macOS: "Newton can't be opened"</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 space-y-4">
                <p className="text-slate-700">
                  <strong>Solution:</strong> Bypass Gatekeeper security:
                </p>
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold mb-2">Option 1: Right-click method</p>
                    <ol className="list-decimal list-inside space-y-1 text-slate-700">
                      <li>Right-click Newton.app</li>
                      <li>Select "Open"</li>
                      <li>Click "Open" in the dialog</li>
                    </ol>
                  </div>
                  <div>
                    <p className="font-semibold mb-2">Option 2: Terminal command</p>
                    <div className="bg-slate-900 p-4 rounded">
                      <code className="text-green-400 text-sm">
                        xattr -cr /Applications/Newton.app
                      </code>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="linux-permission" className="bg-white border border-slate-200 rounded-lg px-6">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-[#8B7FD8]" />
                  <span className="font-semibold">Linux: Permission Denied</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 space-y-4">
                <p className="text-slate-700">
                  <strong>Solution:</strong> Make the AppImage executable:
                </p>
                <div className="bg-slate-900 p-4 rounded">
                  <code className="text-green-400 text-sm">
                    chmod +x Newton-1.0.0.AppImage<br/>
                    ./Newton-1.0.0.AppImage
                  </code>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Quick Fix Checklist */}
      <section className="py-12 px-6">
        <div className="container mx-auto max-w-4xl">
          <Card className="border-green-300 bg-green-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <CardTitle className="text-green-900">Quick Fix Checklist</CardTitle>
              </div>
              <CardDescription className="text-green-800">
                Try these steps before reporting an issue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-green-900">Use Node.js 18.7.0 - 22.x (check with <code className="bg-green-100 px-1 rounded">node --version</code>)</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-green-900">Install system build tools (Xcode CLI Tools, build-essential, etc.)</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-green-900">Clear npm cache: <code className="bg-green-100 px-1 rounded">npm cache clean --force</code></p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-green-900">Remove node_modules: <code className="bg-green-100 px-1 rounded">rm -rf node_modules package-lock.json</code></p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-green-900">Reinstall: <code className="bg-green-100 px-1 rounded">npm install</code></p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-br from-[#8B7FD8] to-[#00D4D4]">
        <div className="container mx-auto text-center max-w-3xl">
          <h3 className="text-4xl font-bold text-white mb-6">
            Still Need Help?
          </h3>
          <p className="text-xl text-white/90 mb-8">
            Check our GitHub issues or join the community for support
          </p>
          <div className="flex items-center justify-center gap-4">
            <a href="https://github.com/newton-api/newton-api-client/issues" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="secondary" className="bg-white text-[#8B7FD8] hover:bg-slate-100">
                <Bug className="w-5 h-5 mr-2" />
                Report an Issue
              </Button>
            </a>
            <Link href="/getting-started">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Back to Getting Started
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
