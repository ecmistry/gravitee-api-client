import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  X, 
  Zap, 
  Shield, 
  Rocket,
  GitBranch,
  Database,
  Code2,
  Network,
  Lock,
  Gauge,
  Users,
  ArrowLeft
} from "lucide-react";
import { Link } from "wouter";

export default function Comparison() {
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
            Feature Comparison
          </Badge>
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-[#EA3527] to-[#F09135] bg-clip-text text-transparent">
            Why Choose Newton?
          </h2>
          <p className="text-xl text-slate-600 leading-relaxed">
            Built specifically for Newton users, Newton offers unmatched integration, 
            performance, and features that generic API clients simply can't match.
          </p>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <Card className="border-slate-200 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-orange-50">
              <CardTitle className="text-2xl">Feature Comparison</CardTitle>
              <CardDescription>See how Newton compares to generic API clients</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-100 border-b-2 border-slate-200">
                    <tr>
                      <th className="text-left p-4 font-semibold text-slate-700">Feature</th>
                      <th className="text-center p-4 font-semibold">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#8B7FD8] to-[#00D4D4] flex items-center justify-center">
                            <span className="text-white font-bold">G</span>
                          </div>
                          <span className="text-[#8B7FD8]">Newton</span>
                        </div>
                      </th>
                      <th className="text-center p-4 font-semibold text-slate-500">Generic API Clients</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {/* Newton Integration */}
                    <tr className="hover:bg-slate-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Network className="w-5 h-5 text-[#8B7FD8]" />
                          <div>
                            <p className="font-medium">Native Newton Integration</p>
                            <p className="text-sm text-slate-600">Direct API import and sync</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-center p-4">
                        <Check className="w-6 h-6 text-green-600 mx-auto" />
                      </td>
                      <td className="text-center p-4">
                        <X className="w-6 h-6 text-slate-400 mx-auto" />
                      </td>
                    </tr>

                    {/* Newton Auth */}
                    <tr className="hover:bg-slate-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Shield className="w-5 h-5 text-[#8B7FD8]" />
                          <div>
                            <p className="font-medium">Newton Authentication</p>
                            <p className="text-sm text-slate-600">OAuth2, API keys, JWT built-in</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-center p-4">
                        <Check className="w-6 h-6 text-green-600 mx-auto" />
                      </td>
                      <td className="text-center p-4">
                        <span className="text-sm text-slate-500">Manual Setup</span>
                      </td>
                    </tr>

                    {/* Policy Testing */}
                    <tr className="hover:bg-slate-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Code2 className="w-5 h-5 text-[#8B7FD8]" />
                          <div>
                            <p className="font-medium">Newton Policy Testing</p>
                            <p className="text-sm text-slate-600">Test with policies applied</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-center p-4">
                        <Check className="w-6 h-6 text-green-600 mx-auto" />
                      </td>
                      <td className="text-center p-4">
                        <X className="w-6 h-6 text-slate-400 mx-auto" />
                      </td>
                    </tr>

                    {/* Gateway Integration */}
                    <tr className="hover:bg-slate-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Gauge className="w-5 h-5 text-[#8B7FD8]" />
                          <div>
                            <p className="font-medium">Gateway Metrics & Monitoring</p>
                            <p className="text-sm text-slate-600">Real-time API analytics</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-center p-4">
                        <Check className="w-6 h-6 text-green-600 mx-auto" />
                      </td>
                      <td className="text-center p-4">
                        <X className="w-6 h-6 text-slate-400 mx-auto" />
                      </td>
                    </tr>

                    {/* Developer Portal */}
                    <tr className="hover:bg-slate-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Users className="w-5 h-5 text-[#8B7FD8]" />
                          <div>
                            <p className="font-medium">Developer Portal Integration</p>
                            <p className="text-sm text-slate-600">Import & publish APIs</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-center p-4">
                        <Check className="w-6 h-6 text-green-600 mx-auto" />
                      </td>
                      <td className="text-center p-4">
                        <X className="w-6 h-6 text-slate-400 mx-auto" />
                      </td>
                    </tr>

                    {/* Storage Options */}
                    <tr className="hover:bg-slate-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Database className="w-5 h-5 text-[#8B7FD8]" />
                          <div>
                            <p className="font-medium">Flexible Storage Options</p>
                            <p className="text-sm text-slate-600">Local, Git, or Cloud</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-center p-4">
                        <Check className="w-6 h-6 text-green-600 mx-auto" />
                      </td>
                      <td className="text-center p-4">
                        <span className="text-sm text-slate-500">Limited</span>
                      </td>
                    </tr>

                    {/* Privacy */}
                    <tr className="hover:bg-slate-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Lock className="w-5 h-5 text-[#8B7FD8]" />
                          <div>
                            <p className="font-medium">100% Local Option</p>
                            <p className="text-sm text-slate-600">No cloud dependency</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-center p-4">
                        <Check className="w-6 h-6 text-green-600 mx-auto" />
                      </td>
                      <td className="text-center p-4">
                        <span className="text-sm text-slate-500">Cloud Required</span>
                      </td>
                    </tr>

                    {/* Git Sync */}
                    <tr className="hover:bg-slate-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <GitBranch className="w-5 h-5 text-[#8B7FD8]" />
                          <div>
                            <p className="font-medium">Git Version Control</p>
                            <p className="text-sm text-slate-600">Any Git repository</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-center p-4">
                        <Check className="w-6 h-6 text-green-600 mx-auto" />
                      </td>
                      <td className="text-center p-4">
                        <span className="text-sm text-slate-500">Proprietary Only</span>
                      </td>
                    </tr>

                    {/* Open Source */}
                    <tr className="hover:bg-slate-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Code2 className="w-5 h-5 text-[#8B7FD8]" />
                          <div>
                            <p className="font-medium">Open Source</p>
                            <p className="text-sm text-slate-600">Apache 2.0 license</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-center p-4">
                        <Check className="w-6 h-6 text-green-600 mx-auto" />
                      </td>
                      <td className="text-center p-4">
                        <span className="text-sm text-slate-500">Varies</span>
                      </td>
                    </tr>

                    {/* Performance */}
                    <tr className="hover:bg-slate-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Zap className="w-5 h-5 text-[#8B7FD8]" />
                          <div>
                            <p className="font-medium">Optimized for Newton</p>
                            <p className="text-sm text-slate-600">Fast API operations</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-center p-4">
                        <Check className="w-6 h-6 text-green-600 mx-auto" />
                      </td>
                      <td className="text-center p-4">
                        <span className="text-sm text-slate-500">Generic</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Key Advantages */}
      <section className="py-16 px-6 bg-white/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Key Advantages</h3>
            <p className="text-slate-600">What makes Newton the best choice for Newton users</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-[#8B7FD8] border-2">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#8B7FD8] to-[#00D4D4] flex items-center justify-center mb-4">
                  <Rocket className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Built for Newton</CardTitle>
                <CardDescription className="text-base">
                  Every feature is designed with Newton users in mind. Import APIs directly from 
                  Newton, test with policies applied, and monitor gateway metrics in real-time.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-[#8B7FD8] border-2">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#8B7FD8] to-[#00D4D4] flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Your Data, Your Choice</CardTitle>
                <CardDescription className="text-base">
                  Choose how to store your API collections: 100% local for maximum privacy, 
                  Git sync for version control, or cloud for team collaboration. No vendor lock-in.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-[#8B7FD8] border-2">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#8B7FD8] to-[#00D4D4] flex items-center justify-center mb-4">
                  <Code2 className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Open Source Freedom</CardTitle>
                <CardDescription className="text-base">
                  Apache 2.0 licensed and community-driven. Extend, customize, and contribute. 
                  No hidden costs, no feature paywalls, no usage limits.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Perfect For</h3>
            <p className="text-slate-600">Newton excels in these scenarios</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-slate-200 hover:border-[#8B7FD8] transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#8B7FD8]" />
                  Enterprise Newton Deployments
                </CardTitle>
                <CardDescription className="text-base">
                  Large organizations using Newton API Management need a client that understands 
                  their complex authentication, policies, and gateway configurations. Newton 
                  provides native support for all Newton enterprise features.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-slate-200 hover:border-[#8B7FD8] transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#8B7FD8]" />
                  API Development Teams
                </CardTitle>
                <CardDescription className="text-base">
                  Teams building APIs on Newton benefit from seamless integration with the 
                  Developer Portal, shared collections via Git, and real-time collaboration 
                  without cloud dependencies.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-slate-200 hover:border-[#8B7FD8] transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-[#8B7FD8]" />
                  Security-Conscious Organizations
                </CardTitle>
                <CardDescription className="text-base">
                  Organizations with strict data privacy requirements can use Newton with 100% 
                  local storage. No API data ever leaves your machine, and you maintain complete 
                  control over sensitive information.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-slate-200 hover:border-[#8B7FD8] transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-[#8B7FD8]" />
                  DevOps & CI/CD Pipelines
                </CardTitle>
                <CardDescription className="text-base">
                  Integrate API testing into your CI/CD workflows with the Newton CLI. 
                  Automate testing, linting, and validation of Newton APIs as part of 
                  your deployment pipeline.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-br from-[#8B7FD8] to-[#00D4D4]">
        <div className="container mx-auto text-center max-w-3xl">
          <h3 className="text-4xl font-bold text-white mb-6">
            Ready to Experience the Difference?
          </h3>
          <p className="text-xl text-white/90 mb-8">
            Join Newton users who have switched to Newton for a better API testing experience
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/">
              <Button size="lg" variant="secondary" className="bg-white text-[#8B7FD8] hover:bg-slate-100">
                <Rocket className="w-5 h-5 mr-2" />
                Download Newton
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              View Documentation
            </Button>
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
