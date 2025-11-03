/**
 * Tests for NetworkStatusIndicator component
 * Requirements: 全般 - ネットワークエラー処理
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NetworkStatusIndicator } from '../NetworkStatusIndicator';
import * as useNetworkStatusModule from '../../hooks/useNetworkStatus';

// Mock the useNetworkStatus hook
const mockUseNetworkStatus = vi.fn();
vi.mock('../../hooks/useNetworkStatus', () => ({
  useNetworkStatus: () => mockUseNetworkStatus(),
}));

describe('NetworkStatusIndicator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when online and showWhenOnline is false', () => {
    mockUseNetworkStatus.mockReturnValue({
      isOnline: true,
      isSlowConnection: false,
      lastOnlineAt: Date.now(),
    });

    const { container } = render(<NetworkStatusIndicator />);
    expect(container.firstChild).toBeNull();
  });

  it('should render when online and showWhenOnline is true', () => {
    mockUseNetworkStatus.mockReturnValue({
      isOnline: true,
      isSlowConnection: false,
      lastOnlineAt: Date.now(),
    });

    render(<NetworkStatusIndicator showWhenOnline={true} />);
    expect(screen.getByText('Connected')).toBeInTheDocument();
  });

  it('should render when offline', () => {
    mockUseNetworkStatus.mockReturnValue({
      isOnline: false,
      isSlowConnection: false,
      lastOnlineAt: Date.now() - 30000, // 30 seconds ago
    });

    render(<NetworkStatusIndicator />);
    expect(screen.getByText('Connection lost - trying to reconnect...')).toBeInTheDocument();
  });

  it('should show appropriate message for recent disconnection', () => {
    mockUseNetworkStatus.mockReturnValue({
      isOnline: false,
      isSlowConnection: false,
      lastOnlineAt: Date.now() - 30000, // 30 seconds ago
    });

    render(<NetworkStatusIndicator />);
    expect(screen.getByText('Connection lost - trying to reconnect...')).toBeInTheDocument();
  });

  it('should show appropriate message for longer disconnection', () => {
    mockUseNetworkStatus.mockReturnValue({
      isOnline: false,
      isSlowConnection: false,
      lastOnlineAt: Date.now() - 120000, // 2 minutes ago
    });

    render(<NetworkStatusIndicator />);
    expect(screen.getByText('Offline for 2m - check your connection')).toBeInTheDocument();
  });

  it('should show generic offline message for very long disconnection', () => {
    mockUseNetworkStatus.mockReturnValue({
      isOnline: false,
      isSlowConnection: false,
      lastOnlineAt: Date.now() - 600000, // 10 minutes ago
    });

    render(<NetworkStatusIndicator />);
    expect(screen.getByText('No internet connection')).toBeInTheDocument();
  });

  it('should show slow connection message', () => {
    mockUseNetworkStatus.mockReturnValue({
      isOnline: true,
      isSlowConnection: true,
      lastOnlineAt: Date.now(),
    });

    render(<NetworkStatusIndicator />);
    expect(screen.getByText('Slow connection detected')).toBeInTheDocument();
  });

  it('should show offline message when lastOnlineAt is null', () => {
    mockUseNetworkStatus.mockReturnValue({
      isOnline: false,
      isSlowConnection: false,
      lastOnlineAt: null,
    });

    render(<NetworkStatusIndicator />);
    expect(screen.getByText('No internet connection')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    mockUseNetworkStatus.mockReturnValue({
      isOnline: false,
      isSlowConnection: false,
      lastOnlineAt: Date.now(),
    });

    render(<NetworkStatusIndicator className="custom-class" />);
    const indicator = screen.getByText('No internet connection').closest('div');
    expect(indicator).toHaveClass('custom-class');
  });

  it('should show retry spinner when offline', () => {
    mockUseNetworkStatus.mockReturnValue({
      isOnline: false,
      isSlowConnection: false,
      lastOnlineAt: Date.now(),
    });

    render(<NetworkStatusIndicator />);
    // Find the SVG by its class instead of role
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('animate-spin');
  });

  it('should use correct styling for different states', () => {
    // Test offline styling
    mockUseNetworkStatus.mockReturnValue({
      isOnline: false,
      isSlowConnection: false,
      lastOnlineAt: Date.now(),
    });

    const { rerender } = render(<NetworkStatusIndicator />);
    let container = screen.getByText('No internet connection').closest('div');
    expect(container).toHaveClass('bg-red-50', 'border-red-200');

    // Test slow connection styling
    mockUseNetworkStatus.mockReturnValue({
      isOnline: true,
      isSlowConnection: true,
      lastOnlineAt: Date.now(),
    });

    rerender(<NetworkStatusIndicator />);
    container = screen.getByText('Slow connection detected').closest('div');
    expect(container).toHaveClass('bg-yellow-50', 'border-yellow-200');

    // Test online styling
    mockUseNetworkStatus.mockReturnValue({
      isOnline: true,
      isSlowConnection: false,
      lastOnlineAt: Date.now(),
    });

    rerender(<NetworkStatusIndicator showWhenOnline={true} />);
    container = screen.getByText('Connected').closest('div');
    expect(container).toHaveClass('bg-green-50', 'border-green-200');
  });
});