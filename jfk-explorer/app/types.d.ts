// Custom type definitions for libraries without TypeScript support

declare module 'aframe-extras' {
  const extras: any;
  export default extras;
}

// Extend the Window interface to include AFRAME as optional
interface Window {
  AFRAME?: any;
} 