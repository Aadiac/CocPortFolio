'use client';

import { useEffect, useRef, useState } from 'react';

const TYPE_MS = 26;
const TYPE_JITTER_MS = 34;
const NEWLINE_MS = 170;
const HOLD_MS = 2400;
const ERASE_MS = 9;
const NEXT_SNIPPET_MS = 500;

const GO_CODE = `// bounded worker pool
func pool(n int, jobs <-chan Job) {
  var wg sync.WaitGroup
  for i := 0; i < n; i++ {
    wg.Add(1)
    go func() {
      defer wg.Done()
      for job := range jobs {
        handle(job)
      }
    }()
  }
  wg.Wait()
}`;

const CPP_CODE = `// thread-safe job queue
struct JobQueue {
  std::mutex mu;
  std::condition_variable ready;
  std::queue<Job> jobs;
  Job pop() {
    std::unique_lock lock(mu);
    ready.wait(lock, [this] {
      return !jobs.empty();
    });
    Job job = jobs.front();
    jobs.pop();
    return job;
  }
};`;

const NODE_CODE = `// live score fan-out
const wss = new WebSocketServer({
  port: 8080,
});

wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    for (const c of wss.clients) {
      c.send(data.toString());
    }
  });
});`;

const TOKEN_PATTERN =
  /(\/\/.*)|('[^']*')|\b(func|var|for|range|go|defer|int|chan|const|new|of|struct|this|return)\b|\b(\d+)\b/g;

const TOKEN_CLASSES = [
  'text-warm-light',
  'text-grass-light',
  'text-accent-light',
  'text-gold-light',
] as const;

interface Token {
  text: string;
  className: string;
}

const tokenize = (code: string): Token[] => {
  const tokens: Token[] = [];
  let cursor = 0;

  for (const match of code.matchAll(TOKEN_PATTERN)) {
    if (match.index > cursor) {
      tokens.push({ text: code.slice(cursor, match.index), className: 'text-light' });
    }
    const group = match.slice(1).findIndex(Boolean);
    tokens.push({ text: match[0], className: TOKEN_CLASSES[group] });
    cursor = match.index + match[0].length;
  }

  if (cursor < code.length) {
    tokens.push({ text: code.slice(cursor), className: 'text-light' });
  }
  return tokens;
};

const SNIPPETS = [
  { fileName: 'pool.go', code: GO_CODE, tokens: tokenize(GO_CODE) },
  { fileName: 'queue.cpp', code: CPP_CODE, tokens: tokenize(CPP_CODE) },
  { fileName: 'server.js', code: NODE_CODE, tokens: tokenize(NODE_CODE) },
];

export default function CodeTyper() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState({ index: 0, count: 0 });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setFrame({ index: 0, count: SNIPPETS[0].code.length });
      return;
    }

    let index = 0;
    let count = 0;
    let erasing = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const step = () => {
      const { code } = SNIPPETS[index];
      let delay: number;

      if (erasing) {
        count -= 1;
        delay = ERASE_MS;
        if (count === 0) {
          erasing = false;
          index = (index + 1) % SNIPPETS.length;
          delay = NEXT_SNIPPET_MS;
        }
      } else {
        count += 1;
        delay = code[count - 1] === '\n' ? NEWLINE_MS : TYPE_MS + Math.random() * TYPE_JITTER_MS;
        if (count === code.length) {
          erasing = true;
          delay = HOLD_MS;
        }
      }

      setFrame({ index, count });
      timer = setTimeout(step, delay);
    };

    const stop = () => {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          stop();
        } else if (timer === null) {
          timer = setTimeout(step, NEXT_SNIPPET_MS);
        }
      },
      { threshold: 0.02 },
    );
    observer.observe(root);

    return () => {
      observer.disconnect();
      stop();
    };
  }, []);

  const snippet = SNIPPETS[frame.index];
  let remaining = frame.count;

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none opacity-55 mix-blend-lighten font-mono text-[11px] md:text-[12.5px] leading-[1.65] p-5 md:p-6"
    >
      <p className="text-warm-light tracking-wide mb-4">{snippet.fileName}</p>
      <pre className="font-mono whitespace-pre overflow-hidden">
        <code>
          {snippet.tokens.map((token, i) => {
            if (remaining <= 0) return null;
            const text = token.text.slice(0, remaining);
            remaining -= token.text.length;
            return (
              <span key={i} className={token.className}>
                {text}
              </span>
            );
          })}
          <span className="inline-block w-[0.55em] h-[1.15em] ml-px align-text-bottom bg-accent-light animate-pulse" />
        </code>
      </pre>
    </div>
  );
}
