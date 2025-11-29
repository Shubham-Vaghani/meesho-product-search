import { useEffect, useRef } from "react";

interface PerformanceMetrics {
  renderTime: number;
  componentMount: number;
  lastUpdate: number;
}

export const usePerformanceMonitor = (
  componentName: string,
  enabled = false
) => {
  const mountTime = useRef<number>(Date.now());
  const lastRenderTime = useRef<number>(Date.now());
  const renderCount = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    const currentTime = Date.now();
    const renderTime = currentTime - lastRenderTime.current;
    renderCount.current += 1;

    if (renderCount.current === 1) {
      // First render (mount)
      console.log(
        `🚀 [${componentName}] Mounted in ${currentTime - mountTime.current}ms`
      );
    } else {
      // Subsequent renders
      console.log(
        `🔄 [${componentName}] Render #${renderCount.current} took ${renderTime}ms`
      );
    }

    lastRenderTime.current = currentTime;
  });

  const logMetrics = () => {
    if (!enabled) return;

    const currentTime = Date.now();
    const metrics: PerformanceMetrics = {
      renderTime: currentTime - lastRenderTime.current,
      componentMount: mountTime.current,
      lastUpdate: lastRenderTime.current,
    };

    console.table({
      [`${componentName} Metrics`]: {
        "Total Renders": renderCount.current,
        "Time Since Mount": `${currentTime - mountTime.current}ms`,
        "Last Render Time": `${metrics.renderTime}ms`,
        "Average Render Time": `${
          (currentTime - mountTime.current) / renderCount.current
        }ms`,
      },
    });

    return metrics;
  };

  return { logMetrics };
};

// Performance observer for web vitals
export const useWebVitals = (enabled = false) => {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    // Measure Largest Contentful Paint (LCP)
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === "largest-contentful-paint") {
          console.log(`📊 LCP: ${entry.startTime}ms`);
        }
      }
    });

    try {
      observer.observe({ entryTypes: ["largest-contentful-paint"] });
    } catch (error) {
      console.warn("Performance Observer not supported");
    }

    // Measure First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === "first-input") {
          const fid = (entry as any).processingStart - entry.startTime;
          console.log(`📊 FID: ${fid}ms`);
        }
      }
    });

    try {
      fidObserver.observe({ entryTypes: ["first-input"] });
    } catch (error) {
      console.warn("First Input Delay measurement not supported");
    }

    return () => {
      observer.disconnect();
      fidObserver.disconnect();
    };
  }, [enabled]);
};

export default usePerformanceMonitor;
