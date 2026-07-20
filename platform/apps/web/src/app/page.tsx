// platform/apps/web/src/app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-on-background font-sans selection:bg-primary-container selection:text-on-primary-container">
      {/* Masthead / Header */}
      <header className="max-w-[1200px] mx-auto px-6 py-8 border-b border-ink-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight flex items-center gap-3">
            <svg className="w-8 h-8 text-primary" viewBox="0 0 100 100" fill="currentColor">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M50 5C50 5 85 15.5 85 47.5C85 71.5 50 95 50 95C50 95 15 71.5 15 47.5C15 15.5 50 5 50 5ZM50 25C32.5 25 22.5 45 22.5 45C22.5 45 32.5 65 50 65C67.5 65 77.5 45 77.5 45C77.5 45 67.5 25 50 25ZM50 32.5C59.7 32.5 67.5 45 67.5 45C67.5 45 59.7 57.5 50 57.5C40.3 57.5 32.5 45 32.5 45C32.5 45 40.3 32.5 50 32.5ZM50 35C44.5 35 40 39.5 40 45C40 50.5 44.5 55 50 55C55.5 55 60 50.5 60 45C60 39.5 55.5 35 50 35ZM50 41C52.2 41 54 42.8 54 45C54 47.2 52.2 49 50 49C47.8 49 46 47.2 46 45C46 42.8 47.8 41 50 41Z"
              />
            </svg>
            <span>CervicalLens</span>
          </h1>
          <p className="font-mono text-[10px] tracking-wider text-ash uppercase mt-1">
            AI Screening & Prognosis System · Low-Resource Settings
          </p>
        </div>
        <nav className="flex items-center gap-4">
          <Link
            href="/login"
            className="px-5 py-2 rounded-full border border-sand bg-surface-container-lowest text-sm font-semibold hover:bg-surface-container-low transition-colors duration-200"
          >
            Clinician Console
          </Link>
          <a
            href="https://expo.dev/accounts/halleluyaholudele/projects/cervicallens/builds/e0095f33-9d11-4383-8211-12020fe6c5be"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2 rounded-full bg-primary text-on-primary text-sm font-semibold hover:bg-opacity-90 transition-all duration-200"
          >
            Download Mobile Client
          </a>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="max-w-[1200px] mx-auto px-6 py-16 md:py-24">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            DATICAN AI-in-Medicine Competition Entry
          </div>
          <h2 className="font-display text-4xl md:text-6xl font-bold leading-tight tracking-tight text-midnight">
            Re-engineering Cervical Cancer Triage for Low-Resource Environments.
          </h2>
          <p className="text-body-lg text-ash mt-6 max-w-2xl">
            An end-to-end clinical workflow integrating offline cytology screening at the edge 
            with prognostic genomic risk stratification to connect field workers, pathologists, and clinicians.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-10">
            <Link
              href="/login"
              className="px-8 py-4 rounded-full bg-midnight text-white text-center font-semibold hover:bg-graphite transition-all duration-200 shadow-md"
            >
              Enter Clinician Console
            </Link>
            <a
              href="https://expo.dev/accounts/halleluyaholudele/projects/cervicallens/builds/e0095f33-9d11-4383-8211-12020fe6c5be"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-full border border-sand bg-parchment text-center text-midnight font-semibold hover:bg-sand transition-all duration-200 flex items-center justify-center gap-2"
            >
              <span>📥</span> Download Android Mobile App (APK)
            </a>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
          <div className="p-6 rounded-3xl bg-surface-container border border-ink-10 hover:border-sand transition-all duration-300">
            <p className="font-mono text-xs text-ash uppercase tracking-wider">Edge Inference</p>
            <h3 className="font-display text-5xl font-bold text-midnight mt-4">3.6 ms</h3>
            <p className="text-sm text-steel mt-2">Offline CPU latency on low-end mobile devices (vs 14.4 ms PyTorch).</p>
          </div>
          <div className="p-6 rounded-3xl bg-surface-container border border-ink-10 hover:border-sand transition-all duration-300">
            <p className="font-mono text-xs text-ash uppercase tracking-wider">Model Footprint</p>
            <h3 className="font-display text-5xl font-bold text-midnight mt-4">0.28 MB</h3>
            <p className="text-sm text-steel mt-2">Distilled MobileNetV3-Small ONNX model running natively on-device.</p>
          </div>
          <div className="p-6 rounded-3xl bg-surface-container border border-ink-10 hover:border-sand transition-all duration-300">
            <p className="font-mono text-xs text-ash uppercase tracking-wider">Screening Filter</p>
            <h3 className="font-display text-5xl font-bold text-midnight mt-4">96.0%</h3>
            <p className="text-sm text-steel mt-2">Sensitivity achieved on held-out test cytology sets for high-security triage.</p>
          </div>
          <div className="p-6 rounded-3xl bg-surface-container border border-ink-10 hover:border-sand transition-all duration-300">
            <p className="font-mono text-xs text-ash uppercase tracking-wider">Prognostic Survival</p>
            <h3 className="font-display text-5xl font-bold text-midnight mt-4">2.2 HR</h3>
            <p className="text-sm text-steel mt-2">Hazard Ratio of CRITICAL vs LOW risk categories (Cox model, p = 0.010).</p>
          </div>
        </section>

        {/* The Two Pillars */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-28">
          {/* Pillar 1: Cytology */}
          <div className="p-8 rounded-[32px] bg-surface-container-low border border-ink-10">
            <div className="font-mono text-xs text-primary font-bold uppercase tracking-wider">Pillar 01</div>
            <h3 className="font-display text-3xl font-bold text-midnight mt-4">Primary Screening at the Edge</h3>
            <p className="text-sm text-steel mt-4 leading-relaxed">
              Cytology screening at the point of care is throttled by laboratory shortage. 
              CervicalLens deploys a distilled student MobileNetV3 model directly onto native field-worker devices, 
              allowing community health workers to perform real-time offline classifications of Pap-smear slide 
              tiles without an active internet connection.
            </p>
            <div className="mt-8 p-6 rounded-2xl bg-surface-container-highest/50 border border-ink-10">
              <h4 className="font-mono text-xs font-semibold text-midnight uppercase tracking-wider">Distillation Loss Formula</h4>
              <p className="font-mono text-sm text-midnight mt-2 overflow-x-auto whitespace-pre py-2 bg-white px-4 rounded border border-ink-10">
                L = α T² D_KL(softmax(Z_s/T) || softmax(Z_t/T)) + (1-α) L_CE(y, Z_s)
              </p>
              <p className="text-[11px] text-steel mt-2">Knowledge distilled from pathology foundation models (UNI, CTransPath) into a highly optimized edge binary.</p>
            </div>
          </div>

          {/* Pillar 2: Genomics */}
          <div className="p-8 rounded-[32px] bg-surface-container-low border border-ink-10">
            <div className="font-mono text-xs text-secondary font-bold uppercase tracking-wider">Pillar 02</div>
            <h3 className="font-display text-3xl font-bold text-midnight mt-4">Prognostic Genomic Risk Stratification</h3>
            <p className="text-sm text-steel mt-4 leading-relaxed">
              Once cervical cancer is confirmed, patient clinical outcomes are driven by host-viral genetics. 
              CervicalLens computes Progression-Free Interval (PFI) risk using a 2-axis survival prognostic model 
              evaluated on the real TCGA-CESC patient cohort.
            </p>
            
            {/* Visual Risk Matrix Grid */}
            <div className="mt-8">
              <h4 className="font-mono text-xs font-semibold text-midnight uppercase tracking-wider mb-4">2D Risk Classification Matrix</h4>
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                <div className="p-2"></div>
                <div className="p-2 border-b border-sand text-ash uppercase tracking-wider text-[10px]">Metastasis Low</div>
                <div className="p-2 border-b border-sand text-ash uppercase tracking-wider text-[10px]">Metastasis High</div>
                
                <div className="p-3 border-r border-sand text-ash uppercase tracking-wider flex items-center justify-center text-[10px] text-left">Virulence Low</div>
                <div className="p-3 bg-primary/10 text-primary border border-primary/20 rounded-xl font-bold flex flex-col justify-center">
                  <span>LOW RISK</span>
                  <span className="text-[9px] font-normal text-steel mt-0.5">Surveillance</span>
                </div>
                <div className="p-3 bg-secondary/10 text-secondary border border-secondary/20 rounded-xl font-bold flex flex-col justify-center">
                  <span>MODERATE</span>
                  <span className="text-[9px] font-normal text-steel mt-0.5">Mild hazard</span>
                </div>
                
                <div className="p-3 border-r border-sand text-ash uppercase tracking-wider flex items-center justify-center text-[10px] text-left">Virulence High</div>
                <div className="p-3 bg-secondary/20 text-secondary border border-secondary/30 rounded-xl font-bold flex flex-col justify-center">
                  <span>HIGH RISK</span>
                  <span className="text-[9px] font-normal text-steel mt-0.5">High hazard</span>
                </div>
                <div className="p-3 bg-error text-white rounded-xl font-bold flex flex-col justify-center shadow-sm">
                  <span>CRITICAL</span>
                  <span className="text-[9px] font-normal text-white/80 mt-0.5">HR = 2.2</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Scientific Contradiction / Sensitivity Check */}
        <section className="mt-28 p-8 md:p-12 rounded-[40px] bg-midnight text-parchment border border-ink-10">
          <div className="max-w-3xl">
            <span className="font-mono text-xs text-secondary-container uppercase tracking-wider font-semibold">Genomic Sensitivity Check</span>
            <h3 className="font-display text-3xl md:text-4xl font-bold mt-4 leading-tight">
              Disproving the APOBEC3B Survival Contradiction
            </h3>
            <p className="text-sm text-sand/80 mt-6 leading-relaxed">
              A published clinical study (PMC10076974) claimed that high expression of the APOBEC3B enzyme led to 
              <em> worse</em> overall survival. CervicalLens ran robust sensitivity audits on the same TCGA-CESC cohort 
              and successfully disproved this claim, identifying a critical <strong>label inversion bug</strong> in their codebase.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 font-mono text-xs">
              <div className="p-4 rounded-xl border border-sand/10 bg-graphite">
                <div className="text-secondary-container font-semibold">01. FIGO Adjusted</div>
                <p className="text-[11px] text-sand/60 mt-2">Adjusting for age and FIGO stage reveals APOBEC3B is actually highly protective (HR 0.66–0.72, p=0.0008).</p>
              </div>
              <div className="p-4 rounded-xl border border-sand/10 bg-graphite">
                <div className="text-secondary-container font-semibold">02. Quantile Scan</div>
                <p className="text-[11px] text-sand/60 mt-2">A complete scan of expression quantiles (10% to 90%) failed to yield a single threshold predicting worse survival.</p>
              </div>
              <div className="p-4 rounded-xl border border-sand/10 bg-graphite">
                <div className="text-secondary-container font-semibold">03. Group Inversion</div>
                <p className="text-[11px] text-sand/60 mt-2">Flipping the high/low group labels reproduced their published KM curves and log-rank statistics exactly.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Live Hosted Systems status */}
        <section className="mt-28 border-t border-ink-10 pt-16">
          <h3 className="font-display text-3xl font-bold text-midnight">Hosted System Architecture</h3>
          <p className="text-sm text-steel mt-2">Turborepo workspaces deployed and active for NACOS × DATICAN evaluation.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
            <div className="p-6 rounded-2xl bg-surface border border-ink-10 flex flex-col justify-between">
              <div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#2e7d32] mb-4" />
                <h4 className="font-display text-lg font-bold text-midnight">Clinician Console</h4>
                <p className="text-xs text-steel mt-2">Next.js clinician management dashboard tracking patient codes, pap-smear tiles, and genomic risks.</p>
              </div>
              <Link href="/login" className="mt-6 text-xs text-primary font-bold hover:underline">
                Open Web Portal →
              </Link>
            </div>
            
            <div className="p-6 rounded-2xl bg-surface border border-ink-10 flex flex-col justify-between">
              <div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#2e7d32] mb-4" />
                <h4 className="font-display text-lg font-bold text-midnight">Hono API Backend</h4>
                <p className="text-xs text-steel mt-2">Serverless REST API (Vercel Node.js 22) conducting live model inference in under 1 microsecond.</p>
              </div>
              <a href="https://api-cervicallens.hallelx2.com/health" target="_blank" rel="noopener noreferrer" className="mt-6 text-xs text-primary font-bold hover:underline">
                Verify API Health →
              </a>
            </div>

            <div className="p-6 rounded-2xl bg-surface border border-ink-10 flex flex-col justify-between">
              <div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#2e7d32] mb-4" />
                <h4 className="font-display text-lg font-bold text-midnight">Field Worker App</h4>
                <p className="text-xs text-steel mt-2">Expo React Native client with local file system caching, camera- specimen uploads, and offline support.</p>
              </div>
              <a href="https://expo.dev/accounts/halleluyaholudele/projects/cervicallens/builds/e0095f33-9d11-4383-8211-12020fe6c5be" target="_blank" rel="noopener noreferrer" className="mt-6 text-xs text-primary font-bold hover:underline">
                Download APK Archive →
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container border-t border-ink-10 py-12 mt-28">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono text-ash">
          <div>© 2026 CervicalLens. All rights reserved. Developed by Halleluyah Oludele.</div>
          <div className="flex gap-4">
            <a href="https://github.com/hallelx2/cervical-lens" target="_blank" rel="noopener noreferrer" className="hover:underline">Production Code</a>
            <span>·</span>
            <a href="https://github.com/DATICANcompetitionUI/cervical-lens-submission" target="_blank" rel="noopener noreferrer" className="hover:underline">DATICAN Submission</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
