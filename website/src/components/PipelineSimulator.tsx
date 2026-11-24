import { useEffect, useRef, useState } from 'react';
import { Check, Loader2, Play, RotateCcw } from 'lucide-react';
import { HostConfig } from '../utils/devopsGenerators';
import { PIPELINE_STAGES } from '../data/portfolioContent';

interface PipelineSimulatorProps {
  config: HostConfig;
}

type StageStatus = 'Idle' | 'Running' | 'Passed';

export function PipelineSimulator({ config }: PipelineSimulatorProps) {
  const [statuses, setStatuses] = useState<Record<string, StageStatus>>(() =>
    Object.fromEntries(PIPELINE_STAGES.map((stage) => [stage.id, 'Idle' as StageStatus]))
  );
  const [isRunning, setIsRunning] = useState(false);
  const [hasExecuted, setHasExecuted] = useState(false);
  const [logs, setLogs] = useState<string[]>([
    `Ready to simulate push to ${config.githubUser}/${config.repoName} (${config.branch}) -> ${config.vpsIp}`,
  ]);
  const timersRef = useRef<number[]>([]);
  const logContainerRef = useRef<HTMLDivElement | null>(null);

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  useEffect(() => {
    if (!hasExecuted && !isRunning) {
      setLogs([
        `Ready to simulate push to ${config.githubUser}/${config.repoName} (${config.branch}) -> ${config.vpsIp}`,
      ]);
    }
  }, [config.githubUser, config.repoName, config.branch, config.vpsIp, hasExecuted, isRunning]);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const handleReset = () => {
    clearTimers();
    setIsRunning(false);
    setHasExecuted(false);
    setStatuses(
      Object.fromEntries(PIPELINE_STAGES.map((stage) => [stage.id, 'Idle' as StageStatus]))
    );
    setLogs([
      `Ready to simulate push to ${config.githubUser}/${config.repoName} (${config.branch}) -> ${config.vpsIp}`,
    ]);
  };

  const handleRun = () => {
    clearTimers();
    setIsRunning(true);
    setHasExecuted(true);
    setStatuses(
      Object.fromEntries(PIPELINE_STAGES.map((stage) => [stage.id, 'Idle' as StageStatus]))
    );
    setLogs([
      `$ git push origin ${config.branch}`,
      `Triggered workflow "Deploy to Contabo Ubuntu 24.04" on ${config.githubUser}/${config.repoName}`,
    ]);

    let elapsed = 0;

    PIPELINE_STAGES.forEach((stage, index) => {
      const cmd = stage.getCommand(config);
      const startTimer = window.setTimeout(() => {
        setStatuses((prev) => ({ ...prev, [stage.id]: 'Running' }));
        setLogs((prev) => [...prev, `[Stage 0${index + 1}] Running: ${cmd}`]);
      }, elapsed);
      timersRef.current.push(startTimer);

      elapsed += stage.durationMs;

      const finishTimer = window.setTimeout(() => {
        setStatuses((prev) => ({ ...prev, [stage.id]: 'Passed' }));
        setLogs((prev) => [
          ...prev,
          ...stage.logOutput(config).map((line) => `  ✓ ${line}`),
        ]);
        if (index === PIPELINE_STAGES.length - 1) {
          setIsRunning(false);
          setLogs((prev) => [
            ...prev,
            `Deployment complete: https://${config.domain} verified live.`,
          ]);
        }
      }, elapsed);
      timersRef.current.push(finishTimer);

      elapsed += 120;
    });
  };

  const passedCount = Object.values(statuses).filter((s) => s === 'Passed').length;

  return (
    <section id="pipeline" className="py-16 lg:py-20 bg-white">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <p className="text-xs font-medium text-blue-600">CI/CD Dry-Run Simulator</p>
            <h2 className="font-display text-3xl font-bold tracking-tight text-zinc-950 [text-wrap:balance]">
              Verify the push-to-Contabo release flow
            </h2>
            <p className="text-sm sm:text-base text-zinc-600">
              Preview each automated stage from TypeScript verification to rsync transfer and Nginx
              reload on <span className="font-mono text-zinc-900">{config.vpsIp}</span>.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleRun}
              disabled={isRunning}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Running Pipeline...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Run Deploy Simulation</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleReset}
              aria-label="Reset pipeline simulation"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-5 border border-zinc-200 rounded-2xl divide-y divide-zinc-200 bg-white flex flex-col overflow-hidden">
            <div className="px-5 py-3.5 bg-zinc-50 flex items-center justify-between text-xs font-medium text-zinc-600 shrink-0">
              <span>Pipeline Stages</span>
              <span className="font-mono text-zinc-900">
                {passedCount}/{PIPELINE_STAGES.length} passed
              </span>
            </div>

            <div className="flex-1 flex flex-col divide-y divide-zinc-200">
              {PIPELINE_STAGES.map((stage, idx) => {
                const status = statuses[stage.id];
                const commandText = stage.getCommand(config);
                return (
                  <div
                    key={stage.id}
                    className="flex-1 px-5 py-4 flex items-center justify-between gap-4 bg-white"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-sm font-medium text-zinc-950 truncate">
                        0{idx + 1}. {stage.name}
                      </p>
                      <p className="font-mono text-xs text-zinc-500 truncate">{commandText}</p>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap shrink-0 ${
                        status === 'Passed'
                          ? 'text-emerald-700'
                          : status === 'Running'
                            ? 'text-blue-600'
                            : 'text-zinc-500'
                      }`}
                    >
                      {status === 'Passed' && <Check className="w-3.5 h-3.5" />}
                      {status === 'Running' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>{status}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-7 rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-200 flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900/90 flex items-center justify-between text-xs text-zinc-400 shrink-0">
              <span className="font-mono text-zinc-200">
                github-actions · {config.githubUser}/{config.repoName}
              </span>
              <span className="font-mono">
                {isRunning
                  ? 'Deploying'
                  : passedCount === PIPELINE_STAGES.length
                    ? 'Completed'
                    : 'Standby'}
              </span>
            </div>

            <div
              ref={logContainerRef}
              data-testid="pipeline-logs"
              className="p-4 font-mono text-xs leading-6 space-y-1 overflow-y-auto h-[320px]"
            >
              {logs.map((line, i) => (
                <div
                  key={`${i}-${line.slice(0, 12)}`}
                  className={
                    line.startsWith('  ✓')
                      ? 'text-emerald-400'
                      : line.startsWith('$')
                        ? 'text-blue-400'
                        : 'text-zinc-300'
                  }
                >
                  {line}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
