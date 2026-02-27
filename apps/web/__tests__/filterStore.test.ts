import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useFilterStore } from '@/stores/filterStore';
import { PolicyStatus, PolicyTheme, SenegalRegion } from '@xamle/types';

describe('filterStore', () => {
  beforeEach(() => {
    act(() => {
      useFilterStore.getState().reset();
    });
  });

  it('has correct initial state', () => {
    const state = useFilterStore.getState();
    expect(state.search).toBe('');
    expect(state.status).toBeUndefined();
    expect(state.theme).toBeUndefined();
    expect(state.region).toBeUndefined();
    expect(state.page).toBe(1);
  });

  it('updates search and resets page to 1', () => {
    const { result } = renderHook(() => useFilterStore());

    act(() => result.current.setPage(5));
    act(() => result.current.setSearch('Plan Sénégal Émergent'));

    expect(result.current.search).toBe('Plan Sénégal Émergent');
    expect(result.current.page).toBe(1);
  });

  it('sets status filter and resets page', () => {
    const { result } = renderHook(() => useFilterStore());

    act(() => result.current.setPage(3));
    act(() => result.current.setStatus(PolicyStatus.IN_PROGRESS));

    expect(result.current.status).toBe(PolicyStatus.IN_PROGRESS);
    expect(result.current.page).toBe(1);
  });

  it('sets theme filter', () => {
    const { result } = renderHook(() => useFilterStore());

    act(() => result.current.setTheme(PolicyTheme.HEALTH));
    expect(result.current.theme).toBe(PolicyTheme.HEALTH);
  });

  it('sets region filter', () => {
    const { result } = renderHook(() => useFilterStore());

    act(() => result.current.setRegion(SenegalRegion.DAKAR));
    expect(result.current.region).toBe(SenegalRegion.DAKAR);
  });

  it('sets page without resetting filters', () => {
    const { result } = renderHook(() => useFilterStore());

    act(() => result.current.setStatus(PolicyStatus.DELAYED));
    act(() => result.current.setPage(4));

    expect(result.current.page).toBe(4);
    expect(result.current.status).toBe(PolicyStatus.DELAYED);
  });

  it('resets all filters to defaults', () => {
    const { result } = renderHook(() => useFilterStore());

    act(() => {
      result.current.setSearch('test');
      result.current.setStatus(PolicyStatus.DELAYED);
      result.current.setTheme(PolicyTheme.EDUCATION);
      result.current.setPage(5);
    });

    act(() => result.current.reset());

    expect(result.current.search).toBe('');
    expect(result.current.status).toBeUndefined();
    expect(result.current.theme).toBeUndefined();
    expect(result.current.page).toBe(1);
  });

  it('toSearchParams includes active filters', () => {
    const { result } = renderHook(() => useFilterStore());

    act(() => {
      result.current.setSearch('eau potable');
      result.current.setStatus(PolicyStatus.IN_PROGRESS);
    });

    const params = result.current.toSearchParams();
    expect(params.get('search')).toBe('eau potable');
    expect(params.get('status')).toBe(PolicyStatus.IN_PROGRESS);
    expect(params.get('page')).toBe('1');
  });

  it('toSearchParams omits undefined filters', () => {
    const { result } = renderHook(() => useFilterStore());

    act(() => result.current.setSearch('agriculture'));

    const params = result.current.toSearchParams();
    expect(params.has('theme')).toBe(false);
    expect(params.has('region')).toBe(false);
    expect(params.has('ministryId')).toBe(false);
  });
});
