/**
 * Vitest 测试设置文件
 * 配置测试环境和全局设置
 */

import { vi } from 'vitest';
import 'jsdom-global/register';

// 模拟浏览器 API
global.ResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

global.IntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// 模拟 Canvas API
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(() => ({ data: new Array(4) })),
  putImageData: vi.fn(),
  createImageData: vi.fn(() => ({ data: new Array(4) })),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  fillText: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  measureText: vi.fn(() => ({ width: 0 })),
  transform: vi.fn(),
  rect: vi.fn(),
  clip: vi.fn(),
}));

// 模拟 Audio API
global.Audio = vi.fn(() => ({
  play: vi.fn(),
  pause: vi.fn(),
  load: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
}));

// 模拟 localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// 模拟 sessionStorage
global.sessionStorage = localStorageMock;

// 模拟 fetch
global.fetch = vi.fn();

// 模拟 URL.createObjectURL
global.URL.createObjectURL = vi.fn();
global.URL.revokeObjectURL = vi.fn();

// 设置测试超时
vi.setConfig({ testTimeout: 10000 });