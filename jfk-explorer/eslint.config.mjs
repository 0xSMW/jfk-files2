import nextConfig from 'eslint-config-next';

export default [
  nextConfig,
  {
    rules: {
      'react/react-in-jsx-scope': 'off'
    }
  }
];
