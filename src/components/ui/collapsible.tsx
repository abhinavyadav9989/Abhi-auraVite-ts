import React, { useState, createContext, useContext } from 'react';

const CollapsibleContext = createContext(null);

const Collapsible = ({ children, open, onOpenChange = () => {} }) => {
  /**
   * This is a custom implementation of a Collapsible component
   * to avoid using external libraries like @radix-ui.
   * It's controlled from the parent via `open` and `onOpenChange` props.
   */
  return (
    <CollapsibleContext.Provider value={{ isOpen: open, toggle: onOpenChange }}>
      <div>{children}</div>
    </CollapsibleContext.Provider>
  );
};

const CollapsibleTrigger = ({ children, className }) => {
  const context = useContext(CollapsibleContext);
  if (!context) {
    throw new Error("CollapsibleTrigger must be used within a Collapsible component");
  }
  return (
    <button type="button" className={className} onClick={context.toggle}>
      {children}
    </button>
  );
};

const CollapsibleContent = ({ children, className }) => {
  const context = useContext(CollapsibleContext);
  if (!context) {
    throw new Error("CollapsibleContent must be used within a Collapsible component");
  }
  return context.isOpen ? <div className={className}>{children}</div> : null;
};

export { Collapsible, CollapsibleTrigger, CollapsibleContent };