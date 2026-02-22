import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  Code2, 
  Zap, 
  Shield, 
  GitBranch, 
  Database, 
  Play,
  FileJson,
  Network,
  Terminal,
  Rocket
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#8B7FD8] to-[#00D4D4] flex items-center justify-center">
                <span className="text-white font-bold text-xl">N</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-[#8B7FD8] to-[#00D4D4] bg-clip-text text-transparent">
                  Newton
                </h1>
                <p className="text-xs text-slate-600">API Client</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="border-[#8B7FD8] text-[#8B7FD8]">
                v1.0.0
              </Badge>
              <Button variant="outline" size="sm">
                <GitBranch className="w-4 h-4 mr-2" />
                GitHub
              </Button>
              <Button className="bg-gradient-to-r from-[#8B7FD8] to-[#00D4D4] text-white hover:opacity-90">
                <Rocket className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <div className="text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-[#8B7FD8] text-sm font-medium mb-6">
                <Zap className="w-4 h-4" />
                Open Source • Cross-Platform • Newton Native
              </div>
              <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-[#8B7FD8] via-[#00D4D4] to-[#B8AFED] bg-clip-text text-transparent leading-tight">
                The Newton API Client
              </h2>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Newton is a powerful, open-source API client for modern API development. 
                Test, debug, and manage your APIs with Newton's friendly interface.
              </p>
              <div className="flex items-center gap-4">
                <Link href="/demo">
                  <Button size="lg" className="bg-gradient-to-r from-[#8B7FD8] to-[#00D4D4] text-white hover:opacity-90 px-8 shadow-lg shadow-cyan-300/50">
                    <Play className="w-5 h-5 mr-2" />
                    Try Demo
                  </Button>
                </Link>
                <Link href="/getting-started">
                  <Button size="lg" variant="outline" className="border-[#8B7FD8] text-[#8B7FD8] hover:bg-purple-50 px-8">
                    Get Started
                  </Button>
                </Link>
                <Link href="/comparison">
                  <Button size="lg" variant="outline" className="border-[#8B7FD8] text-[#8B7FD8] hover:bg-purple-50">
                    Why Newton?
                  </Button>
                </Link>
                <Link href="/docker-builds">
                  <Button size="lg" variant="outline" className="border-[#00D4D4] text-[#00D4D4] hover:bg-cyan-50">
                    Docker Builds
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Right: Newton Mascot */}
            <div className="relative">
              <div className="relative z-10 animate-float">
                <img 
                  src="https://private-us-east-1.manuscdn.com/sessionFile/sOUNyv3Qn48GGEAIZlkYdf/sandbox/rQgHE3WheT8JsWI3d58yl7-img-1_1771714494000_na1fn_bmV3dG9uLWljb24tNTEy.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvc09VTnl2M1FuNDhHR0VBSVpsa1lkZi9zYW5kYm94L3JRZ0hFM1doZVQ4SnNXSTNkNTh5bDctaW1nLTFfMTc3MTcxNDQ5NDAwMF9uYTFmbl9ibVYzZEc5dUxXbGpiMjR0TlRFeS5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=vS~PyA8rDs8-Az9sUwyefZKHEW8rNG6CQHf4zU5hBLWsolDmhSwSJtYbio2PShtNSuRPg9c7tHbxEtO~j8W4EVIhNSWhstqEdgbIF04Gt6r~oNavULT0AgM39l0knNyVS7vegfJbTHm7g3fhBGQZVD6F0lsKN-pG38FwGhTsUH8dqFgO6W-NWT8hztXipSEihUsehY8KTTDHxUDnLaRh93c1S6SCMkjWI2ufv68HUAL2DQNxblVwtygNgBS9ijx-7cmamADHjEIf6cwBsa5O0p8vyprxg1CkcgN2fm4IDjGSZxNSF3qyjQKmtjQ2KCuZG8l-~HEzpz5~hQjTCTv5Bw__"
                  alt="Newton - Your friendly API companion"
                  className="w-full max-w-md mx-auto drop-shadow-2xl"
                />
              </div>
              {/* Floating bubbles */}
              <div className="absolute top-20 right-10 w-8 h-8 rounded-full bg-[#00D4D4] opacity-60 animate-bubble-1"></div>
              <div className="absolute top-40 right-32 w-6 h-6 rounded-full bg-[#8B7FD8] opacity-40 animate-bubble-2"></div>
              <div className="absolute bottom-32 right-20 w-10 h-10 rounded-full bg-[#B8AFED] opacity-50 animate-bubble-3"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-6 bg-white/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Powerful Features</h3>
            <p className="text-slate-600">Everything you need to work with Newton APIs</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-slate-200 hover:border-[#8B7FD8] transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#8B7FD8] to-[#00D4D4] flex items-center justify-center mb-4">
                  <Code2 className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Multi-Protocol Support</CardTitle>
                <CardDescription>
                  REST, GraphQL, WebSocket, gRPC, and more
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-slate-200 hover:border-[#00D4D4] transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#00D4D4] to-[#1A8B8B] flex items-center justify-center mb-4">
                  <Network className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Newton Integration</CardTitle>
                <CardDescription>
                  Native support for Newton API Management Platform
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-slate-200 hover:border-[#B8AFED] transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#B8AFED] to-[#8B7FD8] flex items-center justify-center mb-4">
                  <GitBranch className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Git Sync</CardTitle>
                <CardDescription>
                  Version control for your API collections
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-slate-200 hover:border-[#8B7FD8] transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#8B7FD8] to-[#3D2F6B] flex items-center justify-center mb-4">
                  <Database className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Environment Variables</CardTitle>
                <CardDescription>
                  Manage multiple environments effortlessly
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-slate-200 hover:border-[#00D4D4] transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#00D4D4] to-[#8B7FD8] flex items-center justify-center mb-4">
                  <Terminal className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Code Generation</CardTitle>
                <CardDescription>
                  Generate client code in multiple languages
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-slate-200 hover:border-[#B8AFED] transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#B8AFED] to-[#00D4D4] flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Security Testing</CardTitle>
                <CardDescription>
                  Built-in security and authentication testing
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Interactive Demo */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">See Newton in Action</h3>
            <p className="text-slate-600">Experience the intuitive interface</p>
          </div>

          <Card className="border-[#8B7FD8]">
            <CardContent className="p-6">
              <Tabs defaultValue="request" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="request">Request</TabsTrigger>
                  <TabsTrigger value="response">Response</TabsTrigger>
                  <TabsTrigger value="tests">Tests</TabsTrigger>
                </TabsList>
                <TabsContent value="request" className="space-y-4">
                  <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm text-green-400">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-[#00D4D4] text-white">GET</Badge>
                      <span className="text-slate-300">https://api.newton.io/v1/users</span>
                    </div>
                    <div className="text-slate-500">
                      Headers: Authorization: Bearer xxx...
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="response" className="space-y-4">
                  <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-[#00D4D4] text-white">200 OK</Badge>
                      <span className="text-slate-500">142ms</span>
                    </div>
                    <pre className="text-green-400">
{`{
  "users": [
    { "id": 1, "name": "Newton" },
    { "id": 2, "name": "API Explorer" }
  ]
}`}
                    </pre>
                  </div>
                </TabsContent>
                <TabsContent value="tests" className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-[#00D4D4]"></div>
                      <span className="text-sm">Status code is 200</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-[#00D4D4]"></div>
                      <span className="text-sm">Response time &lt; 200ms</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-[#00D4D4]"></div>
                      <span className="text-sm">JSON schema is valid</span>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-[#8B7FD8] to-[#00D4D4]">
        <div className="container mx-auto text-center max-w-3xl">
          <h3 className="text-4xl font-bold text-white mb-6">
            Ready to explore APIs with Newton?
          </h3>
          <p className="text-xl text-white/90 mb-8">
            Download Newton today and experience the future of API development
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/getting-started">
              <Button size="lg" className="bg-white text-[#8B7FD8] hover:bg-slate-100 px-8">
                <Rocket className="w-5 h-5 mr-2" />
                Download Now
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <FileJson className="w-5 h-5 mr-2" />
              View Documentation
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 px-6 bg-white">
        <div className="container mx-auto text-center text-slate-600 text-sm">
          <p>Built with ❤️ for the API development community</p>
          <p className="mt-2">Open Source • Cross-Platform • Newton Native</p>
        </div>
      </footer>
    </div>
  );
}
