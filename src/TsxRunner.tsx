import React, { useState } from 'react';
import * as Babel from '@babel/standalone';
import * as FluentUI from '@fluentui/react-components';

const TsxRunner: React.FC = () => {
  const [tsxCode, setTsxCode] = useState<string>(`
import React from 'react';
import { Button, Text } from '@fluentui/react-components';

interface ISimpleFluentComponent {
    value: string
}

const SimpleFluentComponent = (props: ISimpleFluentComponent) => {
  return (
    <div>
      <Text>Label: </Text>
      <Button appearance="primary" onClick={() => alert('Clicked!')}>
        {props.value}
      </Button>
    </div>
  );
};

export default SimpleFluentComponent;
  `);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [renderedComponent, setRenderedComponent] = useState<React.ComponentType<any> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const transpileAndRun = () => {
    try {
      // Transpile TSX to JS using Babel
      const transpiledCode = Babel.transform(tsxCode, {
        presets: ['react', 'typescript'],
        filename: 'userComponent.tsx',
        sourceType: 'module',
        plugins: ['transform-modules-commonjs']
      }).code;

      if (!transpiledCode) {
        throw new Error('Transpilation failed. Please check your code and try again.');
      }

      // Create a module-like environment for imports
      const module = { exports: {} };
      const imports = {
        "react": React,
        '@fluentui/react-components': FluentUI,
      };

      // Function to mimic CommonJS require
      const require = (moduleName: string) => {
        if (moduleName in imports) {
          return imports[moduleName as keyof typeof imports];
        }
        throw new Error(`Module "${moduleName}" is not available. Only React and @fluentui/react-components are allowed.`);
      };

      // Evaluate the transpiled code
      const evalCode = new Function('require', 'module', 'exports', transpiledCode);
      evalCode(require, module, module.exports);

      // Extract the default export (the component)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const UserComponent = (module.exports as any).default;
      if (!UserComponent || typeof UserComponent !== 'function') {
        throw new Error('The code must export a default React component.');
      }

      setRenderedComponent(() => UserComponent);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
      setRenderedComponent(null);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '20px' }}>
      <div style={{ flex: 1 }}>
        <h2>Enter TSX Code</h2>
        <textarea
          value={tsxCode}
          onChange={(e) => setTsxCode(e.target.value)}
          rows={20}
          cols={60}
          style={{ width: '100%', fontFamily: 'monospace', padding: '10px' }}
          placeholder="Enter your TSX code here..."
        />
        <button
          onClick={transpileAndRun}
          style={{
            marginTop: '10px',
            padding: '8px 16px',
            backgroundColor: '#0078d4',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Run Code
        </button>
      </div>
      <div style={{ flex: 1 }}>
        <h2>Output</h2>
        {error && (
          <div style={{ color: 'red', marginBottom: '10px' }}>
            Error: {error}
          </div>
        )}
        {renderedComponent && (
          <div style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '4px' }}>
            {React.createElement(renderedComponent, { value: 'Test Button' })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TsxRunner;