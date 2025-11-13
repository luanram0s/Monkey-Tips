
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-brand-secondary/50 backdrop-blur-sm sticky top-0 z-50 shadow-lg shadow-black/20">
      <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between">
        <div className="flex items-center gap-3 mb-2 sm:mb-0">
          <span className="text-4xl" role="img" aria-label="monkey emoji">🐒</span>
          <h1 className="text-2xl font-bold text-brand-accent tracking-wider">
            Monkey Tips Live
          </h1>
        </div>
        <p className="text-sm text-brand-subtle italic text-center sm:text-right">
          Transformamos dados em decisões. Aposte com estratégia, não com sorte.
        </p>
      </div>
    </header>
  );
};

export default Header;
