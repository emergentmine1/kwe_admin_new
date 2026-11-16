'use client';

import { setNonce } from 'get-nonce';

let registered = false;

/**
 * Gives the CSP nonce of the loaded document to the style injector used by dialogs/menus
 * (react-remove-scroll). Read from the page itself, because later server refreshes carry new nonces
 * that the already-loaded document does not trust.
 */
export function NonceRegistrar() {
  if (!registered && typeof document !== 'undefined') {
    const nonce = document.querySelector<HTMLScriptElement>('script[nonce]')?.nonce;
    if (nonce) {
      setNonce(nonce);
      registered = true;
    }
  }
  return null;
}
