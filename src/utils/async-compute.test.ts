import { describe, it, expect, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useAsyncCompute } from "./async-compute";

function deferred<T>() {
  let resolve: (v: T) => void;
  let reject: (e: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve: resolve!, reject: reject! };
}

describe("useAsyncCompute", () => {
  it("first render", async () => {
    const fn = vi.fn(() => new Promise(() => {}));

    const { result } = renderHook(() => useAsyncCompute(fn, []));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("resolves data and sets isLoading to false", async () => {
    const d = deferred<number>();

    const { result } = renderHook(() => useAsyncCompute(() => d.promise, []));

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      d.resolve(42);
      await d.promise;
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBe(42);
    expect(result.current.error).toBeNull();
  });

  it("isLoading becomes true when deps change", async () => {
    const d1 = deferred<number>();
    const d2 = deferred<number>();

    const fn = vi
      .fn()
      .mockImplementationOnce(() => d1.promise)
      .mockImplementationOnce(() => d2.promise);

    // Initial render
    const { result, rerender } = renderHook((deps) => useAsyncCompute(fn, deps), {
      initialProps: [1],
    });

    expect(result.current.isLoading).toBe(true);

    // Resolve first promise, second render.
    // The method must not be called yet.
    await act(async () => {
      d1.resolve(1);
      await d1.promise;
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBe(1);
    expect(fn).toHaveBeenCalledTimes(1);

    // Change deps, third render.
    rerender([2]);

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeNull();
  });

  it("does not commit stale async results", async () => {
    const d1 = deferred<number>();
    const d2 = deferred<number>();

    const fn = vi
      .fn()
      .mockImplementationOnce(() => d1.promise)
      .mockImplementationOnce(() => d2.promise);

    // Initial render
    const { result, rerender } = renderHook((deps) => useAsyncCompute(fn, deps), {
      initialProps: [1],
    });
    await Promise.resolve();

    // Change deps before first promise resolves
    rerender([2]);

    // Resolve first promise
    await act(async () => {
      d1.resolve(1);
      await d1.promise;
    });

    // First promise resolved, but stale, so no commit
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeNull();

    // Resolve second promise
    await act(async () => {
      d2.resolve(2);
      await d2.promise;
    });

    // Second promise resolved and committed
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBe(2);
  });

  it("aborts previous computation on deps change", () => {
    const abortSpy = vi.fn();

    const fn = vi.fn((signal: AbortSignal) => {
      signal.addEventListener("abort", abortSpy);
      return new Promise(() => {});
    });

    const { rerender } = renderHook((deps) => useAsyncCompute(fn, deps), { initialProps: [1] });

    rerender([2]);
  });

  it("renders again even if the result if the same", async () => {
    const d1 = deferred<number>();
    const d2 = deferred<number>();

    const fn = vi
      .fn()
      .mockImplementationOnce(() => d1.promise)
      .mockImplementationOnce(() => d2.promise);

    // Initial render
    const { result, rerender } = renderHook((deps) => useAsyncCompute(fn, deps), { initialProps: [1] });

    // Resolve first promise
    await act(async () => {
      d1.resolve(1);
      await d1.promise;
    });

    // First promise resolved, but stale, so no commit
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBe(1);

    // Change deps, third render.
    rerender([2]);

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeNull();

    // Resolve second promise, same result as first
    await act(async () => {
      d2.resolve(1);
      await d2.promise;
    });

    // Second promise resolved and committed
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBe(1);
  });
});
