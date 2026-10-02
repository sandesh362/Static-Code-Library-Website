/** Registers the JSX loader hooks for the offline test scripts. */
import { register } from 'node:module';

register('./jsx-loader.mjs', import.meta.url);
