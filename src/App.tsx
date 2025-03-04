import React from 'react';
import TsxRunner from './TsxRunner.tsx';

const App: React.FC = () => {
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>TSX Runner</h1>
      <TsxRunner />
    </div>
  );
};

export default App;