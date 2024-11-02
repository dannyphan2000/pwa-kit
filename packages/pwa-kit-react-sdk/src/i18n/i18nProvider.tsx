import React, { useMemo } from "react";

// This is the main function used to translate messages in the project
// Note that this implementation must be isomorphic
// and work in both the Node.js Server and the browser.
type TranslateFunction = (
  id: string,
  defaultMessage?: string,
  options?: Record<string, unknown>
) => string | React.ReactNode;

const defaultTranslate: TranslateFunction = (id, defaultMessage, options) => {
  console.log('defaultTranslate')
  return defaultMessage ?? id;
};

// Another option is to expose this function via a hook "useTranslate"
// However, since we don't need the reactivity, we'll just use a simple variable
// if this becomes a problem, we can switch to a hook later
let t: TranslateFunction = defaultTranslate;

interface I18nAdaptor {
  init?: () => void;
  t: TranslateFunction;
  Provider?: React.ComponentType<{children: React.ReactNode}>;
}

interface I18nProviderProps {
  adaptor: I18nAdaptor;
  children: React.ReactNode;
}

const I18nProvider = ({ adaptor, children, ...props }: I18nProviderProps) => {
  
  // Well, if you know React, you know that this is a bit of an anti-pattern.
  // The anti-pattern is that useMemo have side effects. It should not.
  //
  // However, we want to make sure that the t() function has a minimal code api, since
  // it is used in many places in the codebase.
  // The correct way is probably to use a hook to return the t() function like useTranslate,
  // but here we use a module variable for t().
  // Reason is that users can import t() from any file and use it without having to call a hook.
  // This is a trade-off between ergonomics and reactivity.
  // Since translations are typically static and not expected to change at runtime,
  // and typically the t() function should not contain any side effects.
  // We think this is a good compromise.
  useMemo(() => {
    if (!adaptor) {
      console.warn("I18nProvider is rendered without an adaptor, this component is a no-op.");
      return;
    }

    if (adaptor && !adaptor.t) {
      console.warn("Missing t function in I18nAdaptor, translation is not enabled, the t function will return the default value.");
    }

    adaptor.init?.();
    t = adaptor?.t ?? defaultTranslate;

    return () => {
      t = defaultTranslate;
    }
  }, [adaptor]);

  return adaptor?.Provider ? <adaptor.Provider {...props}>{children}</adaptor.Provider> : <>{children}</>;
};

export { I18nProvider, t };
